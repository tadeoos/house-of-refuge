import datetime
import re

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
    MATTRESS = "mattress", _("Materac")


class TransportRange(models.TextChoices):
    WARSAW = "warsaw", _("Warsaw")
    POLAND = "poland", _("Poland")
    NONE = "none", _("None")


class Status(models.TextChoices):
    NEW = "new", _("Świeżak")
    # VERIFIED = "verified", _("Wiśnia")
    # PROCESSING = "processing", _("W procesie")
    TAKEN = "taken", _("Zajęta")
    IGNORE = "ignore", _("Ignoruj")


class HousingResourceManager(Manager):

    def for_remote(self, user):
        return self.filter(
            Q(status__in=[Status.NEW])
            # | Q(owner=user)
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
    address = models.CharField(max_length=512)  # ulica numer domu..
    people_to_accommodate_raw = models.CharField(max_length=1024, blank=True, default="")
    people_to_accommodate = models.IntegerField(
        default=0
    )  # Ile osób jesteś w stanie wesprzeć tak, by miały godne warunki pobytu?
    age = models.CharField(max_length=512, default="", blank=True)
    languages = models.CharField(max_length=512, default="", blank=True)
    when_to_call = models.CharField(max_length=1024, default="", blank=True)
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
    extra = models.CharField(max_length=2048, null=True, default="", blank=True)
    status = models.CharField(choices=Status.choices, default=Status.NEW, max_length=32)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, null=True, blank=True)
    will_pick_up_now = models.BooleanField(default=False)
    note = models.TextField(max_length=2048, default="", blank=True)
    cherry = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)
    is_dropped = models.BooleanField(default=False)
    is_ready = models.BooleanField(default=False)

    objects = HousingResourceManager()

    def __str__(self):
        return f"{self.id} {self.name} {self.phone_number} {self.full_address} {self.pk}"

    class Meta:
        verbose_name = "Zasób"
        verbose_name_plural = "Zasoby"
        indexes = [
            models.Index(fields=['modified']),
        ]

    @property
    def full_address(self):
        return f"{self.address} {self.city_and_zip_code}"

    @property
    def compact_display(self):
        return f"{self.name} {self.get_resource_display()}, {self.full_address}\n{self.extra}"

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
            full_address=self.full_address,
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
            cherry=self.cherry,
            verified=self.verified,
            languages=self.languages,
            when_to_call=self.when_to_call,
            living_with_pets=self.living_with_pets,
            can_take_person_with_pets=self.can_take_person_with_pets,
            note=self.note,
            is_prio=self.is_dropped or self.is_ready,
            compact_display=self.compact_display,
            owner=self.owner.as_json() if self.owner else None,
        )


class SubSource(models.TextChoices):
    WEBFORM = "webform", _("Strona")
    MAIL = "mail", _("Email")
    TERRAIN = "terrain", _("Zachodni")
    OTHER = "other", _("Inny")


class SubStatus(models.TextChoices):
    NEW = "new", _("Świeżak")
    SEARCHING = "searching", _("Szukamy")
    IN_PROGRESS = "in_progress", _("Host znaleziony")
    GONE = "gone", _("Zniknęła")
    SUCCESS = "success", _("Sukces")
    CANCELLED = "cancelled", _("Nieaktualne")


END_OF_DAY = 7


def get_our_today_cutoff(date=None):
    now = date or timezone.now()
    if now.hour > END_OF_DAY:
        cut_off = now.date()
    else:
        cut_off = (now - datetime.timedelta(days=1)).date()
    return cut_off


