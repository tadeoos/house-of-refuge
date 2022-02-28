from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class UsersConfig(AppConfig):
    name = "house_of_refuge.users"
    verbose_name = _("Users")

    def ready(self):
        try:
            import house_of_refuge.users.signals  # noqa F401
        except ImportError:
            pass
