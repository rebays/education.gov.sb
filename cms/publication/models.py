from django.db import models
from django.utils import timezone

from grapple.models import (
    GraphQLRichText,
    GraphQLStreamfield,
    GraphQLString,
)
from wagtail import blocks
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.fields import RichTextField, StreamField
from wagtail.models import Page


class PublicationIndexPage(Page):
    """Landing page for the publications section — lists PublicationPage children."""

    parent_page_types = ["home.HomePage"]
    subpage_types = ["publication.PublicationPage"]
    max_count = 1


class PublicationPage(Page):
    class PublicationType(models.TextChoices):
        POLICY = "policy", "Policy"
        REPORT = "report", "Report"
        GUIDELINE = "guideline", "Guideline"

    date = models.DateField("Publication date", default=timezone.now)
    publication_type = models.CharField(
        max_length=32,
        choices=PublicationType.choices,
        default=PublicationType.POLICY,
    )
    office = models.CharField(
        max_length=200,
        blank=True,
        help_text="Owning division or office, e.g. 'Curriculum Development Division'.",
    )
    format = models.CharField(
        max_length=20,
        blank=True,
        default="PDF",
        help_text="Document format label shown in listings, e.g. 'PDF'.",
    )
    size = models.CharField(
        max_length=20,
        blank=True,
        help_text="Human-readable file size shown in listings, e.g. '3.2 MB'.",
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

    parent_page_types = ["publication.PublicationIndexPage"]
    subpage_types = []

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("date"),
                FieldPanel("publication_type"),
                FieldPanel("office"),
            ],
            heading="Meta",
        ),
        MultiFieldPanel(
            [
                FieldPanel("format"),
                FieldPanel("size"),
            ],
            heading="File info",
        ),
        FieldPanel("summary"),
        FieldPanel("key_points"),
        FieldPanel("body"),
    ]

    graphql_fields = [
        GraphQLString("date"),
        GraphQLString("publication_type"),
        GraphQLString("office"),
        GraphQLString("format"),
        GraphQLString("size"),
        GraphQLString("summary"),
        GraphQLStreamfield("key_points"),
        GraphQLRichText("body"),
    ]

    class Meta:
        verbose_name = "Publication page"
