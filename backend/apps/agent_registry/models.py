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