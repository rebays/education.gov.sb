from django.db import models
from wagtail.documents.models import AbstractDocument, Document
from wagtail.search import index


class ResourceDocument(AbstractDocument):
    """
    Custom document model for the resource library. Referenced by
    WAGTAILDOCS_DOCUMENT_MODEL in settings; folder structure comes from the
    document's collection.
    """

    class ResourceType(models.TextChoices):
        PDS = "pds", "Product Data Sheet (PDS)"
        SDS = "sds", "Safety Data Sheet (SDS)"
        BROCHURE = "brochure", "Brochure"
        CERTIFICATE = "certificate", "Certificate"
        MANUAL = "manual", "Manual"
        OTHER = "other", "Other"

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

    admin_form_fields = Document.admin_form_fields + (
        "resource_type",
        "description",
        "language",
        "revision_date",
    )

    search_fields = AbstractDocument.search_fields + [
        index.SearchField("description"),
        index.FilterField("resource_type"),
        index.FilterField("language"),
    ]
