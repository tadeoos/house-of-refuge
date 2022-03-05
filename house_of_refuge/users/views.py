from datetime import timedelta

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.views.generic import DetailView, RedirectView, UpdateView

from house_of_refuge.main.models import Submission, HousingResource, END_OF_DAY

User = get_user_model()


class UserDetailView(LoginRequiredMixin, DetailView):

    model = User
    slug_field = "username"
    slug_url_kwarg = "username"


user_detail_view = UserDetailView.as_view()


class UserUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):

    model = User
    fields = ["name"]
    success_message = _("Information successfully updated")

    def get_success_url(self):
        assert (
            self.request.user.is_authenticated
        )  # for mypy to know that the user is authenticated
        return self.request.user.get_absolute_url()

    def get_object(self):
        return self.request.user


user_update_view = UserUpdateView.as_view()


class UserRedirectView(LoginRequiredMixin, RedirectView):

    permanent = False

    def get_redirect_url(self):
        return reverse("users:detail", kwargs={"username": self.request.user.username})


user_redirect_view = UserRedirectView.as_view()


def day_iterator(start_date):
    now = timezone.now()
    start_date = start_date.replace(hour=END_OF_DAY, minute=0, second=0, microsecond=0)
    if start_date.hour < END_OF_DAY:
        start_date -= timedelta(days=1)

    end_date = start_date + timedelta(days=1)

    yield start_date, end_date
    while end_date < now:
        start_week = end_date
        end_date += timedelta(days=1)
        yield start_week, end_date


@staff_member_required
def activity_stats_view(request):

    all_subs = Submission.objects.all().count()
    all_hosts = HousingResource.objects.all().count()

    users = User.objects.all().annotate(bank_count=Count('textbank', distinct=True))

    events_last_24h = {
        e['user']: e['count']
        for e in UserEvent.objects.triggered_by_user().filter(user__onboarded=True, created__gt=ago(days=1)).values(
            'user').annotate(count=Count('user'))
    }
    events_last_week = {
        e['user']: e['count']
        for e in UserEvent.objects.triggered_by_user().filter(user__onboarded=True, created__gt=ago(days=7)).values(
            'user').annotate(count=Count('user'))
    }
    events_last_month = {
        e['user']: e['count']
        for e in UserEvent.objects.triggered_by_user().filter(user__onboarded=True, created__gt=ago(days=30)).values(
            'user').annotate(count=Count('user'))
    }
    events_total = {
        e['user']: e['count']
        for e in
        UserEvent.objects.triggered_by_user().filter(user__onboarded=True).values('user').annotate(count=Count('user'))
    }

    # events by time and type
    events_time_data = defaultdict(lambda: dict((i, 0) for i in range(24)))
    for event in UserEvent.objects.triggered_by_user().iterator():
        events_time_data[event.event][event.created.hour] += 1

    events_times_chart = dict(labels=list(str(i) for i in range(24)))

    events_times_chart['datasets'] = [
        {
            "label": k,
            "data": list(v.values()),
            "backgroundColor": [
                random_hex_color()
            ],
            # "borderWidth": 1
        } for k, v in events_time_data.items()
    ]

    total = len(users)
    active_last_24 = len([i for i in events_last_24h.values() if i])
    active_last_week = len([i for i in events_last_week.values() if i])
    active_last_month = len([i for i in events_last_month.values() if i])

    labels = []
    chart_data = []
    users_data = []

    start = Submission.objects.earliest("created").created
    for start, end in day_iterator(start):
        subs_created = Submission.objects.filter(created__range=(start, end))
        successful = subs_created.filter(status="success")
        events_this_week = {
            e['user']: e['count']
            for e in UserEvent.objects.triggered_by_user().filter(
                created__range=(start, end)
            ).values('user').annotate(count=Count('user'))
            if e['count'] > 1
        }
        users_up_to_this_week = User.objects.filter(date_joined__lte=end).count()
        labels.append(str(end.date()))
        chart_data.append(len(events_this_week.values()))
        users_data.append(users_up_to_this_week)

    confs = UserEvent.objects.filter(
        event=UserEvents.SHARED_BANK_VISITED, data__type='gapgen'
    ).values_list("data__config", flat=True)
    c = Counter([tuple(sorted(d.items())) for d in confs])
    top_10 = []
    for conf, count in c.most_common(10):
        as_d = dict(conf)
        as_d["disable_input"] = not as_d["enable_input"]
        display = ' + '.join(o for o, used in as_d.items() if used)
        top_10.append((display, count))

    onboarded = User.objects.filter(onboarded=True).count()

    pdf_exports = UserEvent.objects.filter(event=UserEvents.EXPORTED_BANK_PDF).count()
    csv_exports = UserEvent.objects.filter(event=UserEvents.EXPORTED_BANK_CSV).count()
    table_exports = UserEvent.objects.filter(event=UserEvents.BANK_TABLE_VIEW).count()
    share_visited = UserEvent.objects.filter(event=UserEvents.SHARED_BANK_VISITED).count()

    context = {
        "onboarded": f"{onboarded} ({onboarded / total * 100:.0f}%)",
        "data": sorted([{
            'user': p,
            "events_last_24h": events_last_24h.get(p.id, 0),
            "events_last_week": events_last_week.get(p.id, 0),
            "events_total": events_total.get(p.id, 0),
            "banks": p.bank_count,
        } for p in users if p.onboarded], key=lambda k: -k['events_last_24h']),
        "active_24": f"{active_last_24} ({active_last_24 / onboarded * 100:.0f}%)",
        "active_week": f"{active_last_week} ({active_last_week / onboarded * 100:.0f}%)",
        "active_month": f"{active_last_month} ({active_last_month / onboarded * 100:.0f}%)",
        "labels": labels,
        "chart_data": chart_data,
        "users_data": users_data,
        "top_configs": top_10,
        "pdf_exports": pdf_exports,
        "csv_exports": csv_exports,
        "table_exports": table_exports,
        "share_visited": share_visited,
        "events_times_chart": events_times_chart,
    }
    return render(request, "users/stats.html", context=context)
