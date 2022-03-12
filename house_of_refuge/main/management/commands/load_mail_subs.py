import csv
import datetime
import re

from django.core.management import BaseCommand
from django.db import transaction

from house_of_refuge.main.models import Submission


class Command(BaseCommand):
    def add_arguments(self, parser):
        # Positional arguments
        # parser.add_argument('poll_ids', nargs='+', type=int)

        # Named (optional) arguments
        parser.add_argument(
            '--path',
            default="local/zgloszenia-mail.csv",
            help='Delete poll instead of closing it',
        )

    def get_people(self, value):
        return value
        # return max([int(i) for i in re.findall(r"\d+", value)] or [0])

    def process_transport(self, value):
        return "tak" in value.lower()

    def process_date(self, value):
        if m := re.match(r'.+?(\d{1,2})[\.\-](0\d)', value):
            day = m.group(1)
            month = m.group(2)
            return datetime.date(year=2022, day=int(day), month=int(month))
        return None

    def get_note(self, data):
        return f"""
        {data["dodatkowe informacje o potrzebujących"]}
        ---
        {data["kiedy w PL"]}
        """

    def process_line(self, data):
        return dict(
            name=data["Imię i nazwisko"],
            phone_number=data["Telefon bezpośredni do potrzebującego"],
            people=self.get_people(data["ile osób"]),
            how_long=data["na jak długo"],
            contact_person=data["zgłoszenie bezpośrednie czy przez kogoś (kontakt do łącznika)"],
            extra=data["kto tam jest (jaki skład)"],
            languages="",
            source="mail",
            when=self.process_date(data["kiedy w PL"]),
            transport_needed=self.process_transport(data["czy mamy ogarniac dla nich transport"]),
            resource=None,
            owner=None,
            note=self.get_note(data),
            status=self.get_status(data['status']),
            person_in_charge_old=data["kto ogarnia w bazie"]
        )

    @transaction.atomic
    def handle(self, *args, **options):
        with open(options["path"], mode='r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            line_count = 0
            for row in csv_reader:
                try:
                    data = self.process_line(row)
                    Submission.objects.get_or_create(**data)
                except Exception as e:
                    print(f"error: {e}: {data}")
                    raise e
                line_count += 1
        print(f'Processed {line_count} lines.')

    def get_status(self, param):
        # todo
        return "new"
