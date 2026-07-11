from pathlib import Path

from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db.models import Count
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from wagtail.search.backends import get_search_backend

from .forms import FolderForm, MultipleDocumentUploadForm, ResourceForm
from .models import Resource, ResourceFolder

DOCUMENTS_PER_PAGE = 50
LAYOUT_SESSION_KEY = "resource_library_layout"
DEFAULT_LAYOUT = "grid"

# Any of these model permissions grants access to browse the library; each
# mutating view additionally checks its own specific permission.
LIBRARY_PERMISSIONS = [
    "resources.view_resource",
    "resources.add_resource",
    "resources.change_resource",
    "resources.delete_resource",
    "resources.add_resourcefolder",
    "resources.change_resourcefolder",
    "resources.delete_resourcefolder",
]


def user_has_library_access(user):
    return any(user.has_perm(perm) for perm in LIBRARY_PERMISSIONS)


def check_library_access(request):
    if not user_has_library_access(request.user):
        raise PermissionDenied


def get_folder(folder_id):
    """Resolve a folder id to (library root, folder), 404ing outside the library."""
    root = ResourceFolder.get_library_root()
    if folder_id is None:
        return root, root
    folder = get_object_or_404(ResourceFolder, id=folder_id)
    if folder.pk != root.pk and not folder.is_descendant_of(root):
        raise Http404
    return root, folder


def get_breadcrumbs(root, folder):
    return [f for f in folder.get_ancestors() if f.depth >= root.depth] + [folder]


def explorer(request, folder_id=None):
    check_library_access(request)
    root, folder = get_folder(folder_id)

    layout = request.GET.get("layout")
    if layout in ("grid", "list"):
        request.session[LAYOUT_SESSION_KEY] = layout
    else:
        layout = request.session.get(LAYOUT_SESSION_KEY, DEFAULT_LAYOUT)

    search_query = request.GET.get("q", "").strip()
    if search_query:
        # Search covers the current folder and everything below it
        subtree = ResourceFolder.objects.filter(path__startswith=folder.path)
        subfolders = []
        documents = get_search_backend().search(
            search_query,
            Resource.objects.filter(folder__in=subtree).select_related("folder"),
        )
    else:
        subfolders = list(folder.get_children().order_by("name"))
        documents = Resource.objects.filter(folder=folder).order_by("title")

        # Annotate each subfolder with the file and folder counts of its whole
        # subtree, using one aggregate query and treebeard's materialised paths
        counts = (
            Resource.objects.filter(folder__in=folder.get_descendants())
            .values("folder__path")
            .annotate(count=Count("id"))
        )
        descendant_paths = list(
            folder.get_descendants().values_list("path", flat=True)
        )
        for sub in subfolders:
            sub.document_count = sum(
                row["count"]
                for row in counts
                if row["folder__path"].startswith(sub.path)
            )
            sub.folder_count = sum(
                1
                for path in descendant_paths
                if path.startswith(sub.path) and path != sub.path
            )

    page_obj = Paginator(documents, DOCUMENTS_PER_PAGE).get_page(request.GET.get("p"))

    return render(
        request,
        "resources/explorer.html",
        {
            "root": root,
            "folder": folder,
            "is_root": folder.pk == root.pk,
            "breadcrumbs": get_breadcrumbs(root, folder),
            "subfolders": subfolders,
            "page_obj": page_obj,
            "search_query": search_query,
            "layout": layout,
            "can_upload": request.user.has_perm("resources.add_resource"),
            "can_add_folder": request.user.has_perm("resources.add_resourcefolder"),
            "can_change_folder": request.user.has_perm(
                "resources.change_resourcefolder"
            ),
            "can_delete_folder": request.user.has_perm(
                "resources.delete_resourcefolder"
            ),
            "can_edit_documents": request.user.has_perm("resources.change_resource"),
            "can_delete_documents": request.user.has_perm(
                "resources.delete_resource"
            ),
        },
    )


def add_folder(request, parent_id):
    check_library_access(request)
    if not request.user.has_perm("resources.add_resourcefolder"):
        raise PermissionDenied
    root, parent = get_folder(parent_id)

    form = FolderForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        folder = parent.add_child(
            instance=ResourceFolder(name=form.cleaned_data["name"])
        )
        messages.success(request, f"Folder '{folder.name}' created.")
        return redirect("resource_library:folder", folder.pk)

    return render(
        request,
        "resources/folder_form.html",
        {
            "form": form,
            "page_title": "New folder",
            "folder": parent,
            "breadcrumbs": get_breadcrumbs(root, parent),
        },
    )


