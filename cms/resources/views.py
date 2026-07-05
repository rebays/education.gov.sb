from pathlib import Path

from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db.models import Count
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from wagtail.documents import get_document_model
from wagtail.documents.permissions import permission_policy
from wagtail.models import Collection

from .forms import FolderForm, MultipleDocumentUploadForm

LIBRARY_ROOT_NAME = "Resource Library"
DOCUMENTS_PER_PAGE = 50
LAYOUT_SESSION_KEY = "resource_library_layout"
DEFAULT_LAYOUT = "grid"


def get_library_root():
    """
    The library lives in its own subtree of the collection tree, rooted at a
    collection named "Resource Library" (created on first use). Renaming that
    collection in Settings > Collections will cause a new empty root to be
    created here.
    """
    root = Collection.objects.filter(name=LIBRARY_ROOT_NAME, depth=2).first()
    if root is None:
        root = Collection.get_first_root_node().add_child(name=LIBRARY_ROOT_NAME)
    return root


def check_library_access(request):
    if not permission_policy.user_has_any_permission(
        request.user, ["add", "change", "delete", "choose"]
    ):
        raise PermissionDenied


def get_folder(folder_id):
    """Resolve a folder id to (library root, folder), 404ing outside the library."""
    root = get_library_root()
    if folder_id is None:
        return root, root
    folder = get_object_or_404(Collection, id=folder_id)
    if folder.pk != root.pk and not folder.is_descendant_of(root):
        raise Http404
    return root, folder


def get_breadcrumbs(root, folder):
    return [c for c in folder.get_ancestors() if c.depth >= root.depth] + [folder]


def user_can_upload_to(user, folder):
    return (
        permission_policy.collections_user_has_permission_for(user, "add")
        .filter(pk=folder.pk)
        .exists()
    )


def explorer(request, folder_id=None):
    check_library_access(request)
    root, folder = get_folder(folder_id)
    Document = get_document_model()

    layout = request.GET.get("layout")
    if layout in ("grid", "list"):
        request.session[LAYOUT_SESSION_KEY] = layout
    else:
        layout = request.session.get(LAYOUT_SESSION_KEY, DEFAULT_LAYOUT)

    search_query = request.GET.get("q", "").strip()
    if search_query:
        # Search covers the current folder and everything below it
        subtree = folder.get_descendants(inclusive=True)
        subfolders = []
        documents = (
            Document.objects.filter(collection__in=subtree)
            .select_related("collection")
            .order_by("title")
            .search(search_query)
        )
    else:
        subfolders = list(folder.get_children().order_by("name"))
        documents = Document.objects.filter(collection=folder).order_by("title")

        # Annotate each subfolder with the file and folder counts of its whole
        # subtree, using one aggregate query and treebeard's materialised paths
        counts = (
            Document.objects.filter(collection__in=folder.get_descendants())
            .values("collection__path")
            .annotate(count=Count("id"))
        )
        descendant_paths = list(
            folder.get_descendants().values_list("path", flat=True)
        )
        for sub in subfolders:
            sub.document_count = sum(
                row["count"]
                for row in counts
                if row["collection__path"].startswith(sub.path)
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
            "can_upload": user_can_upload_to(request.user, folder),
            "can_add_folder": request.user.has_perm("wagtailcore.add_collection"),
            "can_change_folder": request.user.has_perm("wagtailcore.change_collection"),
            "can_delete_folder": request.user.has_perm("wagtailcore.delete_collection"),
            "can_delete_documents": permission_policy.user_has_any_permission(
                request.user, ["delete"]
            ),
        },
    )


def add_folder(request, parent_id):
    check_library_access(request)
    if not request.user.has_perm("wagtailcore.add_collection"):
        raise PermissionDenied
    root, parent = get_folder(parent_id)

    form = FolderForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        folder = parent.add_child(instance=Collection(name=form.cleaned_data["name"]))
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
    if not request.user.has_perm("wagtailcore.change_collection"):
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
    if not request.user.has_perm("wagtailcore.delete_collection"):
        raise PermissionDenied
    root, folder = get_folder(folder_id)
    if folder.pk == root.pk:
        raise PermissionDenied

    Document = get_document_model()
    is_empty = (
        not folder.get_children().exists()
        and not Document.objects.filter(collection=folder).exists()
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
    root, folder = get_folder(folder_id)
    if not user_can_upload_to(request.user, folder):
        raise PermissionDenied

    Document = get_document_model()

    if request.method == "POST":
        form = MultipleDocumentUploadForm(request.POST, request.FILES)
        if form.is_valid():
            for f in form.cleaned_data["files"]:
                document = Document(
                    title=Path(f.name).stem,
                    file=f,
                    collection=folder,
                    uploaded_by_user=request.user,
                    resource_type=form.cleaned_data["resource_type"],
                    language=form.cleaned_data["language"],
                    revision_date=form.cleaned_data["revision_date"],
                    description=form.cleaned_data["description"],
                )
                document._set_document_file_metadata()
                document.save()
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
