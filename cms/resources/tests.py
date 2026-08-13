import re
from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.messages import get_messages
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
from .views import annotate_folder_counts


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
        self.assertContains(response, "The library is empty.")

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
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
        )
        self.assertEqual(folder.resources.count(), 2)
        self.assertFalse(folder.get_children().exists())

    def test_upload_rejects_disallowed_extension(self):
        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Reports"))

        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {
                "files": SimpleUploadedFile("malware.exe", b"nope"),
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
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[category.pk])
        )
        resource = Resource.objects.get()
        self.assertTrue(resource.is_video)
        self.assertEqual(resource.folder, category)
        self.assertEqual(resource.label, "Numeracy training")

        # Grid card shows the media icon instead of the document icon
        response = self.client.get(
            reverse("resource_library:folder", args=[category.pk])
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
            },
        )
        self.assertEqual(response.status_code, 302)  # denied -> admin redirect
        self.assertEqual(Resource.objects.count(), 0)

    def test_uploader_can_add_files_but_not_folders(self):
        self.make_user("uploader", "add_resource")
        self.client.login(username="uploader", password="password")

        root = ResourceFolder.get_library_root()
        folder = root.add_child(instance=ResourceFolder(name="Uploads"))
        response = self.client.post(
            reverse("resource_library:upload", args=[folder.pk]),
            {"files": SimpleUploadedFile("doc.pdf", b"contents")},
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[folder.pk])
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
        html = self.client.get(
            reverse("resource_library:edit_folder", args=[folder.pk])
        ).content.decode()
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


