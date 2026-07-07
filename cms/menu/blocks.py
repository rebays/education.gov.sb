from wagtail import blocks
from grapple.helpers import register_streamfield_block
from grapple.models import (
    GraphQLBoolean,
    GraphQLPage,
    GraphQLStreamfield,
    GraphQLString,
)


@register_streamfield_block
class PageLinkBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    page = blocks.PageChooserBlock()

    graphql_fields = [
        GraphQLString("title"),
        GraphQLPage("page"),
    ]

    class Meta:
        graphql_name = "PageLinkBlock"

@register_streamfield_block
class ExternalLinkBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    url = blocks.URLBlock()

    graphql_fields = [
        GraphQLString("title"),
        GraphQLString("url"),
    ]

    class Meta:
        graphql_name = "ExternalLinkBlock"

@register_streamfield_block
class LinksGroupBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    links = blocks.StreamBlock([
        ('page_link', PageLinkBlock()),
        ('external_link', ExternalLinkBlock()),
    ])

    graphql_fields = [
        GraphQLString("title"),
        GraphQLStreamfield("links"),
    ]

    class Meta:
        graphql_name = "LinksGroupBlock"


@register_streamfield_block
class DropdownBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    page = blocks.PageChooserBlock(required=False, help_text="Optional — makes the dropdown title a clickable link.")
    show_dropdown_icon = blocks.BooleanBlock(required=False, help_text="Display a dropdown indicator icon.")
    items = blocks.StreamBlock([
        ('page_link', PageLinkBlock()),
        ('external_link', ExternalLinkBlock()),
        ('links_group', LinksGroupBlock()),
    ])

    graphql_fields = [
        GraphQLString("title"),
        GraphQLPage("page"),
        GraphQLBoolean("show_dropdown_icon"),
        GraphQLStreamfield("items"),
    ]

    class Meta:
        graphql_name = "DropdownBlock"


class MenuItemBlock(blocks.StreamBlock):
    page_link = PageLinkBlock()
    external_link = ExternalLinkBlock()
    links_group = LinksGroupBlock()
    dropdown = DropdownBlock()

    class Meta:
        graphql_name = "MenuItemBlock"