import graphene
from django.contrib.auth.models import Permission
from django.db.models import Count, Q
from django.urls import include, path, reverse
from grapple.registry import registry
from wagtail import hooks
from wagtail.admin.admin_url_finder import (
    ModelAdminURLFinder,
    register_admin_url_finder,
)
from wagtail.admin.menu import MenuItem
from wagtail.admin.viewsets.chooser import ChooserViewSet
from wagtail.documents.wagtail_hooks import DocumentsSummaryItem
from wagtail.permission_policies import ModelPermissionPolicy

# `viewsets` is imported for its side effect: registering the curriculum
# vocabulary snippets. Only `wagtail_hooks` is autodiscovered by Wagtail, so
# a `viewsets` module that nothing imports never runs — as is currently the
# case for publication/viewsets.py, whose snippet is silently unregistered.
from . import viewsets  # noqa: F401
from .models import EducationLevel, ResourceFolder, Subject, YearLevel
from .views import user_has_library_access


@hooks.register("register_admin_urls")
def register_resource_library_urls():
    return [
        path("resource-library/", include("resources.urls")),
    ]


class ResourceFolderAdminURLFinder(ModelAdminURLFinder):
    """
    Teaches Wagtail how to link to a resource folder.

    Wagtail resolves referencing objects to an edit URL when rendering usage
    listings — models managed by a viewset get this for free, but the library
    has its own bespoke admin. Without a finder, every folder shown on a
    subject's or level's usage page is anonymised to "(Private resource
    folder)" with no link, which defeats the point of the page.
    """

    edit_url_name = "resource_library:edit_folder"
    permission_policy = ModelPermissionPolicy(ResourceFolder)


register_admin_url_finder(ResourceFolder, ResourceFolderAdminURLFinder)


class ResourceLibraryMenuItem(MenuItem):
    def is_shown(self, request):
        return user_has_library_access(request.user)


@hooks.register("register_admin_menu_item")
def register_resource_library_menu_item():
    return ResourceLibraryMenuItem(
        "Resource Library",
        reverse("resource_library:index"),
        # Not a folder icon: that's what Pages uses, and two top-level items
        # with the same icon are indistinguishable at a glance. A document
        # icon also matches what the library actually holds, and what its own
        # file cards and chooser already use.
        icon_name="doc-full",
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


def live_folders():
    """
    Folders the public may see: published, and not inside anything that
    isn't. Publication cascades — hiding a section has to hide what's inside
    it, or its children stay reachable at URLs containing its slug.
    """
    hidden = list(
        ResourceFolder.objects.filter(is_published=False).values_list(
            "path", flat=True
        )
    )
    queryset = ResourceFolder.objects.filter(is_published=True)
    if hidden:
        # Materialised paths: a descendant's path starts with its ancestor's
        descendants = Q()
        for path in hidden:
            descendants |= Q(path__startswith=path)
        queryset = queryset.exclude(descendants)
    return queryset


def resource_pages_queryset():
    return live_folders().annotate(
        direct_file_count=Count("resources")
    ).filter(direct_file_count__gt=0)


def resolve_folder_by_path(path_parts):
    """
    Resolve a folder by its path from the library root.
    path_parts: list of slugs like ['primary', 'year-1', 'english']
    Returns the folder at that path, or None if not found.
    """
    if not path_parts:
        return ResourceFolder.get_library_root()

    current = ResourceFolder.get_library_root()
    for slug in path_parts:
        try:
            current = current.get_children().get(slug=slug)
        except ResourceFolder.DoesNotExist:
            return None
    return current


class ResourceTypeChoice(graphene.ObjectType):
    """A `ResourceFolder.ResourceType` choice, for building filter controls."""

    value = graphene.String(required=True)
    label = graphene.String(required=True)


class ResourcePagesQuery(graphene.ObjectType):
    resource_pages = graphene.List(
        lambda: registry.models[ResourceFolder],
        resource_type=graphene.String(),
        level=graphene.String(description="EducationLevel slug"),
        subject=graphene.String(description="Subject slug"),
        year_level=graphene.String(description="YearLevel slug"),
        topic=graphene.String(description="Topic tag name"),
        search=graphene.String(description="Case-insensitive name/description match"),
    )
    education_levels = graphene.List(
        lambda: registry.models[EducationLevel],
        description="Education stages, in display order",
    )
    year_levels = graphene.List(
        lambda: registry.models[YearLevel],
        level=graphene.String(description="Restrict to one EducationLevel slug"),
        description="Years/forms, in display order",
    )
    subjects = graphene.List(
        lambda: registry.models[Subject],
        level=graphene.String(description="Restrict to subjects taught at this level"),
        description="Curriculum subjects, in display order",
    )
    resource_types = graphene.List(
        ResourceTypeChoice,
        description="Available resource type values and their display labels",
    )
    resource_page = graphene.Field(
        lambda: registry.models[ResourceFolder],
        slug=graphene.String(required=True),
    )
    resource_folder = graphene.Field(
        lambda: registry.models[ResourceFolder],
        path=graphene.String(required=True),
        description="Fetch folder by slash-separated path (e.g. 'primary/year-1/english')",
    )
    resource_library_root = graphene.Field(
        lambda: registry.models[ResourceFolder],
        description="Fetch the resource library root folder with all top-level folders",
    )

    def resolve_resource_pages(
        self,
        info,
        resource_type=None,
        level=None,
        subject=None,
        year_level=None,
        topic=None,
        search=None,
        **kwargs,
    ):
        queryset = (
            resource_pages_queryset()
            .select_related("level", "subject")
            .prefetch_related("year_levels", "topics", "resources")
            .order_by("name")
        )
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        if level:
            queryset = queryset.filter(level__slug=level)
        if subject:
            queryset = queryset.filter(subject__slug=subject)
        if year_level:
            queryset = queryset.filter(year_levels__slug=year_level)
        if topic:
            queryset = queryset.filter(topics__name__iexact=topic)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        # year_levels/topics are many-to-many, so their filters can duplicate rows
        return queryset.distinct()

    def resolve_education_levels(self, info, **kwargs):
        return EducationLevel.objects.all()

    def resolve_year_levels(self, info, level=None, **kwargs):
        queryset = YearLevel.objects.select_related("level")
        if level:
            queryset = queryset.filter(level__slug=level)
        return queryset

    def resolve_resource_types(self, info, **kwargs):
        return [
            ResourceTypeChoice(value=value, label=label)
            for value, label in ResourceFolder.ResourceType.choices
        ]

    def resolve_subjects(self, info, level=None, **kwargs):
        queryset = Subject.objects.prefetch_related("levels")
        if level:
            queryset = queryset.filter(levels__slug=level)
        return queryset.distinct()

    def resolve_resource_page(self, info, slug, **kwargs):
        return resource_pages_queryset().filter(slug=slug).first()

    def resolve_resource_folder(self, info, path, **kwargs):
        """
        Resolve folder by slash-separated path from library root.
        E.g. 'primary/year-1/english' or 'policies'
        """
        if not path:
            return None
        path_parts = [p.strip() for p in path.split('/') if p.strip()]
        folder = resolve_folder_by_path(path_parts)
        if folder is None or not folder.is_live:
            return None
        return folder

    def resolve_resource_library_root(self, info, **kwargs):
        """Return the resource library root folder."""
        return ResourceFolder.get_library_root()


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
