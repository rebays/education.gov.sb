from django import forms
from django.conf import settings
from django.core.validators import FileExtensionValidator
from wagtail.admin.widgets import AdminDateInput
from wagtail.documents.fields import WagtailDocumentField

from .models import ResourceDocument


class FolderForm(forms.Form):
    name = forms.CharField(label="Folder name", max_length=255)


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class MultipleDocumentField(WagtailDocumentField):
    """
    WagtailDocumentField (per-file max size validation) accepting multiple
    files, with WAGTAILDOCS_EXTENSIONS enforced per file. Extension checking
    normally lives in Document.clean(), which the bulk upload bypasses.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput(attrs={"multiple": True}))
        super().__init__(*args, **kwargs)
        allowed_extensions = getattr(settings, "WAGTAILDOCS_EXTENSIONS", None)
        if allowed_extensions:
            self.validators.append(FileExtensionValidator(allowed_extensions))

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
    each document's title is derived from its filename.
    """

    files = MultipleDocumentField(label="Files")
    resource_type = forms.ChoiceField(
        choices=ResourceDocument.ResourceType.choices,
        initial=ResourceDocument.ResourceType.PDS,
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
