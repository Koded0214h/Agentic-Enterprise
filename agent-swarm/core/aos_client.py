"""
AOS Bridge Client

Thin HTTP client connecting agent-swarm to the AOS control plane.
All methods are silent no-ops when AOS_BASE_URL / AOS_TOKEN are not set,
so the swarm runs fine in environments without AOS.

Environment variables:
  AOS_BASE_URL   — e.g. http://localhost:8000  (no trailing slash)
  AOS_TOKEN      — JWT or API token for AOS auth
  AOS_ENV        — dev | staging | prod  (default: dev)
"""

import json
import os
import time
import uuid
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional

_BASE_URL = os.environ.get("AOS_BASE_URL", "").rstrip("/")
_TOKEN = os.environ.get("AOS_TOKEN", "")
_ENV = os.environ.get("AOS_ENV", "dev")

ENABLED = bool(_BASE_URL and _TOKEN)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _headers() -> dict:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {_TOKEN}",
    }


def _post(path: str, body: dict) -> Optional[dict]:
    if not ENABLED:
        return None
    url = f"{_BASE_URL}{path}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        body_text = exc.read().decode(errors="replace")
        print(f"  [AOS] POST {path} → HTTP {exc.code}: {body_text[:200]}")
        return None
    except Exception as exc:
        print(f"  [AOS] POST {path} error: {exc}")
        return None


def _get(path: str, params: dict) -> Optional[dict]:
    if not ENABLED:
        return None
    url = f"{_BASE_URL}{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=_headers(), method="GET")
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception as exc:
        print(f"  [AOS] GET {path} error: {exc}")
        return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def new_execution_id() -> str:
    """Generate a fresh execution UUID."""
    return str(uuid.uuid4())


_MAX_THROTTLE_RETRIES = 3


def policy_check(
    execution_id: str,
    agent_name: str,
    task: str,
    engine: str = "claude",
    workflow_phase: Optional[str] = None,
    context: Optional[dict] = None,
    _retries: int = 0,
) -> dict:
    """
    Pre-execution policy gate.

    Returns the AOS response dict, or {"decision": "allow"} when AOS is
    disabled or unreachable (fail-open — the swarm must not block on AOS).

    On a "throttle" decision AOS returns retry_after_seconds. This function
    sleeps for that duration and retries up to _MAX_THROTTLE_RETRIES times
    before converting the throttle into a hard deny.
    """
    if not ENABLED:
        return {"decision": "allow"}

    body: dict = {
        "execution_id": execution_id,
        "agent_name": agent_name,
        "task": task[:2000],
        "engine": engine,
        "environment": _ENV,
        "context": context or {},
    }
    if workflow_phase:
        body["workflow_phase"] = workflow_phase

    result = _post("/api/swarm/policy/check/", body)
    if result is None:
        print("  [AOS] Policy check unreachable — proceeding (fail-open)")
        return {"decision": "allow"}

    decision = result.get("decision", "allow")
    reason = result.get("reason", "")

    if decision == "throttle":
        retry_after = int(result.get("retry_after_seconds", 30))
        if _retries < _MAX_THROTTLE_RETRIES:
            print(
                f"  [AOS] Throttled — retrying in {retry_after}s "
                f"(attempt {_retries + 1}/{_MAX_THROTTLE_RETRIES})"
            )
            time.sleep(retry_after)
            return policy_check(
                execution_id, agent_name, task, engine,
                workflow_phase, context, _retries=_retries + 1,
            )
        print("  [AOS] Throttle max retries exceeded — converting to deny")
        return {"decision": "deny", "reason": "Throttle max retries exceeded"}

    if decision != "allow":
        print(f"  [AOS] Policy decision: {decision.upper()} — {reason}")
    return result


def usage_report(
    execution_id: str,
    agent_name: str,
    engine: str,
    duration_ms: int = 0,
    tokens_input: int = 0,
    tokens_output: int = 0,
    cost_usd: float = 0.0,
    success: bool = True,
    error_message: str = "",
) -> Optional[dict]:
    """Post-execution usage metering. Fire-and-forget."""
    if not ENABLED:
        return None

    body = {
        "execution_id": execution_id,
        "agent_name": agent_name,
        "engine": engine,
        "tokens_input": tokens_input,
        "tokens_output": tokens_output,
        "cost_usd": f"{cost_usd:.6f}",
        "duration_ms": duration_ms,
        "success": success,
        "error_message": error_message[:500] if error_message else "",
    }
    return _post("/api/swarm/usage/report/", body)


def emit_trace(
    execution_id: str,
    agent_name: str,
    phase: str,
    event_type: str,
    payload: Optional[dict] = None,
) -> Optional[dict]:
    """Emit a workflow trace event to AOS."""
    if not ENABLED:
        return None

    body = {
        "execution_id": execution_id,
        "agent_name": agent_name,
        "phase": phase,
        "event_type": event_type,
        "payload": payload or {},
    }
    return _post("/api/swarm/traces/", body)


def kb_query(
    query: str,
    agent_name: str = "",
    top_k: int = 5,
) -> list:
    """
    Query the AOS knowledge base for context relevant to the task.
    Returns a list of result dicts, or [] when AOS is disabled.
    """
    if not ENABLED:
        return []

    result = _get("/api/swarm/kb/query/", {"q": query, "agent": agent_name, "top_k": top_k})
    if result is None:
        return []
    return result.get("results", [])
