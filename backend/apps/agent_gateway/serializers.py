from rest_framework import serializers
from apps.agent_registry.models import Agent
from .models import AgentSession, AgentRequestLog


class AgentLoginSerializer(serializers.Serializer):
    agent_id = serializers.UUIDField()
    identity_key = serializers.CharField()


class AgentSessionSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    
    class Meta:
        model = AgentSession
        fields = ['id', 'agent', 'agent_name', 'jti', 'ip_address', 
                  'last_activity', 'expires_at', 'revoked_at', 'created_at']
        read_only_fields = ['id', 'jti', 'created_at']


class AgentRequestLogSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    
    class Meta:
        model = AgentRequestLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']