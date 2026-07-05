from django.urls import include, path, reverse
from wagtail import hooks
from wagtail.admin.menu import MenuItem
from wagtail.documents.permissions import permission_policy


@hooks.register("register_admin_urls")
def register_resource_library_urls():
    return [
        path("resource-library/", include("resources.urls")),
    ]


class ResourceLibraryMenuItem(MenuItem):
    def is_shown(self, request):
        return permission_policy.user_has_any_permission(
            request.user, ["add", "change", "delete", "choose"]
        )


@hooks.register("register_admin_menu_item")
def register_resource_library_menu_item():
    return ResourceLibraryMenuItem(
        "Resource Library",
        reverse("resource_library:index"),
        icon_name="folder-open-inverse",
        order=201,
    )
