from django.contrib.auth.models import Permission
from django.urls import include, path, reverse
from wagtail import hooks
from wagtail.admin.menu import MenuItem
from wagtail.admin.viewsets.chooser import ChooserViewSet
from wagtail.documents.wagtail_hooks import DocumentsSummaryItem

from .views import user_has_library_access


@hooks.register("register_admin_urls")
def register_resource_library_urls():
    return [
        path("resource-library/", include("resources.urls")),
    ]


class ResourceLibraryMenuItem(MenuItem):
    def is_shown(self, request):
        return user_has_library_access(request.user)


@hooks.register("register_admin_menu_item")
def register_resource_library_menu_item():
    return ResourceLibraryMenuItem(
        "Resource Library",
        reverse("resource_library:index"),
        icon_name="folder-open-inverse",
        order=201,
    )


@hooks.register("register_permissions")
def register_resource_library_permissions():
    # Makes the library's model permissions assignable in the group edit view
    return Permission.objects.filter(
        content_type__app_label="resources",
        codename__in=[
            "add_resource",
            "change_resource",
            "delete_resource",
            "view_resource",
            "add_resourcefolder",
            "change_resourcefolder",
            "delete_resourcefolder",
        ],
    )


class ResourceChooserViewSet(ChooserViewSet):
    """Lets pages reference a resource via ForeignKey or ChooserBlock."""

    model = "resources.Resource"
    icon = "doc-full"
    choose_one_text = "Choose a resource"
    choose_another_text = "Choose another resource"


resource_chooser_viewset = ResourceChooserViewSet("resource_chooser")


@hooks.register("register_admin_viewset")
def register_resource_chooser_viewset():
    return resource_chooser_viewset


# --- Hide the built-in Documents app from the admin ---
# The resource library replaces it. The wagtail.documents app itself must stay
# installed (Grapple imports its models), so its admin surfaces are hidden
# here instead. /admin/documents/ remains reachable by direct URL.


@hooks.register("construct_main_menu")
def hide_documents_menu_item(request, menu_items):
    menu_items[:] = [item for item in menu_items if item.name != "documents"]


@hooks.register("construct_homepage_summary_items")
def hide_documents_summary_item(request, summary_items):
    summary_items[:] = [
        item for item in summary_items if not isinstance(item, DocumentsSummaryItem)
    ]


@hooks.register("construct_search")
def hide_documents_search_area(request, search_areas):
    search_areas[:] = [area for area in search_areas if area.name != "documents"]


@hooks.register("register_rich_text_features", order=10)
def remove_document_link_feature(features):
    # order=10 runs this after wagtail.documents (order=0) has added the
    # feature, so rich text editors no longer offer document links
    if "document-link" in features.default_features:
        features.default_features.remove("document-link")
