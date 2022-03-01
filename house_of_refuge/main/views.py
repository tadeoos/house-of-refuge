from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
import json
from django.views.decorators.csrf import ensure_csrf_cookie

from .forms import HousingResourceForm
# Create your views here.
from .models import HousingResource, Status, Submission


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
        for r in HousingResource.objects.filter(status__in=[Status.NEW, Status.VERIFIED])
    ]
    subs = [
        s.as_prop()
        for s in Submission.objects.filter(status__in=[Status.NEW])
    ]
    return render(
        request, "main/housing_list.html", {"props": dict(
            initialResources=resources, subs=subs
        )}
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
        for r in HousingResource.objects.filter(status__in=[Status.NEW, Status.VERIFIED])
    ]
    return JsonResponse({"data": resources})


@require_http_methods(["POST"])
@login_required
def update_resource_status(request, resource_id, **kwargs):
    user = request.user
    data = json.loads(request.body)
    resource = HousingResource.objects.select_for_update().get(id=resource_id)
    new_status = data['value']
    if resource.status in [Status.NEW, Status.VERIFIED]:
        resource.status = new_status
        resource.owner = user
        resource.save()
    else:
        return JsonResponse({
            "status": "error",
            "message": f"Can't update from status: {resource.status}",
            "object": resource.as_prop(),
        }, status=400)

    return JsonResponse({
        "status": "success",
        "message": "Updated!",
        "object": resource.as_prop()
    }
    )


@require_http_methods(["POST"])
def create_submission(request):
    # TODO: add some validation
    data = json.loads(request.body)
    s = Submission.objects.create(**data)
    return JsonResponse({"data": s.as_prop()})


@require_http_methods(["POST"])
def create_resource(request):
    # TODO: add some validation
    data = json.loads(request.body)
    hr = HousingResource.objects.create(**data)
    return JsonResponse({"data": hr.as_prop()})


@require_http_methods(["GET"])
@login_required
def get_submissions(request):
    subs = [
        s.as_prop()
        for s in Submission.objects.filter(status__in=[Status.NEW])
    ]
    return JsonResponse({"data": subs})
