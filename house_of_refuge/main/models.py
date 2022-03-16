import datetime
import re
from secrets import token_urlsafe

from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Manager, Q, Count
from django.urls import reverse
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.functional import cached_property
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

# Create your models here.
from solo.models import SingletonModel

from house_of_refuge.main.utils import ago, get_phone_number_display, extract_number_from_string

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
    TAKEN = "taken", _("Zajęta")
    CALLING = "calling", _("Dzwonimy")
    IGNORE = "ignore", _("Ignoruj")
    SHOULD_DELETE = "should_delete", _("Do usunięcia")


class HousingResourceManager(Manager):

    def for_remote(self, user):
        return self.filter(
            Q(status__in=[Status.NEW])
            # | Q(owner=user)
        )

    def exclude_excels(self):
        cutoff = datetime.datetime(2022, 3, 3, 16, 0, 0)
        return self.exclude(Q(created__lt=cutoff), ~Q(people_to_accommodate_raw=""))


# dodać do formularza zasobowego:
# - osobno: ile masz lat
# - osobno: czy masz/przyjmiesz zwierzęta
# - języki: osobno
# - kiedy można do ciebie dzwonić/czy można dzwonić do ciebie po północy
# -

def generate_token():
    for i in range(1000):
        token = get_random_string(32)
        if not HousingResource.objects.filter(token=token).exists():
            return token
    raise ValueError


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
    backup_phone_number = models.CharField(max_length=128, default="", blank=True)
    email = models.EmailField(unique=False)
    extra = models.CharField(max_length=2048, null=True, default="", blank=True)
    status = models.CharField(choices=Status.choices, default=Status.NEW, max_length=32)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, null=True, blank=True)
    will_pick_up_now = models.BooleanField(default=False)
    note = models.TextField(max_length=2048, default="", blank=True)
    cherry = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)
    is_dropped = models.BooleanField(default=False)
    got_hot = models.DateTimeField(default=None, null=True, blank=True)
    turtle = models.BooleanField(default=False, help_text=_("This host offers longer stay"), verbose_name=_("Turtle"))
    token = models.CharField(max_length=64, unique=True, default=generate_token)

    objects = HousingResourceManager()

    def __str__(self):
        return f"{self.id} {self.name} {self.phone_number} {self.full_address} {self.pk}"

    class Meta:
        verbose_name = "Zasób"
        verbose_name_plural = "Zasoby"
        indexes = [
            models.Index(fields=['modified']),
        ]

    def get_edit_url(self):
        return f'{settings.BASE_URL}{reverse("main:host-edit")}?t={self.token}'

    def get_display_in_email(self, i=0):
        link = self.get_edit_url()
        if i:
            return f'{i}. {link} (dodane {self.created.strftime("%Y-%m-%d %H:%M:%S")}'
        return link

    @property
    def full_address(self):
        return f"{self.address} {self.city_and_zip_code}"

    @property
    def is_actively_ready(self):
        return self.got_hot and self.got_hot > ago(hours=12)

    @property
    def hot_sort(self):
        points = [0]
        if self.is_dropped:
            points.append(14)
        if self.is_actively_ready:
            points.append(8)
        if self.cherry:
            points.append(3)
        if self.verified:
            points.append(2)
        return sum(points)

    @property
    def compact_display(self):
        return f"{self.name} {self.get_resource_display()}, {self.full_address}\n{self.extra}"

    def for_stats(self):
        return dict(
            created=self.created,
            status=self.status,
            people_count=self.people_to_accommodate,
            day=get_our_today_cutoff(self.created),
        )

    def for_edit(self):
        return dict(
            id=self.id,
            token=self.token,
            name=self.name,
            about_info=self.about_info,
            resource=self.resource,
            city_and_zip_code=self.city_and_zip_code,
            city=self.city_and_zip_code.replace(self.zip_code, ""),
            zip_code=self.zip_code,
            address=self.address,
            people_to_accommodate=self.people_to_accommodate,
            age=self.age,
            languages=self.languages,
            when_to_call=self.when_to_call,
            costs=self.costs,
            availability=self.availability,
            accommodation_length=extract_number_from_string(
                self.accommodation_length, default=0) or self.accommodation_length,
            details=self.details,
            transport=self.transport,
            living_with_pets=self.living_with_pets or "",
            can_take_person_with_pets=self.can_take_person_with_pets or "",
            phone_number=get_phone_number_display(self.phone_number),
            backup_phone_number=get_phone_number_display(self.backup_phone_number),
            email=self.email,
            extra=self.extra or "",
        )

    def sub_representation(self):
        return dict(
            name=self.name,
            address=self.full_address,
            phone_number=get_phone_number_display(self.phone_number),
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
            phone_number=get_phone_number_display(self.phone_number),
            backup_phone_number=get_phone_number_display(self.backup_phone_number),
            will_pick_up_now=self.will_pick_up_now,
            email=self.email,
            extra=self.extra,
            status=self.status,
            cherry=self.cherry,
            turtle=self.turtle,
            verified=self.verified,
            languages=self.languages,
            when_to_call=self.when_to_call,
            living_with_pets=self.living_with_pets,
            can_take_person_with_pets=self.can_take_person_with_pets,
            is_dropped=self.is_dropped,
            is_ready=self.is_actively_ready,
            is_hot=self.is_dropped or self.is_actively_ready,
            hot_sort=self.hot_sort,
            note=self.note,
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


END_OF_DAY = 5


def get_our_today_cutoff(date=None):
    now = date or timezone.now()
    base_time = now.astimezone(timezone.get_default_timezone())
    if base_time.hour > END_OF_DAY:
        cut_off = base_time.date()
    else:
        cut_off = (base_time - datetime.timedelta(days=1)).date()
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
        return self.filter(finished_at__gte=cut_off, status=SubStatus.SUCCESS).only("people")


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
    note = models.CharField(max_length=2048, default="", blank=True)
    status = models.CharField(choices=SubStatus.choices, default=Status.NEW, max_length=32)
    person_in_charge_old = models.CharField(max_length=512, default="", blank=True)
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                 related_name="received_subs", help_text="Przyjmujący zgłoszenie")
    coordinator = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                    related_name="coord_subs", help_text="Łącznik")
    matcher = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                related_name="matched_subs", help_text="Kto znalazł hosta")
    resource = models.ForeignKey(HousingResource, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                 help_text="Zasób (Host)")
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
        elif self.status == SubStatus.NEW:
            self.priority = 0
            if self.resource:
                self.clear_resource()
                self.resource = None
        elif self.status == SubStatus.SEARCHING:
            self.priority = 1
        elif self.status == SubStatus.IN_PROGRESS:
            self.priority = 2
            if getattr(self.resource, "will_pick_up_now", False):
                self.priority = 3
        elif self.status == SubStatus.CANCELLED:
            self.priority = -3
        elif self.status == SubStatus.SUCCESS:
            self.priority = -2
        if self.status == SubStatus.SUCCESS and not self.finished_at:
            self.finished_at = timezone.now()
        return super(Submission, self).save(*args, **kwargs)

    @property
    def people_as_int(self):
        return extract_number_from_string(self.people, default=1)

    @property
    def accomodation_in_the_future(self):
        if self.when:
            when = self.when.date() if isinstance(self.when, datetime.datetime) else self.when
            return when > get_our_today_cutoff()
        return False

    def clear_resource(self):
        self.resource.owner = None
        self.resource.availability = get_our_today_cutoff()
        self.resource.save()

    @cached_property
    def first_searched_date(self):
        try:
            return self.changes.filter(
                change__icontains="status': 'searching'"
            ).earliest("created").created.astimezone(
                timezone.get_default_timezone()
            )
        except ObjectChange.DoesNotExist:
            return None

    @cached_property
    def first_matched_date(self):
        try:
            return self.changes.filter(
                change__icontains="matched host"
            ).earliest("created").created.astimezone(
                timezone.get_default_timezone()
            )
        except ObjectChange.DoesNotExist:
            return None

    def for_stats(self):
        first_searched = self.first_searched_date
        first_match = self.first_matched_date
        return dict(
            id=self.id,
            created=self.created.astimezone(timezone.get_default_timezone()),
            created_hour=self.created.astimezone(timezone.get_default_timezone()).hour,
            status=self.status,
            finished_at=self.finished_at,
            finished_day=get_our_today_cutoff(self.finished_at) if self.finished_at else None,
            source=self.source,
            people_count=self.people_as_int,
            day=get_our_today_cutoff(self.created.astimezone(timezone.get_default_timezone())),
            first_searched=first_searched,
            first_searched_hour=first_searched.hour if first_searched else None,
            first_match=first_match,
            first_match_hour=first_match.hour if first_match else None
        )

    def handle_gone(self):
        self.status = SubStatus.CANCELLED
        if self.resource:
            self.resource.is_dropped = True
            note_append = f"Spad ze zgłoszenia {self.id}; host znaleziony przez: {self.resource.owner}"
            try:
                self.resource.note += f" \n{note_append}"
            except TypeError:
                self.resource.note = note_append
            self.clear_resource()
            self.resource = None
        try:
            self.note += f' \nDropped at {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}'
        except TypeError:
            self.note = f'Dropped at {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}'
        self.save()

    def as_prop(self):
        try:
            created = self.created.astimezone(timezone.get_default_timezone()).strftime("%-d %B %H:%M:%S")
        except ValueError:
            created = str(self.created.astimezone(timezone.get_default_timezone()))
        return dict(
            id=self.id,
            created=created,
            name=self.name,
            phone_number=get_phone_number_display(self.phone_number),
            people=self.people,
            people_count=str(self.people_as_int),
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
    submission = models.ForeignKey(Submission, on_delete=models.SET_NULL, null=True, related_name="changes")
    host = models.ForeignKey(HousingResource, on_delete=models.SET_NULL, null=True, related_name="changes")
    change = models.CharField(max_length=2048)

    def __str__(self):
        return f"{self.user}: {self.change}" \
               f" (sub={getattr(self.submission, 'id', None)})" \
               f" (host={getattr(self.host, 'id', None)})"

    class Meta:
        verbose_name = "Zmiana Rekordu"
        verbose_name_plural = "Zmiany Rekordów"


class SiteConfiguration(SingletonModel):
    submission_throttling = models.IntegerField(
        default=30, verbose_name=_("submission throttling"),
        help_text=_("Max number of open/searching submissions. Set to 0 to disable throttling.")
    )
    throttle_created_after = models.DateTimeField(
        default=timezone.now, verbose_name=_("submission throttling active since"),
        help_text=_("Only submissions created after this date will be "
                    "counted in calculating throttling limit"))

    def __str__(self):
        return "Site Configuration"

    class Meta:
        verbose_name = _("Site Configuration")