class VocabularyDeletionSafetyTests(TestCase):
    """
    Deleting a curriculum vocabulary entry used to be silently destructive:
    the confirmation screen reported "referenced 0 times" while the delete
    unclassified every resource using it, and removing an education level
    cascaded away all of its year levels.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.primary = EducationLevel.objects.get(slug="primary")
        self.maths = Subject.objects.get(slug="mathematics")

        root = ResourceFolder.get_library_root()
        self.folder = root.add_child(
            instance=ResourceFolder(
                name="Year 1 Maths", level=self.primary, subject=self.maths
            )
        )
        add_file(self.folder, "unit.pdf")

    def test_resource_folder_is_registered_for_reference_tracking(self):
        from wagtail.models.reference_index import ReferenceIndex

        self.assertTrue(ReferenceIndex.is_indexed(ResourceFolder))

    def test_folder_references_are_recorded(self):
        """The count on the delete screen comes from this index."""
        from wagtail.models.reference_index import ReferenceIndex

        for target in (self.maths, self.primary):
            with self.subTest(target=target):
                refs = ReferenceIndex.get_references_to(target)
                self.assertGreater(
                    refs.count(), 0, f"no reference recorded to {target}"
                )

    def test_delete_screen_reports_real_usage(self):
        response = self.client.get(
            reverse("wagtailsnippets_resources_subject:delete", args=[self.maths.pk])
        )
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.context["usage_count"], 0)

    def test_education_level_with_year_levels_cannot_be_deleted(self):
        year_count = self.primary.year_levels.count()
        self.assertGreater(year_count, 0)

        response = self.client.post(
            reverse(
                "wagtailsnippets_resources_educationlevel:delete",
                args=[self.primary.pk],
            )
        )
        # Redirected with an explanation rather than a 500, and nothing
        # was destroyed. Note this is the ProtectedError safety net doing the
        # work, not Wagtail's reference-index check — vocabulary seeded by a
        # data migration isn't in the index until it's rebuilt.
        self.assertEqual(response.status_code, 302)
        self.assertIn(
            "can’t be deleted",
            " ".join(str(m.message) for m in get_messages(response.wsgi_request)),
        )
        self.assertTrue(
            EducationLevel.objects.filter(pk=self.primary.pk).exists(),
            "the education level was deleted despite being protected",
        )
        self.assertEqual(self.primary.year_levels.count(), year_count)
        self.folder.refresh_from_db()
        self.assertEqual(self.folder.level, self.primary)

    def test_protect_is_enforced_at_the_database_level(self):
        from django.db.models.deletion import ProtectedError

        with self.assertRaises(ProtectedError):
            self.primary.delete()

    def test_education_level_without_year_levels_can_still_be_deleted(self):
        spare = EducationLevel.objects.create(name="TVET", slug="tvet", order=99)
        response = self.client.post(
            reverse(
                "wagtailsnippets_resources_educationlevel:delete", args=[spare.pk]
            )
        )
        self.assertEqual(response.status_code, 302)
        self.assertFalse(EducationLevel.objects.filter(pk=spare.pk).exists())


class VocabularyEditingTests(TestCase):
    """The three curriculum vocabularies are edited as Wagtail snippets."""

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)

    def test_name_syncs_into_slug(self):
        """
        Slugs are the frontend's contract (filters and the call-number map key
        off them), so editors shouldn't be hand-typing them.
        """
        html = self.client.get(
            reverse("wagtailsnippets_resources_subject:add")
        ).content.decode()
        # TitleFieldPanel wires the source field to emit sync events that the
        # slug widget's w-slug controller listens for
        self.assertIn("w-sync", html)
        self.assertIn("w-sync#apply", html)

    def test_levels_render_as_checkboxes(self):
        html = self.client.get(
            reverse("wagtailsnippets_resources_subject:add")
        ).content.decode()
        self.assertIn('type="checkbox"', html)
        self.assertNotIn('<select name="levels"', html)

    def test_help_text_explains_slug_risk(self):
        for label in ("educationlevel", "yearlevel", "subject"):
            with self.subTest(label=label):
                html = self.client.get(
                    reverse(f"wagtailsnippets_resources_{label}:add")
                ).content.decode()
                self.assertIn("Changing it breaks", html)

    def test_subject_listing_shows_levels(self):
        html = self.client.get(
            reverse("wagtailsnippets_resources_subject:list")
        ).content.decode()
        # Business Studies is senior secondary only — the scoping should be
        # visible without opening the record
        self.assertIn("Senior Secondary", html)

    def test_levels_display_handles_unscoped_subject(self):
        subject = Subject.objects.create(name="Unscoped", slug="unscoped")
        self.assertEqual(subject.levels_display(), "—")


class YearLevelDeletionTests(TestCase):
    """
    Deleting a year level used to be invisible damage: the M2M from
    ResourceFolder isn't in Wagtail's reference index, so the screen said
    "referenced 0 times" and the delete quietly stripped it from every
    resource.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.y1 = YearLevel.objects.get(slug="y1")
        self.y2 = YearLevel.objects.get(slug="y2")

        root = ResourceFolder.get_library_root()
        self.folder = root.add_child(
            instance=ResourceFolder(
                name="Counting", level=EducationLevel.objects.get(slug="primary")
            )
        )
        self.folder.year_levels.set([self.y1])
        add_file(self.folder, "counting.pdf")

    def delete_url(self, year_level):
        return reverse(
            "wagtailsnippets_resources_yearlevel:delete", args=[year_level.pk]
        )

    def test_confirm_screen_reports_real_usage(self):
        response = self.client.get(self.delete_url(self.y1))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["in_use_count"], 1)
        self.assertTrue(response.context["is_protected"])
        self.assertContains(response, "applied to 1 resource")
        # Protected means the parent template hides the delete button
        self.assertNotContains(response, "Yes, delete")

    def test_year_level_in_use_cannot_be_deleted(self):
        response = self.client.post(self.delete_url(self.y1))
        self.assertEqual(response.status_code, 302)
        self.assertTrue(YearLevel.objects.filter(pk=self.y1.pk).exists())
        self.assertEqual(list(self.folder.year_levels.all()), [self.y1])
        self.assertIn(
            "can’t be deleted",
            " ".join(str(m.message) for m in get_messages(response.wsgi_request)),
        )

    def test_unused_year_level_can_still_be_deleted(self):
        response = self.client.post(self.delete_url(self.y2))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(YearLevel.objects.filter(pk=self.y2.pk).exists())

    def test_unused_year_level_shows_normal_confirmation(self):
        response = self.client.get(self.delete_url(self.y2))
        self.assertFalse(response.context.get("is_protected"))
        self.assertContains(response, "Yes, delete")


