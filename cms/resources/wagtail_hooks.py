import graphene
from django.contrib.auth.models import Permission
from django.db.models import Count
from django.urls import include, path, reverse
from grapple.registry import registry
from wagtail import hooks
from wagtail.admin.menu import MenuItem
from wagtail.admin.viewsets.chooser import ChooserViewSet
from wagtail.documents.wagtail_hooks import DocumentsSummaryItem

from .models import ResourceFolder
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


# --- Frontend GraphQL queries ---
# Convention: the folder tree is CMS-side organisation only. A folder that
# directly contains files is a "resource page"; the hierarchy itself is never
# exposed to the frontend.


def resource_pages_queryset():
    return ResourceFolder.objects.annotate(
        direct_file_count=Count("resources")
    ).filter(direct_file_count__gt=0)


class ResourcePagesQuery(graphene.ObjectType):
    resource_pages = graphene.List(
        lambda: registry.models[ResourceFolder],
        resource_type=graphene.String(),
    )
    resource_page = graphene.Field(
        lambda: registry.models[ResourceFolder],
        slug=graphene.String(required=True),
    )

    def resolve_resource_pages(self, info, resource_type=None, **kwargs):
        queryset = resource_pages_queryset().order_by("name")
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        return queryset

    def resolve_resource_page(self, info, slug, **kwargs):
        return resource_pages_queryset().filter(slug=slug).first()


@hooks.register("register_schema_query")
def register_resource_pages_query(query_mixins):
    query_mixins.append(ResourcePagesQuery)


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
