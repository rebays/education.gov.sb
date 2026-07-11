from django.urls import path

from . import views

app_name = "resource_library"

urlpatterns = [
    path("", views.explorer, name="index"),
    path("folder/<int:folder_id>/", views.explorer, name="folder"),
    path("folder/<int:parent_id>/new/", views.add_folder, name="add_folder"),
    path("folder/<int:folder_id>/rename/", views.rename_folder, name="rename_folder"),
    path("folder/<int:folder_id>/delete/", views.delete_folder, name="delete_folder"),
    path("folder/<int:folder_id>/upload/", views.upload, name="upload"),
    path(
        "resource/<int:resource_id>/edit/",
        views.edit_resource,
        name="edit_resource",
    ),
    path(
        "resource/<int:resource_id>/delete/",
        views.delete_resource,
        name="delete_resource",
    ),
]
