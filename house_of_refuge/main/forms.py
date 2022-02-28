from django.forms import ModelForm

from .models import HousingResource

# Create the form class.


class HousingResourceForm(ModelForm):
    class Meta:
        model = HousingResource
        fields = "__all__"
        labels = {
            "name": "Imię i nazwisko",
            "about_info": "Powiedz coś o sobie",
            "resource": "Zasób",
            "address": "Adres",
            "city_and_zip_code": "Miasto i kod pocztowy",
            "people_to_accommodate": "Ile osób jesteś w stanie wesprzeć tak, by miały godne warunki pobytu?",
            "costs": "Koszty pobytu",
            "availability": "Od kiedy udostępniasz nocleg?",
            "accommodation_length": "Na jak długo udostępniasz nocleg?",
            "details": "Garść informacji o miejscu",
            "transport": "Czy jesteś w stanie przyjechać po osoby, którym udzielisz schronienia na dworzec/w podane miejsce pobytu?",
            "phone_number": "Twój numer telefonu ",
            "backup_phone_number": "Awaryjny numer telefonu (dodatkowa osoba kontaktowa)",
            "email": "Twój mail",
            "extra": "Dodatkowe uwagi",
        }
        help_texts = {
            "about_info": "ile masz lat? Z kim mieszkasz (jeśli przyjmujesz kogoś u siebie)?",
            "address": "ulica, numer budynku, numer mieszkania",
            "costs": "czynsz, opłaty, koszty najmu lub darmowy pobyt",
            "details": "obecność zwierząt, języki obce lokatorów i lokatorek, dostępna pościel i ręczniki, inne",
        }
