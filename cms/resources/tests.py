from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils.text import slugify

from .models import (
    LIBRARY_ROOT_NAME,
    EducationLevel,
    Resource,
    ResourceFolder,
    Subject,
    YearLevel,
)


def add_file(folder, filename="doc.pdf", content=b"contents", label=""):
    resource = Resource(
        folder=folder,
        file=SimpleUploadedFile(filename, content),
        label=label,
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
                "published_date": "2025-06-30",
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
                "published_date": "2026-01-15",
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        folder.refresh_from_db()
        self.assertEqual(folder.name, "Primary Science Teacher Guide")
        self.assertEqual(folder.resource_type, "teacher_guide")
        self.assertEqual(str(folder.published_date), "2026-01-15")

    def test_upload_separate_creates_resource_per_file(self):
        root = ResourceFolder.get_library_root()
        category = root.add_child(instance=ResourceFolder(name="Workbooks 2026"))

        response = self.client.post(
            reverse("resource_library:upload", args=[category.pk]),
            {
                "files": [
                    SimpleUploadedFile("Fee guidance.pdf", b"one"),
                    SimpleUploadedFile("Term dates.pdf", b"two"),
                ],
                "mode": "separate",
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
        add_file(folder, "report.pdf")

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": SimpleUploadedFile("Annex A.pdf", b"annex"),
                "mode": "add",
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
                "files": SimpleUploadedFile("Loose file.pdf", b"contents"),
                "mode": "add",  # ignored at the root
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
                "files": SimpleUploadedFile("big.pdf", b"x" * 100),
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
        add_file(page, "report.pdf", label="Budget summary")

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
        resource = add_file(folder, "report.pdf", label="report")

        response = self.client.post(
            reverse("resource_library:edit_resource", args=[resource.pk]),
            {"label": "Full report"},
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        resource.refresh_from_db()
        self.assertEqual(resource.label, "Full report")

    def test_replace_file(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))
        resource = add_file(folder, "report.pdf", content=b"old contents")
        old_file_name = resource.file.name
        storage = resource.file.storage

        response = self.client.post(
            reverse("resource_library:edit_resource", args=[resource.pk]),
            {
                "label": "report",
                "file": SimpleUploadedFile("report-v2.pdf", b"new contents"),
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
        add_file(page, "report.pdf", label="Full report")
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
                    resources { displayLabel url isVideo fileSize }
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
                "files": SimpleUploadedFile("doc.pdf", b"contents"),
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
                "files": SimpleUploadedFile("doc.pdf", b"contents"),
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
                    SimpleUploadedFile("Counting.pdf", b"one"),
                    SimpleUploadedFile("Shapes.pdf", b"two"),
                ],
                "mode": "separate",
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

    def test_last_updated_prefers_published_date(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Dated"))
        # Falls back to the CMS timestamp while published_date is unset
        self.assertEqual(folder.last_updated, folder.updated_at.date())

        folder.published_date = date(2026, 3, 10)
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
        add_file(self.maths_page, "workbook.pdf")

        self.english_page = root.add_child(
            instance=ResourceFolder(
                name="Literacy Teacher Guide",
                resource_type="teacher_guide",
                level=self.primary,
                subject=self.english,
            )
        )
        self.english_page.year_levels.set([self.y1, self.y3])
        add_file(self.english_page, "guide.pdf")

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
        add_file(nested, "unit.pdf")

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
        add_file(page, "unit.pdf")

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
        add_file(page, "doc.pdf")

        data = self.execute(
            '{ resourcePage(slug: "standalone") { ancestorFolders { name } urlPath } }'
        )
        self.assertEqual(data["resourcePage"]["ancestorFolders"], [])
        self.assertEqual(data["resourcePage"]["urlPath"], "/resources/standalone/")


# 1x1 transparent PNG — enough for Wagtail to create a real Image record
TEST_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
    b"\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05"
    b"\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


def make_image(title="Cover"):
    from wagtail.images import get_image_model

    return get_image_model().objects.create(
        title=title,
        file=SimpleUploadedFile(f"{slugify(title)}.png", TEST_PNG, "image/png"),
        width=1,
        height=1,
    )


class ResourceLeadAndCoverTests(TestCase):
    """
    `lead` drives the resource page header and `cover_image` the card in the
    explorer. Both are optional, so the fallbacks matter as much as the
    fields themselves.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.root = ResourceFolder.get_library_root()

    def execute(self, query):
        from grapple.schema import schema

        result = schema.execute(query)
        self.assertIsNone(result.errors)
        return result.data

    def test_display_lead_falls_back_to_description(self):
        folder = self.root.add_child(
            instance=ResourceFolder(name="Guide", description="A description")
        )
        self.assertEqual(folder.display_lead, "A description")

        folder.lead = "A punchier intro"
        folder.save()
        self.assertEqual(folder.display_lead, "A punchier intro")

    def test_display_lead_empty_when_nothing_set(self):
        folder = self.root.add_child(instance=ResourceFolder(name="Bare"))
        self.assertEqual(folder.display_lead, "")

    def test_graphql_exposes_lead_and_cover(self):
        image = make_image()
        page = self.root.add_child(
            instance=ResourceFolder(
                name="Numeracy Workbook",
                description="Practice book",
                lead="Everything a Year 3 teacher needs",
                cover_image=image,
            )
        )
        add_file(page, "workbook.pdf")

        data = self.execute(
            """
            {
                resourcePage(slug: "numeracy-workbook") {
                    lead
                    displayLead
                    description
                    coverImage { url }
                }
            }
            """
        )
        result = data["resourcePage"]
        self.assertEqual(result["lead"], "Everything a Year 3 teacher needs")
        self.assertEqual(result["displayLead"], "Everything a Year 3 teacher needs")
        self.assertEqual(result["description"], "Practice book")
        self.assertTrue(result["coverImage"]["url"])

    def test_graphql_cover_is_null_when_unset(self):
        page = self.root.add_child(instance=ResourceFolder(name="No Cover"))
        add_file(page, "doc.pdf")
        data = self.execute(
            '{ resourcePage(slug: "no-cover") { coverImage { url } lead } }'
        )
        self.assertIsNone(data["resourcePage"]["coverImage"])
        self.assertEqual(data["resourcePage"]["lead"], "")

    def test_folder_form_saves_lead_and_cover(self):
        image = make_image("Chosen cover")
        folder = self.root.add_child(instance=ResourceFolder(name="Syllabus"))

        response = self.client.post(
            reverse("resource_library:edit_folder", args=[folder.pk]),
            {
                "name": "Syllabus",
                "lead": "The 2026 mathematics syllabus",
                "description": "Full syllabus document",
                "cover_image": image.pk,
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        folder.refresh_from_db()
        self.assertEqual(folder.lead, "The 2026 mathematics syllabus")
        self.assertEqual(folder.cover_image, image)

    def test_edit_form_renders_image_chooser(self):
        folder = self.root.add_child(instance=ResourceFolder(name="Chooser"))
        response = self.client.get(
            reverse("resource_library:edit_folder", args=[folder.pk])
        )
        self.assertEqual(response.status_code, 200)
        # The chooser is a Wagtail widget with its own JS; a plain <select>
        # would mean it silently fell back to the default widget
        self.assertContains(response, "chooser")
        self.assertContains(response, "image-chooser")

    def test_upload_defaults_published_date_to_today(self):
        from datetime import date as _date

        category = self.root.add_child(instance=ResourceFolder(name="Batch"))
        response = self.client.post(
            reverse("resource_library:upload", args=[category.pk]),
            {
                "files": SimpleUploadedFile("Handbook.pdf", b"x"),
                "mode": "separate",
                # published_date deliberately omitted
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[category.pk])
        )
        folder = ResourceFolder.objects.get(name="Handbook")
        self.assertEqual(folder.published_date, _date.today())

    def test_upload_respects_explicit_published_date(self):
        category = self.root.add_child(instance=ResourceFolder(name="Backdated"))
        self.client.post(
            reverse("resource_library:upload", args=[category.pk]),
            {
                "files": SimpleUploadedFile("Old syllabus.pdf", b"x"),
                "mode": "separate",
                "published_date": "2024-02-01",
            },
        )
        folder = ResourceFolder.objects.get(name="Old syllabus")
        self.assertEqual(str(folder.published_date), "2024-02-01")

    def test_upload_form_prefills_today(self):
        from datetime import date as _date

        category = self.root.add_child(instance=ResourceFolder(name="Prefill"))
        response = self.client.get(
            reverse("resource_library:upload", args=[category.pk])
        )
        self.assertEqual(
            response.context["form"].fields["published_date"].initial(), _date.today()
        )

    def test_graphql_exposes_published_date(self):
        page = self.root.add_child(
            instance=ResourceFolder(
                name="Dated Resource", published_date=date(2026, 5, 4)
            )
        )
        add_file(page, "doc.pdf")
        data = self.execute(
            '{ resourcePage(slug: "dated-resource") { publishedDate } }'
        )
        self.assertEqual(data["resourcePage"]["publishedDate"], "2026-05-04")

    def test_date_fields_render_as_pickers(self):
        """
        AdminDateInput emits a text input plus an inline initDateChooser()
        call — the picker only materialises if the widget's media is on the
        page. These bespoke templates render fields by hand, so the media is
        easy to forget and the failure is silent (a plain text box).
        """
        folder = self.root.add_child(instance=ResourceFolder(name="Picker"))
        for url in (
            reverse("resource_library:edit_folder", args=[folder.pk]),
            reverse("resource_library:upload", args=[folder.pk]),
        ):
            with self.subTest(url=url):
                html = self.client.get(url).content.decode()
                self.assertIn("initDateChooser", html)
                self.assertIn("date-time-chooser.js", html)

    def test_folder_cards_carry_edit_and_delete_actions(self):
        child = self.root.add_child(instance=ResourceFolder(name="Primary"))
        response = self.client.get(reverse("resource_library:index"))
        html = response.content.decode()

        edit_url = reverse("resource_library:edit_folder", args=[child.pk])
        delete_url = reverse("resource_library:delete_folder", args=[child.pk])
        self.assertIn(edit_url, html)
        self.assertIn(delete_url, html)
        # Folders are managed from the parent listing now, so the heading no
        # longer carries its own edit/delete buttons
        self.assertNotIn("rl-folder-actions", html)

    def test_folder_actions_present_in_list_layout(self):
        child = self.root.add_child(instance=ResourceFolder(name="Secondary"))
        response = self.client.get(
            reverse("resource_library:index"), {"layout": "list"}
        )
        html = response.content.decode()
        self.assertIn(reverse("resource_library:edit_folder", args=[child.pk]), html)
        self.assertIn(reverse("resource_library:delete_folder", args=[child.pk]), html)

    def test_folder_card_is_not_a_nested_anchor(self):
        """
        The card used to be a bare <a>; action links can't be nested inside
        one. It has to be a wrapper element with the link as a child.
        """
        self.root.add_child(instance=ResourceFolder(name="Nested"))
        html = self.client.get(reverse("resource_library:index")).content.decode()
        self.assertNotIn('<a class="rl-card"', html)

    def test_viewer_without_permissions_sees_no_folder_actions(self):
        child = self.root.add_child(instance=ResourceFolder(name="ReadOnly"))
        viewer = get_user_model().objects.create_user(
            username="viewer", password="password", is_staff=True
        )
        viewer.user_permissions.add(
            Permission.objects.get(codename="view_resource"),
            Permission.objects.get(codename="access_admin", content_type__app_label="wagtailadmin"),
        )
        self.client.force_login(viewer)
        html = self.client.get(reverse("resource_library:index")).content.decode()
        self.assertNotIn(reverse("resource_library:edit_folder", args=[child.pk]), html)
        self.assertNotIn(reverse("resource_library:delete_folder", args=[child.pk]), html)

    def test_video_extension_lists_stay_in_sync(self):
        """
        Two lists describe "what is a video": the settings list gates uploads,
        and models.VIDEO_EXTENSIONS decides the size limit and whether the
        frontend renders a player. If they drift, a file can be accepted but
        never play, or get the wrong size limit.
        """
        from django.conf import settings as django_settings

        from .models import VIDEO_EXTENSIONS

        self.assertEqual(
            sorted(django_settings.RESOURCE_LIBRARY_VIDEO_EXTENSIONS),
            sorted(VIDEO_EXTENSIONS),
        )

    def test_allowed_extensions_are_pdf_and_video_only(self):
        from django.conf import settings as django_settings

        self.assertEqual(
            sorted(django_settings.RESOURCE_LIBRARY_EXTENSIONS),
            sorted(["pdf", "mp4", "webm", "m4v"]),
        )

    def test_office_documents_and_archives_are_rejected(self):
        from django.conf import settings as django_settings

        folder = self.root.add_child(instance=ResourceFolder(name="Uploads"))
        for filename in ("notes.docx", "budget.xlsx", "deck.pptx", "pack.zip", "notes.txt"):
            with self.subTest(filename=filename):
                response = self.client.post(
                    reverse("resource_library:upload", args=[folder.pk]),
                    {
                        "files": SimpleUploadedFile(filename, b"contents"),
                        "mode": "separate",
                    },
                )
                self.assertEqual(response.status_code, 200)  # redisplayed with errors
                # Django lists the extensions in the order they're configured
                allowed = ", ".join(django_settings.RESOURCE_LIBRARY_EXTENSIONS)
                self.assertFormError(
                    response.context["form"],
                    "files",
                    f"File extension “{filename.rsplit('.', 1)[1]}” is not allowed. "
                    f"Allowed extensions are: {allowed}.",
                )
        self.assertFalse(Resource.objects.exists())

    def test_pdf_and_video_are_accepted(self):
        folder = self.root.add_child(instance=ResourceFolder(name="Accepted"))
        for filename in ("syllabus.pdf", "lesson.mp4", "clip.webm", "clip.m4v"):
            with self.subTest(filename=filename):
                response = self.client.post(
                    reverse("resource_library:upload", args=[folder.pk]),
                    {
                        "files": SimpleUploadedFile(filename, b"contents"),
                        "mode": "separate",
                    },
                )
                self.assertRedirects(
                    response, reverse("resource_library:folder", args=[folder.pk])
                )
        self.assertEqual(Resource.objects.count(), 4)

    def test_upload_input_advertises_accepted_formats(self):
        folder = self.root.add_child(instance=ResourceFolder(name="Advertised"))
        html = self.client.get(
            reverse("resource_library:upload", args=[folder.pk])
        ).content.decode()
        self.assertIn('accept=".pdf,.mp4,.webm,.m4v"', html)
        self.assertIn("Accepted formats: PDF, MP4, WEBM, M4V.", html)
