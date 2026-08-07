from django.db import models
from grapple.models import (
    GraphQLImage,
    GraphQLRichText,
    GraphQLStreamfield,
    GraphQLString,
)
from wagtail import blocks
from wagtail.admin.panels import FieldPanel, FieldRowPanel, MultiFieldPanel
from wagtail.fields import RichTextField, StreamField
from wagtail.models import Page
from wagtail_headless_preview.models import HeadlessMixin

from home.blocks import (
    DropdownFieldBlock,
    EmailFieldBlock,
    MultilineTextFieldBlock,
    PillarBlock,
    ServiceBlock,
    TextFieldBlock,
)


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
    pillars = StreamField(
        [("pillar", PillarBlock())],
        use_json_field=True,
        blank=True,
        help_text="'Built on three pillars' cards.",
    )
    service_heading = models.CharField(max_length=200, blank=True)
    service_intro = models.TextField(blank=True)
    services = StreamField(
        [("service", ServiceBlock())],
        use_json_field=True,
        blank=True,
        help_text="Services shown in the media accordion.",
    )
    support_heading = models.CharField(max_length=200, blank=True)
    support_body = models.TextField(blank=True)
    support_email = models.EmailField(blank=True)

    contact_form_heading = models.CharField(max_length=200, blank=True)
    contact_form_intro = models.TextField(blank=True)
    contact_form_fields = StreamField(
        [
            ("text", TextFieldBlock()),
            ("email", EmailFieldBlock()),
            ("multiline", MultilineTextFieldBlock()),
            ("dropdown", DropdownFieldBlock()),
        ],
        use_json_field=True,
        blank=True,
        help_text="Input fields rendered inside the contact form.",
    )
    contact_form_submit_text = models.CharField(
        max_length=100, blank=True, default="Send message"
    )

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
                FieldPanel("service_heading"),
                FieldPanel("service_intro"),
                FieldPanel("services"),
            ],
            heading="Services",
        ),
        MultiFieldPanel(
            [
                FieldPanel("support_heading"),
                FieldPanel("support_body"),
                FieldPanel("support_email"),
            ],
            heading="Get in touch",
        ),
        MultiFieldPanel(
            [
                FieldPanel("contact_form_heading"),
                FieldPanel("contact_form_intro"),
                FieldPanel("contact_form_fields"),
                FieldPanel("contact_form_submit_text"),
            ],
            heading="Contact form",
        ),
    ]

    graphql_fields = [
        GraphQLString("lead"),
        GraphQLString("purpose_heading"),
        GraphQLRichText("purpose_body"),
        GraphQLImage("purpose_image"),
        GraphQLStreamfield("pillars"),
        GraphQLString("service_heading"),
        GraphQLString("service_intro"),
        GraphQLStreamfield("services"),
        GraphQLString("support_heading"),
        GraphQLString("support_body"),
        GraphQLString("support_email"),
        GraphQLString("contact_form_heading"),
        GraphQLString("contact_form_intro"),
        GraphQLStreamfield("contact_form_fields"),
        GraphQLString("contact_form_submit_text"),
    ]

    class Meta:
        verbose_name = "About page"


class AccessibilityPage(HeadlessMixin, Page):
    """The single Accessibility statement page — always lives directly under HomePage."""

    lead = models.TextField(
        blank=True,
        help_text="Short lead paragraph shown in the page header.",
    )
    at_a_glance = StreamField(
        [("point", blocks.CharBlock(max_length=200))],
        use_json_field=True,
        blank=True,
        help_text="Skimmable bullets shown above the body.",
    )
    body = RichTextField(
        blank=True,
        help_text="Main body content. Use H2 headings for section titles.",
    )
    conformance_target = models.CharField(
        max_length=100, blank=True, default="WCAG 2.1 AA"
    )
    effective_date = models.DateField(null=True, blank=True)
    last_reviewed = models.DateField(null=True, blank=True)
    contact_email = models.EmailField(blank=True)

    parent_page_types = ["home.HomePage"]
    subpage_types = []
    max_count = 1

    content_panels = Page.content_panels + [
        FieldPanel("lead"),
        FieldPanel("at_a_glance"),
        FieldPanel("body"),
        MultiFieldPanel(
            [
                FieldPanel("conformance_target"),
                FieldRowPanel(
                    [
                        FieldPanel("effective_date"),
                        FieldPanel("last_reviewed"),
                    ]
                ),
                FieldPanel("contact_email"),
            ],
            heading="Conformance",
        ),
    ]

    graphql_fields = [
        GraphQLString("lead"),
        GraphQLStreamfield("at_a_glance"),
        GraphQLRichText("body"),
        GraphQLString("conformance_target"),
        GraphQLString("effective_date"),
        GraphQLString("last_reviewed"),
        GraphQLString("contact_email"),
    ]

    class Meta:
        verbose_name = "Accessibility page"
