import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Account(models.Model):
    class Lifecycle(models.TextChoices):
        PROSPECT = "PROSPECT", _("Prospect")
        ACTIVE = "ACTIVE", _("Active")
        CUSTOMER = "CUSTOMER", _("Customer")
        CHURNED = "CHURNED", _("Churned")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ops_accounts",
    )
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=255, blank=True, default="")
    industry = models.CharField(max_length=120, blank=True, default="")
    lifecycle = models.CharField(
        max_length=20,
        choices=Lifecycle.choices,
        default=Lifecycle.PROSPECT,
    )
    external_provider = models.CharField(max_length=50, blank=True, default="")
    external_id = models.CharField(max_length=255, blank=True, default="")
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "lifecycle"]),
            models.Index(fields=["external_provider", "external_id"]),
        ]

    def __str__(self):
        return self.name


class Lead(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", _("New")
        CONTACTED = "CONTACTED", _("Contacted")
        QUALIFIED = "QUALIFIED", _("Qualified")
        CONVERTED = "CONVERTED", _("Converted")
        LOST = "LOST", _("Lost")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ops_leads",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads",
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, default="")
    company = models.CharField(max_length=255, blank=True, default="")
    source = models.CharField(max_length=80, blank=True, default="manual")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    score = models.IntegerField(default=0)
    external_provider = models.CharField(max_length=50, blank=True, default="")
    external_id = models.CharField(max_length=255, blank=True, default="")
    converted_opportunity = models.OneToOneField(
        "Opportunity",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="origin_lead",
    )
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "status"]),
            models.Index(fields=["source", "status"]),
            models.Index(fields=["external_provider", "external_id"]),
        ]

    def __str__(self):
        return self.name


class Opportunity(models.Model):
    class Stage(models.TextChoices):
        DISCOVERY = "DISCOVERY", _("Discovery")
        DEMO = "DEMO", _("Demo")
        PROPOSAL = "PROPOSAL", _("Proposal")
        NEGOTIATION = "NEGOTIATION", _("Negotiation")
        WON = "WON", _("Won")
        LOST = "LOST", _("Lost")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ops_opportunities",
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
    title = models.CharField(max_length=255)
    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.DISCOVERY,
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    expected_close_date = models.DateField(null=True, blank=True)
    external_provider = models.CharField(max_length=50, blank=True, default="")
    external_id = models.CharField(max_length=255, blank=True, default="")
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "stage"]),
            models.Index(fields=["external_provider", "external_id"]),
        ]

    def __str__(self):
        return self.title


class Ticket(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", _("New")
        OPEN = "OPEN", _("Open")
        WAITING = "WAITING", _("Waiting")
        ESCALATED = "ESCALATED", _("Escalated")
        RESOLVED = "RESOLVED", _("Resolved")
        CLOSED = "CLOSED", _("Closed")

    class Priority(models.TextChoices):
        LOW = "LOW", _("Low")
        NORMAL = "NORMAL", _("Normal")
        HIGH = "HIGH", _("High")
        URGENT = "URGENT", _("Urgent")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ops_tickets",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tickets",
    )
    requester_name = models.CharField(max_length=255)
    requester_email = models.EmailField(blank=True, default="")
    subject = models.CharField(max_length=255)
    body = models.TextField(blank=True, default="")
    channel = models.CharField(max_length=80, blank=True, default="internal")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.NORMAL,
    )
    external_provider = models.CharField(max_length=50, blank=True, default="")
    external_id = models.CharField(max_length=255, blank=True, default="")
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ops_assigned_tickets",
    )
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "status"]),
            models.Index(fields=["channel", "priority"]),
            models.Index(fields=["external_provider", "external_id"]),
        ]

    def __str__(self):
        return self.subject


class Touchpoint(models.Model):
    class Kind(models.TextChoices):
        EMAIL = "EMAIL", _("Email")
        CALL = "CALL", _("Call")
        MEETING = "MEETING", _("Meeting")
        NOTE = "NOTE", _("Note")
        RESPONSE = "RESPONSE", _("Response")

    class Direction(models.TextChoices):
        OUTBOUND = "OUTBOUND", _("Outbound")
        INBOUND = "INBOUND", _("Inbound")
        INTERNAL = "INTERNAL", _("Internal")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ops_touchpoints",
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
    opportunity = models.ForeignKey(
        Opportunity,
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
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.NOTE)
    direction = models.CharField(
        max_length=20,
        choices=Direction.choices,
        default=Direction.INTERNAL,
    )
    summary = models.CharField(max_length=255)
    body = models.TextField(blank=True, default="")
    external_provider = models.CharField(max_length=50, blank=True, default="")
    external_id = models.CharField(max_length=255, blank=True, default="")
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "kind", "direction"]),
            models.Index(fields=["external_provider", "external_id"]),
        ]

    def __str__(self):
        return self.summary


class QueueItem(models.Model):
    class Kind(models.TextChoices):
        LEAD_SYNC = "LEAD_SYNC", _("Lead Sync")
        OPPORTUNITY_SYNC = "OPPORTUNITY_SYNC", _("Opportunity Sync")
        TICKET_SYNC = "TICKET_SYNC", _("Ticket Sync")
        TICKET_REPLY = "TICKET_REPLY", _("Ticket Reply")
        TOUCHPOINT_SYNC = "TOUCHPOINT_SYNC", _("Touchpoint Sync")
        ESCALATION = "ESCALATION", _("Escalation")

    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        PROCESSING = "PROCESSING", _("Processing")
        WAITING_BRIDGE = "WAITING_BRIDGE", _("Waiting for Bridge")
        RETRYING = "RETRYING", _("Retrying")
        COMPLETED = "COMPLETED", _("Completed")
        FAILED = "FAILED", _("Failed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ops_queue_items",
    )
    kind = models.CharField(max_length=30, choices=Kind.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payload = models.JSONField(default=dict, blank=True)
    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="queue_items",
    )
    opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="queue_items",
    )
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="queue_items",
    )
    touchpoint = models.ForeignKey(
        Touchpoint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="queue_items",
    )
    external_provider = models.CharField(max_length=50, blank=True, default="")
    external_id = models.CharField(max_length=255, blank=True, default="")
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=3)
    next_attempt_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, default="")
    last_result = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "status", "kind"]),
            models.Index(fields=["status", "next_attempt_at"]),
        ]

    def __str__(self):
        return f"{self.kind} / {self.status}"
