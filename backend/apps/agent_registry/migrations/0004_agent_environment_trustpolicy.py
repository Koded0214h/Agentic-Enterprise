import uuid
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("agent_registry", "0003_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="agent",
            name="environment",
            field=models.CharField(
                choices=[("dev", "Development"), ("staging", "Staging"), ("prod", "Production")],
                default="dev",
                help_text="Deployment environment this agent is scoped to",
                max_length=10,
            ),
        ),
        migrations.CreateModel(
            name="AgentTrustPolicy",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("allowed", models.BooleanField(default=True)),
                ("reason", models.TextField(blank=True, help_text="Why this trust relationship exists or was denied")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "source_agent",
                    models.ForeignKey(
                        help_text="The agent initiating the call",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="outgoing_trust_policies",
                        to="agent_registry.agent",
                    ),
                ),
                (
                    "target_agent",
                    models.ForeignKey(
                        help_text="The agent being called",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="incoming_trust_policies",
                        to="agent_registry.agent",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddConstraint(
            model_name="agenttrustpolicy",
            constraint=models.UniqueConstraint(
                fields=["source_agent", "target_agent"],
                name="unique_trust_pair",
            ),
        ),
    ]
