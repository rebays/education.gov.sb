from datetime import date

from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.template.defaultfilters import filesizeformat
from wagtail.admin.widgets import AdminDateInput
from wagtail.images.widgets import AdminImageChooser

from .models import (
    EducationLevel,
    Resource,
    ResourceFolder,
    Subject,
    YearLevel,
    is_video_filename,
)


def validate_year_levels_match_level(level, year_levels):
    """
    Curriculum facets have to agree: a folder set to Primary can't be tagged
    Form 3. Shared by the folder and upload forms, which both collect the
    pair. Returns an error message, or None when consistent.
    """
    if not level or not year_levels:
        return None
    mismatched = [y.label for y in year_levels if y.level_id != level.pk]
    if not mismatched:
        return None
    return (
        f"{', '.join(mismatched)} "
        f"{'does' if len(mismatched) == 1 else 'do'} not belong to {level.name}."
    )


class FolderForm(forms.ModelForm):
    """
    Create/edit form for a folder. The details are optional: they only
    surface on the frontend once the folder holds files and thereby becomes
    a resource page.
    """

    class Meta:
        model = ResourceFolder
        fields = [
            "name",
            "lead",
            "description",
            "cover_image",
            "resource_type",
            "level",
            "subject",
            "year_levels",
            "topics",
            "published_date",
            "meta_description",
            "canonical_url",
        ]
        widgets = {
            "lead": forms.Textarea(attrs={"rows": 2}),
            "description": forms.Textarea(attrs={"rows": 3}),
            # Without this the image FK renders as a plain <select> listing
            # every image in the library
            "cover_image": AdminImageChooser,
            "year_levels": forms.CheckboxSelectMultiple,
            "published_date": AdminDateInput,
            "meta_description": forms.Textarea(attrs={"rows": 2}),
            "canonical_url": forms.URLInput(attrs={"placeholder": "https://example.com/resources/page/"}),
        }
        help_texts = {
            "description": "Shown on the resource page once this folder has files.",
        }

    def clean(self):
        cleaned_data = super().clean()
        error = validate_year_levels_match_level(
            cleaned_data.get("level"), cleaned_data.get("year_levels")
        )
        if error:
            self.add_error("year_levels", error)
        return cleaned_data


