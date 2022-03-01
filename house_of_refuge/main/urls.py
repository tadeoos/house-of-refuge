from django.urls import path

import house_of_refuge.main.views as views

app_name = "main"
urlpatterns = [
    path("", views.resource_gathering, name="main_form"),
    path("zasoby", views.housing_list, name="zasoby"),
    path("api/update_status/<int:resource_id>", views.update_resource_status, name="status_update"),
    path("api/zasoby", views.get_resources, name="zasoby_get"),
    path("api/zgloszenia", views.get_submissions, name="zgloszenia_get"),
    path("api/zglos", views.create_submission, name="zgloszenie_create"),
]
