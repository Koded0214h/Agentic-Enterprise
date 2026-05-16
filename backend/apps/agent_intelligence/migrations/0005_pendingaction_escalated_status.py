from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('agent_intelligence', '0004_alter_conversation_status_pendingaction'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pendingaction',
            name='status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending'),
                    ('APPROVED', 'Approved'),
                    ('DENIED', 'Denied'),
                    ('EXPIRED', 'Expired'),
                    ('ESCALATED', 'Escalated'),
                ],
                default='PENDING',
                max_length=20,
            ),
        ),
    ]
