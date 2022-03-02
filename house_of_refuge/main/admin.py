import re

from django.contrib import admin
from django.utils import timezone
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from import_export.fields import Field
from import_export.widgets import DateTimeWidget, DateWidget, Widget

from .models import HousingResource, HousingType, TransportRange, Submission

VALUE_MAP = {
    "Tak, na terenie Warszawy": TransportRange.WARSAW,
    "Tak, na terenie Warszawy i Polski": TransportRange.POLAND,
    "Nie": TransportRange.NONE,
    "Pokój (lub kilka pokoi) w swoim mieszkaniu/domu": HousingType.ROOM,
    "Łóżko lub rozkładana kanapa w swoim mieszkaniu/domu": HousingType.COUCH,
    "Mieszkanie": HousingType.FLAT,
    "Dom": HousingType.HOME,
}


class ChoiceWidget(Widget):
    def clean(self, value, row=None, *args, **kwargs):
        return VALUE_MAP.get(value.strip(), "UNKNOWN")


class PeopleWidget(Widget):
    def clean(self, value, row=None, *args, **kwargs):
        return max([int(i) for i in re.findall(r"\d+", value)] or [0])


class ExtractZipCodeWidget(Widget):
    def clean(self, value, row=None, *args, **kwargs):
        try:
            return "".join(re.match(r".*?(\d+)[^\d]*?(\d+)", value).groups())
        except AttributeError:
            if "warszawa" in value.lower():
                return "05999"
            else:
                return "99999"


class CustomDateWidget(DateWidget):
    def clean(self, value, row=None, *args, **kwargs):
        return super().clean(value=value.strip(), row=row, *args, **kwargs)


class CustomDateTimeWidget(DateTimeWidget):
    def clean(self, value, row=None, *args, **kwargs):
        if not value.strip():
            return timezone.now()
        return super().clean(value=value.strip(), row=row, *args, **kwargs)


# Register your models here.
class HousingRow(resources.ModelResource):
    name = Field(attribute="name", column_name="Imię i nazwisko")
    about_info = Field(
        attribute="about_info",
        column_name="Powiedz coś o sobie - ile masz lat? Z kim mieszkasz (jeśli przyjmujesz kogoś u siebie)?",
    )
    resource = Field(attribute="resource", column_name="Zasób", widget=ChoiceWidget())
    city_and_zip_code = Field(
        attribute="city_and_zip_code", column_name="Miasto i kod pocztowy"
    )
    zip_code = Field(
        attribute="zip_code",
        column_name="Miasto i kod pocztowy",
        widget=ExtractZipCodeWidget(),
    )
    address = Field(
        attribute="address",
        column_name="Adres (ulica, numer budynku, numer mieszkania)",
    )
    people_to_accommodate_raw = Field(
        attribute="people_to_accommodate_raw",
        column_name="Ile osób jesteś w stanie wesprzeć tak, by miały godne warunki pobytu? ",
    )
    people_to_accommodate = Field(
        attribute="people_to_accommodate",
        column_name="Ile osób jesteś w stanie wesprzeć tak, by miały godne warunki pobytu? ",
        widget=PeopleWidget(),
    )
    costs = Field(
        attribute="costs",
        column_name="Koszty pobytu (czynsz, opłaty, koszty najmu lub darmowy pobyt)",
    )
    availability = Field(
        attribute="availability",
        column_name="Od kiedy udostępniasz nocleg?",
        widget=CustomDateWidget(format="%m/%d/%Y"),
    )
    accommodation_length = Field(
        attribute="accommodation_length",
        column_name="Na jak długo udostępniasz nocleg?",
    )
    details = Field(
        attribute="details",
        column_name="Garść informacji o miejscu (obecność zwierząt, języki obce lokatorów i lokatorek, dostępna pościel i ręczniki, inne)",
    )
    transport = Field(
        attribute="transport",
        column_name="Czy jesteś w stanie przyjechać po osoby, którym udzielisz schronienia na dworzec/w podane miejsce pobytu?",
        widget=ChoiceWidget(),
    )
    phone_number = Field(attribute="phone_number", column_name="Twój numer telefonu")
    backup_phone_number = Field(
        attribute="backup_phone_number",
        column_name="Awaryjny numer telefonu (dodatkowa osoba kontaktowa)",
    )
    email = Field(attribute="email", column_name="Twój mail")
    extra = Field(attribute="extra", column_name="Dodatkowe uwagi")
    created = Field(
        attribute="created",
        column_name="Timestamp",
        widget=CustomDateTimeWidget(format="%m/%d/%Y %H:%M:%S"),
    )

    def skip_row(self, instance, original):
        if all([
            instance.email == original.email,
            instance.people_to_accommodate_raw == original.people_to_accommodate_raw,
            instance.extra == original.extra,
            instance.availability == original.availability,
        ]):
            return True
        return super().skip_row(instance, original)

    class Meta:
        model = HousingResource
        skip_unchanged = True
        report_skipped = False
        import_id_fields = ["created"]


@admin.register(HousingResource)
class HousingResourceAdmin(ImportExportModelAdmin):
    resource_class = HousingRow
    search_fields = ("about_info", "city_and_zip_code", "email", "details", "extra")
    list_display = ("name", "email", "resource", "availability", "accommodation_length", "status")
    list_filter = ("status", "availability", "people_to_accommodate")


@admin.register(Submission)
class SubmissionAdmin(ImportExportModelAdmin):
    # resource_class = HousingRow
    search_fields = ("name", "source", "languages", "status", "receiver", "coordinator")
    list_display = ("name", "people", "how_long", "status", "receiver", "coordinator")
    list_filter = ("status", "source")
