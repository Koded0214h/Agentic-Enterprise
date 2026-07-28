import uuid

from django.contrib.auth.models import User
from django.db import models

from .crypto import decrypt_secret, encrypt_secret


class IntegrationConnection(models.Model):
    """A user's connection to an external delivery provider (GitHub, Vercel).

    Stores the OAuth/personal access token encrypted at rest. One row per
    (user, provider).
    """

    PROVIDER_CHOICES = [
        ("github", "GitHub"),
        ("vercel", "Vercel"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="integrations")
    provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES)
    access_token_encrypted = models.TextField()
    account_login = models.CharField(max_length=255, blank=True)
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("user", "provider")]

    def __str__(self):
        return f"IntegrationConnection({self.user_id}, {self.provider})"

    @property
    def access_token(self) -> str:
        return decrypt_secret(self.access_token_encrypted)

    def set_token(self, token: str) -> None:
        self.access_token_encrypted = encrypt_secret(token)


class DeliveryRecord(models.Model):
    """Outcome of delivering a swarm run — the repo it landed in and the live URL."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("delivered", "Delivered"),
        ("partial", "Partial"),  # repo pushed but deploy failed/absent
        ("skipped", "Skipped"),  # nothing to deliver / not connected
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="deliveries")
    run_id = models.CharField(max_length=64, db_index=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    repo_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    detail = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"DeliveryRecord({self.run_id}, {self.status})"
