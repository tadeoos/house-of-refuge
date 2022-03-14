import datetime
import json
import random
from collections import defaultdict, Counter
from datetime import timedelta

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Count
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.template.loader import get_template
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

# Create your views here.
from .models import HousingResource, Submission, SubStatus, Coordinator, ObjectChange, User, END_OF_DAY, SubSource
from .serializers import SubmissionSerializer, HousingResourceSerializer


@login_required
def housing_list(request):
    coords = defaultdict(list)
    for c in Coordinator.objects.all().order_by("id"):
        coords[c.group].append(c.as_json())

    people_helped = sum([
        sub.people_as_int
        for sub in Submission.objects.for_happy_message()
    ])

    return render(
        request, "main/housing_list.html", {"props": dict(
            initialResources=[],
            subs=[],
            userData=request.user.as_json(),
            coordinators=coords, helped=people_helped,
        ), "no_nav": True}
    )


@ensure_csrf_cookie
def home(request):
    user = None
    if not request.user.is_anonymous:
        user = request.user
        user = dict(id=user.id, name=str(user))
    return render(request, "main/home.html", {"props": dict(userData=user), "no_nav": True})


def edit(request):
    return render(request, "main/home.html", {"no_nav": True})


@require_http_methods(["POST"])
@ensure_csrf_cookie
def form_data(request):
    data = json.loads(request.body)
    token = data['token']
    print(token)
    form_data = None
    if token:
        host = get_object_or_404(HousingResource, token=token)
        form_data = host.for_edit()
    return JsonResponse({
        "formData": form_data}
    )


@require_http_methods(["POST"])
@login_required
@transaction.atomic
def resource_match_found(request):
    data = json.loads(request.body)
    print(f"Host znaleziony: {data}")
    resource_id = data["resource"]
    sub_id = data["sub"]
    resource = HousingResource.objects.select_for_update().get(id=resource_id)
    resource.owner = request.user
    resource.will_pick_up_now = data["transport"]
    resource.availability = data["newDate"]
    resource.is_dropped = False
    resource.is_ready = False
    resource.status = "new"
    resource.save()
    sub = Submission.objects.get(id=sub_id)
    if sub.resource is not None and sub.resource == resource:
        # error
        return JsonResponse({
            "status": "error",
            "message": "This submission already have a diiferent resource",
            "object": sub.as_prop(),
        }, status=400)
    if sub.matcher != request.user:
        return JsonResponse({
            "status": "error",
            "message": f"This submission is already processed by {sub.matcher}!",
            "object": sub.as_prop(),
        }, status=400)
    sub.resource = resource
    sub.status = SubStatus.IN_PROGRESS
    sub.save()

    ObjectChange.objects.create(
        user=request.user, submission=sub, host=resource,
        change=f"matched host with submission ({data})"
    )

    return JsonResponse({
        "status": "success",
        "message": "Poszło!",
        "object": sub.as_prop()}
    )


@require_http_methods(["POST"])
@login_required
@transaction.atomic
def update_resource_note(request, resource_id, **kwargs):
    data = json.loads(request.body)
    resource = HousingResource.objects.select_for_update().get(id=resource_id)
    resource.note = data['note']
    ObjectChange.objects.create(
        user=request.user, host=resource,
        change=f"note update: {data}"
    )
    resource.save()
    return JsonResponse({
        "status": "success",
        "message": "Note updated!",
        "object": resource.as_prop()}
    )


# @csrf_exempt
@api_view(['POST'])
def send_email_with_edit_token(request):
    email = request.data["email"]
    replies = HousingResource.objects.filter(email=email).order_by('id')
    if replies:
        subject = "Link do edycji zgłoszenia"
        email_text_content = get_template("emails/host_edit.txt").render(
            dict(replies=replies, multiple=len(replies) > 1)
        )
        # html_content = get_template("emails/ping_email.html").render({"user": user})
        from_email = "Grupa Zasoby <grupazasoby@gmail.com>"
        send_mail(subject, email_text_content, from_email, [email])
    return Response({}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def create_submission(request):
    serializer = SubmissionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'PUT', "DELETE"])
