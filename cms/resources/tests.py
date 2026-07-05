from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from wagtail.documents import get_document_model
from wagtail.models import Collection

from .views import LIBRARY_ROOT_NAME, get_library_root


class ResourceLibraryTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)

    def test_index_creates_library_root(self):
        response = self.client.get(reverse("resource_library:index"))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Collection.objects.filter(name=LIBRARY_ROOT_NAME, depth=2).exists()
        )
        self.assertContains(response, "This folder is empty.")

    def test_menu_item_appears_in_admin(self):
        response = self.client.get(reverse("wagtailadmin_home"))
        self.assertContains(response, "Resource Library")

    def test_create_and_browse_folder(self):
        root = get_library_root()
        response = self.client.post(
            reverse("resource_library:add_folder", args=[root.pk]),
            {"name": "PDS"},
        )
        folder = Collection.objects.get(name="PDS")
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertTrue(folder.is_descendant_of(root))

        response = self.client.get(reverse("resource_library:index"))
        self.assertContains(response, "PDS")
        self.assertContains(response, "Empty")

    def test_upload_into_folder(self):
        root = get_library_root()
        folder = root.add_child(instance=Collection(name="PDS"))

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": SimpleUploadedFile(
                    "Epoxy adhesive datasheet.txt", b"datasheet contents"
                ),
                "resource_type": "pds",
                "description": "Technical data for epoxy adhesive",
                "language": "en",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )

        doc = get_document_model().objects.get()
        self.assertEqual(doc.title, "Epoxy adhesive datasheet")
        self.assertEqual(doc.collection, folder)
        self.assertEqual(doc.resource_type, "pds")
        self.assertEqual(doc.uploaded_by_user, self.user)
        self.assertTrue(doc.file_size)

        # Document listed inside its folder, and counted on the parent listing
        response = self.client.get(
            reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertContains(response, "Epoxy adhesive datasheet")
        response = self.client.get(reverse("resource_library:index"))
        self.assertContains(response, "1 file")

    def test_upload_multiple_files(self):
        root = get_library_root()
        folder = root.add_child(instance=Collection(name="PDS"))

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": [
                    SimpleUploadedFile("epoxy.txt", b"one"),
                    SimpleUploadedFile("acrylic.txt", b"two"),
                ],
                "resource_type": "sds",
                "language": "fr",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )

        docs = get_document_model().objects.order_by("title")
        self.assertEqual(docs.count(), 2)
        self.assertEqual([d.title for d in docs], ["acrylic", "epoxy"])
        for doc in docs:
            self.assertEqual(doc.collection, folder)
            self.assertEqual(doc.resource_type, "sds")
            self.assertEqual(doc.language, "fr")

    def test_upload_rejects_disallowed_extension(self):
        root = get_library_root()
        folder = root.add_child(instance=Collection(name="PDS"))

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": SimpleUploadedFile("malware.exe", b"nope"),
                "resource_type": "pds",
            },
        )
        self.assertEqual(response.status_code, 200)  # re-rendered with errors
        self.assertContains(response, "extension")
        self.assertEqual(get_document_model().objects.count(), 0)

    def test_layout_defaults_to_grid_and_toggle_persists(self):
        root = get_library_root()
        root.add_child(instance=Collection(name="PDS"))

        # Default view is the thumbnail grid
        response = self.client.get(reverse("resource_library:index"))
        self.assertContains(response, '<div class="rl-grid">')

        # Switching to list view shows the table…
        response = self.client.get(reverse("resource_library:index"), {"layout": "list"})
        self.assertNotContains(response, '<div class="rl-grid">')
        self.assertContains(response, '<table class="listing">')

        # …and the choice is remembered for subsequent visits
        response = self.client.get(reverse("resource_library:index"))
        self.assertContains(response, '<table class="listing">')

    def test_search_covers_subtree(self):
        root = get_library_root()
        folder = root.add_child(instance=Collection(name="PDS"))
        get_document_model().objects.create(
            title="Epoxy adhesive datasheet",
            file=SimpleUploadedFile("epoxy.txt", b"contents"),
            collection=folder,
        )

        # Searching from the library root finds the document in the subfolder
        response = self.client.get(
            reverse("resource_library:index"), {"q": "epoxy"}
        )
        self.assertContains(response, "Epoxy adhesive datasheet")
        self.assertContains(response, "PDS")  # folder column shown in results

    def test_rename_and_delete_folder(self):
        root = get_library_root()
        folder = root.add_child(instance=Collection(name="PDS"))

        self.client.post(
            reverse("resource_library:rename_folder", args=[folder.pk]),
            {"name": "Product Data Sheets"},
        )
        folder.refresh_from_db()
        self.assertEqual(folder.name, "Product Data Sheets")

        response = self.client.post(
            reverse("resource_library:delete_folder", args=[folder.pk])
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[root.pk])
        )
        self.assertFalse(Collection.objects.filter(pk=folder.pk).exists())

    def test_cannot_delete_non_empty_folder(self):
        root = get_library_root()
        folder = root.add_child(instance=Collection(name="PDS"))
        get_document_model().objects.create(
            title="Doc",
            file=SimpleUploadedFile("doc.txt", b"contents"),
            collection=folder,
        )

        response = self.client.post(
            reverse("resource_library:delete_folder", args=[folder.pk])
        )
        # Wagtail's admin access wrapper turns PermissionDenied into a
        # redirect to the admin home with an error message
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Collection.objects.filter(pk=folder.pk).exists())

    def test_folder_outside_library_is_404(self):
        get_library_root()
        outside = Collection.get_first_root_node().add_child(name="Not the library")
        response = self.client.get(
            reverse("resource_library:folder", args=[outside.pk])
        )
        self.assertEqual(response.status_code, 404)

    def test_requires_document_permissions(self):
        get_user_model().objects.create_user(
            username="nobody", email="nobody@example.com", password="password"
        )
        self.client.logout()
        self.client.login(username="nobody", password="password")
        response = self.client.get(reverse("resource_library:index"))
        # Users without any document permission are denied (Wagtail admin
        # redirects unauthorised users rather than returning a bare 403)
        self.assertNotEqual(response.status_code, 200)
