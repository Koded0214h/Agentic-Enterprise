from rest_framework import serializers
from .models import Agent, Role, AgentType, AgentStatus


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description", "permissions", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class AgentSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.id")  # Set automatically from request user
    roles = RoleSerializer(many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="roles"
    )
    identity_key = serializers.CharField(read_only=True)  # Only shown on create

    class Meta:
        model = Agent
        fields = [
            "id",
            "name",
            "agent_type",
            "owner",
            "version",
            "identity_key",
            "roles",
            "role_ids",
            "status",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "identity_key", "created_at", "updated_at"]

    def create(self, validated_data):
        # Identity is generated automatically, not from request data
        from .utils import generate_agent_identity
        identity = generate_agent_identity()
        validated_data["identity_key"] = identity["token"]
        return super().create(validated_data)