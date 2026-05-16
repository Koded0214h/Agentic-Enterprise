import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.agent_registry.models import Agent

User = get_user_model()


class AgentSession(models.Model):
    """Tracks active agent sessions and their JWTs"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='sessions')
    jti = models.CharField(max_length=255, unique=True)  # JWT ID
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['jti']),
            models.Index(fields=['agent', 'expires_at']),
        ]


class AgentRequestLog(models.Model):
    """Logs every request made by agents"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='requests')
    session = models.ForeignKey(AgentSession, on_delete=models.SET_NULL, null=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    query_params = models.JSONField(default=dict)
    headers = models.JSONField(default=dict)
    body = models.JSONField(null=True, blank=True)
    response_status = models.IntegerField()
    response_body = models.JSONField(null=True, blank=True)
    duration_ms = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent', 'created_at']),
        ]


# ──────────────────────────────────────────────
# Task 1 – Password Reset
# ──────────────────────────────────────────────

class PasswordResetToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=6, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"PasswordResetToken({self.user_id}, used={self.used})"


# ──────────────────────────────────────────────
# Task 4 – Workspace
# ──────────────────────────────────────────────

class Workspace(models.Model):
    PLAN_CHOICES = [
        ('starter', 'Starter'),
        ('growth', 'Growth'),
        ('enterprise', 'Enterprise'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_workspaces')
    members = models.ManyToManyField(
        User,
        through='WorkspaceMembership',
        through_fields=('workspace', 'user'),
        related_name='workspaces',
    )
    plan = models.CharField(max_length=50, default='starter', choices=PLAN_CHOICES)
    token_budget_monthly = models.IntegerField(default=50000)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class WorkspaceMembership(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    ]

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, default='member', choices=ROLE_CHOICES)
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_invitations',
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('workspace', 'user')]

    def __str__(self):
        return f"{self.user} in {self.workspace} as {self.role}"


class WorkspaceInvitation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    email = models.EmailField()
    role = models.CharField(max_length=50, default='member')
    token = models.CharField(max_length=64, unique=True)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    accepted = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invite({self.email} -> {self.workspace})"


# ──────────────────────────────────────────────
# Email Verification
# ──────────────────────────────────────────────

class EmailVerificationToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    email = models.EmailField()  # snapshot of email at issuance
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"EmailVerificationToken({self.user_id}, verified={self.verified_at is not None})"


# ──────────────────────────────────────────────
# User Preferences (onboarding + HITL + workspace)
# ──────────────────────────────────────────────

class UserPreferences(models.Model):
    """Per-user settings — onboarding state, HITL preferences, active workspace."""
    HITL_LEVELS = [
        ('strict', 'Strict — approve every external action'),
        ('standard', 'Standard — approve high-stakes only'),
        ('lenient', 'Lenient — log only, no blocking'),
        ('off', 'Off — fully autonomous'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences', primary_key=True)
    email_verified = models.BooleanField(default=False)
    onboarding_completed = models.BooleanField(default=False)
    onboarding_step = models.CharField(max_length=50, default='welcome')
    active_workspace = models.ForeignKey(
        'Workspace', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='active_for_users',
    )
    hitl_level = models.CharField(max_length=20, choices=HITL_LEVELS, default='standard')
    hitl_cost_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    monthly_token_budget = models.IntegerField(default=50000)
    notify_on_approval = models.BooleanField(default=True)
    notify_on_failure = models.BooleanField(default=True)
    notify_on_budget = models.BooleanField(default=True)
    notify_in_app = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"UserPreferences({self.user_id})"


# ──────────────────────────────────────────────
# Task 5 – LLM Provider Config
# ──────────────────────────────────────────────

class LLMProviderConfig(models.Model):
    PROVIDER_CHOICES = [
        ('anthropic', 'Anthropic'),
        ('openai', 'OpenAI'),
        ('gemini', 'Google Gemini'),
        ('mistral', 'Mistral'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='llm_configs')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    api_key_encrypted = models.TextField()  # Fernet-encrypted base64 blob
    model_preference = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'provider')]

    def __str__(self):
        return f"LLMProviderConfig({self.user_id}, {self.provider})"


# ──────────────────────────────────────────────
# Task 6 – Waitlist
# ──────────────────────────────────────────────

class WaitlistEntry(models.Model):
    email = models.EmailField(unique=True)
    source = models.CharField(max_length=100, default='landing')
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.email


# ──────────────────────────────────────────────
# Task 7 – Beta Invite System
# ──────────────────────────────────────────────

class BetaInviteCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    max_uses = models.IntegerField(default=1)
    use_count = models.IntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class BetaTesterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='beta_profile')
    invite_code_used = models.ForeignKey(BetaInviteCode, on_delete=models.SET_NULL, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    feedback_count = models.IntegerField(default=0)
    is_active_tester = models.BooleanField(default=True)

    def __str__(self):
        return f"BetaTesterProfile({self.user_id})"


class FeedbackEntry(models.Model):
    TYPE_CHOICES = [
        ('bug', 'Bug Report'),
        ('feature', 'Feature Request'),
        ('general', 'General Feedback'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    body = models.TextField()
    rating = models.IntegerField(null=True, blank=True)
    page = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"FeedbackEntry({self.type}, {self.title[:40]})"
