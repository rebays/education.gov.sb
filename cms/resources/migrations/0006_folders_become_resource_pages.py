"""
Data migration for the folder-as-resource-page convention:

- Every existing folder gets a slug generated from its name.
- Every existing Resource (one file + page metadata) becomes a child folder
  carrying the page metadata (name from the title, description, type,
  revision date), with the file left as a Resource inside it; the file's
  label is taken from the old title. Legacy resource_type values (pds, sds,
  brochure, certificate, manual) map to "other".

Historical models don't carry treebeard's tree methods, so child folders are
inserted with explicit path/depth bookkeeping (append as last child).

Reversing copies each file's page metadata back from its folder onto the
Resource row and restores the title from the label. The wrapper folders are
left in place (they're valid, harmless folders under the old code).
"""

from django.db import migrations
from django.db.models import F
from django.utils.text import slugify

NEW_TYPES = {"policy", "form", "report", "circular", "curriculum", "video", "other"}
STEPLEN = 4  # treebeard MP_Node default


def int_to_step(value):
    """treebeard's base-36 path step encoding (numconv with 0-9A-Z)."""
    digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result = ""
    while value:
        value, remainder = divmod(value, 36)
        result = digits[remainder] + result
    return result.rjust(STEPLEN, "0")


def step_to_int(step):
    return int(step, 36)


def unique_slug(base, used):
    base = slugify(base)[:240] or "resource"
    slug = base
    suffix = 2
    while slug in used:
        slug = f"{base}-{suffix}"
        suffix += 1
    used.add(slug)
    return slug


def forwards(apps, schema_editor):
    Resource = apps.get_model("resources", "Resource")
    ResourceFolder = apps.get_model("resources", "ResourceFolder")

    used_slugs = set()
    for folder in ResourceFolder.objects.order_by("path"):
        folder.slug = unique_slug(folder.name, used_slugs)
        folder.save(update_fields=["slug"])

    for resource in Resource.objects.order_by("pk").select_related("folder"):
        parent = resource.folder
        # Append the wrapper folder as the parent's last child
        children = ResourceFolder.objects.filter(
            path__startswith=parent.path, depth=parent.depth + 1
        ).order_by("-path")
        last_child = children.first()
        if last_child is None:
            next_step = int_to_step(1)
        else:
            next_step = int_to_step(step_to_int(last_child.path[-STEPLEN:]) + 1)

        wrapper = ResourceFolder.objects.create(
            path=parent.path + next_step,
            depth=parent.depth + 1,
            numchild=0,
            name=resource.title or "Resource",
            slug=unique_slug(resource.title or "resource", used_slugs),
            description=resource.description,
            resource_type=(
                resource.resource_type
                if resource.resource_type in NEW_TYPES
                else "other"
            ),
            revision_date=resource.revision_date,
        )
        # F() expression: several resources can share a parent, and each row's
        # in-memory parent instance would otherwise hold a stale numchild
        ResourceFolder.objects.filter(pk=parent.pk).update(
            numchild=F("numchild") + 1
        )

        resource.folder = wrapper
        resource.label = resource.title or ""
        resource.save(update_fields=["folder", "label"])


def backwards(apps, schema_editor):
    Resource = apps.get_model("resources", "Resource")

    for resource in Resource.objects.select_related("folder"):
        folder = resource.folder
        resource.title = resource.label or folder.name
        resource.description = folder.description
        resource.resource_type = folder.resource_type or "other"
        resource.revision_date = folder.revision_date
        resource.save(
            update_fields=[
                "title",
                "description",
                "resource_type",
                "revision_date",
            ]
        )


class Migration(migrations.Migration):
    dependencies = [
        ("resources", "0005_resource_label_resourcefolder_description_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
