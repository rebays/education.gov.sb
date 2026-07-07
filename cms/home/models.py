from django.db import models

from grapple.models import (
    GraphQLImage,
    GraphQLRichText,
    GraphQLStreamfield,
    GraphQLString,
)
from wagtail import blocks
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.fields import RichTextField, StreamField
from wagtail.models import Page


class HomePage(Page):
    pass


class AboutPage(Page):
    """The single About page for the site — always lives directly under HomePage."""

    lead = models.TextField(
        blank=True,
        help_text="Short lead paragraph shown in the page header.",
    )
    purpose_heading = models.CharField(max_length=200, blank=True)
    purpose_body = RichTextField(
        blank=True,
        help_text="Main 'Our purpose' body content.",
    )
    purpose_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Illustrative image for the purpose section.",
    )
    pillars = StreamField(
        [
            (
                "pillar",
                blocks.StructBlock(
                    [
                        ("title", blocks.CharBlock(max_length=100)),
                        ("text", blocks.TextBlock()),
                    ]
                ),
            ),
        ],
        use_json_field=True,
        blank=True,
        help_text="'Built on three pillars' cards.",
    )
    support_heading = models.CharField(max_length=200, blank=True)
    support_body = models.TextField(blank=True)
    support_email = models.EmailField(blank=True)

    parent_page_types = ["home.HomePage"]
    subpage_types = []
    max_count = 1

    content_panels = Page.content_panels + [
        FieldPanel("lead"),
        MultiFieldPanel(
            [
                FieldPanel("purpose_heading"),
                FieldPanel("purpose_body"),
                FieldPanel("purpose_image"),
            ],
            heading="Our purpose",
        ),
        FieldPanel("pillars"),
        MultiFieldPanel(
            [
                FieldPanel("support_heading"),
                FieldPanel("support_body"),
                FieldPanel("support_email"),
            ],
            heading="Get in touch",
        ),
    ]

    graphql_fields = [
        GraphQLString("lead"),
        GraphQLString("purpose_heading"),
        GraphQLRichText("purpose_body"),
        GraphQLImage("purpose_image"),
        GraphQLStreamfield("pillars"),
        GraphQLString("support_heading"),
        GraphQLString("support_body"),
        GraphQLString("support_email"),
    ]

    class Meta:
        verbose_name = "About page"
