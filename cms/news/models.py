from django.db import models
from django.utils import timezone
from grapple.models import GraphQLImage, GraphQLStreamfield, GraphQLString
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.blocks import RichTextBlock
from wagtail.fields import StreamField
from wagtail.models import Page

from news.blocks import QuoteBlock


class NewsIndexPage(Page):
    """Landing page for the news section — lists NewsPage children."""

    lead = models.TextField(
        blank=True,
        help_text="Short lead paragraph shown in the page header.",
    )

    parent_page_types = ["home.HomePage"]
    subpage_types = ["news.NewsPage"]
    max_count = 1

    content_panels = Page.content_panels + [
        FieldPanel("lead"),
    ]

    graphql_fields = [
        GraphQLString("lead"),
    ]


class NewsPage(Page):
    class Category(models.TextChoices):
        ANNOUNCEMENT = "announcement", "Announcement"
        PRESS_RELEASE = "press_release", "Press release"
        EVENT = "event", "Event"

    date = models.DateField("Publication date", default=timezone.now)
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.ANNOUNCEMENT,
    )
    excerpt = models.TextField(
        blank=True,
        help_text="Short summary shown on the news index and cards.",
    )
    image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Header/card image.",
    )
    body = StreamField(
        [
            ("rich_text", RichTextBlock()),
            ("quote", QuoteBlock()),
        ],
        use_json_field=True,
        blank=True,
    )

    parent_page_types = ["news.NewsIndexPage"]
    subpage_types = []

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("date"),
                FieldPanel("category"),
            ],
            heading="Meta",
        ),
        FieldPanel("image"),
        FieldPanel("excerpt"),
        FieldPanel("body"),
    ]

    graphql_fields = [
        GraphQLString("date"),
        GraphQLString("category"),
        GraphQLString("excerpt"),
        GraphQLImage("image"),
        GraphQLStreamfield("body"),
    ]

    class Meta:
        verbose_name = "News page"