class SubmissionManager(Manager):

    def for_remote(self):
        return self.filter(
            Q(status__in=[Status.NEW])
        )

    def active_today(self):
        return self.filter(when__lte=get_our_today_cutoff())

    def for_happy_message(self):
        now = timezone.now()
        if now.hour > END_OF_DAY:
            cut_off = now.replace(hour=END_OF_DAY, minute=0, second=0)
        else:
            cut_off = now.replace(day=now.day - 1, hour=END_OF_DAY, minute=0, second=0)
        return self.filter(finished_at__gte=cut_off, status=SubStatus.SUCCESS)


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
    when = models.DateField(default=timezone.now, null=True, blank=True, help_text="Od kiedy potrzebuje")
    transport_needed = models.BooleanField(default=True)
    # ponizej dla zalogowanych
    note = models.TextField(max_length=2048, null=True, blank=True)
    status = models.CharField(choices=SubStatus.choices, default=Status.NEW, max_length=32)
    person_in_charge_old = models.CharField(max_length=512, default="", blank=True)
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                 related_name="received_subs", help_text="Przyjmujący zgłoszenie")
    coordinator = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                    related_name="coord_subs", help_text="Łącznik")
    matcher = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                related_name="matched_subs", help_text="Kto znalazł hosta")
    resource = models.ForeignKey(HousingResource, on_delete=models.SET_NULL, default=None, blank=True, null=True, help_text="Zasób (Host)")
    priority = models.IntegerField(default=1)
    source = models.CharField(choices=SubSource.choices, default=SubSource.WEBFORM, max_length=64)
    should_be_deleted = models.BooleanField(default=False)

    finished_at = models.DateTimeField(null=True, blank=True)

    # TODO: dorobić last status update?

    objects = SubmissionManager()

    def __str__(self):
        return f"{self.id} {self.name} {self.people} na {self.how_long}"

    class Meta:
        verbose_name = "Zgłoszenie"
        verbose_name_plural = "Zgłoszenia"
        ordering = ['-priority', 'created']
        indexes = [
            models.Index(fields=['modified']),
        ]

    def save(self, *args, **kwargs):
        if self.accomodation_in_the_future:
            self.priority = -1
        elif self.status == SubStatus.IN_PROGRESS:
            self.priority = 2
        elif self.status == SubStatus.GONE:
            self.priority = 3
        elif self.status == SubStatus.CANCELLED:
            self.priority = -3
        elif self.status == SubStatus.CANCELLED:
            self.priority = -4
        if self.status == SubStatus.SUCCESS and not self.finished_at:
            self.finished_at = timezone.now()
        return super(Submission, self).save(*args, **kwargs)

    @property
    def people_as_int(self):
        return max([int(i) for i in re.findall(r"\d+", self.people)] or [1])

    @property
    def accomodation_in_the_future(self):
        if self.when:
            when = self.when.date() if isinstance(self.when, datetime.datetime) else self.when
            return when > get_our_today_cutoff()
        return False

    def handle_gone(self):
        self.status = SubStatus.CANCELLED
        if self.resource:
            self.resource.is_dropped = True
            self.resource.note += f"\nHosta znaleziony przez: {self.resource.owner}"
            self.resource.owner = None
            self.resource.availability = get_our_today_cutoff()
            self.resource.save()
            self.resource = None
        self.note += f' \nDropped at {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}'
        self.save()

    def as_prop(self):
        return dict(
            id=self.id,
            created=self.created.astimezone(timezone.get_default_timezone()).strftime("%-d %B %H:%M:%S"),
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
            is_today=get_our_today_cutoff(self.created) >= get_our_today_cutoff(),
            traveling_with_pets=self.traveling_with_pets,
            can_stay_with_pets=self.can_stay_with_pets,
            resource=self.resource.sub_representation() if self.resource else None,
        )


class Groups(models.TextChoices):
    REMOTE = "remote", _("Zdalna")
    STATION = "station", _("Dworzec")


class Coordinator(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    group = models.CharField(choices=Groups.choices, max_length=32)

    class Meta:
        verbose_name = "Koordynator"
        verbose_name_plural = "Koordynatorzy"

    def as_json(self):
        return dict(user=self.user.as_json(), group=self.group)


class ObjectChange(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    submission = models.ForeignKey(Submission, on_delete=models.SET_NULL, null=True)
    host = models.ForeignKey(HousingResource, on_delete=models.SET_NULL, null=True)
    change = models.CharField(max_length=2048)

    class Meta:
        verbose_name = "Zmiana Rekordu"
        verbose_name_plural = "Zmiany Rekordów"
