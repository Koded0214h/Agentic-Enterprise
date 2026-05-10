from rest_framework import serializers
from .models import Agent, Role, AgentType, AgentStatus, AgentTrustPolicy


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
            "department",
            "version",
            "identity_key",
            "roles",
            "role_ids",
            "status",
            "source",
            "environment",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "identity_key", "source", "created_at", "updated_at"]

    def create(self, validated_data):
        from .utils import generate_agent_identity
        identity = generate_agent_identity()
        validated_data["identity_key"] = identity["token"]
        return super().create(validated_data)


class AgentTrustPolicySerializer(serializers.ModelSerializer):
    source_agent_name = serializers.ReadOnlyField(source="source_agent.name")
    target_agent_name = serializers.ReadOnlyField(source="target_agent.name")

    class Meta:
        model = AgentTrustPolicy
        fields = [
            "id", "source_agent", "source_agent_name",
            "target_agent", "target_agent_name",
            "allowed", "reason", "created_by", "created_at", "expires_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]