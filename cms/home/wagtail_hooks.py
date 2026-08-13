# your_app/wagtail_hooks.py
from django.templatetags.static import static
from django.utils.html import format_html
from wagtail import hooks

from .mutations import Mutation


@hooks.register("register_schema_mutation")
def register_author_mutation(mutation_mixins):
    mutation_mixins.append(Mutation)


@hooks.register("insert_global_admin_css")
def global_admin_css():
    """Admin chrome tweaks — see home/static/css/admin.css for the rationale."""
    return format_html(
        '<link rel="stylesheet" href="{}">', static("css/admin.css")
    )


@hooks.register("construct_settings_menu")
def hide_collections_menu_item(request, menu_items):
    """
    Collections organise images and documents. The Documents app is hidden
    (the Resource Library replaces it), which leaves collections doing very
    little beyond adding a concept editors have to learn. Images still work
    without it — they land in the default collection.
    """
    menu_items[:] = [item for item in menu_items if item.name != "collections"]
