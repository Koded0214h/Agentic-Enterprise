import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.agent_registry.models import Agent

User = get_user_model()

class DepartmentCostCenter(models.Model):
    """Department or cost center for chargebacks."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_departments')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class UsageRecord(models.Model):
    """Granular usage records for agents."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='usage_records')
    department = models.ForeignKey(DepartmentCostCenter, on_delete=models.SET_NULL, null=True, related_name='usage_records')
    
    # Usage metrics
    tokens_input = models.IntegerField(default=0)
    tokens_output = models.IntegerField(default=0)
    compute_time_ms = models.IntegerField(default=0)  # For non-LLM or long running tasks
    
    # Cost (calculated based on LLMConfig or flat rates)
    cost = models.DecimalField(max_digits=12, decimal_places=6, default=0.0)
    currency = models.CharField(max_length=3, default='USD')
    
    # Context
    resource_id = models.UUIDField(null=True, blank=True)  # e.g. Conversation ID or Task ID
    resource_type = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent', 'created_at']),
            models.Index(fields=['department', 'created_at']),
        ]

class AgentBudget(models.Model):
    """Budget limits for agents or departments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.OneToOneField(Agent, on_delete=models.CASCADE, related_name='budget', null=True, blank=True)
    department = models.OneToOneField(DepartmentCostCenter, on_delete=models.CASCADE, related_name='budget', null=True, blank=True)
    
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2)
    current_month_spend = models.DecimalField(max_digits=12, decimal_places=6, default=0.0)
    
    alert_threshold_percentage = models.IntegerField(default=80)
    is_active = models.BooleanField(default=True)
    
    last_reset_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        owner = self.agent.name if self.agent else self.department.name
        return f"Budget for {owner}: {self.monthly_limit}"
