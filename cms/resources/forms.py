from django import forms
from django.conf import settings
from django.core.validators import FileExtensionValidator
from wagtail.admin.widgets import AdminDateInput
from wagtail.documents.fields import WagtailDocumentField

from .models import Resource


def document_extension_validators():
    """
    WagtailDocumentField only checks file size; extension checking normally
    lives in Document.clean(), which our standalone Resource model doesn't
    have. Enforce WAGTAILDOCS_EXTENSIONS at the form-field level instead.
    """
    allowed_extensions = getattr(settings, "WAGTAILDOCS_EXTENSIONS", None)
    if allowed_extensions:
        return [FileExtensionValidator(allowed_extensions)]
    return []


class FolderForm(forms.Form):
    name = forms.CharField(label="Folder name", max_length=255)


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class MultipleDocumentField(WagtailDocumentField):
    """
    WagtailDocumentField (per-file max size validation) accepting multiple
    files, with WAGTAILDOCS_EXTENSIONS enforced per file.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput(attrs={"multiple": True}))
        super().__init__(*args, **kwargs)
        self.validators = [*self.validators, *document_extension_validators()]

    def clean(self, data, initial=None):
        single_clean = super().clean
        if not isinstance(data, (list, tuple)):
            data = [data]
        if not data:
            data = [None]  # let FileField raise its usual 'required' error
        cleaned = [single_clean(d, initial) for d in data]
        return [f for f in cleaned if f is not None]


class MultipleDocumentUploadForm(forms.Form):
    """
    Bulk upload form: the metadata fields are applied to every selected file;
    each resource's title is derived from its filename.
    """

    files = MultipleDocumentField(label="Files")
    resource_type = forms.ChoiceField(
        choices=Resource.ResourceType.choices,
        initial=Resource.ResourceType.PDS,
    )
    language = forms.CharField(
        max_length=10,
        required=False,
        initial="en",
        help_text="ISO language code, e.g. en, fr, de",
    )
    revision_date = forms.DateField(required=False, widget=AdminDateInput)
    description = forms.CharField(
        required=False, widget=forms.Textarea(attrs={"rows": 3})
    )


class ResourceForm(forms.ModelForm):
    """Edit form for a single resource; replacing the file is optional."""

    class Meta:
        model = Resource
        fields = [
            "title",
            "file",
            "resource_type",
            "description",
            "language",
            "revision_date",
        ]
        field_classes = {"file": WagtailDocumentField}
        widgets = {
            "revision_date": AdminDateInput,
            "description": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        file_field = self.fields["file"]
        file_field.validators = [
            *file_field.validators,
            *document_extension_validators(),
        ]
