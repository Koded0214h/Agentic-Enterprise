import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('type', models.CharField(
                    choices=[
                        ('approval_request', 'Approval Request'),
                        ('approval_resolved', 'Approval Resolved'),
                        ('budget_alert', 'Budget Alert'),
                        ('workflow_complete', 'Workflow Complete'),
                        ('workflow_failed', 'Workflow Failed'),
                        ('system', 'System'),
                    ],
                    default='system',
                    max_length=30,
                )),
                ('title', models.CharField(max_length=255)),
                ('body', models.TextField()),
                ('link', models.CharField(blank=True, default='', max_length=500)),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('recipient', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='notifications',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
