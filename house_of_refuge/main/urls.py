from django.urls import path

import house_of_refuge.main.views as views

app_name = "main"
urlpatterns = [
    path("", views.home, name="home"),
    path("healthz/", views.healthcheck, name="health"),
    path("statsy/", views.activity_stats_view, name="health"),
    path("share", views.home, name="home"),
    path("find", views.home, name="home"),
    path("privacy/", views.home, name="home"),
    path("jazda/", views.housing_list, name="zasoby"),
    path("api/latest/subs/", views.latest_submission, name="latest_subs"),
    path("api/latest/resources/", views.latest_resource, name="latest_resources"),
    path("api/update_status/<int:resource_id>", views.update_resource_status, name="status_update"),
    path("api/update_note/<int:resource_id>", views.update_resource_note, name="note_update"),
    path("api/zasoby", views.get_resources, name="zasoby_get"),
    path("api/zgloszenia", views.get_submissions, name="zgloszenia_get"),
    path("api/zglos", views.create_submission, name="zgloszenie_create"),
    path("api/stworz_zasob", views.create_resource, name="zasob_create"),
    path("api/set_matcher", views.set_sub_matcher, name="set_matcher"),
    path("api/match_found", views.resource_match_found, name="match_found"),
    path("api/sub/update/<int:sub_id>", views.update_sub, name="sub_update"),
    path("api/resource/update/<int:resource_id>", views.update_resource, name="resource_update"),
]
