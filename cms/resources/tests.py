from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import LIBRARY_ROOT_NAME, Resource, ResourceFolder


def add_file(folder, filename="doc.txt", content=b"contents", label="", language="en"):
    resource = Resource(
        folder=folder,
        file=SimpleUploadedFile(filename, content),
        label=label,
        language=language,
    )
    resource.set_file_metadata()
    resource.save()
    return resource


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
        self.assertTrue(root.slug)
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

    def test_create_folder_with_details(self):
        root = ResourceFolder.get_library_root()
        response = self.client.post(
            reverse("resource_library:add_folder", args=[root.pk]),
            {
                "name": "Annual Report 2025",
                "description": "The ministry's annual report",
                "resource_type": "report",
                "revision_date": "2025-06-30",
            },
        )
        folder = ResourceFolder.objects.get(name="Annual Report 2025")
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertTrue(folder.is_descendant_of(root))
        self.assertEqual(folder.slug, "annual-report-2025")
        self.assertEqual(folder.description, "The ministry's annual report")
        self.assertEqual(folder.resource_type, "report")

        # Details are optional: a bare category folder is fine too
        self.client.post(
            reverse("resource_library:add_folder", args=[root.pk]),
            {"name": "Curriculum"},
        )
        category = ResourceFolder.objects.get(name="Curriculum")
        self.assertEqual(category.description, "")
        self.assertEqual(category.slug, "curriculum")

    def test_slugs_are_unique_and_stable(self):
        root = ResourceFolder.get_library_root()
        first = root.add_child(instance=ResourceFolder(name="Reports"))
        second = root.add_child(instance=ResourceFolder(name="Reports"))
        self.assertEqual(first.slug, "reports")
        self.assertEqual(second.slug, "reports-2")

        # Renaming does not change an existing slug (public URLs stay stable)
        self.client.post(
            reverse("resource_library:edit_folder", args=[first.pk]),
            {"name": "Old Reports"},
        )
        first.refresh_from_db()
        self.assertEqual(first.name, "Old Reports")
        self.assertEqual(first.slug, "reports")

    def test_edit_folder_details(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Circular 12"))

        response = self.client.post(
            reverse("resource_library:edit_folder", args=[folder.pk]),
            {
                "name": "Circular 12/2026",
                "description": "School fee guidance",
                "resource_type": "circular",
                "revision_date": "2026-01-15",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        folder.refresh_from_db()
        self.assertEqual(folder.name, "Circular 12/2026")
        self.assertEqual(folder.resource_type, "circular")
        self.assertEqual(str(folder.revision_date), "2026-01-15")

    def test_upload_separate_creates_resource_per_file(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Circulars 2026"))

        response = self.client.post(
            reverse("resource_library:upload", args=[category.pk]),
            {
                "files": [
                    SimpleUploadedFile("Fee guidance.txt", b"one"),
                    SimpleUploadedFile("Term dates.txt", b"two"),
                ],
                "mode": "separate",
                "language": "en",
                "description": "Official circular",
                "resource_type": "circular",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[category.pk])
        )

        # Each file got its own resource folder with the shared details
        category.refresh_from_db()
        self.assertEqual(category.get_children().count(), 2)
        self.assertFalse(category.resources.exists())
        for name in ("Fee guidance", "Term dates"):
            folder = ResourceFolder.objects.get(name=name)
            self.assertEqual(folder.get_parent().pk, category.pk)
            self.assertEqual(folder.description, "Official circular")
            self.assertEqual(folder.resource_type, "circular")
            resource = folder.resources.get()
            self.assertEqual(resource.label, name)
            self.assertEqual(resource.language, "en")
            self.assertEqual(resource.uploaded_by_user, self.user)
            self.assertTrue(resource.file_size)
            self.assertTrue(resource.file_hash)

        # Counted on the category's listing
        response = self.client.get(
            reverse("resource_library:folder", args=[category.pk])
        )
        self.assertContains(response, "Fee guidance")
        response = self.client.get(reverse("resource_library:index"))
        self.assertContains(response, "2 files · 2 folders")

    def test_upload_add_to_resource_folder(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(
            instance=ResourceFolder(name="Annual Report", resource_type="report")
        )
        add_file(folder, "report.txt")

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": SimpleUploadedFile("Annex A.txt", b"annex"),
                "mode": "add",
                "language": "en",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertEqual(folder.resources.count(), 2)
        self.assertFalse(folder.get_children().exists())

    def test_upload_mode_defaults(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Empty"))
        page = root.add_child(instance=ResourceFolder(name="Page"))
        add_file(page)

        response = self.client.get(
            reverse("resource_library:upload", args=[category.pk])
        )
        self.assertEqual(response.context["form"].initial["mode"], "separate")

        response = self.client.get(reverse("resource_library:upload", args=[page.pk]))
        self.assertEqual(response.context["form"].initial["mode"], "add")

    def test_upload_at_root_forces_separate(self):
        root = ResourceFolder.get_library_root()
        response = self.client.post(
            reverse("resource_library:upload", args=[root.pk]),
            {
                "files": SimpleUploadedFile("Loose file.txt", b"contents"),
                "mode": "add",  # ignored at the root
                "language": "en",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[root.pk])
        )
        root.refresh_from_db()
        self.assertFalse(root.resources.exists())
        folder = ResourceFolder.objects.get(name="Loose file")
        self.assertEqual(folder.resources.count(), 1)

    def test_upload_rejects_disallowed_extension(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": SimpleUploadedFile("malware.exe", b"nope"),
                "mode": "separate",
            },
        )
        self.assertEqual(response.status_code, 200)  # re-rendered with errors
        self.assertContains(response, "extension")
        self.assertEqual(Resource.objects.count(), 0)

    def test_upload_video(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Videos"))

        response = self.client.post(
            reverse("resource_library:upload", args=[category.pk]),
            {
                "files": SimpleUploadedFile("Numeracy training.mp4", b"video bytes"),
                "mode": "separate",
                "resource_type": "video",
                "language": "en",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[category.pk])
        )
        resource = Resource.objects.get()
        self.assertTrue(resource.is_video)
        page = resource.folder
        self.assertEqual(page.name, "Numeracy training")
        self.assertEqual(page.resource_type, "video")

        # Grid card shows the media icon instead of the document icon
        response = self.client.get(
            reverse("resource_library:folder", args=[page.pk])
        )
        self.assertContains(response, "#icon-media")

    @override_settings(
        RESOURCE_LIBRARY_MAX_UPLOAD_SIZE=5,
        RESOURCE_LIBRARY_VIDEO_MAX_UPLOAD_SIZE=1000,
    )
    def test_size_limits_are_per_kind(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))
        upload_url = reverse("resource_library:upload", args=[folder.pk])

        # A document over the document limit is rejected…
        response = self.client.post(
            upload_url,
            {
                "files": SimpleUploadedFile("big.txt", b"x" * 100),
                "mode": "separate",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "too big")
        self.assertEqual(Resource.objects.count(), 0)

        # …while a video of the same size fits under the video limit
        response = self.client.post(
            upload_url,
            {
                "files": SimpleUploadedFile("big.mp4", b"x" * 100),
                "mode": "separate",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertEqual(Resource.objects.count(), 1)

    @override_settings(RESOURCE_LIBRARY_VIDEO_MAX_UPLOAD_SIZE=50)
    def test_oversized_video_rejected(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Videos"))

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": SimpleUploadedFile("huge.mp4", b"x" * 100),
                "mode": "separate",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "too big")
        self.assertEqual(Resource.objects.count(), 0)

    def test_layout_defaults_to_grid_and_toggle_persists(self):
        root = ResourceFolder.get_library_root()
        root.add_child(instance=ResourceFolder(name="Reports"))

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

    def test_search_finds_folders_and_files(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Reports"))
        page = category.add_child(
            instance=ResourceFolder(
                name="Annual Report 2025", description="Yearly performance report"
            )
        )
        add_file(page, "report.txt", label="Budget summary")

        # Folder found by name, searching from the library root
        response = self.client.get(reverse("resource_library:index"), {"q": "annual"})
        self.assertContains(response, "Annual Report 2025")

        # File found by label, with its folder shown in the results
        response = self.client.get(reverse("resource_library:index"), {"q": "budget"})
        self.assertContains(response, "Budget summary")
        self.assertContains(response, "Annual Report 2025")

        # Searching inside an unrelated subtree finds nothing
        other = root.add_child(instance=ResourceFolder(name="Other"))
        response = self.client.get(
            reverse("resource_library:folder", args=[other.pk]), {"q": "annual"}
        )
        self.assertNotContains(response, "Annual Report 2025")

    def test_edit_file(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))
        resource = add_file(folder, "report.txt", label="report")

        response = self.client.post(
            reverse("resource_library:edit_resource", args=[resource.pk]),
            {"label": "Full report", "language": "fr"},
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        resource.refresh_from_db()
        self.assertEqual(resource.label, "Full report")
        self.assertEqual(resource.language, "fr")

    def test_replace_file(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))
        resource = add_file(folder, "report.txt", content=b"old contents")
        old_file_name = resource.file.name
        storage = resource.file.storage

        response = self.client.post(
            reverse("resource_library:edit_resource", args=[resource.pk]),
            {
                "label": "report",
                "language": "en",
                "file": SimpleUploadedFile("report-v2.txt", b"new contents"),
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        resource.refresh_from_db()
        self.assertNotEqual(resource.file.name, old_file_name)
        self.assertEqual(resource.file_size, len(b"new contents"))
        self.assertFalse(storage.exists(old_file_name))

    def test_delete_file_removes_storage(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))
        resource = add_file(folder)
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

    def test_delete_folder(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))

        response = self.client.post(
            reverse("resource_library:delete_folder", args=[folder.pk])
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[root.pk])
        )
        self.assertFalse(ResourceFolder.objects.filter(pk=folder.pk).exists())

    def test_cannot_delete_non_empty_folder(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))
        add_file(folder)

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

    def test_graphql_resource_pages(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Reports"))
        page = category.add_child(
            instance=ResourceFolder(
                name="Annual Report 2025",
                description="Yearly report",
                resource_type="report",
            )
        )
        add_file(page, "report.txt", label="Full report")
        add_file(page, "summary.mp4", label="Video summary")

        from grapple.schema import schema

        result = schema.execute(
            """
            {
                resourcePages { name slug }
                resourcePage(slug: "annual-report-2025") {
                    name
                    description
                    resourceType
                    fileCount
                    resources { displayLabel language url isVideo fileSize }
                }
            }
            """
        )
        self.assertIsNone(result.errors)

        # Only folders with files count as resource pages; the category (and
        # the root) are CMS-side organisation and stay invisible
        pages = result.data["resourcePages"]
        self.assertEqual([p["slug"] for p in pages], ["annual-report-2025"])

        page_data = result.data["resourcePage"]
        self.assertEqual(page_data["name"], "Annual Report 2025")
        self.assertEqual(page_data["resourceType"], "report")
        self.assertEqual(page_data["fileCount"], 2)
        labels = [f["displayLabel"] for f in page_data["resources"]]
        self.assertIn("Full report", labels)
        self.assertIn("Video summary", labels)
        videos = [f["isVideo"] for f in page_data["resources"]]
        self.assertEqual(sorted(videos), [False, True])
        for f in page_data["resources"]:
            self.assertTrue(f["url"])

    def test_graphql_category_folder_is_not_a_page(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Empty category"))

        from grapple.schema import schema

        result = schema.execute(
            '{ resourcePage(slug: "%s") { name } }' % category.slug
        )
        self.assertIsNone(result.errors)
        self.assertIsNone(result.data["resourcePage"])


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
            {
                "files": SimpleUploadedFile("doc.txt", b"contents"),
                "mode": "separate",
            },
        )
        self.assertEqual(response.status_code, 302)  # denied -> admin redirect
        self.assertEqual(Resource.objects.count(), 0)

    def test_uploader_can_add_files_but_not_folders(self):
        self.make_user("uploader", "add_resource")
        self.client.login(username="uploader", password="password")

        root = ResourceFolder.get_library_root()
        response = self.client.post(
            reverse("resource_library:upload", args=[root.pk]),
            {
                "files": SimpleUploadedFile("doc.txt", b"contents"),
                "mode": "separate",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[root.pk])
        )
        self.assertEqual(Resource.objects.count(), 1)

        response = self.client.post(
            reverse("resource_library:add_folder", args=[root.pk]),
            {"name": "Reports"},
        )
        self.assertEqual(response.status_code, 302)  # denied -> admin redirect
        self.assertFalse(ResourceFolder.objects.filter(name="Reports").exists())
