from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet

from .models import Publication


class PublicationViewSet(SnippetViewSet):
    model = Publication
    icon = "doc-full"
    menu_label = "Publications"
    menu_name = "publications"
    menu_order = 200
    add_to_admin_menu = True
    list_display = ["title", "publication_type", "date", "office"]
    list_filter = ["publication_type", "date"]
    search_fields = ["title", "summary"]


register_snippet(PublicationViewSet)
