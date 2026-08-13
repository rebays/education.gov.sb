from django.apps import AppConfig


class ResourcesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "resources"

    def ready(self):
        from wagtail.models.reference_index import ReferenceIndex

        from .models import ResourceFolder

        # Wagtail only auto-registers Page subclasses (see wagtail/apps.py) and
        # the models its own viewsets manage. ResourceFolder is a plain
        # MP_Node, so without this its foreign keys to Subject, EducationLevel
        # and the image library are invisible to the reference index — and the
        # snippet delete screens cheerfully report "referenced 0 times" while
        # deleting silently unclassifies every resource using them.
        #
        # Registration only affects folders saved from now on; run
        # `manage.py rebuild_references_index` once to backfill existing rows,
        # including everything created by the seed data migration.
        ReferenceIndex.register_model(ResourceFolder)
