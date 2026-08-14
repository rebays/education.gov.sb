from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet

from .models import Publication


class PublicationViewSet(SnippetViewSet):
    model = Publication
    # Not doc-full: the resource library claims that one throughout its own UI
    # to mean "a resource file", and two top-level menu items with the same
    # icon are indistinguishable at a glance. A clipboard also suits what this
    # actually holds — policies, reports and guidelines.
    icon = "clipboard-list"
    menu_label = "Publications"
    menu_name = "publications"
    menu_order = 200
    add_to_admin_menu = True
    list_display = ["title", "publication_type", "date", "office"]
    list_filter = ["publication_type", "date"]
    search_fields = ["title", "summary"]


register_snippet(PublicationViewSet)
