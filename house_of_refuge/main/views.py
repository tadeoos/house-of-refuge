from collections import defaultdict

from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .forms import HousingResourceForm
# Create your views here.
from .models import HousingResource, Status, Submission, SubStatus, Coordinator
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
    resources = [
        r.as_prop()
        for r in HousingResource.objects.for_remote(request.user)
    ]
    subs = [
        s.as_prop()
        for s in Submission.objects.all()
    ]
    coords = defaultdict(list)
    for c in Coordinator.objects.all():
        coords[c.group].append(c.as_json())

    people_helped = sum([
        sub.people_as_int
        for sub in Submission.objects.for_happy_message()
    ])

    return render(
        request, "main/housing_list.html", {"props": dict(
            initialResources=resources, subs=subs, userData=request.user.as_json(),
            coordinators=coords, helped=people_helped,
        ), "show_nav": False}
    )


@ensure_csrf_cookie
def home(request):
    user = None
    if not request.user.is_anonymous:
        user = request.user
        user = dict(id=user.id, name=user.username)
    return render(request, "main/home.html", {"props": dict(userData=user)})


@require_http_methods(["GET"])
@login_required
def get_resources(request):
    resources = [
        r.as_prop()
        for r in HousingResource.objects.for_remote(request.user)
    ]
    return JsonResponse({"data": resources})


@require_http_methods(["POST"])
@login_required
def resource_match_found(request):
    data = json.loads(request.body)
    print(f"Data: {data}")
    resource_id = data["resource"]
    sub_id = data["sub"]
    resource = HousingResource.objects.select_for_update().get(id=resource_id)
    resource.owner = request.user
    resource.will_pick_up_now = data["transport"]
    resource.is_dropped = False
    resource.save()
    sub = Submission.objects.get(id=sub_id)
    if sub.resource is not None and sub.resource == resource:
        # error
        return JsonResponse({
            "status": "error",
            "message": f"This submission already have a diiferent resource",
            "object": sub.as_prop(),
        }, status=400)
    assert sub.matcher == request.user
    sub.resource = resource
    sub.status = SubStatus.IN_PROGRESS
    sub.save()
    return JsonResponse({
        "status": "success",
        "message": "Poszło!",
        "object": sub.as_prop()}
    )


@require_http_methods(["POST"])
@login_required
def update_resource_status(request, resource_id, **kwargs):
    user = request.user
    data = json.loads(request.body)
    resource = HousingResource.objects.select_for_update().get(id=resource_id)
    new_status = data['value']
    resource.status = new_status
    resource.save()
    return JsonResponse({
        "status": "success",
        "message": "Updated!",
        "object": resource.as_prop()}
    )


@require_http_methods(["POST"])
@login_required
def update_resource_note(request, resource_id, **kwargs):
    data = json.loads(request.body)
    resource = HousingResource.objects.select_for_update().get(id=resource_id)
    resource.note = data['note']
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
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_resource(request):
    # TODO: add some validation
    serializer = HousingResourceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@require_http_methods(["POST"])
def update_sub(request, sub_id):
    data = json.loads(request.body)
    sub = Submission.objects.get(id=sub_id)
    for field, value in data['fields'].items():
        if field == "status" and value == SubStatus.GONE:
            # zniknął!
            sub.handle_gone()
        else:
            setattr(sub, field, value)
            sub.save()
    return JsonResponse({"data": sub.as_prop(), "message": "Updated", "status": "success",})


@api_view(['POST'])
def update_resource(request, resource_id):
    resource = HousingResource.objects.get(id=resource_id)
    serializer = HousingResourceSerializer(instance=resource, data=request.data['fields'], partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@require_http_methods(["POST"])
def set_sub_matcher(request):
    data = json.loads(request.body)
    sub = Submission.objects.get(id=data['sub_id'])
    sub.matcher_id = data["matcher"]
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
        for s in Submission.objects.filter(when__lte=timezone.now().date())
    ]
    dropped = [hr.as_prop() for hr in HousingResource.objects.filter(is_dropped=True)]
    return JsonResponse({"data": dict(submissions=subs, dropped=dropped)})


def healthcheck(request):
    HousingResource.objects.first()
    return HttpResponse("", status=204)
