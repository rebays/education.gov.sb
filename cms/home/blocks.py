from grapple.helpers import register_streamfield_block
from grapple.models import GraphQLCollection, GraphQLString
from wagtail import blocks


PILLAR_ICON_CHOICES = [
    ("shield", "Shield (verified / trust)"),
    ("people", "People (community / inclusion)"),
    ("cloud", "Cloud (access / offline)"),
]


@register_streamfield_block
class PillarBlock(blocks.StructBlock):
    title = blocks.CharBlock(max_length=100)
    text = blocks.TextBlock()
    icon = blocks.ChoiceBlock(choices=PILLAR_ICON_CHOICES, required=False)

    graphql_fields = [
        GraphQLString("title"),
        GraphQLString("text"),
        GraphQLString("icon"),
    ]

    class Meta:
        icon = "list-ul"


# ---- Contact form field blocks ----


@register_streamfield_block
class TextFieldBlock(blocks.StructBlock):
    field_label = blocks.CharBlock(max_length=200)
    placeholder = blocks.CharBlock(max_length=200, required=False)

    graphql_fields = [
        GraphQLString("field_label"),
        GraphQLString("placeholder"),
    ]

    class Meta:
        icon = "edit"
        label = "Text input"


@register_streamfield_block
class EmailFieldBlock(blocks.StructBlock):
    field_label = blocks.CharBlock(max_length=200)
    placeholder = blocks.CharBlock(max_length=200, required=False)

    graphql_fields = [
        GraphQLString("field_label"),
        GraphQLString("placeholder"),
    ]

    class Meta:
        icon = "mail"
        label = "Email input"


@register_streamfield_block
class MultilineTextFieldBlock(blocks.StructBlock):
    field_label = blocks.CharBlock(max_length=200)
    placeholder = blocks.CharBlock(max_length=200, required=False)

    graphql_fields = [
        GraphQLString("field_label"),
        GraphQLString("placeholder"),
    ]

    class Meta:
        icon = "form"
        label = "Multi-line text"


@register_streamfield_block
class DropdownFieldBlock(blocks.StructBlock):
    field_label = blocks.CharBlock(max_length=200)
    options = blocks.ListBlock(blocks.CharBlock(max_length=200))

    graphql_fields = [
        GraphQLString("field_label"),
        GraphQLCollection(GraphQLString, "options"),
    ]

    class Meta:
        icon = "arrow-down"
        label = "Dropdown"