class VocabularyUsageViewTests(TestCase):
    """
    The usage pages answer "which resources use this?" — the question an
    editor asks before renaming or deleting a vocabulary entry.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.primary = EducationLevel.objects.get(slug="primary")
        self.maths = Subject.objects.get(slug="mathematics")
        self.y1 = YearLevel.objects.get(slug="y1")
        self.y2 = YearLevel.objects.get(slug="y2")

        root = ResourceFolder.get_library_root()
        self.folder = root.add_child(
            instance=ResourceFolder(
                name="Counting", level=self.primary, subject=self.maths
            )
        )
        self.folder.year_levels.set([self.y1])
        add_file(self.folder, "counting.pdf")

    def usage_url(self, label, obj):
        return reverse(f"wagtailsnippets_resources_{label}:usage", args=[obj.pk])

    def test_folder_is_named_and_linked_not_private(self):
        """
        Without an AdminURLFinder every referencing folder was anonymised to
        "(Private resource folder)" with no way to reach it.
        """
        for label, obj in (("subject", self.maths), ("educationlevel", self.primary)):
            with self.subTest(label=label):
                html = self.client.get(self.usage_url(label, obj)).content.decode()
                self.assertIn("Counting", html)
                self.assertNotIn("(Private", html)
                self.assertIn(
                    reverse("resource_library:edit_folder", args=[self.folder.pk]),
                    html,
                )

    def test_admin_url_finder_resolves_folders(self):
        from wagtail.admin.admin_url_finder import AdminURLFinder

        self.assertEqual(
            AdminURLFinder(self.user).get_edit_url(self.folder),
            reverse("resource_library:edit_folder", args=[self.folder.pk]),
        )

    def test_url_finder_respects_permissions(self):
        """A user who can't change folders shouldn't get an edit link."""
        from wagtail.admin.admin_url_finder import AdminURLFinder

        viewer = get_user_model().objects.create_user(
            username="viewer", password="password", is_staff=True
        )
        viewer.user_permissions.add(
            Permission.objects.get(codename="view_resource")
        )
        self.assertIsNone(AdminURLFinder(viewer).get_edit_url(self.folder))

    def test_year_level_usage_lists_m2m_resources(self):
        """
        year_levels is a ManyToMany, which the reference index can't see — the
        default page was empty while the delete screen said it was in use.
        """
        html = self.client.get(self.usage_url("yearlevel", self.y1)).content.decode()
        self.assertIn("Counting", html)
        self.assertIn(
            reverse("resource_library:edit_folder", args=[self.folder.pk]), html
        )
        self.assertNotIn("(Private", html)

    def test_unused_year_level_usage_is_empty(self):
        html = self.client.get(self.usage_url("yearlevel", self.y2)).content.decode()
        self.assertNotIn("Counting", html)

    def test_usage_page_and_delete_screen_agree(self):
        usage = self.client.get(self.usage_url("yearlevel", self.y1)).content.decode()
        delete = self.client.get(
            reverse("wagtailsnippets_resources_yearlevel:delete", args=[self.y1.pk])
        )
        self.assertIn("Counting", usage)
        self.assertEqual(delete.context["in_use_count"], 1)


class CurriculumMenuTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)

    def test_menu_label(self):
        response = self.client.get(reverse("wagtailadmin_home"))
        self.assertContains(response, "Curriculum structure")

    def test_icon_differs_from_resource_library(self):
        """
        The two sit next to each other in the sidebar; sharing an icon made
        them indistinguishable at a glance.
        """
        from .viewsets import CurriculumViewSetGroup
        from .wagtail_hooks import register_resource_library_menu_item

        self.assertNotEqual(
            CurriculumViewSetGroup.menu_icon,
            register_resource_library_menu_item().icon_name,
        )

    def test_icon_is_a_real_wagtail_icon(self):
        """A misspelt icon name fails silently as a blank square."""
        from wagtail.admin.icons import get_icons

        from .viewsets import CurriculumViewSetGroup

        # Icons are served as one SVG sprite; a name that isn't in it renders
        # as an empty square with no error anywhere.
        sprite = "".join(get_icons())
        self.assertIn(f'id="icon-{CurriculumViewSetGroup.menu_icon}"', sprite)


class FolderPageKindTests(TestCase):
    """
    Every folder is public now: files make it a resource page, subfolders make
    it a directory of them, and a folder holding neither redirects away. The
    explorer has to say which, because the editor can't tell otherwise.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.root = ResourceFolder.get_library_root()

    def test_page_kind_matches_the_frontend_rule(self):
        resource = self.root.add_child(instance=ResourceFolder(name="Counting"))
        add_file(resource, "counting.pdf")

        directory = self.root.add_child(instance=ResourceFolder(name="Primary"))
        nested = directory.add_child(instance=ResourceFolder(name="Year 1"))
        add_file(nested, "y1.pdf")

        empty = self.root.add_child(instance=ResourceFolder(name="Empty"))
        # A folder whose only child is itself empty has nothing to browse
        hollow = self.root.add_child(instance=ResourceFolder(name="Hollow"))
        hollow.add_child(instance=ResourceFolder(name="Also empty"))

        self.assertEqual(resource.page_kind, "resource")
        self.assertEqual(directory.page_kind, "directory")
        self.assertEqual(empty.page_kind, "none")
        self.assertEqual(hollow.page_kind, "none")
        self.assertTrue(resource.has_public_page)
        self.assertFalse(empty.has_public_page)

    def test_counts_describe_the_folder_itself(self):
        """
        A category holding one nested document used to read "1 file", which
        is not something it contains.
        """
        category = self.root.add_child(instance=ResourceFolder(name="Primary"))
        nested = category.add_child(instance=ResourceFolder(name="Year 1"))
        add_file(nested, "unit.pdf")

        html = self.client.get(reverse("resource_library:index")).content.decode()
        card = re.search(r"Primary.*?</a>", html, re.S).group(0)
        text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", card))
        self.assertIn("1 folder", text)
        self.assertNotIn("1 file", text)

    def test_annotation_agrees_with_the_model_property(self):
        """The listing and the single-folder property must not drift."""
        for name, files, children in (
            ("WithFiles", 1, 0),
            ("WithChildren", 0, 1),
            ("Nothing", 0, 0),
        ):
            folder = self.root.add_child(instance=ResourceFolder(name=name))
            for i in range(files):
                add_file(folder, f"{name}{i}.pdf")
            for i in range(children):
                child = folder.add_child(
                    instance=ResourceFolder(name=f"{name} child {i}")
                )
                add_file(child, f"{name}c{i}.pdf")

        subfolders = list(self.root.get_children())
        annotate_folder_counts(subfolders)
        for folder in subfolders:
            with self.subTest(folder=folder.name):
                self.assertEqual(
                    folder.page_kind,
                    ResourceFolder.objects.get(pk=folder.pk).page_kind,
                )

    def test_annotation_query_count_is_flat(self):
        for i in range(20):
            folder = self.root.add_child(instance=ResourceFolder(name=f"F{i}"))
            add_file(folder, f"f{i}.pdf")
        subfolders = list(self.root.get_children())
        with self.assertNumQueries(2):
            annotate_folder_counts(subfolders)

    def test_explorer_links_to_the_public_page(self):
        folder = self.root.add_child(instance=ResourceFolder(name="Linkable"))
        add_file(folder, "doc.pdf")
        html = self.client.get(reverse("resource_library:index")).content.decode()
        self.assertIn(folder.public_url, html)
        self.assertIn("View on site", html)

    def test_no_public_link_for_folders_without_a_page(self):
        folder = self.root.add_child(instance=ResourceFolder(name="Nothing here"))
        html = self.client.get(reverse("resource_library:index")).content.decode()
        self.assertNotIn(folder.public_url, html)
        self.assertIn("Not published", html)

    def test_public_url_points_at_the_frontend_host(self):
        folder = self.root.add_child(instance=ResourceFolder(name="Hosted"))
        self.assertTrue(folder.public_url.startswith("http"))
        self.assertTrue(folder.public_url.endswith(folder.url_path))

    def test_folder_form_explains_how_it_publishes(self):
        resource = self.root.add_child(instance=ResourceFolder(name="Guide"))
        add_file(resource, "guide.pdf")
        directory = self.root.add_child(instance=ResourceFolder(name="Section"))
        child = directory.add_child(instance=ResourceFolder(name="Inner"))
        add_file(child, "inner.pdf")
        empty = self.root.add_child(instance=ResourceFolder(name="Blank"))

        for folder, expected in (
            (resource, "resource page"),
            (directory, "directory"),
            (empty, "no public page"),
        ):
            with self.subTest(folder=folder.name):
                response = self.client.get(
                    reverse("resource_library:edit_folder", args=[folder.pk])
                )
                self.assertContains(response, expected)

    def test_directory_form_says_curriculum_fields_do_not_apply(self):
        directory = self.root.add_child(instance=ResourceFolder(name="Section"))
        child = directory.add_child(instance=ResourceFolder(name="Inner"))
        add_file(child, "inner.pdf")
        response = self.client.get(
            reverse("resource_library:edit_folder", args=[directory.pk])
        )
        self.assertContains(response, "don't apply to directories")


