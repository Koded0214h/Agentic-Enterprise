"""
Swarm Scheduler — persistent cron-job system for autonomous agent tasks.

Stores jobs in a JSON file (~/.swarm/scheduler/jobs.json) so they survive
restarts. Runs them in a background thread. No external dependencies beyond
the standard library.

Each job definition:
  {
    "id": "uuid",
    "name": "Post daily Twitter report",
    "schedule": "0 9 * * *",          # cron expression (5-field)
    "agent": "marketing-social-media-strategist",
    "task": "Write and post today's Twitter thread about AI trends",
    "engine": "claude",
    "enabled": true,
    "last_run": null,
    "next_run": "2025-01-01T09:00:00",
    "run_count": 0,
    "created_at": "2024-12-31T10:00:00"
  }

Cron expression support: standard 5-field (min hour dom month dow).
Wildcards (*), lists (1,3,5), ranges (9-17), step values (*/2) all work.
"""
from __future__ import annotations

import json
import os
import threading
import time
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, Callable

from tools.base import ToolResult

_SWARM_HOME = Path(os.environ.get("SWARM_HOME", Path.home() / ".swarm"))
_JOBS_FILE = _SWARM_HOME / "scheduler" / "jobs.json"
_jobs_lock = threading.Lock()
_scheduler_thread: Optional[threading.Thread] = None
_on_trigger: Optional[Callable[[dict], None]] = None  # set by the scheduler runner


# ─────────────────────────────────────────────────────────────────────────────
# Persistence
# ─────────────────────────────────────────────────────────────────────────────

def _load_jobs() -> list[dict]:
    _JOBS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not _JOBS_FILE.exists():
        return []
    try:
        return json.loads(_JOBS_FILE.read_text())
    except Exception:
        return []


def _save_jobs(jobs: list[dict]) -> None:
    _JOBS_FILE.parent.mkdir(parents=True, exist_ok=True)
    _JOBS_FILE.write_text(json.dumps(jobs, indent=2, default=str))


# ─────────────────────────────────────────────────────────────────────────────
# Cron expression parser
# ─────────────────────────────────────────────────────────────────────────────

def _parse_field(field: str, lo: int, hi: int) -> set[int]:
    """Parse a single cron field into a set of matching integers."""
    if field == "*":
        return set(range(lo, hi + 1))
    result: set[int] = set()
    for part in field.split(","):
        if "/" in part:
            base, step = part.split("/", 1)
            step = int(step)
            start, end = (lo, hi) if base == "*" else (int(base), hi)
            result.update(range(start, end + 1, step))
        elif "-" in part:
            start_s, end_s = part.split("-", 1)
            result.update(range(int(start_s), int(end_s) + 1))
        else:
            result.add(int(part))
    return result


def _cron_matches(expr: str, dt: datetime) -> bool:
    """Return True if a cron expression matches the given datetime."""
    parts = expr.strip().split()
    if len(parts) != 5:
        return False
    try:
        mins = _parse_field(parts[0], 0, 59)
        hours = _parse_field(parts[1], 0, 23)
        doms = _parse_field(parts[2], 1, 31)
        months = _parse_field(parts[3], 1, 12)
        dows = _parse_field(parts[4], 0, 6)  # 0=Sunday
    except (ValueError, IndexError):
        return False
    return (
        dt.minute in mins and
        dt.hour in hours and
        dt.day in doms and
        dt.month in months and
        dt.weekday() % 7 in {(d % 7) for d in dows}
    )


def _next_run_after(expr: str, after: datetime) -> Optional[datetime]:
    """
    Calculate the next datetime (minute precision) when expr matches,
    starting from the minute after 'after'.
    Scans up to 1 year ahead before giving up.
    """
    candidate = after.replace(second=0, microsecond=0)
    # advance one minute
    candidate = candidate.replace(minute=candidate.minute)
    from datetime import timedelta
    candidate += timedelta(minutes=1)
    limit = after + timedelta(days=366)
    while candidate <= limit:
        if _cron_matches(expr, candidate):
            return candidate
        candidate += timedelta(minutes=1)
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def create_job(name: str, schedule: str, agent: str, task: str,
               engine: str = "claude", enabled: bool = True,
               max_retries: int = 3, retry_delay_minutes: int = 5) -> ToolResult:
    """
    Create a new scheduled job.

    schedule: 5-field cron expression, e.g. '0 9 * * 1-5' (9am weekdays)
    agent:    swarm agent name to run, e.g. 'marketing-social-media-strategist'
    task:     the task prompt to send to the agent
    """
    now = datetime.now(timezone.utc)
    next_run = _next_run_after(schedule, now)
    if next_run is None:
        return ToolResult(ok=False, error=f"Could not calculate next run for schedule: '{schedule}'")

    job = {
        "id": str(uuid.uuid4()),
        "name": name,
        "schedule": schedule,
        "agent": agent,
        "task": task,
        "engine": engine,
        "enabled": enabled,
        "last_run": None,
        "next_run": next_run.isoformat(),
        "run_count": 0,
        "retry_count": 0,
        "max_retries": int(max_retries),
        "retry_delay_minutes": int(retry_delay_minutes),
        "last_status": "scheduled",
        "last_error": "",
        "created_at": now.isoformat(),
    }

    with _jobs_lock:
        jobs = _load_jobs()
        jobs.append(job)
        _save_jobs(jobs)

    return ToolResult(ok=True, data=job)


def list_jobs() -> ToolResult:
    """Return all scheduled jobs."""
    with _jobs_lock:
        return ToolResult(ok=True, data=_load_jobs())


