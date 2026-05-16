"""
AOS Native Runtime — Job Queue

AgentJob is the structured data contract between the control plane and
execution workers. Jobs are serialised to JSON and published to Celery.

Queue names:
  agent.execute.critical  — HITL-approved actions (priority 10)
  agent.execute.standard  — normal tasks (priority 5)
  agent.execute.batch     — background / non-urgent (priority 1)

Celery setup: connects to the same Redis broker as the Django backend.
Run the worker: celery -A runtime.jobs worker --loglevel=info
"""
from __future__ import annotations

import asyncio
import os
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone

BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Lazy Celery app — only initialised if celery is installed.
_celery = None


def _get_celery():
    global _celery
    if _celery is not None:
        return _celery
    try:
        from celery import Celery
    except ImportError:
        return None

    app = Celery("aos_runtime", broker=BROKER_URL, backend=RESULT_BACKEND)
    app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_acks_late=True,           # ack after completion, not before (safe retry)
        worker_prefetch_multiplier=1,  # one job at a time per worker process
        task_routes={
            "runtime.jobs.execute_agent_job": {
                "queue": "agent.execute.standard",
            },
        },
        task_queues={},
    )
    _celery = app
    return app


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class RetryPolicy:
    max_retries: int = 3
    backoff_seconds: int = 5         # base; multiplied by attempt number
    retry_on: list[str] = field(default_factory=lambda: ["timeout", "rate_limit", "transient"])

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "RetryPolicy":
        return cls(**d)


@dataclass
class AgentJob:
    job_id: str
    execution_id: str
    agent_id: str                   # swarm agent name, e.g. "sales-account-strategist"
    agent_category: str             # e.g. "sales" — used for provider routing
    task: str
    system_prompt: str
    tools: list[str]                # allowed tool names
    permissions: list[str]          # agent's permission list
    policy_context: dict            # result from pre-flight AOS policy check
    priority: int = 5               # 0–10
    timeout_seconds: int = 1800
    retry_policy: RetryPolicy = field(default_factory=RetryPolicy)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    department_id: str = ""
    workspace_dir: str = "."

    def to_dict(self) -> dict:
        d = asdict(self)
        return d

    @classmethod
    def from_dict(cls, d: dict) -> "AgentJob":
        d = dict(d)
        d["retry_policy"] = RetryPolicy.from_dict(d.get("retry_policy", {}))
        return cls(**d)

    @property
    def queue_name(self) -> str:
        if self.priority >= 8:
            return "agent.execute.critical"
        if self.priority <= 2:
            return "agent.execute.batch"
        return "agent.execute.standard"


# ---------------------------------------------------------------------------
# Celery task
# ---------------------------------------------------------------------------

def register_tasks(app):
    """Register Celery tasks on the app. Called lazily so the module can be
    imported without Celery installed (falls back to direct async execution)."""

    @app.task(
        bind=True,
        name="runtime.jobs.execute_agent_job",
        max_retries=3,
        acks_late=True,
    )
    def execute_agent_job(self, job_dict: dict) -> dict:
        """Celery task that wraps the async NativeAgentWorker."""
        from .worker import NativeAgentWorker

        job = AgentJob.from_dict(job_dict)
        worker = NativeAgentWorker.from_job(job)
        try:
            result = asyncio.run(worker.run(job))
            return result.to_dict()
        except Exception as exc:
            retry_in = job.retry_policy.backoff_seconds * (self.request.retries + 1)
            raise self.retry(exc=exc, countdown=retry_in)

    return execute_agent_job


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def enqueue(job: AgentJob) -> str:
    """
    Publish a job to the Celery queue.
    Returns the Celery task ID, or "direct" if Celery is not available
    (falls back to synchronous in-process execution).
    """
    app = _get_celery()
    if app is None:
        _run_directly(job)
        return "direct"

    task_fn = register_tasks(app)
    result = task_fn.apply_async(
        args=[job.to_dict()],
        queue=job.queue_name,
        priority=job.priority,
        task_id=job.job_id,
    )
    return result.id


def _run_directly(job: AgentJob) -> None:
    """Fallback: run inline when Celery/Redis is not available."""
    from .worker import NativeAgentWorker
    worker = NativeAgentWorker.from_job(job)
    asyncio.run(worker.run(job))
