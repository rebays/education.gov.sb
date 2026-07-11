from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from grapple.models import (
    GraphQLRichText,
    GraphQLStreamfield,
    GraphQLString,
)
from wagtail import blocks
from wagtail.admin.panels import FieldPanel, FieldRowPanel, MultiFieldPanel
from wagtail.fields import RichTextField, StreamField
from wagtail.models import Page
from wagtail.search import index

from .panels import FilePreviewPanel


class PublicationIndexPage(Page):
    """Landing page for the publications section — front-end lists Publication snippets."""

    parent_page_types = ["home.HomePage"]
    subpage_types = []
    max_count = 1


class Publication(index.Indexed, models.Model):
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
        GraphQLString("file"),
        GraphQLString("date"),
        GraphQLString("publication_type"),
        GraphQLString("office"),
        GraphQLString("summary"),
        GraphQLStreamfield("key_points"),
        GraphQLRichText("body"),
    ]

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
