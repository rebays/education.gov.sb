import hashlib
import os.path

from django.conf import settings
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from treebeard.mp_tree import MP_Node
from wagtail.search import index

LIBRARY_ROOT_NAME = "Resource Library"


class ResourceFolder(MP_Node):
    """
    Folder tree for the resource library. Lives entirely apart from Wagtail's
    collection tree; the library is rooted at a single root node created on
    first use (so it survives renaming).
    """

    name = models.CharField(max_length=255)

    class Meta:
        verbose_name = "resource folder"

    def __str__(self):
        return self.name

    @classmethod
    def get_library_root(cls):
        root = cls.get_first_root_node()
        if root is None:
            root = cls.add_root(name=LIBRARY_ROOT_NAME)
        return root


class Resource(index.Indexed, models.Model):
    """
    A file in the resource library. Deliberately not registered as the Wagtail
    document model, so the library stays separate from the general Documents
    area; files are served directly from media storage via `file.url`.
    """

    class ResourceType(models.TextChoices):
        PDS = "pds", "Product Data Sheet (PDS)"
        SDS = "sds", "Safety Data Sheet (SDS)"
        BROCHURE = "brochure", "Brochure"
        CERTIFICATE = "certificate", "Certificate"
        MANUAL = "manual", "Manual"
        OTHER = "other", "Other"

    folder = models.ForeignKey(
        ResourceFolder, on_delete=models.PROTECT, related_name="resources"
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="resources", max_length=255)
    resource_type = models.CharField(
        max_length=20,
        choices=ResourceType.choices,
        default=ResourceType.PDS,
    )
    description = models.TextField(blank=True)
    language = models.CharField(
        max_length=10,
        blank=True,
        default="en",
        help_text="ISO language code, e.g. en, fr, de",
    )
    revision_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date of the current revision of this resource",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    uploaded_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    file_size = models.PositiveBigIntegerField(null=True, editable=False)
    file_hash = models.CharField(max_length=40, blank=True, editable=False)

    search_fields = [
        index.SearchField("title"),
        index.AutocompleteField("title"),
        index.SearchField("description"),
        index.FilterField("folder"),
        index.FilterField("resource_type"),
        index.FilterField("language"),
    ]

    class Meta:
        verbose_name = "resource"

    def __str__(self):
        return self.title

    @property
    def url(self):
        return self.file.url

    @property
    def filename(self):
        return os.path.basename(self.file.name)

    @property
    def file_extension(self):
        return os.path.splitext(self.filename)[1][1:]

    def set_file_metadata(self):
        """Populate file_size and file_hash from the current file."""
        self.file.seek(0)
        self.file_hash = hashlib.sha1(self.file.read()).hexdigest()
        self.file.seek(0)
        self.file_size = self.file.size


@receiver(post_delete, sender=Resource)
def delete_resource_file(instance, **kwargs):
    # FileFields don't clean up storage on delete; do it ourselves
    instance.file.delete(save=False)
