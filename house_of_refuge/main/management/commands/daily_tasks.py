from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from house_of_refuge.main.models import HousingResource, Status

User = get_user_model()


class Command(BaseCommand):
    help = 'Run daily tasks: deactivate regular users and delete ignored hosts'

    # def add_arguments(self, parser):
        # parser.add_argument('--hosts', default=100, type=int)
        # parser.add_argument('--submissions', default=20, type=int)
        # parser.add_argument('--locale', default="pl_PL", type=str)

    def handle(self, *args, **options):

        # first deactivate non-stuff users
        User.objects.filter(is_staff=False, is_superuser=False).update(is_active=False)

        # delete ignored hosts
        HousingResource.objects.filter(status=Status.SHOULD_DELETE).delete()
