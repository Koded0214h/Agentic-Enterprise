"""
Celery application for the AOS backend.

This module is what `celery -A backend worker` and `celery -A backend beat`
(see docker-compose.prod.yml) load. Without it those containers exit
immediately and every @shared_task — billing budget resets, knowledge_base
ingestion, agent_intelligence, ops_core queue processing — silently never runs.

All configuration is read from Django settings under the CELERY_ namespace
(CELERY_BROKER_URL, CELERY_RESULT_BACKEND, CELERY_BEAT_SCHEDULE, ...).
"""
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")

# Load CELERY_* settings from Django settings (e.g. CELERY_BROKER_URL -> broker_url).
app.config_from_object("django.conf:settings", namespace="CELERY")

# Discover tasks.py in every installed app.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Trivial task for verifying the worker is alive: `debug_task.delay()`."""
    print(f"Request: {self.request!r}")
