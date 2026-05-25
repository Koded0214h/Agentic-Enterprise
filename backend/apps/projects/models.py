import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

# Dependency note: this is the minimal Project stub required by Anas's ops_core
# models (Sprint 1). Koded will extend this with the full project-scoped API,
# workspace links, budgets, policy references, and activity log (Sprint 1, Day 2-4).


class ProjectStatus(models.TextChoices):
    ACTIVE = "active", _("Active")
    PAUSED = "paused", _("Paused")
    ARCHIVED = "archived", _("Archived")


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    workspace = models.ForeignKey(
        "agent_gateway.Workspace",
        on_delete=models.CASCADE,
        related_name="projects",
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_projects",
    )
    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.ACTIVE,
    )
    # metadata holds runtime config such as fallback_webhook_url and fallback_alert_email
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["workspace", "status"]),
            models.Index(fields=["owner", "status"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.status})"