def get_job(job_id: str) -> ToolResult:
    """Get a specific job by ID."""
    with _jobs_lock:
        for job in _load_jobs():
            if job["id"] == job_id:
                return ToolResult(ok=True, data=job)
    return ToolResult(ok=False, error=f"Job {job_id} not found")


def update_job(job_id: str, **updates) -> ToolResult:
    """Update a job's fields (name, schedule, task, enabled, agent, engine)."""
    allowed = {"name", "schedule", "task", "enabled", "agent", "engine", "max_retries", "retry_delay_minutes"}
    bad = set(updates) - allowed
    if bad:
        return ToolResult(ok=False, error=f"Cannot update fields: {bad}")

    with _jobs_lock:
        jobs = _load_jobs()
        for job in jobs:
            if job["id"] == job_id:
                job.update({k: v for k, v in updates.items() if k in allowed})
                if "schedule" in updates:
                    next_run = _next_run_after(updates["schedule"], datetime.now(timezone.utc))
                    job["next_run"] = next_run.isoformat() if next_run else None
                _save_jobs(jobs)
                return ToolResult(ok=True, data=job)
    return ToolResult(ok=False, error=f"Job {job_id} not found")


def delete_job(job_id: str) -> ToolResult:
    """Delete a scheduled job."""
    with _jobs_lock:
        jobs = _load_jobs()
        original = len(jobs)
        jobs = [j for j in jobs if j["id"] != job_id]
        if len(jobs) == original:
            return ToolResult(ok=False, error=f"Job {job_id} not found")
        _save_jobs(jobs)
    return ToolResult(ok=True, data={"deleted": job_id})


def pause_job(job_id: str) -> ToolResult:
    """Disable a job without deleting it."""
    return update_job(job_id, enabled=False)


def resume_job(job_id: str) -> ToolResult:
    """Re-enable a paused job."""
    return update_job(job_id, enabled=True)


def run_job_now(job_id: str) -> ToolResult:
    """Manually trigger a job immediately (ignores schedule)."""
    result = get_job(job_id)
    if not result.ok:
        return result
    job = result.data
    if _on_trigger:
        try:
            _on_trigger(job)
            return ToolResult(ok=True, data={"triggered": job_id})
        except Exception as exc:
            return ToolResult(ok=False, error=str(exc))
    return ToolResult(ok=False, error="Scheduler not running — call start_scheduler() first")


# ─────────────────────────────────────────────────────────────────────────────
# Scheduler background thread
# ─────────────────────────────────────────────────────────────────────────────

def start_scheduler(trigger_fn: Callable[[dict], None],
                    tick_seconds: int = 60) -> None:
    """
    Start the background scheduler thread.

    trigger_fn: called with a job dict whenever a job fires.
                In production, this calls the swarm orchestrator to run the agent.
    tick_seconds: how often to check the clock (default: every 60s / once per minute).
    """
    global _scheduler_thread, _on_trigger
    _on_trigger = trigger_fn

    if _scheduler_thread and _scheduler_thread.is_alive():
        return  # already running

    def _loop():
        while True:
            now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
            with _jobs_lock:
                jobs = _load_jobs()
                changed = False
                for job in jobs:
                    if not job.get("enabled"):
                        continue
                    if not job.get("next_run"):
                        continue
                    next_run = datetime.fromisoformat(job["next_run"])
                    if now >= next_run:
                        # Fire the job
                        try:
                            trigger_fn(job)
                            job["last_status"] = "success"
                            job["last_error"] = ""
                            job["retry_count"] = 0
                            job["run_count"] = job.get("run_count", 0) + 1
                            job["last_run"] = now.isoformat()
                            next_nxt = _next_run_after(job["schedule"], now)
                            job["next_run"] = next_nxt.isoformat() if next_nxt else None
                        except Exception as exc:
                            job["last_error"] = str(exc)
                            job["run_count"] = job.get("run_count", 0) + 1
                            retry_count = int(job.get("retry_count", 0))
                            max_retries = int(job.get("max_retries", 3))
                            retry_delay_minutes = int(job.get("retry_delay_minutes", 5))
                            if retry_count < max_retries:
                                retry_count += 1
                                job["retry_count"] = retry_count
                                job["last_status"] = "retrying"
                                job["next_run"] = (now + timedelta(minutes=retry_delay_minutes * retry_count)).isoformat()
                            else:
                                print(f"[scheduler] Job '{job['name']}' failed: {exc}")
                                job["last_status"] = "failed"
                                job["retry_count"] = 0
                                next_nxt = _next_run_after(job["schedule"], now)
                                job["next_run"] = next_nxt.isoformat() if next_nxt else None
                        else:
                            job["run_count"] = job.get("run_count", 0) + 1
                        changed = True
                if changed:
                    _save_jobs(jobs)
            time.sleep(tick_seconds)

    _scheduler_thread = threading.Thread(target=_loop, daemon=True, name="swarm-scheduler")
    _scheduler_thread.start()


def get_scheduler_status() -> dict:
    """Return the scheduler status and upcoming job summary."""
    running = bool(_scheduler_thread and _scheduler_thread.is_alive())
    with _jobs_lock:
        jobs = _load_jobs()
    upcoming = sorted(
        [j for j in jobs if j.get("enabled") and j.get("next_run")],
        key=lambda j: j["next_run"],
    )[:5]
    return {
        "running": running,
        "total_jobs": len(jobs),
        "enabled_jobs": sum(1 for j in jobs if j.get("enabled")),
        "upcoming": [{
            "id": j["id"],
            "name": j["name"],
            "agent": j["agent"],
            "next_run": j["next_run"],
        } for j in upcoming],
    }
