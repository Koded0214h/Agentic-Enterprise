import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from apps.agent_registry.models import Agent, Role

User = get_user_model()


class PolicyEffect(models.TextChoices):
    ALLOW = "ALLOW", _("Allow")
    DENY = "DENY", _("Deny")
    AUDIT = "AUDIT", _("Audit Only")
    ESCALATE = "ESCALATE", _("Require Approval")


class PolicyResource(models.TextChoices):
    # Tool access
    TOOL_ALL = "tool:*", _("All Tools")
    TOOL_CRM = "tool:crm", _("CRM Tools")
    TOOL_EMAIL = "tool:email", _("Email Tools")
    TOOL_DATABASE = "tool:database", _("Database Tools")
    TOOL_API = "tool:api", _("External API Tools")
    TOOL_FILE = "tool:file", _("File System Tools")
    
    # Agent operations
    AGENT_CREATE = "agent:create", _("Create Agents")
    AGENT_READ = "agent:read", _("Read Agents")
    AGENT_UPDATE = "agent:update", _("Update Agents")
    AGENT_DELETE = "agent:delete", _("Delete Agents")
    AGENT_EXECUTE = "agent:execute", _("Execute Agents")
    
    # Workflow
    WORKFLOW_CREATE = "workflow:create", _("Create Workflows")
    WORKFLOW_EXECUTE = "workflow:execute", _("Execute Workflows")
    
    # Data access
    DATA_READ = "data:read", _("Read Data")
    DATA_WRITE = "data:write", _("Write Data")
    DATA_DELETE = "data:delete", _("Delete Data")


class PolicyCondition(models.Model):
    """
    Dynamic conditions for policy evaluation.
    Supports JSON-based rule conditions.
    """
    OPERATOR_CHOICES = [
        ("eq", "Equals"),
        ("neq", "Not Equals"),
        ("gt", "Greater Than"),
        ("lt", "Less Than"),
        ("contains", "Contains"),
        ("not_contains", "Not Contains"),
        ("in", "In List"),
        ("not_in", "Not In List"),
        ("between", "Between"),
        ("regex", "Matches Regex"),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    field = models.CharField(max_length=100, help_text=_("Field to evaluate (e.g., request.method, resource.type)"))
    operator = models.CharField(max_length=20, choices=OPERATOR_CHOICES)
    value = models.JSONField(help_text=_("Value to compare against"))
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.field} {self.operator} {self.value}"


class Policy(models.Model):
    """
    Core Policy model - defines who can do what under which conditions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    
    # What action/resource this policy applies to
    resources = models.JSONField(
        default=list,
        help_text=_("List of resources this policy applies to (e.g., ['tool:crm', 'agent:execute'])")
    )
    
    # The effect when conditions match
    effect = models.CharField(
        max_length=20,
        choices=PolicyEffect.choices,
        default=PolicyEffect.DENY
    )
    
    # Conditions that must be met
    conditions = models.ManyToManyField(
        PolicyCondition,
        blank=True,
        related_name="policies"
    )
    
    # Who this policy applies to
    roles = models.ManyToManyField(Role, blank=True, related_name="policies")
    agents = models.ManyToManyField(Agent, blank=True, related_name="policies")
    
    # Priority - higher numbers evaluated first
    priority = models.IntegerField(default=0)
    
    # Time-based constraints
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    
    # Usage limits
    max_calls = models.IntegerField(null=True, blank=True, help_text=_("Maximum number of times this policy can be applied"))
    calls_made = models.IntegerField(default=0)
    
    # Risk level (0-100)
    risk_level = models.IntegerField(default=0, help_text=_("0 = Low Risk, 100 = Critical Risk"))
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ["-priority", "name"]
        indexes = [
            models.Index(fields=["is_active", "effect"]),
            models.Index(fields=["valid_from", "valid_until"]),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.effect})"
    
    def increment_calls(self):
        """Increment the call counter for this policy"""
        self.calls_made += 1
        self.save(update_fields=["calls_made"])
    
    def is_valid_now(self):
        """Check if policy is currently valid based on time constraints"""
        from django.utils import timezone
        now = timezone.now()
        
        if self.valid_from and now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        if self.max_calls and self.calls_made >= self.max_calls:
            return False
            
        return True


class PolicyAssignment(models.Model):
    """
    Track which policies are assigned to which agents/roles.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name="assignments")
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True, blank=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = [
            ["policy", "agent"],
            ["policy", "role"],
        ]


class PolicyAuditLog(models.Model):
    """
    Log every policy evaluation for compliance and debugging.
    """
    DECISION_CHOICES = [
        ("ALLOW", "Allowed"),
        ("DENY", "Denied"),
        ("AUDIT", "Audited"),
        ("ESCALATE", "Escalated"),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name="policy_logs")
    policy = models.ForeignKey(Policy, on_delete=models.SET_NULL, null=True)
    
    # What was requested
    resource = models.CharField(max_length=100)
    action = models.CharField(max_length=100)
    request_data = models.JSONField(default=dict)
    
    # Decision
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES)
    reason = models.TextField()
    
    # Context
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    
    # Timing
    execution_time_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["agent", "created_at"]),
            models.Index(fields=["decision", "created_at"]),
        ]