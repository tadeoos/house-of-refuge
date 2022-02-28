from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class MainConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "house_of_refuge.main"
    verbose_name = _("Main")
