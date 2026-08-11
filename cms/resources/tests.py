from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import (
    LIBRARY_ROOT_NAME,
    EducationLevel,
    Resource,
    ResourceFolder,
    Subject,
    YearLevel,
)


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
                "name": "Year 3 Mathematics Syllabus",
                "description": "The Year 3 mathematics syllabus",
                "resource_type": "syllabus",
                "revision_date": "2025-06-30",
            },
        )
        folder = ResourceFolder.objects.get(name="Year 3 Mathematics Syllabus")
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertTrue(folder.is_descendant_of(root))
        self.assertEqual(folder.slug, "year-3-mathematics-syllabus")
        self.assertEqual(folder.description, "The Year 3 mathematics syllabus")
        self.assertEqual(folder.resource_type, "syllabus")

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
        folder = root.add_child(instance=ResourceFolder(name="Science Guide"))

        response = self.client.post(
            reverse("resource_library:edit_folder", args=[folder.pk]),
            {
                "name": "Primary Science Teacher Guide",
                "description": "Hands-on activities for the primary science kit",
                "resource_type": "teacher_guide",
                "revision_date": "2026-01-15",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        folder.refresh_from_db()
        self.assertEqual(folder.name, "Primary Science Teacher Guide")
        self.assertEqual(folder.resource_type, "teacher_guide")
        self.assertEqual(str(folder.revision_date), "2026-01-15")

    def test_upload_separate_creates_resource_per_file(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Workbooks 2026"))

        response = self.client.post(
            reverse("resource_library:upload", args=[category.pk]),
            {
                "files": [
                    SimpleUploadedFile("Fee guidance.txt", b"one"),
                    SimpleUploadedFile("Term dates.txt", b"two"),
                ],
                "mode": "separate",
                "language": "en",
                "description": "Practice workbook",
                "resource_type": "workbook",
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
            self.assertEqual(folder.description, "Practice workbook")
            self.assertEqual(folder.resource_type, "workbook")
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
            instance=ResourceFolder(name="Annual Report", resource_type="workbook")
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
                resource_type="assessment",
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
        self.assertEqual(page_data["resourceType"], "assessment")
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


class CurriculumFacetTests(TestCase):
    """
    The curriculum facets (level, subject, year levels, topics) are what the
    public explorer filters on, so they have to survive both the folder form
    and a bulk upload — the two places editors actually set them.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        # Seeded by migration 0016
        self.primary = EducationLevel.objects.get(slug="primary")
        self.junior = EducationLevel.objects.get(slug="junior-secondary")
        self.maths = Subject.objects.get(slug="mathematics")
        self.y1 = YearLevel.objects.get(slug="y1")
        self.y2 = YearLevel.objects.get(slug="y2")
        self.f1 = YearLevel.objects.get(slug="f1")

    def test_vocabulary_seeded(self):
        self.assertEqual(EducationLevel.objects.count(), 4)
        self.assertEqual(YearLevel.objects.count(), 12)
        self.assertEqual(Subject.objects.count(), 10)
        # Early childhood is classified by level only — no years
        self.assertFalse(
            YearLevel.objects.filter(level__slug="early-childhood").exists()
        )
        # Subjects are scoped to the levels they're taught at
        self.assertNotIn(
            self.primary, Subject.objects.get(slug="business-studies").levels.all()
        )

    def test_folder_form_saves_facets(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Numeracy Workbook"))

        response = self.client.post(
            reverse("resource_library:edit_folder", args=[folder.pk]),
            {
                "name": "Numeracy Workbook",
                "resource_type": "workbook",
                "level": self.primary.pk,
                "subject": self.maths.pk,
                "year_levels": [self.y1.pk, self.y2.pk],
                "topics": "numeracy, early grade",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        folder.refresh_from_db()
        self.assertEqual(folder.level, self.primary)
        self.assertEqual(folder.subject, self.maths)
        self.assertEqual(
            sorted(folder.year_levels.values_list("slug", flat=True)), ["y1", "y2"]
        )
        self.assertEqual(
            sorted(folder.topics.names()), ["early grade", "numeracy"]
        )

    def test_year_levels_must_belong_to_level(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Mismatched"))

        response = self.client.post(
            reverse("resource_library:edit_folder", args=[folder.pk]),
            {
                "name": "Mismatched",
                "level": self.primary.pk,
                "year_levels": [self.f1.pk],  # Form 1 is junior secondary
            },
        )
        self.assertEqual(response.status_code, 200)  # re-rendered with errors
        self.assertFormError(
            response.context["form"],
            "year_levels",
            "Form 1 does not belong to Primary.",
        )
        folder.refresh_from_db()
        self.assertIsNone(folder.level)

    def test_upload_applies_facets_to_each_resource(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Year 1 Maths"))

        response = self.client.post(
            reverse("resource_library:upload", args=[category.pk]),
            {
                "files": [
                    SimpleUploadedFile("Counting.txt", b"one"),
                    SimpleUploadedFile("Shapes.txt", b"two"),
                ],
                "mode": "separate",
                "language": "en",
                "resource_type": "workbook",
                "level": self.primary.pk,
                "subject": self.maths.pk,
                "year_levels": [self.y1.pk],
                "topics": "numeracy",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[category.pk])
        )

        for name in ("Counting", "Shapes"):
            folder = ResourceFolder.objects.get(name=name)
            self.assertEqual(folder.level, self.primary)
            self.assertEqual(folder.subject, self.maths)
            self.assertEqual(list(folder.year_levels.all()), [self.y1])
            self.assertEqual(list(folder.topics.names()), ["numeracy"])

    def test_last_updated_prefers_revision_date(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Dated"))
        # Falls back to the CMS timestamp while revision_date is unset
        self.assertEqual(folder.last_updated, folder.updated_at.date())

        folder.revision_date = date(2026, 3, 10)
        folder.save()
        self.assertEqual(folder.last_updated, date(2026, 3, 10))


class CurriculumGraphQLTests(TestCase):
    def setUp(self):
        self.primary = EducationLevel.objects.get(slug="primary")
        self.maths = Subject.objects.get(slug="mathematics")
        self.english = Subject.objects.get(slug="english")
        self.y1 = YearLevel.objects.get(slug="y1")
        self.y3 = YearLevel.objects.get(slug="y3")

        root = ResourceFolder.get_library_root()
        self.maths_page = root.add_child(
            instance=ResourceFolder(
                name="Numeracy Workbook",
                resource_type="workbook",
                level=self.primary,
                subject=self.maths,
            )
        )
        self.maths_page.year_levels.set([self.y1])
        self.maths_page.topics.add("numeracy")
        add_file(self.maths_page, "workbook.txt")

        self.english_page = root.add_child(
            instance=ResourceFolder(
                name="Literacy Teacher Guide",
                resource_type="teacher_guide",
                level=self.primary,
                subject=self.english,
            )
        )
        self.english_page.year_levels.set([self.y1, self.y3])
        add_file(self.english_page, "guide.txt")

    def execute(self, query, **variables):
        from grapple.schema import schema

        result = schema.execute(query, variables=variables or None)
        self.assertIsNone(result.errors)
        return result.data

    def test_vocabulary_queries(self):
        data = self.execute(
            """
            {
                educationLevels { slug name }
                yearLevels(level: "primary") { slug label levelSlug }
                subjects(level: "senior-secondary") { slug }
            }
            """
        )
        # Ordered by the `order` field, not alphabetically
        self.assertEqual(
            [lvl["slug"] for lvl in data["educationLevels"]],
            ["early-childhood", "primary", "junior-secondary", "senior-secondary"],
        )
        self.assertEqual(
            [y["slug"] for y in data["yearLevels"]],
            ["y1", "y2", "y3", "y4", "y5", "y6"],
        )
        self.assertEqual(data["yearLevels"][0]["levelSlug"], "primary")
        subject_slugs = [s["slug"] for s in data["subjects"]]
        self.assertIn("business-studies", subject_slugs)
        self.assertNotIn("arts-crafts", subject_slugs)

    def test_resource_page_exposes_facets(self):
        data = self.execute(
            """
            {
                resourcePage(slug: "numeracy-workbook") {
                    level { slug name }
                    subject { slug }
                    yearLevels { slug }
                    topics { name }
                    lastUpdated
                }
            }
            """
        )
        page = data["resourcePage"]
        self.assertEqual(page["level"]["slug"], "primary")
        self.assertEqual(page["subject"]["slug"], "mathematics")
        self.assertEqual([y["slug"] for y in page["yearLevels"]], ["y1"])
        self.assertEqual([t["name"] for t in page["topics"]], ["numeracy"])
        self.assertTrue(page["lastUpdated"])

    def test_resource_pages_filters(self):
        def slugs(**args):
            arg_str = ", ".join(f'{k}: "{v}"' for k, v in args.items())
            selector = f"resourcePages({arg_str})" if arg_str else "resourcePages"
            data = self.execute("{ %s { slug } }" % selector)
            return sorted(p["slug"] for p in data["resourcePages"])

        self.assertEqual(
            slugs(), ["literacy-teacher-guide", "numeracy-workbook"]
        )
        self.assertEqual(slugs(subject="mathematics"), ["numeracy-workbook"])
        self.assertEqual(slugs(resourceType="teacher_guide"), ["literacy-teacher-guide"])
        self.assertEqual(slugs(topic="numeracy"), ["numeracy-workbook"])
        self.assertEqual(slugs(yearLevel="y3"), ["literacy-teacher-guide"])
        self.assertEqual(slugs(level="junior-secondary"), [])
        # A resource spanning several years matches each of them, once
        self.assertEqual(slugs(yearLevel="y1"), ["literacy-teacher-guide", "numeracy-workbook"])
        # Search covers name and description
        self.assertEqual(slugs(search="numeracy"), ["numeracy-workbook"])
        # Filters compose
        self.assertEqual(slugs(level="primary", subject="english"), ["literacy-teacher-guide"])

    def test_url_path_and_type_labels(self):
        data = self.execute(
            """
            {
                resourcePage(slug: "numeracy-workbook") {
                    urlPath
                    resourceTypeDisplay
                }
                resourceTypes { value label }
            }
            """
        )
        # Links have to carry the whole path from the library root — the
        # frontend catch-all resolves folders by path, not by slug
        self.assertEqual(data["resourcePage"]["urlPath"], "/resources/numeracy-workbook/")
        self.assertEqual(data["resourcePage"]["resourceTypeDisplay"], "Workbook")
        types = {t["value"]: t["label"] for t in data["resourceTypes"]}
        self.assertEqual(types["teacher_guide"], "Teacher Guide")
        self.assertNotIn("policy", types)

    def test_url_path_includes_ancestors(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Primary"))
        nested = category.add_child(instance=ResourceFolder(name="Year 1 English"))
        add_file(nested, "unit.txt")

        data = self.execute(
            '{ resourcePage(slug: "year-1-english") { urlPath } }'
        )
        self.assertEqual(
            data["resourcePage"]["urlPath"], "/resources/primary/year-1-english/"
        )

    def test_ancestor_folders_exclude_the_library_root(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Primary"))
        year = category.add_child(instance=ResourceFolder(name="Year 1"))
        page = year.add_child(instance=ResourceFolder(name="Counting Unit"))
        add_file(page, "unit.txt")

        data = self.execute(
            '{ resourcePage(slug: "counting-unit") { ancestorFolders { name } } }'
        )
        # Outermost first, and the library root is a container rather than a
        # location — breadcrumbs shouldn't show it
        self.assertEqual(
            [a["name"] for a in data["resourcePage"]["ancestorFolders"]],
            ["Primary", "Year 1"],
        )

    def test_top_level_resource_page_has_no_ancestors(self):
        root = ResourceFolder.get_library_root()
        page = root.add_child(instance=ResourceFolder(name="Standalone"))
        add_file(page, "doc.txt")

        data = self.execute(
            '{ resourcePage(slug: "standalone") { ancestorFolders { name } urlPath } }'
        )
        self.assertEqual(data["resourcePage"]["ancestorFolders"], [])
        self.assertEqual(data["resourcePage"]["urlPath"], "/resources/standalone/")
