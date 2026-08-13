import hashlib
import os.path

from django import forms as django_forms
from django.conf import settings
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.functional import cached_property
from django.utils.text import slugify
from grapple.models import (
    GraphQLBoolean,
    GraphQLCollection,
    GraphQLForeignKey,
    GraphQLImage,
    GraphQLInt,
    GraphQLString,
    GraphQLTag,
)
from taggit.managers import TaggableManager
from treebeard.mp_tree import MP_Node
from wagtail.admin.panels import FieldPanel, TitleFieldPanel
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


class EducationLevel(models.Model):
    """
    A stage of the education system (Early Childhood, Primary, Junior
    Secondary, Senior Secondary). Kept as data rather than choices so the
    ministry can add stages — TVET, for instance — without a migration.
    """

    name = models.CharField(max_length=100)
    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text=(
            "Used by the frontend to identify this level. Changing it breaks "
            "existing links that filter by this level."
        ),
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Lower numbers appear first in filters and on the coverage map.",
    )

    panels = [
        TitleFieldPanel("name"),
        FieldPanel("slug"),
        FieldPanel("order"),
    ]

    graphql_fields = [
        GraphQLString("name"),
        GraphQLString("slug"),
        GraphQLInt("order"),
    ]

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "education level"

    def __str__(self):
        return self.name


class YearLevel(models.Model):
    """A year/form within a level — 'Year 1', 'Form 3'."""

    label = models.CharField(max_length=100, help_text="Shown to the public, e.g. “Year 1”.")
    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text=(
            "Used by the frontend to identify this year, e.g. “y1”. Changing "
            "it breaks existing links that filter by this year."
        ),
    )
    level = models.ForeignKey(
        EducationLevel,
        # PROTECT, not CASCADE: deleting an education level used to take all
        # of its years with it in one click, wiping the vocabulary that the
        # public filters and coverage map are built from. Clear the years
        # deliberately first.
        on_delete=models.PROTECT,
        related_name="year_levels",
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Lower numbers appear first within the level.",
    )

    panels = [
        TitleFieldPanel("label"),
        FieldPanel("slug"),
        FieldPanel("level"),
        FieldPanel("order"),
    ]

    graphql_fields = [
        GraphQLString("label"),
        GraphQLString("slug"),
        GraphQLString("level_slug"),
        GraphQLInt("order"),
    ]

    class Meta:
        ordering = ["level__order", "order", "label"]
        verbose_name = "year level"

    def __str__(self):
        return self.label

    @property
    def level_slug(self):
        return self.level.slug


class Subject(models.Model):
    """
    A curriculum subject. `levels` scopes which stages it's taught at, so the
    explorer's subject filter and coverage map can show the right rows per
    level — including subjects with nothing published yet, which is the whole
    point of the map.
    """

    name = models.CharField(max_length=150)
    slug = models.SlugField(
        max_length=150,
        unique=True,
        help_text=(
            "Used by the frontend to identify this subject. Changing it breaks "
            "existing links that filter by this subject."
        ),
    )
    levels = models.ManyToManyField(
        EducationLevel,
        related_name="subjects",
        blank=True,
        help_text=(
            "Levels this subject is taught at. Controls which subjects appear "
            "in the filters and as rows on the coverage map."
        ),
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Lower numbers appear first in the subject filter.",
    )

    panels = [
        TitleFieldPanel("name"),
        FieldPanel("slug"),
        FieldPanel("levels", widget=django_forms.CheckboxSelectMultiple),
        FieldPanel("order"),
    ]

    graphql_fields = [
        GraphQLString("name"),
        GraphQLString("slug"),
        GraphQLInt("order"),
        GraphQLCollection(
            GraphQLForeignKey, "levels", "resources.EducationLevel"
        ),
    ]

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "subject"

    def __str__(self):
        return self.name

    def levels_display(self):
        """Level scoping at a glance in the listing, since it's a M2M."""
        return ", ".join(level.name for level in self.levels.all()) or "—"

    levels_display.short_description = "Levels"


