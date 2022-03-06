import json
from collections import defaultdict
from datetime import timedelta

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import Count
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .forms import HousingResourceForm
# Create your views here.
from .models import HousingResource, Submission, SubStatus, Coordinator, ObjectChange, Status, User, END_OF_DAY
from .serializers import SubmissionSerializer, HousingResourceSerializer


def resource_gathering(request):
    if request.method == "POST":
        form = HousingResourceForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            # do something.
    else:
        form = HousingResourceForm()
    return render(request, "main/gather_form.html", {"form": form})


@login_required
def housing_list(request):
    # resources = [
    #     r.as_prop()
    #     for r in HousingResource.objects.for_remote(request.user)
    # ]
    # subs = [
    #     s.as_prop()
    #     for s in Submission.objects.all()
    # ]
    coords = defaultdict(list)
    for c in Coordinator.objects.all():
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
        ), "show_nav": False}
    )


@ensure_csrf_cookie
def home(request):
    user = None
    if not request.user.is_anonymous:
        user = request.user
        user = dict(id=user.id, name=str(user))
    return render(request, "main/home.html", {"props": dict(userData=user)})


@require_http_methods(["GET"])
@login_required
def get_resources(request):
    resources = [
        r.as_prop()
        for r in HousingResource.objects.select_related("owner").filter(
            status=Status.NEW)
    ]
    return JsonResponse({"data": resources})


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
        change="matched host with submission"
    )

    return JsonResponse({
        "status": "success",
        "message": "Poszło!",
        "object": sub.as_prop()}
    )


@require_http_methods(["POST"])
@login_required
@transaction.atomic
def update_resource_status(request, resource_id, **kwargs):
    user = request.user
    data = json.loads(request.body)
    resource = HousingResource.objects.select_for_update().get(id=resource_id)
    new_status = data['value']
    resource.status = new_status
    resource.save()
    ObjectChange.objects.create(
        user=request.user, host=resource,
        change=f"status update: {data}"
    )
    return JsonResponse({
        "status": "success",
        "message": "Updated!",
        "object": resource.as_prop()}
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


@api_view(['POST'])
def create_submission(request):
    # TODO: add some validation
    serializer = SubmissionSerializer(data=request.data)
    print(f"Got sub data: {request.data}")
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_resource(request):
    # TODO: add some validation
    serializer = HousingResourceSerializer(data=request.data)
    print(f"Got resource data: {request.data}")
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@require_http_methods(["POST"])
@transaction.atomic
def update_sub(request, sub_id):
    data = json.loads(request.body)
    sub = Submission.objects.get(id=sub_id)
    for field, value in data['fields'].items():
        if value and "matcher" in field and sub.matcher and sub.matcher != request.user:
            return JsonResponse(
                {"data": None,
                 "message": "ktoś już szuka tego zgłoszenia",
                 "status": "error"}, status=400)
        if field == "status" and value == SubStatus.GONE:
            # zniknął!
            sub.handle_gone()
        else:
            setattr(sub, field, value)
            sub.save()
    ObjectChange.objects.create(
        user=request.user, submission=sub,
        change=f"update: {data}"
    )
    return JsonResponse({"data": sub.as_prop(), "message": "Updated", "status": "success",})


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


@require_http_methods(["POST"])
@transaction.atomic
def set_sub_matcher(request):
    data = json.loads(request.body)
    sub = Submission.objects.get(id=data['sub_id'])
    sub.matcher_id = data["matcher"]
    ObjectChange.objects.create(
        user=request.user, submission=sub,
        change="set as matcher"
    )
    sub.save()
    return JsonResponse({"data": sub.as_prop()})


@require_http_methods(["POST"])
def sub_is_processed(request, sub_id):
    sub = Submission.objects.get(id=sub_id)
    sub.matcher_id = request.user
    sub.save()
    return JsonResponse({"data": sub.as_prop()})


@require_http_methods(["GET"])
@login_required
def latest_submission(request):
    return JsonResponse({"id": int(Submission.objects.all().latest("modified").modified.timestamp() * 1000)})


@require_http_methods(["GET"])
@login_required
def latest_resource(request):
    return JsonResponse({"id": int(HousingResource.objects.all().latest("modified").modified.timestamp() * 1000)})


@require_http_methods(["GET"])
@login_required
def get_submissions(request):
    subs = [
        s.as_prop()
        for s in Submission.objects.select_related("matcher", "receiver", "coordinator", "resource").all()
    ]
    dropped = [hr.as_prop() for hr in HousingResource.objects.filter(is_dropped=True)]
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
    labels = []
    subs_data = []
    success_data = []
    people_data = []

    base_start = Submission.objects.earliest("created").created
    for start, end in day_iterator(base_start):
        subs_created = Submission.objects.filter(created__range=(start, end))
        successful = Submission.objects.filter(finished_at__range=(start, end), status="success")
        labels.append(str(start.date()))
        subs_data.append(subs_created.count())
        success_data.append(successful.count())
        people_data.append(sum(s.people_as_int for s in successful))

    all_subs = Submission.objects.all().count()
    all_hosts = HousingResource.objects.all().count()
    all_success = Submission.objects.filter(status=SubStatus.SUCCESS).count()
    all_cancelled = Submission.objects.filter(status=SubStatus.CANCELLED).count()

    TOP = 10

    top_matchers = User.objects.all().annotate(mc=Count('matched_subs')).order_by('-mc')[:TOP]
    top_receivers = User.objects.all().annotate(mc=Count('received_subs')).order_by('-mc')[:TOP]
    top_coords = User.objects.all().annotate(mc=Count('coord_subs')).order_by('-mc')[:TOP]

    context = {

        "labels": labels,
        "chart_data": subs_data,
        "success_data": success_data,
        "people_data": people_data,
        "all_subs": all_subs,
        "all_hosts": all_hosts,
        "top_matchers": top_matchers,
        "top_receivers": top_receivers,
        "top_coords": top_coords,
        "all_success": all_success,
        "all_cancelled": all_cancelled,
    }
    return render(request, "users/stats.html", context=context)