def create_resource(request):
    if request.method == "POST":
        serializer = HousingResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        obj = get_object_or_404(HousingResource, token=request.data['token'])
    except KeyError:
        return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PUT":
        serializer = HousingResourceSerializer(instance=obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        obj.delete()
        return Response({}, status=status.HTTP_204_NO_CONTENT)


@require_http_methods(["POST"])
@transaction.atomic
def update_sub(request, sub_id):
    data = json.loads(request.body)
    sub = Submission.objects.select_for_update().get(id=sub_id)
    for field, value in data['fields'].items():
        if "matcher" in field and sub.matcher and sub.matcher != request.user:
            if value:
                # someone wants to start working on already taken sub
                return JsonResponse(
                    {"data": None,
                     "message": "ktoś już szuka tego zgłoszenia",
                     "status": "error"}, status=400)
            else:
                is_coordinator = Coordinator.objects.filter(user=request.user).exists()
                # someone wants to free up a taken sub, only coordinator can do that!
                if not is_coordinator:
                    return JsonResponse(
                        {"data": None,
                         "message": "To zgłoszenie jest procesowane przez kogoś innego",
                         "status": "error"}, status=400)
                elif sub.resource:
                    #  we never want to free up sub with host
                    return JsonResponse(
                        {"data": None,
                         "message": "to zgłoszenie ma już hosta",
                         "status": "error"}, status=400)
                else:
                    setattr(sub, field, value)

        elif field == "status" and value in [SubStatus.GONE, SubStatus.CANCELLED]:
            sub.handle_gone()
        elif field == "when":
            date_value = datetime.datetime.strptime(value, "%Y-%m-%d")
            sub.when = date_value
        else:
            setattr(sub, field, value)
    sub.save()
    ObjectChange.objects.create(
        user=request.user, submission=sub,
        change=f"update: {data}"
    )
    return JsonResponse({"data": sub.as_prop(), "message": "Updated", "status": "success", })


@api_view(['POST'])
@transaction.atomic
def update_resource(request, resource_id):
    resource = HousingResource.objects.get(id=resource_id)
    serializer = HousingResourceSerializer(instance=resource, data=request.data['fields'], partial=True)
    if serializer.is_valid():
        serializer.save()
        ObjectChange.objects.create(
            user=request.user, host=resource,
            change=f"update: {request.data['fields']}"
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@require_http_methods(["GET"])
@login_required
def latest_submission(request):
    return JsonResponse({"id": str(Submission.objects.all().latest("modified").modified.timestamp())})


@require_http_methods(["GET"])
@login_required
def latest_resource(request):
    return JsonResponse({"id": str(HousingResource.objects.all().latest("modified").modified.timestamp())})


@require_http_methods(["GET"])
@login_required
def get_resources(request):
    since = request.GET.get("since", "0")
    try:
        updated_after = datetime.datetime.fromtimestamp(float(since)).astimezone(timezone.utc)
    except OSError:
        updated_after = datetime.datetime(year=2010, month=1, day=1)
    resources = [
        r.as_prop()
        for r in HousingResource.objects.select_related(
            "owner"
        ).filter(
            modified__gt=updated_after
        )
    ]
    return JsonResponse({"data": resources})


@require_http_methods(["GET"])
@login_required
def get_submissions(request):
    since = request.GET.get("since", "0")
    try:
        updated_after = datetime.datetime.fromtimestamp(float(since)).astimezone(timezone.utc)
    except OSError:
        updated_after = datetime.datetime(year=2010, month=1, day=1)
    subs = [
        s.as_prop()
        for s in Submission.objects.select_related(
            "matcher", "receiver", "coordinator", "resource__owner"
        ).filter(modified__gt=updated_after)
    ]
    dropped = [hr.as_prop() for hr in HousingResource.objects.select_related("owner").filter(is_dropped=True)]
    return JsonResponse({"data": dict(submissions=subs, dropped=dropped)})


def healthcheck(request):
    HousingResource.objects.first()
    return HttpResponse("", status=204)


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
    source = request.GET.get("source", None)
    labels = []
    subs_data = []
    success_data = []
    hosts_data = []

    subs_people_data = []
    success_people_data = []
    hosts_people_data = []

    base_start = Submission.objects.earliest("created").created
    for start, end in day_iterator(base_start):
        labels.append(str(start.date()))
        hosts_added = HousingResource.objects.exclude_excels().filter(created__range=(start, end))

        subs_created = Submission.objects.filter(created__range=(start, end))
        successful = Submission.objects.filter(finished_at__range=(start, end), status="success")

        if source:
            subs_created = subs_created.filter(source=source)
            successful = successful.filter(source=source)

        subs_data.append(subs_created.count())
        success_data.append(successful.count())
        hosts_data.append(hosts_added.count())

        subs_people_data.append(sum(s.people_as_int for s in subs_created))
        success_people_data.append(sum(s.people_as_int for s in successful))
        hosts_people_data.append(sum(h.people_to_accommodate for h in hosts_added))

    all_hosts = HousingResource.objects.all().count()
    all_subs = Submission.objects.all().count()
    all_success = Submission.objects.filter(status=SubStatus.SUCCESS).count()
    all_cancelled = Submission.objects.filter(status=SubStatus.CANCELLED).count()

    terrain_subs = Submission.objects.filter(source=SubSource.TERRAIN).count()
    terrain_success = Submission.objects.filter(source=SubSource.TERRAIN, status=SubStatus.SUCCESS).count()
    terrain_cancelled = Submission.objects.filter(source=SubSource.TERRAIN, status=SubStatus.CANCELLED).count()

    TOP = 10

    # top_matchers = User.objects.all().annotate(mc=Count('matched_subs')).order_by('-mc')[:TOP]
    # top_receivers = User.objects.all().annotate(mc=Count('received_subs')).order_by('-mc')[:TOP]
    # top_coords = User.objects.all().annotate(mc=Count('coord_subs')).order_by('-mc')[:TOP]

    matches = ObjectChange.objects.filter(change__icontains="matched host")
    if source:
        matches = matches.filter(submission__source=source)

    c = Counter(m.hour for m in matches.values_list("created", flat=True))
    hour_labels = []
    matches_count = []
    for hour, count in sorted(c.items()):
        hour_labels.append(f"{hour}")
        matches_count.append(count)

    context = dict(
        labels=labels,
        source=source,
        chart_data=subs_data,
        success_data=success_data,
        subs_people_data=subs_people_data,
        success_people_data=success_people_data,
        hosts_people_data=hosts_people_data,
        all_subs=all_subs,
        all_hosts=all_hosts,
        hosts_data=hosts_data,
        # top_matchers=top_matchers,
        # top_receivers=top_receivers,
        # top_coords=top_coords,
        hour_labels=hour_labels,
        matches_count=matches_count,
        all_success=all_success,
        all_cancelled=all_cancelled,
        terrain_subs=terrain_subs,
        terrain_success=terrain_success,
        terrain_cancelled=terrain_cancelled,
        terrain_ratio=f"{terrain_subs / all_subs:.0%}",
        terrain_success_ratio=f"{terrain_success / terrain_subs:.0%}",
        terrain_cancelled_ratio=f"{terrain_cancelled / terrain_subs:.0%}",
        all_success_ratio=f"{all_success / all_subs:.0%}",
        all_cancelled_ratio=f"{all_cancelled / all_subs:.0%}",
    )
    return render(request, "users/stats.html", context=context)


@require_http_methods(["GET"])
@login_required
def get_helped_count(request):
    people_helped = sum([
        sub.people_as_int
        for sub in Submission.objects.for_happy_message()
    ])
    return JsonResponse({"count": people_helped})
