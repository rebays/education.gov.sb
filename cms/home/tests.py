from pathlib import Path

from django.contrib.auth import get_user_model
from django.contrib.staticfiles import finders
from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse
from wagtail.models import Page, Site
from wagtail.test.utils import WagtailPageTestCase

from home.models import HomePage


class HomeSetUpTests(WagtailPageTestCase):
    """
    Tests for basic page structure setup and HomePage creation.
    """

    def test_root_create(self):
        root_page = Page.objects.get(pk=1)
        self.assertIsNotNone(root_page)

    def test_homepage_create(self):
        root_page = Page.objects.get(pk=1)
        homepage = HomePage(title="Home")
        root_page.add_child(instance=homepage)
        self.assertTrue(HomePage.objects.filter(title="Home").exists())


class HomeTests(WagtailPageTestCase):
    """
    Tests for homepage functionality and rendering.
    """

    def setUp(self):
        """
        Create a homepage instance for testing.
        """
        root_page = Page.get_first_root_node()
        Site.objects.create(hostname="testsite", root_page=root_page, is_default_site=True)
        self.homepage = HomePage(title="Home")
        root_page.add_child(instance=self.homepage)

    def tearDown(self):
        # The Site created above is rolled back without firing delete signals,
        # leaving Wagtail's cached site root paths pointing at a dead site id;
        # clear the cache so later tests see a consistent state
        cache.clear()

    def test_homepage_is_renderable(self):
        self.assertPageIsRenderable(self.homepage)

    def test_homepage_template_used(self):
        response = self.client.get(self.homepage.url)
        self.assertTemplateUsed(response, "home/home_page.html")


class AdminChromeTests(TestCase):
    """The admin CSS override that widens Wagtail's sidebar."""

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)

    def test_stylesheet_is_served_and_linked(self):
        self.assertTrue(
            finders.find("css/admin.css"), "css/admin.css is not on the static path"
        )
        response = self.client.get(reverse("wagtailadmin_home"))
        self.assertContains(response, "css/admin.css")

    def test_collapsed_sidebar_width_is_preserved(self):
        """
        The override loads after core.css, so a bare `.sidebar` width rule
        would out-cascade Wagtail's own `.sidebar--slim` and stop the sidebar
        collapsing. The :not() guards and the restated 60px rule prevent that.
        """
        css = Path(finders.find("css/admin.css")).read_text(encoding="utf-8")
        self.assertIn(".sidebar:not(.sidebar--slim)", css)
        self.assertIn(".sidebar-loading:not(.sidebar-loading--slim)", css)
        self.assertIn("width: 60px", css)

    def test_every_wagtail_rule_keyed_to_the_old_width_is_overridden(self):
        """
        Wagtail hardcodes 200px in several places; missing one leaves the
        content area or the flyout submenu misaligned with the sidebar.
        """
        css = Path(finders.find("css/admin.css")).read_text(encoding="utf-8")
        for selector in (
            ".sidebar--hidden",
            ".sidebar-panel",
            ".wrapper",
            ".sidebar-panel--open",
            # The sub-menu panel's background is sized by these; missing them
            # leaves an unpainted strip at the widened edge.
            ".sidebar-sub-menu-panel",
            ".sidebar-sub-menu-panel > h2",
            ".sidebar-sub-menu-panel__list",
            ".sidebar-sub-menu-panel--open",
        ):
            with self.subTest(selector=selector):
                self.assertIn(selector, css)


class SettingsMenuTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin2", email="admin2@example.com", password="password"
        )
        self.client.force_login(self.user)

    def test_collections_is_hidden(self):
        """
        Collections only organise images and documents, and the Documents app
        is already hidden in favour of the Resource Library.
        """
        response = self.client.get(reverse("wagtailadmin_home"))
        self.assertNotContains(response, '"label": "Collections"')

    def test_other_settings_items_remain(self):
        response = self.client.get(reverse("wagtailadmin_home"))
        for label in ("Users", "Groups", "Redirects", "Sites"):
            with self.subTest(label=label):
                self.assertContains(response, f'"label": "{label}"')
