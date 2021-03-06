from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from house_of_refuge.main.utils import get_phone_number_display


class User(AbstractUser):
    """
    Default custom user model for House Of Refuge.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    #: First and last name do not cover name patterns around the globe
    name = CharField(_("Name of User"), blank=True, max_length=255)
    phone = CharField(blank=True, max_length=32)
    first_name = None  # type: ignore
    last_name = None  # type: ignore

    def __str__(self):
        return f"{self.name or self.username} ({get_phone_number_display(self.phone)})"

    def as_json(self):
        return {
            "display": str(self),
            "id": self.id,
        }

    def get_absolute_url(self):
        """Get url for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})
