import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds the workspace scoping foreign key to Policy.
    The Workspace model itself lives in apps.agent_gateway — single source
    of truth — so this migration only depends on that app having created it.
    """

    dependencies = [
        ('policy_engine', '0001_initial'),
        ('agent_gateway', '0002_add_auth_workspace_llm_beta_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='policy',
            name='workspace',
            field=models.ForeignKey(
                blank=True,
                help_text='If set, policy applies only to this workspace. Null = global.',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='policies',
                to='agent_gateway.workspace',
            ),
        ),
    ]
