from grapple.helpers import register_streamfield_block
from grapple.models import GraphQLCollection, GraphQLImage, GraphQLString
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


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


@register_streamfield_block
class ServiceBlock(blocks.StructBlock):
    heading = blocks.CharBlock(max_length=200)
    intro = blocks.TextBlock()
    image = ImageChooserBlock()
    badge = blocks.CharBlock(
        max_length=100,
        required=False,
        help_text="Short audience label shown as a pill on the image.",
    )
    text = blocks.CharBlock(
        max_length=200,
        required=False,
        help_text="Caption shown on the image (defaults to the heading).",
    )

    graphql_fields = [
        GraphQLString("heading"),
        GraphQLString("intro"),
        GraphQLImage("image"),
        GraphQLString("badge"),
        GraphQLString("text"),
    ]

    class Meta:
        icon = "cog"
        label = "Service"
