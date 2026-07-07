from django.apps import AppConfig


class MenuConfig(AppConfig):
    name = 'menu'

    def ready(self):
        from django.db.models.signals import post_save
        from .models import Menu
        from .signals import revalidate_frontend
        post_save.connect(revalidate_frontend, sender=Menu)
