# Hand-written migration for:
#   PasswordResetToken, Workspace, WorkspaceMembership, WorkspaceInvitation,
#   LLMProviderConfig, WaitlistEntry,
#   BetaInviteCode, BetaTesterProfile, FeedbackEntry

import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('agent_gateway', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [

        # ── PasswordResetToken ───────────────────────────────────────────────
        migrations.CreateModel(
            name='PasswordResetToken',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('token', models.CharField(db_index=True, max_length=6)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('used', models.BooleanField(default=False)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='password_reset_tokens',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),

        # ── Workspace ────────────────────────────────────────────────────────
        migrations.CreateModel(
            name='Workspace',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('slug', models.SlugField(unique=True)),
                ('plan', models.CharField(
                    choices=[('starter', 'Starter'), ('growth', 'Growth'), ('enterprise', 'Enterprise')],
                    default='starter',
                    max_length=50,
                )),
                ('token_budget_monthly', models.IntegerField(default=50000)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('owner', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='owned_workspaces',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),

        # ── WorkspaceMembership ──────────────────────────────────────────────
        migrations.CreateModel(
            name='WorkspaceMembership',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(
                    choices=[('owner', 'Owner'), ('admin', 'Admin'), ('member', 'Member'), ('viewer', 'Viewer')],
                    default='member',
                    max_length=50,
                )),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('workspace', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to='agent_gateway.workspace',
                )),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to=settings.AUTH_USER_MODEL,
                )),
                ('invited_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='sent_invitations',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'unique_together': {('workspace', 'user')},
            },
        ),

        # Add M2M through field to Workspace after WorkspaceMembership exists
        migrations.AddField(
            model_name='workspace',
            name='members',
            field=models.ManyToManyField(
                related_name='workspaces',
                through='agent_gateway.WorkspaceMembership',
                through_fields=('workspace', 'user'),
                to=settings.AUTH_USER_MODEL,
            ),
        ),

        # ── WorkspaceInvitation ──────────────────────────────────────────────
        migrations.CreateModel(
            name='WorkspaceInvitation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField()),
                ('role', models.CharField(default='member', max_length=50)),
                ('token', models.CharField(max_length=64, unique=True)),
                ('accepted', models.BooleanField(default=False)),
                ('expires_at', models.DateTimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('workspace', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to='agent_gateway.workspace',
                )),
                ('invited_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),

        # ── LLMProviderConfig ────────────────────────────────────────────────
        migrations.CreateModel(
            name='LLMProviderConfig',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('provider', models.CharField(
                    choices=[
                        ('anthropic', 'Anthropic'),
                        ('openai', 'OpenAI'),
                        ('gemini', 'Google Gemini'),
                        ('mistral', 'Mistral'),
                    ],
                    max_length=50,
                )),
                ('api_key_encrypted', models.TextField()),
                ('model_preference', models.CharField(blank=True, max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='llm_configs',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'unique_together': {('user', 'provider')},
            },
        ),

        # ── WaitlistEntry ────────────────────────────────────────────────────
        migrations.CreateModel(
            name='WaitlistEntry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(unique=True)),
                ('source', models.CharField(default='landing', max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('notes', models.TextField(blank=True)),
            ],
        ),

        # ── BetaInviteCode ───────────────────────────────────────────────────
        migrations.CreateModel(
            name='BetaInviteCode',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=20, unique=True)),
                ('max_uses', models.IntegerField(default=1)),
                ('use_count', models.IntegerField(default=0)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),

        # ── BetaTesterProfile ────────────────────────────────────────────────
        migrations.CreateModel(
            name='BetaTesterProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('feedback_count', models.IntegerField(default=0)),
                ('is_active_tester', models.BooleanField(default=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='beta_profile',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('invite_code_used', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to='agent_gateway.betainvitecode',
                )),
            ],
        ),

        # ── FeedbackEntry ────────────────────────────────────────────────────
        migrations.CreateModel(
            name='FeedbackEntry',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('type', models.CharField(
                    choices=[
                        ('bug', 'Bug Report'),
                        ('feature', 'Feature Request'),
                        ('general', 'General Feedback'),
                    ],
                    max_length=50,
                )),
                ('title', models.CharField(max_length=200)),
                ('body', models.TextField()),
                ('rating', models.IntegerField(blank=True, null=True)),
                ('page', models.CharField(blank=True, max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
    ]
