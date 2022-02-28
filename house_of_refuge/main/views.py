from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .forms import HousingResourceForm
# Create your views here.
from .models import HousingResource, Status


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
    return render(
        request, "main/housing_list.html", {"props": dict(resources=resources)}
    )