class ResourceFolder(index.Indexed, MP_Node):
    """
    Folder tree for the resource library, and — by convention — the resource
    page model: any folder that directly contains files is rendered as a
    resource page on the headless frontend (looked up by slug), and a folder
    that only organises others is rendered as a directory of them, so a
    visitor can walk the tree the same way an editor built it. Editors
    organise the library freely, so no shape is assumed: a folder may hold
    files, subfolders, or both. The library is rooted at a single root node
    created on first use (so it survives renaming).
    """

    class ResourceType(models.TextChoices):
        # Curriculum-materials vocabulary. Policies, reports and guidelines
        # are the Publications app's job (see publication.models.Publication)
        # — deliberately not duplicated here.
        SYLLABUS = "syllabus", "Syllabus"
        TEACHER_GUIDE = "teacher_guide", "Teacher Guide"
        WORKBOOK = "workbook", "Workbook"
        ASSESSMENT = "assessment", "Assessment"
        PRINT_PACK = "print_pack", "Print Pack"
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
    lead = models.TextField(
        blank=True,
        help_text=(
            "Short intro shown in the resource page header. "
            "Leave blank to use the description."
        ),
    )
    cover_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Cover shown on the resource card in the explorer.",
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        help_text=(
            "SEO meta description (160 chars max). "
            "Leave blank to use the folder description."
        ),
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
    published_date = models.DateField(
        null=True,
        blank=True,
        help_text=(
            "Date this resource was published. Defaults to the upload date."
        ),
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Sort order within parent folder (0 = no custom sort)",
    )
    # --- Curriculum facets ---
    # All optional: the explorer treats an unset facet as "unclassified"
    # rather than hiding the resource. `level` is stored rather than derived
    # from `year_levels` so material aimed at a whole stage (with no specific
    # year) can still be filtered.
    level = models.ForeignKey(
        EducationLevel,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="resource_folders",
        help_text="Education stage this resource is for.",
    )
    subject = models.ForeignKey(
        Subject,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="resource_folders",
        help_text="Curriculum subject. Leave blank for cross-subject material.",
    )
    year_levels = models.ManyToManyField(
        YearLevel,
        blank=True,
        related_name="resource_folders",
        help_text=(
            "Years/forms this resource covers. Choose several for material "
            "spanning a range; leave blank if it applies to the whole level."
        ),
    )
    topics = TaggableManager(
        blank=True,
        help_text="Free-form keywords, e.g. literacy, inclusive education.",
    )
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
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
        index.FilterField("resource_type"),
        index.FilterField("level_id"),
        index.FilterField("subject_id"),
    ]

    graphql_fields = [
        GraphQLString("name"),
        GraphQLString("slug"),
        GraphQLString("description"),
        GraphQLString("lead"),
        GraphQLString("display_lead"),
        GraphQLImage("cover_image"),
        GraphQLString("meta_description"),
        GraphQLString("canonical_url"),
        GraphQLString("resource_type"),
        GraphQLString("resource_type_display"),
        GraphQLString("url_path"),
        GraphQLImage("og_image"),
        GraphQLString("published_date"),
        GraphQLInt("order"),
        GraphQLInt("file_count"),
        GraphQLInt("child_count"),
        GraphQLString("resource_index_page_slug"),
        GraphQLString("resource_index_page_title"),
        GraphQLForeignKey("level", "resources.EducationLevel"),
        GraphQLForeignKey("subject", "resources.Subject"),
        GraphQLCollection(GraphQLForeignKey, "year_levels", "resources.YearLevel"),
        GraphQLTag("topics"),
        GraphQLString("last_updated"),
        GraphQLCollection(GraphQLForeignKey, "resources", "resources.Resource"),
        GraphQLCollection(GraphQLForeignKey, "children", "resources.ResourceFolder"),
        GraphQLCollection(
            GraphQLForeignKey, "ancestor_folders", "resources.ResourceFolder"
        ),
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
    def child_count(self):
        """
        Number of subfolders. Paired with file_count so the frontend can
        describe a folder honestly whichever way an editor has organised
        it — "0 files" is misleading for a folder holding only subfolders.
        """
        return self.get_children().count()

    @cached_property
    def index_page(self):
        """
        The ResourceIndexPage this folder belongs to.

        The FK is optional and nothing sets it — it isn't on the folder form
        and no upload path assigns it — so in practice it is always null.
        Since ResourceIndexPage is max_count = 1 there is only ever one
        section to belong to, so fall back to it rather than leaving every
        folder unattributed and every public URL guessing at a prefix.
        """
        if self.resource_index_page:
            return self.resource_index_page
        return ResourceIndexPage.objects.live().first()

    @property
    def resource_index_page_slug(self):
        """Slug of the section this folder sits in; names its URL prefix."""
        return self.index_page.slug if self.index_page else None

    @property
    def resource_index_page_title(self):
        """
        Title of the section, for breadcrumbs. The slug names the URL and
        the title names the section; an editor renaming the index page
        should move the breadcrumb label with it.
        """
        return self.index_page.title if self.index_page else None

    @property
    def display_lead(self):
        """
        Text for the resource page header. Falls back to the description so
        the hero is never empty on resources that predate the lead field.
        """
        return self.lead or self.description

    @property
    def ancestor_folders(self):
        """
        Folders between the library root and this one, outermost first. The
        root is excluded — it's the library itself, not a location. Used to
        label breadcrumbs with real folder names instead of URL slugs.
        """
        return [a for a in self.get_ancestors() if a.depth > 1]

    @property
    def url_path(self):
        """
        Public path of this resource page, e.g. `/resources/primary/year-1/`.
        The frontend's catch-all route resolves a folder by its whole path
        from the library root, so a bare slug isn't enough to link to one.
        """
        ancestors = [a.slug for a in self.get_ancestors() if a.depth > 1]
        prefix = self.resource_index_page_slug or "resources"
        return "/" + "/".join([prefix, *ancestors, self.slug]) + "/"

    @property
    def resource_type_display(self):
        """Human label for `resource_type` — keeps the vocabulary single-sourced."""
        return self.get_resource_type_display() if self.resource_type else ""

    @property
    def last_updated(self):
        """
        Date the explorer sorts and labels by. The editor's `published_date`
        wins when set — it describes the material, not the CMS record —
        otherwise fall back to when the folder was last touched.
        """
        return self.published_date or self.updated_at.date()


class Resource(index.Indexed, models.Model):
    """
    A file in the resource library. Page-level metadata (slug, description,
    type, revision date) lives on the containing ResourceFolder; the file
    carries only its own label. Files are served directly from
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
    ]

    graphql_fields = [
        GraphQLString("label"),
        GraphQLString("display_label"),
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
