from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.id")
    workspace_name = serializers.ReadOnlyField(source="workspace.name")

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "workspace",
            "workspace_name",
            "owner",
            "status",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "workspace_name", "created_at", "updated_at"]
