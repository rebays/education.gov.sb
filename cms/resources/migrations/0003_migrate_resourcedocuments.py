"""
Copy the old collection-based library into the new standalone models:

- The "Resource Library" collection subtree becomes the ResourceFolder tree.
  Both are treebeard MP trees with the default steplen, so folder paths are
  derived by re-rooting the collection paths — historical models don't carry
  treebeard's methods, so nodes are written with explicit path/depth/numchild.
- Every ResourceDocument row becomes a Resource row. Files stay where they
  are on disk (the file field keeps its existing relative path). Documents
  whose collection lies outside the library subtree land at the library root.

The old ResourceDocument table is dropped in the following migration.
"""

from django.db import migrations

LIBRARY_ROOT_NAME = "Resource Library"


def forwards(apps, schema_editor):
    Collection = apps.get_model("wagtailcore", "Collection")
    ResourceDocument = apps.get_model("resources", "ResourceDocument")
    ResourceFolder = apps.get_model("resources", "ResourceFolder")
    Resource = apps.get_model("resources", "Resource")

    if not ResourceDocument.objects.exists():
        return

    root = ResourceFolder.objects.create(
        path="0001", depth=1, numchild=0, name=LIBRARY_ROOT_NAME
    )

    folder_for_collection = {}
    old_root = Collection.objects.filter(name=LIBRARY_ROOT_NAME, depth=2).first()
    if old_root is not None:
        folder_for_collection[old_root.pk] = root
        root.numchild = old_root.numchild
        root.save(update_fields=["numchild"])
        descendants = Collection.objects.filter(
            path__startswith=old_root.path, depth__gt=old_root.depth
        ).order_by("path")
        for collection in descendants:
            folder = ResourceFolder.objects.create(
                path=root.path + collection.path[len(old_root.path) :],
                depth=collection.depth - old_root.depth + 1,
                numchild=collection.numchild,
                name=collection.name,
            )
            folder_for_collection[collection.pk] = folder

    for doc in ResourceDocument.objects.all():
        resource = Resource.objects.create(
            folder=folder_for_collection.get(doc.collection_id, root),
            title=doc.title,
            file=doc.file.name,
            resource_type=doc.resource_type,
            description=doc.description,
            language=doc.language,
            revision_date=doc.revision_date,
            uploaded_by_user_id=doc.uploaded_by_user_id,
            file_size=doc.file_size,
            file_hash=doc.file_hash,
        )
        # created_at is auto_now_add, so it has to be set after the fact
        Resource.objects.filter(pk=resource.pk).update(created_at=doc.created_at)


class Migration(migrations.Migration):
    dependencies = [
        ("resources", "0002_resourcefolder_resource"),
        ("wagtailcore", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
