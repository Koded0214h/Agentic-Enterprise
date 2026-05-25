# Generated manually to persist native swarm run state.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("swarm_bridge", "0002_swarmexecutioncontext_status_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="swarmexecutioncontext",
            name="run_lines",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text="Durable line buffer for native run streaming and replay",
            ),
        ),
        migrations.AddField(
            model_name="swarmexecutioncontext",
            name="run_exit_code",
            field=models.IntegerField(
                blank=True,
                help_text="Exit code for native runs, if applicable",
                null=True,
            ),
        ),
    ]
