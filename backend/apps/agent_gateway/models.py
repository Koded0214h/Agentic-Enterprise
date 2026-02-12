import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.agent_registry.models import Agent

User = get_user_model()


class AgentSession(models.Model):
    """Tracks active agent sessions and their JWTs"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='sessions')
    jti = models.CharField(max_length=255, unique=True)  # JWT ID
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['jti']),
            models.Index(fields=['agent', 'expires_at']),
        ]


class AgentRequestLog(models.Model):
    """Logs every request made by agents"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='requests')
    session = models.ForeignKey(AgentSession, on_delete=models.SET_NULL, null=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    query_params = models.JSONField(default=dict)
    headers = models.JSONField(default=dict)
    body = models.JSONField(null=True, blank=True)
    response_status = models.IntegerField()
    response_body = models.JSONField(null=True, blank=True)
    duration_ms = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent', 'created_at']),
        ]