class ResourceFileField(forms.FileField):
    """
    FileField enforcing the resource library's upload rules from settings:
    RESOURCE_LIBRARY_EXTENSIONS, and a per-kind size limit so videos
    (RESOURCE_LIBRARY_VIDEO_MAX_UPLOAD_SIZE) can be far larger than documents
    (RESOURCE_LIBRARY_MAX_UPLOAD_SIZE). Either limit may be None for no limit.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        allowed_extensions = getattr(settings, "RESOURCE_LIBRARY_EXTENSIONS", None)
        if allowed_extensions:
            self.validators = [
                *self.validators,
                FileExtensionValidator(allowed_extensions),
            ]
            # Filters the OS file picker. Advisory only — the validator above
            # is what actually enforces the rule.
            self.widget.attrs.setdefault(
                "accept", ",".join(f".{ext}" for ext in allowed_extensions)
            )
        if not self.help_text:
            self.help_text = self.size_limits_text()

    @staticmethod
    def size_limits_text():
        doc_max = getattr(settings, "RESOURCE_LIBRARY_MAX_UPLOAD_SIZE", None)
        video_max = getattr(settings, "RESOURCE_LIBRARY_VIDEO_MAX_UPLOAD_SIZE", None)
        parts = []
        if doc_max is not None:
            parts.append(f"documents up to {filesizeformat(doc_max)}")
        if video_max is not None:
            parts.append(f"videos up to {filesizeformat(video_max)}")
        size_text = f"Maximum filesize: {', '.join(parts)}." if parts else ""

        allowed = getattr(settings, "RESOURCE_LIBRARY_EXTENSIONS", None)
        if not allowed:
            return size_text
        allowed_text = (
            f"Accepted formats: {', '.join(ext.upper() for ext in allowed)}."
        )
        return f"{allowed_text} {size_text}".strip()

    def validate(self, value):
        super().validate(value)
        if value is None:
            return
        if is_video_filename(value.name):
            max_size = getattr(settings, "RESOURCE_LIBRARY_VIDEO_MAX_UPLOAD_SIZE", None)
        else:
            max_size = getattr(settings, "RESOURCE_LIBRARY_MAX_UPLOAD_SIZE", None)
        if max_size is not None and value.size > max_size:
            raise ValidationError(
                f"'{value.name}' is too big ({filesizeformat(value.size)}). "
                f"Maximum filesize: {filesizeformat(max_size)}.",
                code="file_too_large",
            )


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class MultipleResourceFileField(ResourceFileField):
    """ResourceFileField accepting multiple files, validated one by one."""

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput(attrs={"multiple": True}))
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single_clean = super().clean
        if not isinstance(data, (list, tuple)):
            data = [data]
        if not data:
            data = [None]  # let FileField raise its usual 'required' error
        cleaned = [single_clean(d, initial) for d in data]
        return [f for f in cleaned if f is not None]


class UploadForm(forms.Form):
    """
    Bulk upload form. In "separate" mode each file becomes its own resource
    folder (the details below applied to each); in "add" mode the files are
    added to the current folder and the details are ignored. Each file's
    label is derived from its filename.
    """

    MODE_SEPARATE = "separate"
    MODE_ADD = "add"
    MODE_CHOICES = [
        (MODE_SEPARATE, "Create a separate resource per file"),
        (MODE_ADD, "Add the files to this folder's resource page"),
    ]

    files = MultipleResourceFileField(label="Files")
    mode = forms.ChoiceField(
        choices=MODE_CHOICES,
        widget=forms.RadioSelect,
        label="Upload as",
    )
    description = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={"rows": 3}),
        help_text="Applied to each new resource; ignored when adding files to this folder.",
    )
    resource_type = forms.ChoiceField(
        choices=[("", "---------")] + list(ResourceFolder.ResourceType.choices),
        required=False,
        help_text="Applied to each new resource; ignored when adding files to this folder.",
    )
    # Curriculum facets, collected here so a bulk upload lands fully
    # classified and shows up in the frontend explorer's filters straight
    # away — rather than needing every folder reopened afterwards.
    level = forms.ModelChoiceField(
        queryset=None,
        required=False,
        help_text="Applied to each new resource; ignored when adding files to this folder.",
    )
    subject = forms.ModelChoiceField(
        queryset=None,
        required=False,
        help_text="Applied to each new resource; ignored when adding files to this folder.",
    )
    year_levels = forms.ModelMultipleChoiceField(
        queryset=None,
        required=False,
        widget=forms.CheckboxSelectMultiple,
        help_text="Applied to each new resource; ignored when adding files to this folder.",
    )
    topics = forms.CharField(
        required=False,
        help_text="Comma-separated keywords applied to each new resource.",
    )
    published_date = forms.DateField(
        required=False,
        initial=date.today,
        widget=AdminDateInput,
        help_text=(
            "Applied to each new resource; defaults to today. "
            "Ignored when adding files to this folder."
        ),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set at runtime rather than import time so the querysets aren't
        # evaluated before migrations have created the tables.
        self.fields["level"].queryset = EducationLevel.objects.all()
        self.fields["subject"].queryset = Subject.objects.all()
        self.fields["year_levels"].queryset = YearLevel.objects.select_related("level")

    def clean(self):
        cleaned_data = super().clean()
        error = validate_year_levels_match_level(
            cleaned_data.get("level"), cleaned_data.get("year_levels")
        )
        if error:
            self.add_error("year_levels", error)
        return cleaned_data

    def clean_topics(self):
        raw = self.cleaned_data.get("topics", "")
        return [t.strip() for t in raw.split(",") if t.strip()]


class ResourceForm(forms.ModelForm):
    """Edit form for a single file; replacing the file itself is optional."""

    class Meta:
        model = Resource
        fields = ["label", "file"]
        field_classes = {"file": ResourceFileField}
