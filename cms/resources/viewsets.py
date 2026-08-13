from django.contrib import messages
from django.db.models.deletion import ProtectedError
from django.http import HttpResponseRedirect
from django.utils.functional import cached_property
from wagtail.admin.ui.tables import Column, TitleColumn
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import (
    DeleteView,
    SnippetViewSet,
    SnippetViewSetGroup,
    UsageView,
)

from .models import EducationLevel, Subject, YearLevel


class ProtectedDeleteView(DeleteView):
    """
    Renders a database-level PROTECT as a readable message.

    Wagtail normally blocks a protected delete up front using the reference
    index, but that only works once the index has actually been built. Nothing
    in the admin catches ProtectedError, so a protected row that isn't yet
    indexed would reach the database and raise a 500.
    """

    def form_valid(self, form):
        try:
            return super().form_valid(form)
        except ProtectedError as error:
            count = len(error.protected_objects)
            messages.error(
                self.request,
                f"“{self.object}” can’t be deleted: "
                f"{count} {'item' if count == 1 else 'items'} still depend on it.",
            )
            return HttpResponseRedirect(self.get_success_url())


class YearLevelDeleteView(ProtectedDeleteView):
    """
    Guards the year_levels ManyToMany, which the reference index can't see —
    it only traverses ForeignKeys, so folders using this year level would be
    reported as zero references and silently lose it on delete.
    """

    def in_use_count(self):
        return self.object.resource_folders.count()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        count = self.in_use_count()
        context["in_use_count"] = count
        if count:
            # Hides the delete button, the same way a PROTECT relation does
            context["is_protected"] = True
        return context

    def form_valid(self, form):
        count = self.in_use_count()
        if count:
            messages.error(
                self.request,
                f"“{self.object}” can’t be deleted: it is applied to "
                f"{count} resource{'' if count == 1 else 's'}.",
            )
            return HttpResponseRedirect(self.get_success_url())
        return super().form_valid(form)


class YearLevelUsageView(UsageView):
    """
    Lists the resources that use this year level.

    The default implementation reads Wagtail's reference index, which only
    tracks ForeignKeys — so for a ManyToMany like `year_levels` it renders an
    empty page, contradicting the delete screen that (correctly) reports the
    year level as in use. Query the relation directly instead.
    """

    def get_queryset(self):
        # The parent's get_table() expects (object, references) pairs; there
        # are no reference-index rows behind a ManyToMany, hence the empty list
        return [
            (folder, [])
            for folder in self.object.resource_folders.all().order_by("name")
        ]

    @cached_property
    def columns(self):
        # The inherited columns read references[0], which would blow up on the
        # empty lists above, so declare our own.
        return [
            TitleColumn(
                "name",
                label="Name",
                accessor="label",
                get_url=lambda row: row["edit_url"],
            ),
            Column(
                "content_type",
                label="Type",
                accessor=lambda row: row["object"]._meta.verbose_name.capitalize(),
            ),
            Column(
                "field",
                label="Field",
                accessor=lambda row: "Year levels",
            ),
        ]


class EducationLevelViewSet(SnippetViewSet):
    model = EducationLevel
    icon = "site"
    menu_label = "Education levels"
    list_display = ["name", "slug", "order"]
    search_fields = ["name"]
    delete_view_class = ProtectedDeleteView


class YearLevelViewSet(SnippetViewSet):
    model = YearLevel
    icon = "list-ol"
    menu_label = "Year levels"
    list_display = ["label", "slug", "level", "order"]
    list_filter = ["level"]
    search_fields = ["label"]
    delete_view_class = YearLevelDeleteView
    delete_template_name = "resources/confirm_year_level_delete.html"
    usage_view_class = YearLevelUsageView


class SubjectViewSet(SnippetViewSet):
    model = Subject
    icon = "tag"
    menu_label = "Subjects"
    list_display = ["name", "slug", "levels_display", "order"]
    list_filter = ["levels"]
    search_fields = ["name"]
    delete_view_class = ProtectedDeleteView


class CurriculumViewSetGroup(SnippetViewSetGroup):
    """
    Groups the three vocabularies under one admin menu item so they sit
    together next to the Resource Library rather than scattering three
    entries through the sidebar.

    "Structure" rather than plain "Curriculum": this holds the skeleton
    everything is classified against — levels, years and subjects — not the
    curriculum materials themselves, which live in the Resource Library.
    The sliders icon reads as "the settings that define how things are
    organised", which is what this is — a grid/table icon reads as data or
    reports to anyone who didn't build the coverage map.
    """

    items = (EducationLevelViewSet, YearLevelViewSet, SubjectViewSet)
    menu_icon = "sliders"
    menu_label = "Curriculum structure"
    menu_name = "curriculum-structure"
    menu_order = 202
    add_to_admin_menu = True


register_snippet(CurriculumViewSetGroup)
