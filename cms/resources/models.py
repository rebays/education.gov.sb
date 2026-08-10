import hashlib
import os.path

from django.conf import settings
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.text import slugify
from grapple.models import (
    GraphQLBoolean,
    GraphQLCollection,
    GraphQLForeignKey,
    GraphQLInt,
    GraphQLString,
)
from treebeard.mp_tree import MP_Node
from wagtail.admin.panels import FieldPanel
from wagtail.models import Page
from wagtail.search import index

LIBRARY_ROOT_NAME = "Resource Library"

# Extensions treated as video: they get the larger upload limit, a video icon
# in the explorer, and should be rendered as a player on the frontend.
# Browser-playable formats only.
VIDEO_EXTENSIONS = ["mp4", "webm", "m4v"]


def is_video_filename(filename):
    return os.path.splitext(filename)[1][1:].lower() in VIDEO_EXTENSIONS


class ResourceIndexPage(Page):
    """Landing page for the resources section."""

    lead = models.TextField(
        blank=True,
        help_text="Short lead paragraph shown in the page header.",
    )

    parent_page_types = ["home.HomePage"]
    subpage_types = []
    max_count = 1

    content_panels = Page.content_panels + [
        FieldPanel("lead"),
    ]

    graphql_fields = [
        GraphQLString("lead"),
    ]


class ResourceFolder(index.Indexed, MP_Node):
    """
    Folder tree for the resource library, and — by convention — the resource
    page model: the tree exists purely for organising the library in the CMS,
    and any folder that directly contains files is rendered as a resource
    page on the headless frontend (looked up by slug). The hierarchy itself
    is never exposed. The library is rooted at a single root node created on
    first use (so it survives renaming).
    """

    class ResourceType(models.TextChoices):
        POLICY = "policy", "Policy"
        FORM = "form", "Form"
        REPORT = "report", "Report"
        CIRCULAR = "circular", "Circular"
        CURRICULUM = "curriculum", "Curriculum Material"
        VIDEO = "video", "Video"
        OTHER = "other", "Other"

    name = models.CharField(max_length=255)
    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        help_text="Used in the resource page's public URL; generated from the name if left blank",
    )
    description = models.TextField(blank=True)
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        help_text="SEO meta description (160 chars max). Leave blank to use the folder description.",
    )
    og_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Image for social media sharing (OG image).",
    )
    canonical_url = models.URLField(
        blank=True,
        help_text="Custom canonical URL. Leave blank to use the folder's public URL.",
    )
    resource_type = models.CharField(
        max_length=20,
        choices=ResourceType.choices,
        blank=True,
        default="",
    )
    revision_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date of the current revision of this resource",
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Sort order within parent folder (0 = no custom sort)",
    )
    resource_index_page = models.ForeignKey(
        ResourceIndexPage,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="resource_folders",
        help_text="The ResourceIndexPage this folder belongs to",
    )

    search_fields = [
        index.SearchField("name"),
        index.AutocompleteField("name"),
        index.SearchField("description"),
        index.FilterField("path"),
    ]

    graphql_fields = [
        GraphQLString("name"),
        GraphQLString("slug"),
        GraphQLString("description"),
        GraphQLString("meta_description"),
        GraphQLString("canonical_url"),
        GraphQLString("resource_type"),
        GraphQLString("revision_date"),
        GraphQLInt("order"),
        GraphQLInt("file_count"),
        GraphQLString("resource_index_page_slug"),
        GraphQLCollection(GraphQLForeignKey, "resources", "resources.Resource"),
        GraphQLCollection(GraphQLForeignKey, "children", "resources.ResourceFolder"),
    ]

    class Meta:
        verbose_name = "resource folder"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Generate the slug once; it stays stable across later renames so
        # public URLs don't break
        if not self.slug:
            base = slugify(self.name)[:240] or "folder"
            slug = base
            suffix = 2
            while ResourceFolder.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{suffix}"
                suffix += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @classmethod
    def get_library_root(cls):
        root = cls.get_first_root_node()
        if root is None:
            root = cls.add_root(name=LIBRARY_ROOT_NAME)
        return root

    @property
    def file_count(self):
        return self.resources.count()

    @property
    def is_resource_page(self):
        """Frontend convention: a folder with files is a resource page."""
        return self.resources.exists()

    @property
    def children(self):
        """Return immediate child folders."""
        return self.get_children().order_by("order", "name")

    @property
    def resource_index_page_slug(self):
        """Return the slug of the associated ResourceIndexPage."""
        if self.resource_index_page:
            return self.resource_index_page.slug
        return None


class Resource(index.Indexed, models.Model):
    """
    A file in the resource library. Page-level metadata (slug, description,
    type, revision date) lives on the containing ResourceFolder; the file
    carries only its own label and language. Files are served directly from
    media storage via `file.url`.
    """

    folder = models.ForeignKey(
        ResourceFolder, on_delete=models.PROTECT, related_name="resources"
    )
    label = models.CharField(
        max_length=255,
        blank=True,
        help_text="Shown as the download name; prefilled from the filename",
    )
    file = models.FileField(upload_to="resources", max_length=255)
    language = models.CharField(
        max_length=10,
        blank=True,
        default="en",
        help_text="ISO language code, e.g. en, fr, de",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    published_date = models.DateField(
        null=True,
        blank=True,
        help_text="Publication date (optional, defaults to upload date)",
    )
    office = models.CharField(
        max_length=255,
        blank=True,
        help_text="Publishing office/organization (e.g., 'Ministry of Education')",
    )
    pages = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Number of pages (for documents)",
    )
    uploaded_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    file_size = models.PositiveBigIntegerField(null=True, editable=False)
    file_hash = models.CharField(max_length=40, blank=True, editable=False)

    search_fields = [
        index.SearchField("label"),
        index.AutocompleteField("label"),
        index.FilterField("folder"),
        index.FilterField("language"),
    ]

    graphql_fields = [
        GraphQLString("label"),
        GraphQLString("display_label"),
        GraphQLString("language"),
        GraphQLString("url"),
        GraphQLString("filename"),
        GraphQLString("file_extension"),
        GraphQLString("office"),
        GraphQLString("published_date"),
        GraphQLBoolean("is_video"),
        GraphQLInt("file_size"),
        GraphQLInt("pages"),
    ]

    class Meta:
        verbose_name = "resource"

    def __str__(self):
        return self.display_label

    @property
    def display_label(self):
        return self.label or self.filename

    @property
    def url(self):
        file_url = self.file.url
        if file_url.startswith("/"):
            return settings.WAGTAILADMIN_BASE_URL + file_url
        return file_url

    @property
    def filename(self):
        return os.path.basename(self.file.name)

    @property
    def file_extension(self):
        return os.path.splitext(self.filename)[1][1:]

    @property
    def is_video(self):
        return is_video_filename(self.file.name)

    def set_file_metadata(self):
        """Populate file_size and file_hash from the current file."""
        self.file.seek(0)
        self.file_hash = hashlib.sha1(self.file.read()).hexdigest()
        self.file.seek(0)
        self.file_size = self.file.size


@receiver(post_delete, sender=Resource)
def delete_resource_file(instance, **kwargs):
    # FileFields don't clean up storage on delete; do it ourselves
    instance.file.delete(save=False)
