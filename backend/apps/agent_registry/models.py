import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class AgentType(models.TextChoices):
    EXECUTIVE = "EXECUTIVE", _("Executive Agent")
    FUNCTIONAL = "FUNCTIONAL", _("Functional Agent")
    SUB_AGENT = "SUB_AGENT", _("Sub-Agent")
    OBSERVER = "OBSERVER", _("Observer / Auditor Agent")


class AgentStatus(models.TextChoices):
    RUNNING = "RUNNING", _("Running")
    PAUSED = "PAUSED", _("Paused")
    ERRORED = "ERRORED", _("Errored")


class AgentSource(models.TextChoices):
    AOS = "AOS", _("AOS Native")
    SWARM = "SWARM", _("Agent Swarm")


class AgentEnvironment(models.TextChoices):
    DEV = "dev", _("Development")
    STAGING = "staging", _("Staging")
    PROD = "prod", _("Production")

class Role(models.Model):
    """
    Defines a set of permissions that can be assigned to agents.
    For MVP, permissions are stored as a JSON list.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(
        default=list,
        help_text=_("List of permission strings, e.g. ['tools:read', 'agents:create']")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Agent(models.Model):
    """
    Core Agent Registry model.
    Each agent has a unique identity (token) and belongs to a user (owner).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    agent_type = models.CharField(
        max_length=20,
        choices=AgentType.choices,
        default=AgentType.FUNCTIONAL,
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="agents",
        help_text=_("User who owns/created this agent")
    )
    department = models.ForeignKey(
        'billing.DepartmentCostCenter',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agents'
    )
    version = models.CharField(max_length=50, default="1.0.0")
    identity_key = models.CharField(
        max_length=255,
        unique=True,
        help_text=_("Unique API token / cryptographic identity for the agent")
    )
    roles = models.ManyToManyField(Role, blank=True, related_name="agents")
    status = models.CharField(
        max_length=20,
        choices=AgentStatus.choices,
        default=AgentStatus.RUNNING,
    )
    source = models.CharField(
        max_length=10,
        choices=AgentSource.choices,
        default=AgentSource.AOS,
        help_text=_("Origin of this agent: AOS-native or imported from Agent Swarm"),
    )
    environment = models.CharField(
        max_length=10,
        choices=AgentEnvironment.choices,
        default=AgentEnvironment.DEV,
        help_text=_("Deployment environment this agent is scoped to"),
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        help_text=_("Arbitrary metadata / configuration for the agent")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "status"]),
            models.Index(fields=["identity_key"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.agent_type}) - {self.id}"


class AgentTrustPolicy(models.Model):
    """
    Explicit allow/deny for agent-to-agent communication.
    If no trust policy exists for a (source, target) pair the default is DENY
    when environment == prod, ALLOW otherwise.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_agent = models.ForeignKey(
        Agent,
        on_delete=models.CASCADE,
        related_name="outgoing_trust_policies",
        help_text=_("The agent initiating the call"),
    )
    target_agent = models.ForeignKey(
        Agent,
        on_delete=models.CASCADE,
        related_name="incoming_trust_policies",
        help_text=_("The agent being called"),
    )
    allowed = models.BooleanField(default=True)
    reason = models.TextField(blank=True, help_text=_("Why this trust relationship exists or was denied"))
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [["source_agent", "target_agent"]]
        ordering = ["-created_at"]

    def is_valid(self) -> bool:
        from django.utils import timezone
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        return True

    def __str__(self):
        direction = "→" if self.allowed else "✗"
        return f"{self.source_agent.name} {direction} {self.target_agent.name}"