class UploadFormLayoutTests(TestCase):
    """
    Resource details only apply when each file becomes its own resource, so
    the form shouldn't ask for them when the files are joining an existing
    resource page.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.root = ResourceFolder.get_library_root()

    def test_label_inputs_use_wagtail_field_markup(self):
        """
        The generated inputs have to carry Wagtail's field classes, or they
        miss the 840px cap on .w-field__wrapper and stretch the full width
        while the fields below them don't.
        """
        folder = self.root.add_child(instance=ResourceFolder(name="Widths"))
        html = self.client.get(
            reverse("resource_library:upload", args=[folder.pk])
        ).content.decode()
        for css_class in (
            "w-field__wrapper",
            "w-field__label",
            "w-field w-field--char_field w-field--text_input",
            "w-field__input",
        ):
            with self.subTest(css_class=css_class):
                self.assertIn(css_class, html)


class UploadLabelTests(TestCase):
    """
    The label titles a file on the public resource page, above the
    description — so it's worth setting at upload time rather than opening
    each file afterwards. Labels arrive parallel to the files, letting a bulk
    upload be titled in one pass.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.root = ResourceFolder.get_library_root()
        self.category = self.root.add_child(instance=ResourceFolder(name="Batch"))

    def upload(self, files, **extra):
        return self.client.post(
            reverse("resource_library:upload", args=[self.category.pk]),
            {"files": files, **extra},
        )

    def test_labels_are_applied_in_order(self):
        self.upload(
            [
                SimpleUploadedFile("scan001.pdf", b"a"),
                SimpleUploadedFile("scan002.pdf", b"b"),
            ],
            labels=["Year 1 Syllabus", "Year 2 Syllabus"],
        )
        self.assertEqual(
            sorted(Resource.objects.values_list("label", flat=True)),
            ["Year 1 Syllabus", "Year 2 Syllabus"],
        )

    def test_blank_label_falls_back_to_the_filename(self):
        self.upload(
            [
                SimpleUploadedFile("keep-me.pdf", b"a"),
                SimpleUploadedFile("rename-me.pdf", b"b"),
            ],
            labels=["", "Renamed"],
        )
        self.assertTrue(Resource.objects.filter(label="keep-me").exists())
        self.assertTrue(Resource.objects.filter(label="Renamed").exists())

    def test_no_labels_posted_falls_back_to_filenames(self):
        """JavaScript off: no label inputs exist, so nothing is posted."""
        self.upload(SimpleUploadedFile("plain.pdf", b"a"))
        self.assertEqual(Resource.objects.get().label, "plain")

    def test_labels_are_trimmed(self):
        self.upload(SimpleUploadedFile("x.pdf", b"a"), labels=["  Padded  "])
        self.assertEqual(Resource.objects.get().label, "Padded")

    def test_labels_apply_when_adding_to_an_existing_resource(self):
        page = self.root.add_child(instance=ResourceFolder(name="Existing"))
        add_file(page, "first.pdf")
        self.client.post(
            reverse("resource_library:upload", args=[page.pk]),
            {
                "files": SimpleUploadedFile("annex.pdf", b"x"),
                "labels": ["Annex A"],
            },
        )
        self.assertTrue(page.resources.filter(label="Annex A").exists())
        # ...but it must not rename the folder it joined
        page.refresh_from_db()
        self.assertEqual(page.name, "Existing")

    def test_fewer_labels_than_files_is_survivable(self):
        self.upload(
            [
                SimpleUploadedFile("one.pdf", b"a"),
                SimpleUploadedFile("two.pdf", b"b"),
            ],
            labels=["Only the first"],
        )
        self.assertTrue(Resource.objects.filter(label="Only the first").exists())
        self.assertTrue(Resource.objects.filter(label="two").exists())

    def test_upload_form_describes_what_the_title_does(self):
        """
        Calling it "the download name" undersold it: the label is the
        heading shown above the description on the resource page.
        """
        html = self.client.get(
            reverse("resource_library:upload", args=[self.category.pk])
        ).content.decode()
        self.assertIn("title on the resource page", html)
        self.assertIn("above the", html)