def rename_folder(request, folder_id):
    check_library_access(request)
    if not request.user.has_perm("resources.change_resourcefolder"):
        raise PermissionDenied
    root, folder = get_folder(folder_id)
    if folder.pk == root.pk:
        raise PermissionDenied

    form = FolderForm(request.POST or None, initial={"name": folder.name})
    if request.method == "POST" and form.is_valid():
        folder.name = form.cleaned_data["name"]
        folder.save()
        messages.success(request, f"Folder renamed to '{folder.name}'.")
        return redirect("resource_library:folder", folder.pk)

    return render(
        request,
        "resources/folder_form.html",
        {
            "form": form,
            "page_title": "Rename folder",
            "folder": folder,
            "breadcrumbs": get_breadcrumbs(root, folder),
        },
    )


def delete_folder(request, folder_id):
    check_library_access(request)
    if not request.user.has_perm("resources.delete_resourcefolder"):
        raise PermissionDenied
    root, folder = get_folder(folder_id)
    if folder.pk == root.pk:
        raise PermissionDenied

    is_empty = (
        not folder.get_children().exists() and not folder.resources.exists()
    )

    if request.method == "POST":
        if not is_empty:
            raise PermissionDenied
        parent = folder.get_parent()
        name = folder.name
        folder.delete()
        messages.success(request, f"Folder '{name}' deleted.")
        return redirect("resource_library:folder", parent.pk)

    return render(
        request,
        "resources/confirm_folder_delete.html",
        {
            "folder": folder,
            "is_empty": is_empty,
            "breadcrumbs": get_breadcrumbs(root, folder),
        },
    )


def upload(request, folder_id):
    check_library_access(request)
    if not request.user.has_perm("resources.add_resource"):
        raise PermissionDenied
    root, folder = get_folder(folder_id)

    if request.method == "POST":
        form = MultipleDocumentUploadForm(request.POST, request.FILES)
        if form.is_valid():
            for f in form.cleaned_data["files"]:
                resource = Resource(
                    title=Path(f.name).stem,
                    file=f,
                    folder=folder,
                    uploaded_by_user=request.user,
                    resource_type=form.cleaned_data["resource_type"],
                    language=form.cleaned_data["language"],
                    revision_date=form.cleaned_data["revision_date"],
                    description=form.cleaned_data["description"],
                )
                resource.set_file_metadata()
                resource.save()
            count = len(form.cleaned_data["files"])
            messages.success(
                request,
                f"{count} document{'s' if count != 1 else ''} added to '{folder.name}'.",
            )
            return redirect("resource_library:folder", folder.pk)
    else:
        form = MultipleDocumentUploadForm()

    return render(
        request,
        "resources/upload.html",
        {
            "form": form,
            "folder": folder,
            "breadcrumbs": get_breadcrumbs(root, folder),
        },
    )


def edit_resource(request, resource_id):
    check_library_access(request)
    if not request.user.has_perm("resources.change_resource"):
        raise PermissionDenied
    resource = get_object_or_404(Resource, id=resource_id)
    root, folder = get_folder(resource.folder_id)
    old_file_name = resource.file.name

    if request.method == "POST":
        form = ResourceForm(request.POST, request.FILES, instance=resource)
        if form.is_valid():
            resource = form.save(commit=False)
            file_changed = "file" in form.changed_data
            if file_changed:
                resource.set_file_metadata()
            resource.save()
            if file_changed and old_file_name != resource.file.name:
                resource.file.storage.delete(old_file_name)
            messages.success(request, f"'{resource.title}' updated.")
            return redirect("resource_library:folder", folder.pk)
    else:
        form = ResourceForm(instance=resource)

    return render(
        request,
        "resources/resource_form.html",
        {
            "form": form,
            "page_title": "Edit resource",
            "resource": resource,
            "folder": folder,
            "breadcrumbs": get_breadcrumbs(root, folder),
        },
    )


def delete_resource(request, resource_id):
    check_library_access(request)
    if not request.user.has_perm("resources.delete_resource"):
        raise PermissionDenied
    resource = get_object_or_404(Resource, id=resource_id)
    root, folder = get_folder(resource.folder_id)

    if request.method == "POST":
        title = resource.title
        resource.delete()
        messages.success(request, f"'{title}' deleted.")
        return redirect("resource_library:folder", folder.pk)

    return render(
        request,
        "resources/confirm_resource_delete.html",
        {
            "resource": resource,
            "folder": folder,
            "breadcrumbs": get_breadcrumbs(root, folder),
        },
    )
