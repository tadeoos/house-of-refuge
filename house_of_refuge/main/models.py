from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Manager, Q
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
    # PROCESSING = "processing", _("W procesie")
    TAKEN = "taken", _("Zajęta")
    IGNORE = "ignore", _("Ignoruj")


class HousingResourceManager(Manager):

    def for_remote(self, user):
        return self.filter(
            Q(status__in=[Status.NEW, Status.VERIFIED]) | Q(owner=user)
        )


# dodać do formularza zasobowego:
# - osobno: ile masz lat
# - osobno: czy masz/przyjmiesz zwierzęta
# - języki: osobno
# - kiedy można do ciebie dzwonić/czy można dzwonić do ciebie po północy
# -


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
    age = models.CharField(max_length=512)
    languages = models.CharField(max_length=512)
    when_to_call = models.CharField(max_length=1024)
    living_with_pets = models.CharField(max_length=1024, null=True, blank=True)
    can_take_person_with_pets = models.CharField(max_length=512, null=True, blank=True)

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
    will_pick_up_now = models.BooleanField(default=False)
    note = models.TextField(max_length=2048, default="")

    objects = HousingResourceManager()

    def __str__(self):
        return f"{self.name} {self.people_to_accommodate} {self.zip_code}"

    class Meta:
        verbose_name = "Zasób"
        verbose_name_plural = "Zasoby"

    @property
    def full_address(self):
        return f"{self.address} {self.city_and_zip_code}"

    def sub_representation(self):
        return dict(
            name=self.name,
            address=self.full_address,
            phone_number=self.phone_number,
            note=self.note,
            will_pick_up_now=self.will_pick_up_now,
            owner=self.owner.as_json() if self.owner else None,
        )

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
            note=self.note,
            owner=self.owner.as_json() if self.owner else None,
        )


class SubSource(models.TextChoices):
    WEBFORM = "webform", _("Strona")
    MAIL = "mail", _("Email")
    TERRAIN = "terrain", _("Zachodni")
    OTHER = "other", _("Inny")


class SubStatus(models.TextChoices):
    NEW = "new", _("Świeżak")
    IN_PROGRESS = "in_progress", _("W działaniu")
    GONE = "gone", _("Zniknęła")
    SUCCESS = "success", _("Sukces")
    CANCELLED = "cancelled", _("Nieaktualne")


class SubmissionManager(Manager):

    def for_remote(self):
        return self.filter(
            Q(status__in=[Status.NEW])
        )


class Submission(TimeStampedModel):
    name = models.CharField(max_length=512, null=False, verbose_name="Imię i nazwisko")
    phone_number = models.CharField(max_length=128)
    people = models.CharField(max_length=128)
    how_long = models.CharField(max_length=128)
    description = models.CharField(max_length=2048, help_text="Opisz grupę, podaj wiek wszystkich osób,"
                                                              " relacje ich łączące (rodzina, przyjaciele?), "
                                                              "zaznacz czy można ich rozbić na mniejsze")
    origin = models.CharField(max_length=512, blank=True, default="")
    traveling_with_pets = models.CharField(max_length=1024, null=True, blank=True)
    can_stay_with_pets = models.CharField(max_length=512, null=True, blank=True)  # zrobic dropdown na froncie do tego?
    contact_person = models.CharField(max_length=1024, null=True, blank=True)
    languages = models.CharField(max_length=1024, null=True, blank=True)
    when = models.DateField(default=timezone.now, null=True, blank=True)
    transport_needed = models.BooleanField(default=False)
    # ponizej dla zalogowanych
    note = models.TextField(max_length=2048, null=True, blank=True)
    status = models.CharField(choices=SubStatus.choices, default=Status.NEW, max_length=32)
    person_in_charge_old = models.CharField(max_length=512, default="", blank=True)
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                 related_name="received_subs")
    coordinator = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                    related_name="coord_subs")
    matcher = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                related_name="matched_subs")
    resource = models.ForeignKey(HousingResource, on_delete=models.SET_NULL, default=None, blank=True, null=True)
    priority = models.IntegerField(default=0)
    source = models.CharField(choices=SubSource.choices, default=SubSource.WEBFORM, max_length=64)

    objects = SubmissionManager()

    class Meta:
        verbose_name = "Zgłoszenie"
        verbose_name_plural = "Zgłoszenia"
        ordering = ['-priority', 'created']


    @property
    def accomodation_in_the_future(self):
        if self.when:
            return self.when > timezone.now().date()
        return False

    def as_prop(self):
        return dict(
            id=self.id,
            name=self.name,
            phone_number=self.phone_number,
            people=self.people,
            description=self.description,
            how_long=self.how_long,
            languages=self.languages,
            source=self.source,
            priority=self.priority,
            when=self.when,
            contact_person=self.contact_person,
            transport_needed=self.transport_needed,
            receiver=self.receiver.as_json() if self.receiver else None,
            coordinator=self.coordinator.as_json() if self.coordinator else None,
            matcher=self.matcher.as_json() if self.matcher else None,
            note=self.note,
            accomodation_in_the_future=self.accomodation_in_the_future,
            status=self.status,
            origin=self.origin,
            traveling_with_pets=self.traveling_with_pets,
            can_stay_with_pets=self.can_stay_with_pets,
            resource=self.resource.sub_representation() if self.resource else None,
        )
