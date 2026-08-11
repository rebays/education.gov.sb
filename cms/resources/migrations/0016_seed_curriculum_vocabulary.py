"""
Seed the Solomon Islands curriculum vocabulary and retire the old
publication-flavoured resource types.

The library previously shared a taxonomy with the Publications app
(policy/report/circular/…). Policies, reports and guidelines belong to
`publication.Publication`; the resource library is the curriculum-materials
explorer, so its types are now syllabus/teacher guide/workbook/etc. Any
folder still carrying a retired type is moved to "other" rather than left
holding a value the field no longer offers.
"""

from django.db import migrations

LEVELS = [
    ("early-childhood", "Early Childhood", 1),
    ("primary", "Primary", 2),
    ("junior-secondary", "Junior Secondary", 3),
    ("senior-secondary", "Senior Secondary", 4),
]

# (level slug, year slug, label, order). Early childhood is deliberately
# absent: ECE material is classified by level only, not by year.
YEAR_LEVELS = [
    ("primary", "y1", "Year 1", 1),
    ("primary", "y2", "Year 2", 2),
    ("primary", "y3", "Year 3", 3),
    ("primary", "y4", "Year 4", 4),
    ("primary", "y5", "Year 5", 5),
    ("primary", "y6", "Year 6", 6),
    ("junior-secondary", "f1", "Form 1", 1),
    ("junior-secondary", "f2", "Form 2", 2),
    ("junior-secondary", "f3", "Form 3", 3),
    ("senior-secondary", "f4", "Form 4", 4),
    ("senior-secondary", "f5", "Form 5", 5),
    ("senior-secondary", "f6", "Form 6", 6),
]

ALL_SCHOOL = ["primary", "junior-secondary", "senior-secondary"]
SECONDARY = ["junior-secondary", "senior-secondary"]

# (slug, name, levels taught at, order)
SUBJECTS = [
    ("english", "English", ["early-childhood"] + ALL_SCHOOL, 1),
    ("mathematics", "Mathematics", ["early-childhood"] + ALL_SCHOOL, 2),
    ("science", "Science", ALL_SCHOOL, 3),
    ("social-studies", "Social Studies", ALL_SCHOOL, 4),
    ("health-pe", "Health & Physical Education", ALL_SCHOOL, 5),
    ("religious-education", "Christian Religious Education", ALL_SCHOOL, 6),
    ("arts-crafts", "Arts & Crafts", ["early-childhood", "primary"], 7),
    ("design-technology", "Design & Technology", SECONDARY, 8),
    ("business-studies", "Business Studies", ["senior-secondary"], 9),
    ("agriculture", "Agriculture", SECONDARY, 10),
]

RETIRED_TYPES = ["policy", "form", "report", "circular", "curriculum"]


def seed(apps, schema_editor):
    EducationLevel = apps.get_model("resources", "EducationLevel")
    YearLevel = apps.get_model("resources", "YearLevel")
    Subject = apps.get_model("resources", "Subject")
    ResourceFolder = apps.get_model("resources", "ResourceFolder")

    levels = {}
    for slug, name, order in LEVELS:
        levels[slug], _ = EducationLevel.objects.get_or_create(
            slug=slug, defaults={"name": name, "order": order}
        )

    for level_slug, slug, label, order in YEAR_LEVELS:
        YearLevel.objects.get_or_create(
            slug=slug,
            defaults={
                "label": label,
                "level": levels[level_slug],
                "order": order,
            },
        )

    for slug, name, level_slugs, order in SUBJECTS:
        subject, created = Subject.objects.get_or_create(
            slug=slug, defaults={"name": name, "order": order}
        )
        if created:
            subject.levels.set([levels[s] for s in level_slugs])

    ResourceFolder.objects.filter(resource_type__in=RETIRED_TYPES).update(
        resource_type="other"
    )


def unseed(apps, schema_editor):
    """
    Deliberately a no-op. Reversing the schema drops these tables anyway, and
    blindly deleting would take any vocabulary an editor added since with it.
    """


class Migration(migrations.Migration):
    dependencies = [
        ("resources", "0015_educationlevel_resourcefolder_topics_and_more"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
