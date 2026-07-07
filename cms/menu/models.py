from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.fields import StreamField
from grapple.models import GraphQLString, GraphQLStreamfield
from grapple.helpers import register_query_field
import graphene
from .blocks import MenuItemBlock

@register_query_field("menu", "menus", query_params={"slug": graphene.String()})
class Menu(models.Model):
    name = models.CharField(max_length=100,help_text="Menu Name (e.g., 'main nav' or 'sidebar nav').")
    slug = models.SlugField( unique=True, help_text="Slug used by frontend to fetch menu (e.g., 'main-nav' or 'footer-nav').")

    menu_items = StreamField(MenuItemBlock(), use_json_field=True)

    panels = [
        MultiFieldPanel([
            FieldPanel('name'),
            FieldPanel('slug'),
        ], heading="Identity"),
        MultiFieldPanel([
            FieldPanel('menu_items'),
        ], heading="Items"),
    ]

    graphql_fields = [
        GraphQLString("name"),
        GraphQLString("slug"),
        GraphQLStreamfield("menu_items"),
    ]

    def __str__(self):
        return self.name
