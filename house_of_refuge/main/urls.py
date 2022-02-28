from django.urls import path

import house_of_refuge.main.views as views

app_name = "main"
urlpatterns = [
    path("", views.resource_gathering, name="main_form"),
    path("zasoby", views.housing_list, name="zasoby"),
]
