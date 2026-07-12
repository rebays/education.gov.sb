from pathlib import Path

from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db.models import Count
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from wagtail.search.backends import get_search_backend

from .forms import FolderForm, ResourceForm, UploadForm
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


def annotate_folder_counts(folders):
    """
    Annotate each folder with the file and folder counts of its whole
    subtree, using one aggregate query and treebeard's materialised paths.
    """
    if not folders:
        return
    counts = list(
        Resource.objects.values("folder__path").annotate(count=Count("id"))
    )
    all_paths = list(ResourceFolder.objects.values_list("path", flat=True))
    for folder in folders:
        folder.document_count = sum(
            row["count"]
            for row in counts
            if row["folder__path"].startswith(folder.path)
        )
        folder.folder_count = sum(
            1
            for path in all_paths
            if path.startswith(folder.path) and path != folder.path
        )


def explorer(request, folder_id=None):
    check_library_access(request)
    root, folder = get_folder(folder_id)

    layout = request.GET.get("layout")
    if layout in ("grid", "list"):
        request.session[LAYOUT_SESSION_KEY] = layout
    else:
        layout = request.session.get(LAYOUT_SESSION_KEY, DEFAULT_LAYOUT)

    search_query = request.GET.get("q", "").strip()
    backend = get_search_backend()
    if search_query:
        # Search covers the current folder and everything below it: folders
        # match on name/description, files on their label
        subtree = ResourceFolder.objects.filter(path__startswith=folder.path)
        subfolders = [
            f
            for f in backend.search(search_query, ResourceFolder.objects.all())
            if f.path.startswith(folder.path) and f.pk != folder.pk
        ]
        documents = backend.search(
            search_query,
            Resource.objects.filter(folder__in=subtree).select_related("folder"),
        )
    else:
        subfolders = list(folder.get_children().order_by("name"))
        documents = Resource.objects.filter(folder=folder).order_by("label")

    annotate_folder_counts(subfolders)

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
        folder = parent.add_child(instance=form.save(commit=False))
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


def edit_folder(request, folder_id):
    check_library_access(request)
    if not request.user.has_perm("resources.change_resourcefolder"):
        raise PermissionDenied
    root, folder = get_folder(folder_id)
    if folder.pk == root.pk:
        raise PermissionDenied

    form = FolderForm(request.POST or None, instance=folder)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, f"Folder '{folder.name}' updated.")
        return redirect("resource_library:folder", folder.pk)

    return render(
        request,
        "resources/folder_form.html",
        {
            "form": form,
            "page_title": "Edit folder",
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
    is_root = folder.pk == root.pk

    # Sensible default: a folder that already has files is a resource page,
    # so new files join it; otherwise each file becomes its own resource.
    default_mode = (
        UploadForm.MODE_ADD
        if not is_root and folder.resources.exists()
        else UploadForm.MODE_SEPARATE
    )

    if request.method == "POST":
        form = UploadForm(request.POST, request.FILES)
        if form.is_valid():
            mode = form.cleaned_data["mode"]
            if is_root:
                # The root is organisational by definition — it never becomes
                # a resource page itself
                mode = UploadForm.MODE_SEPARATE
            language = form.cleaned_data["language"]
            for f in form.cleaned_data["files"]:
                stem = Path(f.name).stem
                if mode == UploadForm.MODE_SEPARATE:
                    target = folder.add_child(
                        instance=ResourceFolder(
                            name=stem,
                            description=form.cleaned_data["description"],
                            resource_type=form.cleaned_data["resource_type"],
                            revision_date=form.cleaned_data["revision_date"],
                        )
                    )
                else:
                    target = folder
                resource = Resource(
                    folder=target,
                    file=f,
                    label=stem,
                    language=language,
                    uploaded_by_user=request.user,
                )
                resource.set_file_metadata()
                resource.save()
            count = len(form.cleaned_data["files"])
            if mode == UploadForm.MODE_SEPARATE:
                message = (
                    f"{count} resource{'s' if count != 1 else ''} "
                    f"created in '{folder.name}'."
                )
            else:
                message = (
                    f"{count} file{'s' if count != 1 else ''} "
                    f"added to '{folder.name}'."
                )
            messages.success(request, message)
            return redirect("resource_library:folder", folder.pk)
    else:
        form = UploadForm(initial={"mode": default_mode})

    return render(
        request,
        "resources/upload.html",
        {
            "form": form,
            "folder": folder,
            "is_root": is_root,
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
            messages.success(request, f"'{resource.display_label}' updated.")
            return redirect("resource_library:folder", folder.pk)
    else:
        form = ResourceForm(instance=resource)

    return render(
        request,
        "resources/resource_form.html",
        {
            "form": form,
            "page_title": "Edit file",
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
        label = resource.display_label
        resource.delete()
        messages.success(request, f"'{label}' deleted.")
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
