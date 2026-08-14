from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from wagtail.admin.menu import admin_menu
from wagtail.snippets.models import get_snippet_models

from .models import Publication


class PublicationAdminRegistrationTests(TestCase):
    """
    viewsets.py registers the Publications admin, but nothing imports it by
    name — Wagtail auto-imports wagtail_hooks.py and never viewsets.py, so the
    registration rides on a side-effect import that reads as dead code. It was
    stripped once as an unused import (F401 in 304d372), which silently removed
    Publications from the sidebar: no error, no failing test, just a model with
    no admin UI. These tests fail loudly if that happens again.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            "editor", "editor@example.com", "password"
        )
        self.client.force_login(self.user)

    def test_publication_is_a_registered_snippet(self):
        self.assertIn(Publication, get_snippet_models())

    def test_publications_appears_in_the_sidebar(self):
        """
        The menu item is the thing users actually lost. Nothing else surfaces
        it: PublicationViewSet sets add_to_admin_menu, so Publication is
        excluded from Wagtail's generic Snippets index — which in turn hides
        itself here, because every registered snippet has its own menu item.
        """
        request = self.client.get(reverse("wagtailadmin_home")).wsgi_request
        labels = [item.label for item in admin_menu.menu_items_for_request(request)]
        self.assertIn("Publications", labels)

    def test_the_admin_views_are_reachable(self):
        namespace = "wagtailsnippets_publication_publication"
        for name in ("list", "add"):
            with self.subTest(view=name):
                response = self.client.get(reverse(f"{namespace}:{name}"))
                self.assertEqual(response.status_code, 200)
