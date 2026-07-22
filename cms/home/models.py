from django.db import models

from grapple.models import (
    GraphQLImage,
    GraphQLRichText,
    GraphQLString,
)
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.fields import RichTextField
from wagtail.models import Page
from wagtail_headless_preview.models import HeadlessMixin


class HomePage(HeadlessMixin, Page):
    pass


class AboutPage(HeadlessMixin, Page):
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
    pillar_one_title = models.CharField(max_length=100, blank=True)
    pillar_one_text = models.TextField(blank=True)
    pillar_two_title = models.CharField(max_length=100, blank=True)
    pillar_two_text = models.TextField(blank=True)
    pillar_three_title = models.CharField(max_length=100, blank=True)
    pillar_three_text = models.TextField(blank=True)
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
        MultiFieldPanel(
            [
                FieldPanel("pillar_one_title"),
                FieldPanel("pillar_one_text"),
                FieldPanel("pillar_two_title"),
                FieldPanel("pillar_two_text"),
                FieldPanel("pillar_three_title"),
                FieldPanel("pillar_three_text"),
            ],
            heading="Built on three pillars",
        ),
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
        GraphQLString("pillar_one_title"),
        GraphQLString("pillar_one_text"),
        GraphQLString("pillar_two_title"),
        GraphQLString("pillar_two_text"),
        GraphQLString("pillar_three_title"),
        GraphQLString("pillar_three_text"),
        GraphQLString("support_heading"),
        GraphQLString("support_body"),
        GraphQLString("support_email"),
    ]

    class Meta:
        verbose_name = "About page"
