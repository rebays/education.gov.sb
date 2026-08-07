import os.path

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from grapple.models import (
    GraphQLCollection,
    GraphQLForeignKey,
    GraphQLInt,
    GraphQLRichText,
    GraphQLStreamfield,
    GraphQLString,
)
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from wagtail import blocks
from wagtail.admin.panels import (
    FieldPanel,
    FieldRowPanel,
    MultiFieldPanel,
    MultipleChooserPanel,
)
from wagtail.fields import RichTextField, StreamField
from wagtail.models import Orderable, Page
from wagtail.search import index

from .panels import FilePreviewPanel


class PublicationIndexPage(Page):
    """Landing page for the publications section — front-end lists Publication snippets."""

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


class Publication(index.Indexed, ClusterableModel):
    class PublicationType(models.TextChoices):
        POLICY = "policy", "Policy"
        REPORT = "report", "Report"
        GUIDELINE = "guideline", "Guideline"

    class Office(models.TextChoices):
        PLANNING = "planning", "Planning, Coordination & Research Division"
        STRATEGIC = "strategic", "Strategic Support Unit"
        CURRICULUM = "curriculum", "Curriculum Development Division"
        ASSET = "asset", "Asset Management Division"

    title = models.CharField(max_length=255)
    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        help_text="Auto-generated from the title if left blank.",
    )
    file = models.FileField(
        upload_to="publications/",
        help_text="The publication file (PDF, DOCX, etc.).",
    )
    date = models.DateField("Publication date", default=timezone.now)
    publication_type = models.CharField(
        max_length=32,
        choices=PublicationType.choices,
        default=PublicationType.POLICY,
    )
    office = models.CharField(
        max_length=32,
        choices=Office.choices,
        blank=True,
        help_text="Owning division or office.",
    )
    newer_entry = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Newer publication that supersedes this one, shown as a link on the frontend.",
    )
    summary = models.TextField(
        blank=True,
        help_text="Short summary shown on the publications index and cards.",
    )
    key_points = StreamField(
        [("point", blocks.CharBlock(max_length=200))],
        use_json_field=True,
        blank=True,
        help_text="Optional 'at a glance' bullets shown above the body.",
    )
    body = RichTextField(
        blank=True,
        help_text="Main body content. Use H2 headings for section titles.",
    )

    panels = [
        FieldPanel("title"),
        MultiFieldPanel(
            [
                FieldPanel("file"),
                FilePreviewPanel("file"),
            ],
            heading="File",
        ),
        MultiFieldPanel(
            [
                FieldRowPanel(
                    [
                        FieldPanel("date"),
                        FieldPanel("publication_type"),
                    ]
                ),
                FieldPanel("office"),
            ],
            heading="Details",
        ),
        MultiFieldPanel(
            [
                FieldPanel("summary"),
                FieldPanel("key_points"),
                FieldPanel("body"),
            ],
            heading="Content",
        ),
        MultiFieldPanel(
            [
                FieldPanel("newer_entry"),
                MultipleChooserPanel(
                    "related_publications",
                    chooser_field_name="related",
                    max_num=3,
                    label="Related publication",
                    help_text="Pick up to 3 related publications shown on the frontend.",
                ),
            ],
            heading="Related publications",
        ),
    ]

    search_fields = [
        index.SearchField("title"),
        index.SearchField("summary"),
        index.AutocompleteField("title"),
        index.FilterField("publication_type"),
        index.FilterField("date"),
    ]

    graphql_fields = [
        GraphQLString("title"),
        GraphQLString("slug"),
        GraphQLString("url"),
        GraphQLString("file_extension"),
        GraphQLInt("file_size"),
        GraphQLString("date"),
        GraphQLString("publication_type"),
        GraphQLString("office"),
        # GraphQLSnippet would require Publication to be a registered Wagtail
        # snippet; it isn't, and referencing it that way breaks the whole
        # schema at type-resolution time
        GraphQLForeignKey("newer_entry", "publication.Publication"),
        GraphQLString("summary"),
        GraphQLStreamfield("key_points"),
        GraphQLRichText("body"),
        GraphQLCollection(
            GraphQLForeignKey, "related_publication_items", "publication.Publication"
        ),
    ]

    @property
    def related_publication_items(self):
        return [rp.related for rp in self.related_publications.all()]

    @property
    def url(self):
        # Mirrors grapple.utils.get_media_item_url, without going through it
        # directly: that helper does hasattr(cls, "url") to detect a url
        # attribute, which would re-enter this same property and recurse.
        file_url = self.file.url
        if file_url.startswith("/"):
            return settings.WAGTAILADMIN_BASE_URL + file_url
        return file_url

    @property
    def file_extension(self):
        return os.path.splitext(self.file.name)[1][1:].upper()

    @property
    def file_size(self):
        return self.file.size

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:255]
            slug = base
            n = 2
            while Publication.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                suffix = f"-{n}"
                slug = f"{base[: 255 - len(suffix)]}{suffix}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["-date"]
        verbose_name = "Publication"
        verbose_name_plural = "Publications"


class RelatedPublication(Orderable):
    parent = ParentalKey(
        Publication,
        related_name="related_publications",
        on_delete=models.CASCADE,
    )
    related = models.ForeignKey(
        Publication,
        related_name="+",
        on_delete=models.CASCADE,
    )

    panels = [FieldPanel("related")]

    class Meta(Orderable.Meta):
        verbose_name = "Related publication"
        verbose_name_plural = "Related publications"
