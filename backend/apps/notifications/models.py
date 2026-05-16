import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    class Type(models.TextChoices):
        APPROVAL_REQUEST = 'approval_request', 'Approval Request'
        APPROVAL_RESOLVED = 'approval_resolved', 'Approval Resolved'
        BUDGET_ALERT = 'budget_alert', 'Budget Alert'
        WORKFLOW_COMPLETE = 'workflow_complete', 'Workflow Complete'
        WORKFLOW_FAILED = 'workflow_failed', 'Workflow Failed'
        SYSTEM = 'system', 'System'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    type = models.CharField(max_length=30, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=255)
    body = models.TextField()
    link = models.CharField(max_length=500, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.title} -> {self.recipient_id}"
