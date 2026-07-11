from wagtail.admin.panels import Panel


class FilePreviewPanel(Panel):
    """Renders an inline preview of a FileField's current value on the edit form."""

    def __init__(self, field_name, **kwargs):
        super().__init__(**kwargs)
        self.field_name = field_name

    def clone_kwargs(self):
        kwargs = super().clone_kwargs()
        kwargs["field_name"] = self.field_name
        return kwargs

    @property
    def clean_name(self):
        return super().clean_name or f"file-preview-{self.field_name}"

    class BoundPanel(Panel.BoundPanel):
        template_name = "publication/panels/file_preview.html"

        def is_shown(self):
            return bool(getattr(self.instance, self.panel.field_name, None))

        def get_context_data(self, parent_context=None):
            context = super().get_context_data(parent_context)
            file = getattr(self.instance, self.panel.field_name, None)
            context["file"] = file
            name = (file.name or "").lower() if file else ""
            context["is_pdf"] = name.endswith(".pdf")
            context["is_image"] = name.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"))
            return context
