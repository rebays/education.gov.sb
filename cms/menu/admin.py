from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet

from .models import Menu


class MenuViewSet(SnippetViewSet):
    model = Menu
    menu_label = "Menus"
    menu_icon = "list-ul"
    menu_order = 200
    icon = "list-ul"
    add_to_admin_menu = True


register_snippet(MenuViewSet)
