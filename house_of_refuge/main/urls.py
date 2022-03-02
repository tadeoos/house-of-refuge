from django.urls import path

import house_of_refuge.main.views as views

app_name = "main"
urlpatterns = [
    path("", views.home, name="home"),
    path("form1", views.home, name="home"),
    path("form2", views.home, name="home"),
    path("zasoby", views.housing_list, name="zasoby"),
    path("api/update_status/<int:resource_id>", views.update_resource_status, name="status_update"),
    path("api/update_note/<int:resource_id>", views.update_resource_note, name="note_update"),
    path("api/zasoby", views.get_resources, name="zasoby_get"),
    path("api/zgloszenia", views.get_submissions, name="zgloszenia_get"),
    path("api/zglos", views.create_submission, name="zgloszenie_create"),
    path("api/stworz_zasob", views.create_resource, name="zasob_create"),
    path("api/sub_start/<int:sub_id>", views.sub_is_processed, name="sub_start"),
]
