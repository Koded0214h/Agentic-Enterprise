"""
Swarm Bridge Models

Tracks every execution context that flows from the agent-swarm runtime
into AOS governance. These are the canonical shared data structures for
the integration contract.
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.agent_registry.models import Agent


class SwarmWorkflowPhase(models.TextChoices):
    QUESTIONNAIRE = "questionnaire", _("Questionnaire")
    PLANNER = "planner", _("Planner")
    EXECUTE = "execute", _("Execute")
    DEBUG = "debug", _("Debug")
    SHIP = "ship", _("Ship")
    SCOUT = "scout", _("Scout")


class SwarmEngine(models.TextChoices):
    CLAUDE = "claude", _("Claude (Anthropic)")
    GEMINI = "gemini", _("Gemini (Google)")
    GENERIC = "generic", _("Generic CLI Engine")


class SwarmEnvironment(models.TextChoices):
    DEV = "dev", _("Development")
    STAGING = "staging", _("Staging")
    PROD = "prod", _("Production")


class SwarmExecutionStatus(models.TextChoices):
    PENDING = "pending", _("Pending")
    RUNNING = "running", _("Running")
    COMPLETED = "completed", _("Completed")
    FAILED = "failed", _("Failed")
    CANCELLED = "cancelled", _("Cancelled")
    DENIED = "denied", _("Denied by policy")


class SwarmExecutionContext(models.Model):
    """
    Every agent-swarm execution that passes through the AOS bridge gets
    a SwarmExecutionContext record. This is the source of truth for
    cross-system traceability — linking a swarm run to AOS policy decisions,
    usage records, and trace steps.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Identity
    aos_agent = models.ForeignKey(
        Agent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="swarm_executions",
        help_text=_("AOS Agent record corresponding to the swarm agent"),
    )
    swarm_agent_name = models.CharField(
        max_length=255,
        db_index=True,
        help_text=_("Swarm agent identifier, e.g. 'sales-account-strategist'"),
    )

    # Execution metadata
    engine = models.CharField(
        max_length=20,
        choices=SwarmEngine.choices,
        default=SwarmEngine.CLAUDE,
    )
    workflow_phase = models.CharField(
        max_length=20,
        choices=SwarmWorkflowPhase.choices,
        null=True,
        blank=True,
    )
    environment = models.CharField(
        max_length=10,
        choices=SwarmEnvironment.choices,
        default=SwarmEnvironment.DEV,
    )

    # Task
    task_summary = models.TextField(
        blank=True,
        help_text=_("Brief description of the task dispatched to this agent"),
    )

    # Native run stream/state for /api/swarm/run/*
    run_lines = models.JSONField(
        default=list,
        blank=True,
        help_text=_("Durable line buffer for native run streaming and replay"),
    )
    run_exit_code = models.IntegerField(
        null=True,
        blank=True,
        help_text=_("Exit code for native runs, if applicable"),
    )

    # Usage metrics (populated post-execution via /usage/report/)
    tokens_input = models.IntegerField(default=0)
    tokens_output = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=12, decimal_places=6, default=0)
    duration_ms = models.IntegerField(default=0)

    # Policy gate result (populated by /policy/check/)
    policy_decision = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text=_("allow | deny | escalate — set after AOS policy evaluation"),
    )
    policy_reason = models.TextField(blank=True)

    # Lifecycle
    status = models.CharField(
        max_length=20,
        choices=SwarmExecutionStatus.choices,
        default=SwarmExecutionStatus.PENDING,
        db_index=True,
        help_text=_("Run lifecycle status — drives Observe stream and replay endpoint"),
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["swarm_agent_name", "created_at"]),
            models.Index(fields=["policy_decision", "created_at"]),
            models.Index(fields=["environment", "created_at"]),
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self):
        return f"{self.swarm_agent_name} [{self.environment}] @ {self.created_at:%Y-%m-%d %H:%M}"


class SwarmAgentManifest(models.Model):
    """
    Stores the raw manifest data imported from swarm.config.json.
    Used by the sync_swarm_agents management command and as a reference
    for what capabilities each swarm agent declares.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    aos_agent = models.OneToOneField(
        Agent,
        on_delete=models.CASCADE,
        related_name="swarm_manifest",
    )

    # Data from swarm.config.json
    swarm_name = models.CharField(max_length=255, unique=True)
    source_category = models.CharField(
        max_length=100,
        blank=True,
        help_text=_("Swarm source category, e.g. 'sales', 'engineering', 'product'"),
    )
    file_path = models.CharField(
        max_length=500,
        blank=True,
        help_text=_("Relative path to the agent .md definition file"),
    )
    preferred_engine = models.CharField(
        max_length=20,
        choices=SwarmEngine.choices,
        null=True,
        blank=True,
    )

    # Parsed from the agent's .md file
    description = models.TextField(blank=True)
    raw_markdown = models.TextField(
        blank=True,
        help_text=_("Full content of the agent's .md definition file"),
    )

    # Sync metadata
    last_synced_at = models.DateTimeField(auto_now=True)
    sync_version = models.CharField(
        max_length=50,
        blank=True,
        help_text=_("swarm.config.json version at time of last sync"),
    )

    class Meta:
        ordering = ["source_category", "swarm_name"]

    def __str__(self):
        return f"Manifest: {self.swarm_name} ({self.source_category})"
