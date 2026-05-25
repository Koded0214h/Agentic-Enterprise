import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# Account
# ─────────────────────────────────────────────────────────────────────────────

class AccountSize(models.TextChoices):
    STARTUP = "startup", _("Startup (1–10)")
    SMB = "smb", _("SMB (11–100)")
    MID_MARKET = "mid_market", _("Mid-market (101–1000)")
    ENTERPRISE = "enterprise", _("Enterprise (1000+)")


class Account(models.Model):
    """Company/customer record owned by a project. Nothing lands in a global bucket."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="accounts",
    )
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=255, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    size = models.CharField(max_length=20, choices=AccountSize.choices, blank=True)
    website = models.URLField(blank=True)
    hubspot_id = models.CharField(max_length=100, blank=True, db_index=True)
    salesforce_id = models.CharField(max_length=100, blank=True, db_index=True)
    external_id = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "name"]),
        ]

    def __str__(self):
        return f"{self.name} [project={self.project_id}]"


# ─────────────────────────────────────────────────────────────────────────────
# Lead
# ─────────────────────────────────────────────────────────────────────────────

class LeadStatus(models.TextChoices):
    NEW = "new", _("New")
    CONTACTED = "contacted", _("Contacted")
    QUALIFIED = "qualified", _("Qualified")
    DISQUALIFIED = "disqualified", _("Disqualified")
    CONVERTED = "converted", _("Converted")


class SyncStatus(models.TextChoices):
    PENDING = "pending", _("Pending")
    SYNCED = "synced", _("Synced")
    FAILED = "failed", _("Failed")


class Lead(models.Model):
    """Sales prospect tied to a project. External IDs tracked for CRM sync."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="leads",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads",
    )
    email = models.EmailField()
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    title = models.CharField(max_length=255, blank=True)
    company = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    source = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20,
        choices=LeadStatus.choices,
        default=LeadStatus.NEW,
    )
    score = models.IntegerField(default=0)
    hubspot_id = models.CharField(max_length=100, blank=True, db_index=True)
    salesforce_id = models.CharField(max_length=100, blank=True, db_index=True)
    external_id = models.CharField(max_length=255, blank=True)
    sync_status = models.CharField(
        max_length=20,
        choices=SyncStatus.choices,
        default=SyncStatus.PENDING,
    )
    last_synced_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["project", "email"]),
        ]

    def __str__(self):
        return f"{self.email} [{self.status}]"


# ─────────────────────────────────────────────────────────────────────────────
# Opportunity
# ─────────────────────────────────────────────────────────────────────────────

class OpportunityStage(models.TextChoices):
    PROSPECTING = "prospecting", _("Prospecting")
    QUALIFICATION = "qualification", _("Qualification")
    PROPOSAL = "proposal", _("Proposal")
    NEGOTIATION = "negotiation", _("Negotiation")
    CLOSED_WON = "closed_won", _("Closed Won")
    CLOSED_LOST = "closed_lost", _("Closed Lost")


class Opportunity(models.Model):
    """Deal or sales opportunity tied to a project."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="opportunities",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    name = models.CharField(max_length=255)
    stage = models.CharField(
        max_length=20,
        choices=OpportunityStage.choices,
        default=OpportunityStage.PROSPECTING,
    )
    value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    close_date = models.DateField(null=True, blank=True)
    probability = models.IntegerField(default=0)  # 0–100
    hubspot_id = models.CharField(max_length=100, blank=True, db_index=True)
    salesforce_id = models.CharField(max_length=100, blank=True, db_index=True)
    external_id = models.CharField(max_length=255, blank=True)
    sync_status = models.CharField(
        max_length=20,
        choices=SyncStatus.choices,
        default=SyncStatus.PENDING,
    )
    last_synced_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "stage"]),
        ]

    def __str__(self):
        return f"{self.name} — {self.stage}"


# ─────────────────────────────────────────────────────────────────────────────
# Ticket
# ─────────────────────────────────────────────────────────────────────────────

class TicketStatus(models.TextChoices):
    OPEN = "open", _("Open")
    PENDING = "pending", _("Pending")
    IN_PROGRESS = "in_progress", _("In Progress")
    RESOLVED = "resolved", _("Resolved")
    CLOSED = "closed", _("Closed")


class TicketPriority(models.TextChoices):
    LOW = "low", _("Low")
    MEDIUM = "medium", _("Medium")
    HIGH = "high", _("High")
    CRITICAL = "critical", _("Critical")


class TicketChannel(models.TextChoices):
    EMAIL = "email", _("Email")
    CHAT = "chat", _("Chat")
    PHONE = "phone", _("Phone")
    WEB = "web", _("Web")
    SLACK = "slack", _("Slack")


class Ticket(models.Model):
    """Support ticket tied to a project."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="tickets",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tickets",
    )
    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tickets",
    )
    subject = models.CharField(max_length=500)
    body = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.OPEN,
    )
    priority = models.CharField(
        max_length=20,
        choices=TicketPriority.choices,
        default=TicketPriority.MEDIUM,
    )
    channel = models.CharField(
        max_length=20,
        choices=TicketChannel.choices,
        default=TicketChannel.EMAIL,
    )
    assignee = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets",
    )
    zendesk_id = models.CharField(max_length=100, blank=True, db_index=True)
    intercom_id = models.CharField(max_length=100, blank=True, db_index=True)
    external_id = models.CharField(max_length=255, blank=True)
    sync_status = models.CharField(
        max_length=20,
        choices=SyncStatus.choices,
        default=SyncStatus.PENDING,
    )
    last_synced_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["project", "priority"]),
        ]

    def __str__(self):
        return f"[{self.priority}] {self.subject} ({self.status})"


