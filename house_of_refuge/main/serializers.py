from rest_framework import serializers

from house_of_refuge.main.models import Submission


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = "__all__"
