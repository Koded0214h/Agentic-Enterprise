from rest_framework import serializers
from .models import (
    Policy, PolicyCondition, PolicyAssignment, 
    PolicyAuditLog, PolicyEffect, PolicyResource
)
from apps.agent_registry.serializers import AgentSerializer, RoleSerializer
from apps.agent_registry.models import Agent, Role



class PolicyConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyCondition
        fields = '__all__'


class PolicySerializer(serializers.ModelSerializer):
    conditions = PolicyConditionSerializer(many=True, read_only=True)
    condition_ids = serializers.PrimaryKeyRelatedField(
        queryset=PolicyCondition.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='conditions'
    )
    
    roles = RoleSerializer(many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='roles'
    )
    
    agents = AgentSerializer(many=True, read_only=True)
    agent_ids = serializers.PrimaryKeyRelatedField(
        queryset=Agent.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='agents'
    )
    
    created_by = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = Policy
        fields = '__all__'
        read_only_fields = ['id', 'calls_made', 'created_by', 'created_at', 'updated_at']


class PolicyAssignmentSerializer(serializers.ModelSerializer):
    policy_name = serializers.CharField(source='policy.name', read_only=True)
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)
    
    class Meta:
        model = PolicyAssignment
        fields = '__all__'
        read_only_fields = ['id', 'assigned_by', 'assigned_at']


class PolicyAuditLogSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    policy_name = serializers.CharField(source='policy.name', read_only=True)
    
    class Meta:
        model = PolicyAuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class PolicyEvaluateSerializer(serializers.Serializer):
    agent_id = serializers.UUIDField()
    resource = serializers.ChoiceField(choices=[r[0] for r in PolicyResource.choices])
    action = serializers.CharField(max_length=50)
    context = serializers.JSONField(required=False, default=dict)