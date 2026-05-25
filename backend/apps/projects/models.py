import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class Project(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", _("Active")
        PAUSED = "PAUSED", _("Paused")
        ARCHIVED = "ARCHIVED", _("Archived")

    class Stage(models.TextChoices):
        IDEA = "IDEA", _("Idea")
        MVP = "MVP", _("MVP")
        LAUNCH = "LAUNCH", _("Launch")
        GROWTH = "GROWTH", _("Growth")
        SCALE = "SCALE", _("Scale")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_projects",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default="")
    vision = models.TextField(blank=True, default="")
    target_market = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.IDEA)
    operating_mode = models.CharField(max_length=50, default="standard")
    monthly_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    workspace = models.ForeignKey(
        "agent_gateway.Workspace",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    metadata = models.JSONField(default=dict, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "status"]),
            models.Index(fields=["stage", "status"]),
        ]

    def __str__(self):
        return self.name

    def archive(self):
        self.status = self.Status.ARCHIVED
        self.archived_at = timezone.now()
        self.save(update_fields=["status", "archived_at", "updated_at"])


class ProjectMember(models.Model):
    class Role(models.TextChoices):
        OWNER = "OWNER", _("Owner")
        ADMIN = "ADMIN", _("Admin")
        MEMBER = "MEMBER", _("Member")
        VIEWER = "VIEWER", _("Viewer")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="project_memberships")
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["project", "user"]]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} in {self.project} as {self.role}"


class ProjectActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="activities")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    kind = models.CharField(max_length=100)
    summary = models.CharField(max_length=255)
    body = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["project", "created_at"]), models.Index(fields=["kind", "created_at"])]

    def __str__(self):
        return self.summary


class ProjectGoal(models.Model):
    class Status(models.TextChoices):
        PLANNED = "PLANNED", _("Planned")
        IN_PROGRESS = "IN_PROGRESS", _("In Progress")
        BLOCKED = "BLOCKED", _("Blocked")
        COMPLETED = "COMPLETED", _("Completed")
        CANCELLED = "CANCELLED", _("Cancelled")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="goals")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    priority = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)
    target_metric = models.CharField(max_length=255, blank=True, default="")
    target_value = models.CharField(max_length=255, blank=True, default="")
    due_date = models.DateField(null=True, blank=True)
    workflow_task = models.ForeignKey(
        "agent_intelligence.WorkflowTask",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_goals",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "-created_at"]

    def __str__(self):
        return self.title


class ProjectArtifact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="artifacts")
    kind = models.CharField(max_length=100, default="file")
    name = models.CharField(max_length=255)
    path = models.CharField(max_length=500, blank=True, default="")
    content = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