# ─────────────────────────────────────────────────────────────────────────────
# Touchpoint
# ─────────────────────────────────────────────────────────────────────────────

class TouchpointType(models.TextChoices):
    EMAIL = "email", _("Email")
    CALL = "call", _("Call")
    MEETING = "meeting", _("Meeting")
    NOTE = "note", _("Note")
    DEMO = "demo", _("Demo")
    TRIAL = "trial", _("Trial")
    CHAT = "chat", _("Chat")


class TouchpointDirection(models.TextChoices):
    INBOUND = "inbound", _("Inbound")
    OUTBOUND = "outbound", _("Outbound")


class Touchpoint(models.Model):
    """Interaction log entry tied to a project — email, call, meeting, etc."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="touchpoints",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="touchpoints",
    )
    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="touchpoints",
    )
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="touchpoints",
    )
    type = models.CharField(max_length=20, choices=TouchpointType.choices)
    direction = models.CharField(
        max_length=10,
        choices=TouchpointDirection.choices,
        default=TouchpointDirection.OUTBOUND,
    )
    summary = models.TextField(blank=True)
    occurred_at = models.DateTimeField()
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_touchpoints",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-occurred_at"]
        indexes = [
            models.Index(fields=["project", "type"]),
            models.Index(fields=["project", "occurred_at"]),
        ]

    def __str__(self):
        return f"{self.type} ({self.direction}) — {self.occurred_at:%Y-%m-%d}"


# ─────────────────────────────────────────────────────────────────────────────
# QueueItem
# ─────────────────────────────────────────────────────────────────────────────

class QueueItemType(models.TextChoices):
    LEAD_SYNC = "lead_sync", _("Lead Sync")
    TICKET_SYNC = "ticket_sync", _("Ticket Sync")
    OPPORTUNITY_SYNC = "opportunity_sync", _("Opportunity Sync")
    ACCOUNT_SYNC = "account_sync", _("Account Sync")
    WEBHOOK_DISPATCH = "webhook_dispatch", _("Webhook Dispatch")
    EMAIL_DISPATCH = "email_dispatch", _("Email Dispatch")
    CAMPAIGN = "campaign", _("Campaign")


class QueueItemStatus(models.TextChoices):
    PENDING = "pending", _("Pending")
    PROCESSING = "processing", _("Processing")
    COMPLETED = "completed", _("Completed")
    FAILED = "failed", _("Failed")
    RETRYING = "retrying", _("Retrying")
    DEAD = "dead", _("Dead — max retries exceeded")


class QueueItem(models.Model):
    """
    Durable work item for any async/sync operation within a project.
    All sync, dispatch, and campaign jobs flow through here so queue state is
    always visible and nothing silently drops.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="queue_items",
    )
    item_type = models.CharField(max_length=30, choices=QueueItemType.choices)
    status = models.CharField(
        max_length=20,
        choices=QueueItemStatus.choices,
        default=QueueItemStatus.PENDING,
    )
    priority = models.IntegerField(default=0)
    payload = models.JSONField(default=dict)
    result = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "created_at"]
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["status", "scheduled_at"]),
            models.Index(fields=["next_retry_at"]),
        ]

    def __str__(self):
        return f"{self.item_type} [{self.status}] {self.id}"

    @property
    def can_retry(self) -> bool:
        return self.retry_count < self.max_retries
