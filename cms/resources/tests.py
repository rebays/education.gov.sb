from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from .models import LIBRARY_ROOT_NAME, Resource, ResourceFolder


class ResourceLibraryTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)

    def test_index_creates_library_root(self):
        response = self.client.get(reverse("resource_library:index"))
        self.assertEqual(response.status_code, 200)
        root = ResourceFolder.get_first_root_node()
        self.assertIsNotNone(root)
        self.assertEqual(root.name, LIBRARY_ROOT_NAME)
        self.assertContains(response, "This folder is empty.")

    def test_menu_item_appears_in_admin(self):
        response = self.client.get(reverse("wagtailadmin_home"))
        self.assertContains(response, "Resource Library")

    def test_documents_app_hidden_from_admin(self):
        # Menu item and homepage summary both link to /admin/documents/
        response = self.client.get(reverse("wagtailadmin_home"))
        self.assertNotContains(response, "/admin/documents/")

        # Rich text editors no longer offer document links
        from wagtail.rich_text import features as feature_registry

        self.assertNotIn("document-link", feature_registry.get_default_features())

    def test_create_and_browse_folder(self):
        root = ResourceFolder.get_library_root()
        response = self.client.post(
            reverse("resource_library:add_folder", args=[root.pk]),
            {"name": "PDS"},
        )
        folder = ResourceFolder.objects.get(name="PDS")
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertTrue(folder.is_descendant_of(root))

        response = self.client.get(reverse("resource_library:index"))
        self.assertContains(response, "PDS")
        self.assertContains(response, "Empty")

    def test_upload_into_folder(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))

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

        resource = Resource.objects.get()
        self.assertEqual(resource.title, "Epoxy adhesive datasheet")
        self.assertEqual(resource.folder, folder)
        self.assertEqual(resource.resource_type, "pds")
        self.assertEqual(resource.uploaded_by_user, self.user)
        self.assertTrue(resource.file_size)
        self.assertTrue(resource.file_hash)

        # Resource listed inside its folder, and counted on the parent listing
        response = self.client.get(
            reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertContains(response, "Epoxy adhesive datasheet")
        response = self.client.get(reverse("resource_library:index"))
        self.assertContains(response, "1 file")

    def test_upload_multiple_files(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))

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

        resources = Resource.objects.order_by("title")
        self.assertEqual(resources.count(), 2)
        self.assertEqual([r.title for r in resources], ["acrylic", "epoxy"])
        for resource in resources:
            self.assertEqual(resource.folder, folder)
            self.assertEqual(resource.resource_type, "sds")
            self.assertEqual(resource.language, "fr")

    def test_upload_rejects_disallowed_extension(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": SimpleUploadedFile("malware.exe", b"nope"),
                "resource_type": "pds",
            },
        )
        self.assertEqual(response.status_code, 200)  # re-rendered with errors
        self.assertContains(response, "extension")
        self.assertEqual(Resource.objects.count(), 0)

    def test_layout_defaults_to_grid_and_toggle_persists(self):
        root = ResourceFolder.get_library_root()
        root.add_child(instance=ResourceFolder(name="PDS"))

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
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))
        Resource.objects.create(
            title="Epoxy adhesive datasheet",
            file=SimpleUploadedFile("epoxy.txt", b"contents"),
            folder=folder,
        )

        # Searching from the library root finds the resource in the subfolder
        response = self.client.get(
            reverse("resource_library:index"), {"q": "epoxy"}
        )
        self.assertContains(response, "Epoxy adhesive datasheet")
        self.assertContains(response, "PDS")  # folder column shown in results

    def test_edit_resource(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))
        resource = Resource.objects.create(
            title="Epoxy",
            file=SimpleUploadedFile("epoxy.txt", b"contents"),
            folder=folder,
        )

        response = self.client.post(
            reverse("resource_library:edit_resource", args=[resource.pk]),
            {
                "title": "Epoxy adhesive",
                "resource_type": "manual",
                "description": "Updated",
                "language": "de",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        resource.refresh_from_db()
        self.assertEqual(resource.title, "Epoxy adhesive")
        self.assertEqual(resource.resource_type, "manual")
        self.assertEqual(resource.language, "de")

    def test_replace_resource_file(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))
        resource = Resource.objects.create(
            title="Epoxy",
            file=SimpleUploadedFile("epoxy.txt", b"old contents"),
            folder=folder,
        )
        old_file_name = resource.file.name
        storage = resource.file.storage

        response = self.client.post(
            reverse("resource_library:edit_resource", args=[resource.pk]),
            {
                "title": "Epoxy",
                "resource_type": "pds",
                "language": "en",
                "file": SimpleUploadedFile("epoxy-v2.txt", b"new contents"),
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        resource.refresh_from_db()
        self.assertNotEqual(resource.file.name, old_file_name)
        self.assertTrue(resource.file_hash)
        self.assertEqual(resource.file_size, len(b"new contents"))
        self.assertFalse(storage.exists(old_file_name))

    def test_delete_resource_removes_file(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))
        resource = Resource.objects.create(
            title="Epoxy",
            file=SimpleUploadedFile("epoxy.txt", b"contents"),
            folder=folder,
        )
        file_name = resource.file.name
        storage = resource.file.storage

        response = self.client.post(
            reverse("resource_library:delete_resource", args=[resource.pk])
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertFalse(Resource.objects.exists())
        self.assertFalse(storage.exists(file_name))

    def test_rename_and_delete_folder(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))

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
        self.assertFalse(ResourceFolder.objects.filter(pk=folder.pk).exists())

    def test_cannot_delete_non_empty_folder(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="PDS"))
        Resource.objects.create(
            title="Doc",
            file=SimpleUploadedFile("doc.txt", b"contents"),
            folder=folder,
        )

        response = self.client.post(
            reverse("resource_library:delete_folder", args=[folder.pk])
        )
        # Wagtail's admin access wrapper turns PermissionDenied into a
        # redirect to the admin home with an error message
        self.assertEqual(response.status_code, 302)
        self.assertTrue(ResourceFolder.objects.filter(pk=folder.pk).exists())

    def test_folder_outside_library_is_404(self):
        ResourceFolder.get_library_root()
        outside = ResourceFolder.add_root(name="Not the library")
        response = self.client.get(
            reverse("resource_library:folder", args=[outside.pk])
        )
        self.assertEqual(response.status_code, 404)


class ResourceLibraryPermissionTests(TestCase):
    def make_user(self, username, *codenames):
        user = get_user_model().objects.create_user(
            username=username, email=f"{username}@example.com", password="password"
        )
        perms = [
            Permission.objects.get(
                content_type__app_label="wagtailadmin", codename="access_admin"
            )
        ]
        for codename in codenames:
            perms.append(
                Permission.objects.get(
                    content_type__app_label="resources", codename=codename
                )
            )
        user.user_permissions.set(perms)
        return user

    def test_requires_library_permissions(self):
        self.make_user("nobody")
        self.client.login(username="nobody", password="password")
        response = self.client.get(reverse("resource_library:index"))
        # Users without any resource permission are denied (Wagtail admin
        # redirects unauthorised users rather than returning a bare 403)
        self.assertNotEqual(response.status_code, 200)

    def test_viewer_can_browse_but_not_modify(self):
        self.make_user("viewer", "view_resource")
        self.client.login(username="viewer", password="password")

        response = self.client.get(reverse("resource_library:index"))
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, "New file")
        self.assertNotContains(response, "New folder")

        root = ResourceFolder.get_library_root()
        response = self.client.post(
            reverse("resource_library:upload", args=[root.pk]),
            {"files": SimpleUploadedFile("doc.txt", b"contents"), "resource_type": "pds"},
        )
        self.assertEqual(response.status_code, 302)  # denied -> admin redirect
        self.assertEqual(Resource.objects.count(), 0)

    def test_uploader_can_add_but_not_manage_folders(self):
        self.make_user("uploader", "add_resource")
        self.client.login(username="uploader", password="password")

        root = ResourceFolder.get_library_root()
        response = self.client.post(
            reverse("resource_library:upload", args=[root.pk]),
            {"files": SimpleUploadedFile("doc.txt", b"contents"), "resource_type": "pds"},
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[root.pk])
        )
        self.assertEqual(Resource.objects.count(), 1)

        response = self.client.post(
            reverse("resource_library:add_folder", args=[root.pk]), {"name": "PDS"}
        )
        self.assertEqual(response.status_code, 302)  # denied -> admin redirect
        self.assertFalse(ResourceFolder.objects.filter(name="PDS").exists())
