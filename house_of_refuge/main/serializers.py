from rest_framework import serializers

from house_of_refuge.main.models import Submission, HousingResource


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = "__all__"


class HousingResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HousingResource
        fields = "__all__"
