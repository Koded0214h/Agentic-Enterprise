from rest_framework import serializers
from .models import (
    LLMConfig, AgentCapability, Conversation, 
    Message, ToolDefinition
)
from apps.agent_registry.serializers import AgentSerializer


class LLMConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = LLMConfig
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class AgentCapabilitySerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    primary_llm_name = serializers.CharField(source='primary_llm.name', read_only=True)
    reasoning_llm_name = serializers.CharField(source='reasoning_llm.name', read_only=True)
    
    class Meta:
        model = AgentCapability
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    
    class Meta:
        model = Conversation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ToolDefinitionSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = ToolDefinition
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class AgentExecuteSerializer(serializers.Serializer):
    agent_id = serializers.UUIDField()
    task = serializers.CharField(max_length=5000)
    context = serializers.JSONField(required=False, default=dict)