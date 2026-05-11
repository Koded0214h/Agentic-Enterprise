#!/usr/bin/env python3
"""
Scheduler MCP Server

Exposes the swarm cron scheduler as MCP tools. Any agent can create,
list, update, and delete scheduled jobs through this server.

Configure in swarm.config.json:
  "mcpServers": {
    "scheduler": {
      "command": "python",
      "args": ["mcp_servers/scheduler_server.py"]
    }
  }

Jobs are stored in ~/.swarm/scheduler/jobs.json and persist across restarts.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("ERROR: mcp package not installed. Run: pip install mcp", file=sys.stderr)
    sys.exit(1)

from tools.scheduler.cron import (
    create_job, list_jobs, get_job, update_job, delete_job,
    pause_job, resume_job, run_job_now, get_scheduler_status,
)

mcp = FastMCP("scheduler")


@mcp.tool()
def scheduler_create_job(name: str, schedule: str, agent: str, task: str,
                          engine: str = "claude", enabled: bool = True) -> dict:
    """
    Create a new scheduled autonomous job.

    name:     Human-readable job name, e.g. "Daily Twitter post"
    schedule: 5-field cron expression (min hour dom month dow).
              Common examples:
                '0 9 * * 1-5'   — 9am every weekday
                '0 */4 * * *'   — every 4 hours
                '30 8 * * *'    — 8:30am every day
                '0 0 1 * *'     — midnight on the 1st of each month
    agent:    Swarm agent name, e.g. 'marketing-social-media-strategist'
    task:     The task prompt the agent will receive when the job fires.
    engine:   LLM engine: claude | gemini | codex (default: claude)
    enabled:  Whether the job starts in an enabled state (default: true)
    """
    return create_job(name, schedule, agent, task, engine, enabled).to_dict()


@mcp.tool()
def scheduler_list_jobs() -> dict:
    """List all scheduled jobs with their status and next run time."""
    return list_jobs().to_dict()


@mcp.tool()
def scheduler_get_job(job_id: str) -> dict:
    """Get details of a specific job by its UUID."""
    return get_job(job_id).to_dict()


@mcp.tool()
def scheduler_update_job(job_id: str, updates: str) -> dict:
    """
    Update a job's fields.

    updates: JSON object with fields to change.
    Updatable fields: name, schedule, task, enabled, agent, engine.
    Example: '{"schedule": "0 10 * * *", "task": "Updated task prompt"}'
    """
    return update_job(job_id, **json.loads(updates)).to_dict()


@mcp.tool()
def scheduler_delete_job(job_id: str) -> dict:
    """Permanently delete a scheduled job."""
    return delete_job(job_id).to_dict()


@mcp.tool()
def scheduler_pause_job(job_id: str) -> dict:
    """Pause a job (disable without deleting)."""
    return pause_job(job_id).to_dict()


@mcp.tool()
def scheduler_resume_job(job_id: str) -> dict:
    """Resume a paused job."""
    return resume_job(job_id).to_dict()


@mcp.tool()
def scheduler_run_now(job_id: str) -> dict:
    """Trigger a job immediately, ignoring its schedule."""
    return run_job_now(job_id).to_dict()


@mcp.tool()
def scheduler_status() -> dict:
    """Get scheduler status: is it running, how many jobs, what's coming up next."""
    return {"ok": True, "data": get_scheduler_status()}


if __name__ == "__main__":
    mcp.run(transport="stdio")
