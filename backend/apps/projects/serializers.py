from rest_framework import serializers
from .models import Project, ProjectMember, ProjectActivity, ProjectGoal, ProjectArtifact


class ProjectMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ProjectMember
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class ProjectActivitySerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source="actor.email", read_only=True)

    class Meta:
        model = ProjectActivity
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class ProjectGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectGoal
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class ProjectArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectArtifact
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(many=True, read_only=True, source="memberships")
    activity_count = serializers.SerializerMethodField()
    goal_count = serializers.SerializerMethodField()
    artifact_count = serializers.SerializerMethodField()
    workflow_task_count = serializers.SerializerMethodField()
    swarm_execution_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["id", "owner", "created_at", "updated_at", "archived_at"]

    def get_activity_count(self, obj):
        return obj.activities.count()

    def get_goal_count(self, obj):
        return obj.goals.count()

    def get_artifact_count(self, obj):
        return obj.artifacts.count()

    def get_workflow_task_count(self, obj):
        return obj.workflow_tasks.count()

    def get_swarm_execution_count(self, obj):
        return obj.swarm_executions.count()
