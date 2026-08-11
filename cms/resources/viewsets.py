from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet, SnippetViewSetGroup

from .models import EducationLevel, Subject, YearLevel


class EducationLevelViewSet(SnippetViewSet):
    model = EducationLevel
    icon = "site"
    menu_label = "Education levels"
    list_display = ["name", "slug", "order"]
    search_fields = ["name"]


class YearLevelViewSet(SnippetViewSet):
    model = YearLevel
    icon = "list-ol"
    menu_label = "Year levels"
    list_display = ["label", "slug", "level", "order"]
    list_filter = ["level"]
    search_fields = ["label"]


class SubjectViewSet(SnippetViewSet):
    model = Subject
    icon = "tag"
    menu_label = "Subjects"
    list_display = ["name", "slug", "order"]
    search_fields = ["name"]


class CurriculumViewSetGroup(SnippetViewSetGroup):
    """
    Groups the three vocabularies under one admin menu item so they sit
    together next to the Resource Library rather than scattering three
    entries through the sidebar.
    """

    items = (EducationLevelViewSet, YearLevelViewSet, SubjectViewSet)
    menu_icon = "folder-open-inverse"
    menu_label = "Curriculum"
    menu_name = "curriculum"
    menu_order = 202
    add_to_admin_menu = True


register_snippet(CurriculumViewSetGroup)