class TemplateCommentTests(TestCase):
    """
    Django's `{# #}` comments are single-line only — a multi-line one isn't a
    comment at all and renders as literal text on the page. Nothing errors,
    so it only shows up by looking at the admin.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.root = ResourceFolder.get_library_root()

    def test_no_multiline_hash_comments_in_templates(self):
        import pathlib
        import re

        templates = pathlib.Path(__file__).parent / "templates"
        offenders = [
            f"{path.name}:{source[: m.start()].count(chr(10)) + 1}"
            for path in templates.rglob("*.html")
            for source in [path.read_text(encoding="utf-8")]
            for m in re.finditer(r"\{#.*?#\}", source, re.S)
            if "\n" in m.group(0)
        ]
        self.assertEqual(
            offenders, [], "use {% comment %} for comments spanning lines"
        )

    def test_admin_pages_render_no_comment_text(self):
        folder = self.root.add_child(instance=ResourceFolder(name="Rendered"))
        add_file(folder, "doc.pdf")
        year_level = YearLevel.objects.get(slug="y1")

        pages = {
            "explorer": reverse("resource_library:index"),
            "folder": reverse("resource_library:folder", args=[folder.pk]),
            "upload": reverse("resource_library:upload", args=[folder.pk]),
            "edit folder": reverse(
                "resource_library:edit_folder", args=[folder.pk]
            ),
            "new folder": reverse(
                "resource_library:add_folder", args=[folder.pk]
            ),
            "delete year level": reverse(
                "wagtailsnippets_resources_yearlevel:delete", args=[year_level.pk]
            ),
        }
        for name, url in pages.items():
            with self.subTest(page=name):
                html = self.client.get(url).content.decode()
                self.assertNotIn("{#", html)
                self.assertNotIn("#}", html)
                self.assertNotIn("{% comment %}", html)


class UploadTargetsCurrentFolderTests(TestCase):
    """
    Upload does one thing: put files in the folder you're looking at. The
    folder is the unit of publishing, so creating resources means creating
    folders — and everything describing one lives on the folder form.
    """

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.root = ResourceFolder.get_library_root()
        self.folder = self.root.add_child(instance=ResourceFolder(name="Year 1"))

    def test_files_land_in_the_folder_without_creating_subfolders(self):
        response = self.client.post(
            reverse("resource_library:upload", args=[self.folder.pk]),
            {
                "files": [
                    SimpleUploadedFile("one.pdf", b"a"),
                    SimpleUploadedFile("two.pdf", b"b"),
                ]
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[self.folder.pk])
        )
        self.assertEqual(self.folder.resources.count(), 2)
        self.assertFalse(self.folder.get_children().exists())

    def test_uploading_publishes_an_empty_folder_as_a_resource_page(self):
        self.assertEqual(self.folder.page_kind, "none")
        self.client.post(
            reverse("resource_library:upload", args=[self.folder.pk]),
            {"files": SimpleUploadedFile("syllabus.pdf", b"a")},
        )
        self.assertEqual(
            ResourceFolder.objects.get(pk=self.folder.pk).page_kind, "resource"
        )

    def test_upload_form_has_only_files_and_names(self):
        html = self.client.get(
            reverse("resource_library:upload", args=[self.folder.pk])
        ).content.decode()
        self.assertIn('name="files"', html)
        self.assertIn('id="file-labels"', html)
        for gone in ('name="mode"', 'name="level"', 'name="subject"',
                     'name="published_date"', 'name="resource_type"'):
            with self.subTest(field=gone):
                self.assertNotIn(gone, html)

    def test_root_cannot_hold_files(self):
        """
        Files placed at the root have no public page to belong to — the
        frontend resolves resources by their path below it.
        """
        response = self.client.post(
            reverse("resource_library:upload", args=[self.root.pk]),
            {"files": SimpleUploadedFile("loose.pdf", b"a")},
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[self.root.pk])
        )
        self.assertFalse(Resource.objects.exists())
        self.assertIn(
            "Create one first",
            " ".join(str(m.message) for m in get_messages(response.wsgi_request)),
        )

    def test_root_offers_no_upload_button(self):
        html = self.client.get(reverse("resource_library:index")).content.decode()
        self.assertNotIn(
            reverse("resource_library:upload", args=[self.root.pk]), html
        )

    def test_folders_still_offer_upload(self):
        html = self.client.get(
            reverse("resource_library:folder", args=[self.folder.pk])
        ).content.decode()
        self.assertIn(
            reverse("resource_library:upload", args=[self.folder.pk]), html
        )



class FolderFormLayoutTests(TestCase):
    """Layout of the folder form's tabs."""

    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)
        self.root = ResourceFolder.get_library_root()
        self.folder = self.root.add_child(instance=ResourceFolder(name="Folder"))

    def pane(self, html, pane_id):
        start = html.index(f'id="{pane_id}"')
        rest = html[start:]
        nxt = min(
            (i for i in (rest.find('id="curriculum-pane"', 1),
                         rest.find('id="promote-pane"', 1),
                         rest.find("</form>", 1)) if i > 0),
            default=len(rest),
        )
        return rest[:nxt]

    def test_each_field_is_rendered_once(self):
        """
        A merge left a duplicated curriculum pane, so every field in it was
        emitted twice — invisible, since the tab script only ever shows the
        first, but posting the form sent each value twice.
        """
        html = self.client.get(
            reverse("resource_library:edit_folder", args=[self.folder.pk])
        ).content.decode()
        self.assertEqual(html.count('id="curriculum-pane"'), 1)
        for field in ("resource_type", "level", "subject", "topics"):
            with self.subTest(field=field):
                self.assertEqual(html.count(f'name="{field}"'), 1)

    def test_resource_type_sits_with_the_other_filters(self):
        """
        It's one of the four public filters and is equally meaningless on a
        directory, so it belongs beside level, subject and year levels.
        """
        html = self.client.get(
            reverse("resource_library:edit_folder", args=[self.folder.pk])
        ).content.decode()
        self.assertIn('name="resource_type"', self.pane(html, "curriculum-pane"))
        self.assertNotIn('name="resource_type"', self.pane(html, "content-pane"))

    def test_year_levels_are_grouped_by_education_level(self):
        """
        Twelve ungrouped checkboxes are unreadable; Django emits a <label>
        per group, which the form's CSS turns into a heading.
        """
        html = self.client.get(
            reverse("resource_library:edit_folder", args=[self.folder.pk])
        ).content.decode()
        pane = self.pane(html, "curriculum-pane")
        for level in ("Primary", "Junior Secondary", "Senior Secondary"):
            with self.subTest(level=level):
                self.assertIn(f"<label>{level}</label>", pane)

    def test_grouped_year_levels_still_save(self):
        y1 = YearLevel.objects.get(slug="y1")
        y2 = YearLevel.objects.get(slug="y2")
        response = self.client.post(
            reverse("resource_library:edit_folder", args=[self.folder.pk]),
            {
                "name": "Folder",
                "level": EducationLevel.objects.get(slug="primary").pk,
                "year_levels": [y1.pk, y2.pk],
            },
        )
        self.assertRedirects(
            response, reverse("resource_library:folder", args=[self.folder.pk])
        )
        self.assertEqual(
            sorted(self.folder.year_levels.values_list("slug", flat=True)),
            ["y1", "y2"],
        )

    def test_new_folder_form_prefills_todays_date(self):
        from datetime import date as _date

        response = self.client.get(
            reverse("resource_library:add_folder", args=[self.root.pk])
        )
        initial = response.context["form"].fields["published_date"].initial
        self.assertEqual(initial(), _date.today())

    def test_editing_does_not_restamp_the_published_date(self):
        """
        The prefill is for new folders. Opening an old one to fix a typo
        shouldn't quietly claim it was published today.
        """
        from datetime import date as _date

        dated = self.root.add_child(
            instance=ResourceFolder(name="Old", published_date=_date(2024, 3, 1))
        )
        response = self.client.get(
            reverse("resource_library:edit_folder", args=[dated.pk])
        )
        form = response.context["form"]
        self.assertIsNone(form.fields["published_date"].initial)
        self.assertEqual(form.initial["published_date"], _date(2024, 3, 1))

    def test_creating_a_folder_saves_the_prefilled_date(self):
        from datetime import date as _date

        self.client.post(
            reverse("resource_library:add_folder", args=[self.root.pk]),
            {"name": "Dated", "published_date": _date.today().isoformat()},
        )
        self.assertEqual(
            ResourceFolder.objects.get(name="Dated").published_date, _date.today()
        )

    def test_a_blank_published_date_is_still_allowed(self):
        response = self.client.post(
            reverse("resource_library:add_folder", args=[self.root.pk]),
            {"name": "Undated", "published_date": ""},
        )
        self.assertEqual(response.status_code, 302)
        self.assertIsNone(
            ResourceFolder.objects.get(name="Undated").published_date
        )
