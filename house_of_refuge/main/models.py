from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

# Create your models here.

User = get_user_model()


class HousingType(models.TextChoices):
    HOME = "home", _("Dom")
    FLAT = "flat", _("Mieszkanie")
    ROOM = "room", _("Pokój")
    COUCH = "couch", _("Kanapa")


class TransportRange(models.TextChoices):
    WARSAW = "warsaw", _("Warsaw")
    POLAND = "poland", _("Poland")
    NONE = "none", _("None")


class Status(models.TextChoices):
    NEW = "new", _("Świeżak")
    VERIFIED = "verified", _("Wiśnia")
    PROCESSING = "processing", _("W procesie")
    TAKEN = "taken", _("Zajęta")
    IGNORE = "ignore", _("Ignoruj")


class HousingResource(TimeStampedModel):
    name = models.CharField(max_length=512, null=False, verbose_name="Imię i nazwisko")
    about_info = models.TextField(max_length=2048)
    resource = models.CharField(choices=HousingType.choices, max_length=1024)
    city_and_zip_code = models.CharField(max_length=512)
    zip_code = models.CharField(max_length=8)
    address = models.CharField(max_length=128)  # ulica numer domu..
    people_to_accommodate_raw = models.CharField(max_length=1024)
    people_to_accommodate = models.IntegerField(
        default=0
    )  # Ile osób jesteś w stanie wesprzeć tak, by miały godne warunki pobytu?
    costs = models.CharField(max_length=1024)
    availability = models.DateField(default=timezone.now)
    accommodation_length = models.CharField(
        max_length=1024
    )  # Na jak długo udostępniasz nocleg?
    details = models.TextField(
        max_length=2048
    )  # Garść informacji o miejscu (obecność zwierząt, języki obce lokatorów i lokatorek, dostępna pościel i ręczniki, inne) *
    transport = models.CharField(choices=TransportRange.choices, max_length=16)
    phone_number = models.CharField(max_length=128)
    backup_phone_number = models.CharField(max_length=128)
    email = models.EmailField(unique=False)
    extra = models.CharField(max_length=2048, null=True)
    status = models.CharField(choices=Status.choices, default=Status.NEW, max_length=32)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, null=True)

    def __str__(self):
        return f"{self.name} {self.people_to_accommodate} {self.zip_code}"

    class Meta:
        verbose_name = "Zasób"
        verbose_name_plural = "Zasoby"

    def as_prop(self):
        return dict(
            id=self.id,
            name=self.name,
            about_info=self.about_info,
            resource=self.resource,
            city_and_zip_code=self.city_and_zip_code,
            zip_code=self.zip_code,
            address=self.address,
            people_to_accommodate=self.people_to_accommodate,
            costs=self.costs,
            availability=self.availability,
            accommodation_length=self.accommodation_length,
            details=self.details,
            transport=self.transport,
            phone_number=self.phone_number,
            backup_phone_number=self.backup_phone_number,
            email=self.email,
            extra=self.extra,
            status=self.status,
        )


class SubSource(models.TextChoices):
    WEBFORM = "webform", _("Strona")
    MAIL = "mail", _("Email")
    TERRAIN = "terrain", _("Zachodni")
    OTHER = "other", _("Inny")


class SubStatus(models.TextChoices):
    NEW = "new", _("Świeżak")
    IN_PROGRESS = "in_progress", _("W działaniu")
    SUCCESS = "success", _("Sukces")
    CANCELLED = "cancelled", _("Nieaktualne")


class Submission(TimeStampedModel):
    name = models.CharField(max_length=512, null=False, verbose_name="Imię i nazwisko")
    phone_number = models.CharField(max_length=128)
    people = models.CharField(max_length=128)
    how_long = models.CharField(max_length=128)
    contact_person = models.CharField(max_length=1024, null=True)
    extra = models.TextField(max_length=2048, null=True)
    languages = models.CharField(max_length=1024, null=True)
    source = models.CharField(choices=SubSource.choices, default=SubSource.TERRAIN, max_length=64)
    priority = models.IntegerField(default=0)
    when = models.DateField(default=timezone.now, null=True)
    transport_needed = models.BooleanField(default=False)
    resource = models.ForeignKey(HousingResource, on_delete=models.SET_NULL, default=None, null=True)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, null=True)
    note = models.TextField(max_length=2048, null=True)
    status = models.CharField(choices=SubStatus.choices, default=Status.NEW, max_length=32)
    person_in_charge_old = models.CharField(max_length=512, default="")

    class Meta:
        verbose_name = "Zgłoszenie"
        verbose_name_plural = "Zgłoszenia"

    def as_prop(self):
        return dict(
            id=self.id,
            name=self.name,
            phone_number=self.phone_number,
            people=self.people,
            resource=self.resource,
            how_long=self.how_long,
            languages=self.languages,
            source=self.source,
            priority=self.priority,
            when=self.when,
            contact_person=self.contact_person,
            transport_needed=self.transport_needed,
            owner=self.owner,
            note=self.note,
            extra=self.extra,
            status=self.status
        )
