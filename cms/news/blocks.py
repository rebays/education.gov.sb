from grapple.helpers import register_streamfield_block
from grapple.models import GraphQLString
from wagtail import blocks


@register_streamfield_block
class QuoteBlock(blocks.StructBlock):
    quote = blocks.TextBlock()
    attribution = blocks.CharBlock(
        max_length=200,
        required=False,
        help_text="Name of the person quoted.",
    )
    role = blocks.CharBlock(
        max_length=200,
        required=False,
        help_text="Role or title of the person quoted (e.g. 'Minister of Education').",
    )

    graphql_fields = [
        GraphQLString("quote"),
        GraphQLString("attribution"),
        GraphQLString("role"),
    ]

    class Meta:
        icon = "openquote"
        label = "Pull quote"
