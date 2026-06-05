import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Campaign(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", _("Draft")
        SCHEDULED = "SCHEDULED", _("Scheduled")
        PUBLISHING = "PUBLISHING", _("Publishing")
        LIVE = "LIVE", _("Live")
        MEASURING = "MEASURING", _("Measuring")
        COMPLETED = "COMPLETED", _("Completed")
        FAILED = "FAILED", _("Failed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="campaigns")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketing_campaigns")
    name = models.CharField(max_length=255)
    objective = models.TextField(blank=True, default="")
    audience = models.CharField(max_length=255, blank=True, default="")
    channels = models.JSONField(default=list, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    content_brief = models.TextField(blank=True, default="")
    performance_summary = models.JSONField(default=dict, blank=True)
    next_action_suggestions = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["owner", "status"]),
        ]

    def __str__(self):
        return self.name


class ContentCalendarItem(models.Model):
    class Platform(models.TextChoices):
        INSTAGRAM = "instagram", _("Instagram")
        TIKTOK = "tiktok", _("TikTok")
        LINKEDIN = "linkedin", _("LinkedIn")
        TWITTER = "twitter", _("X/Twitter")
        FACEBOOK = "facebook", _("Facebook")
        OTHER = "other", _("Other")

    class Status(models.TextChoices):
        DRAFT = "DRAFT", _("Draft")
        SCHEDULED = "SCHEDULED", _("Scheduled")
        QUEUED = "QUEUED", _("Queued")
        PUBLISHING = "PUBLISHING", _("Publishing")
        PUBLISHED = "PUBLISHED", _("Published")
        FAILED = "FAILED", _("Failed")
        CANCELLED = "CANCELLED", _("Cancelled")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name="calendar_items")
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="content_calendar_items")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="content_calendar_items")
    title = models.CharField(max_length=255)
    platform = models.CharField(max_length=30, choices=Platform.choices, default=Platform.INSTAGRAM)
    caption = models.TextField(blank=True, default="")
    media_urls = models.JSONField(default=list, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    uploadpost_request_id = models.CharField(max_length=255, blank=True, default="", db_index=True)
    external_post_id = models.CharField(max_length=255, blank=True, default="", db_index=True)
    publish_result = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, default="")
    published_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_at", "-created_at"]
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["campaign", "status"]),
            models.Index(fields=["scheduled_at", "status"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.platform})"


class CampaignMetric(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name="metrics")
    calendar_item = models.ForeignKey(
        ContentCalendarItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="metrics",
    )
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="campaign_metrics")
    source = models.CharField(max_length=50, default="manual")
    impressions = models.PositiveIntegerField(default=0)
    reach = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    comments = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    saves = models.PositiveIntegerField(default=0)
    conversions = models.PositiveIntegerField(default=0)
    spend = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    raw = models.JSONField(default=dict, blank=True)
    captured_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-captured_at"]
        indexes = [
            models.Index(fields=["project", "captured_at"]),
            models.Index(fields=["campaign", "captured_at"]),
        ]

    @property
    def engagement_total(self):
        return self.likes + self.comments + self.shares + self.saves + self.clicks
