from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Account",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255)),
                ("domain", models.CharField(blank=True, default="", max_length=255)),
                ("industry", models.CharField(blank=True, default="", max_length=120)),
                ("lifecycle", models.CharField(choices=[("PROSPECT", "Prospect"), ("ACTIVE", "Active"), ("CUSTOMER", "Customer"), ("CHURNED", "Churned")], default="PROSPECT", max_length=20)),
                ("external_provider", models.CharField(blank=True, default="", max_length=50)),
                ("external_id", models.CharField(blank=True, default="", max_length=255)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ops_accounts", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["owner", "lifecycle"], name="ops_account_owner_lifecycle_idx"),
                    models.Index(fields=["external_provider", "external_id"], name="ops_account_provider_external_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="Lead",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255)),
                ("email", models.EmailField(blank=True, default="", max_length=254)),
                ("company", models.CharField(blank=True, default="", max_length=255)),
                ("source", models.CharField(blank=True, default="manual", max_length=80)),
                ("status", models.CharField(choices=[("NEW", "New"), ("CONTACTED", "Contacted"), ("QUALIFIED", "Qualified"), ("CONVERTED", "Converted"), ("LOST", "Lost")], default="NEW", max_length=20)),
                ("score", models.IntegerField(default=0)),
                ("external_provider", models.CharField(blank=True, default="", max_length=50)),
                ("external_id", models.CharField(blank=True, default="", max_length=255)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("account", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="leads", to="ops.account")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ops_leads", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["owner", "status"], name="ops_lead_owner_status_idx"),
                    models.Index(fields=["source", "status"], name="ops_lead_source_status_idx"),
                    models.Index(fields=["external_provider", "external_id"], name="ops_lead_provider_external_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="Opportunity",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=255)),
                ("stage", models.CharField(choices=[("DISCOVERY", "Discovery"), ("DEMO", "Demo"), ("PROPOSAL", "Proposal"), ("NEGOTIATION", "Negotiation"), ("WON", "Won"), ("LOST", "Lost")], default="DISCOVERY", max_length=20)),
                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("currency", models.CharField(default="USD", max_length=3)),
                ("expected_close_date", models.DateField(blank=True, null=True)),
                ("external_provider", models.CharField(blank=True, default="", max_length=50)),
                ("external_id", models.CharField(blank=True, default="", max_length=255)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("account", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="opportunities", to="ops.account")),
                ("lead", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="opportunities", to="ops.lead")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ops_opportunities", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["owner", "stage"], name="ops_opport_owner_stage_idx"),
                    models.Index(fields=["external_provider", "external_id"], name="ops_opport_provider_external_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="Ticket",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("requester_name", models.CharField(max_length=255)),
                ("requester_email", models.EmailField(blank=True, default="", max_length=254)),
                ("subject", models.CharField(max_length=255)),
                ("body", models.TextField(blank=True, default="")),
                ("channel", models.CharField(blank=True, default="internal", max_length=80)),
                ("status", models.CharField(choices=[("NEW", "New"), ("OPEN", "Open"), ("WAITING", "Waiting"), ("ESCALATED", "Escalated"), ("RESOLVED", "Resolved"), ("CLOSED", "Closed")], default="NEW", max_length=20)),
                ("priority", models.CharField(choices=[("LOW", "Low"), ("NORMAL", "Normal"), ("HIGH", "High"), ("URGENT", "Urgent")], default="NORMAL", max_length=10)),
                ("external_provider", models.CharField(blank=True, default="", max_length=50)),
                ("external_id", models.CharField(blank=True, default="", max_length=255)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("account", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="tickets", to="ops.account")),
                ("assignee", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="ops_assigned_tickets", to=settings.AUTH_USER_MODEL)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ops_tickets", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["owner", "status"], name="ops_ticket_owner_status_idx"),
                    models.Index(fields=["channel", "priority"], name="ops_ticket_channel_priority_idx"),
                    models.Index(fields=["external_provider", "external_id"], name="ops_ticket_provider_external_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="Touchpoint",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("kind", models.CharField(choices=[("EMAIL", "Email"), ("CALL", "Call"), ("MEETING", "Meeting"), ("NOTE", "Note"), ("RESPONSE", "Response")], default="NOTE", max_length=20)),
                ("direction", models.CharField(choices=[("OUTBOUND", "Outbound"), ("INBOUND", "Inbound"), ("INTERNAL", "Internal")], default="INTERNAL", max_length=20)),
                ("summary", models.CharField(max_length=255)),
                ("body", models.TextField(blank=True, default="")),
                ("external_provider", models.CharField(blank=True, default="", max_length=50)),
                ("external_id", models.CharField(blank=True, default="", max_length=255)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("account", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="touchpoints", to="ops.account")),
                ("lead", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="touchpoints", to="ops.lead")),
                ("opportunity", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="touchpoints", to="ops.opportunity")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ops_touchpoints", to=settings.AUTH_USER_MODEL)),
                ("ticket", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="touchpoints", to="ops.ticket")),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["owner", "kind", "direction"], name="ops_touch_owner_kind_dir_idx"),
                    models.Index(fields=["external_provider", "external_id"], name="ops_touch_provider_external_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="QueueItem",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("kind", models.CharField(choices=[("LEAD_SYNC", "Lead Sync"), ("OPPORTUNITY_SYNC", "Opportunity Sync"), ("TICKET_SYNC", "Ticket Sync"), ("TICKET_REPLY", "Ticket Reply"), ("TOUCHPOINT_SYNC", "Touchpoint Sync"), ("ESCALATION", "Escalation")], max_length=30)),
                ("status", models.CharField(choices=[("PENDING", "Pending"), ("PROCESSING", "Processing"), ("WAITING_BRIDGE", "Waiting for Bridge"), ("RETRYING", "Retrying"), ("COMPLETED", "Completed"), ("FAILED", "Failed")], default="PENDING", max_length=20)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("external_provider", models.CharField(blank=True, default="", max_length=50)),
                ("external_id", models.CharField(blank=True, default="", max_length=255)),
                ("attempts", models.IntegerField(default=0)),
                ("max_attempts", models.IntegerField(default=3)),
                ("next_attempt_at", models.DateTimeField(blank=True, null=True)),
                ("last_error", models.TextField(blank=True, default="")),
                ("last_result", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("lead", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="queue_items", to="ops.lead")),
                ("opportunity", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="queue_items", to="ops.opportunity")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ops_queue_items", to=settings.AUTH_USER_MODEL)),
                ("ticket", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="queue_items", to="ops.ticket")),
                ("touchpoint", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="queue_items", to="ops.touchpoint")),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["owner", "status", "kind"], name="ops_queue_owner_status_kind_idx"),
                    models.Index(fields=["status", "next_attempt_at"], name="ops_queue_status_next_idx"),
                ],
            },
        ),
        migrations.AddField(
            model_name="lead",
            name="converted_opportunity",
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="origin_lead", to="ops.opportunity"),
        ),
    ]
