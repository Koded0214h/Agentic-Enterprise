"""
AOS Server-Side Analytics

A thin tracker that forwards events to PostHog or Mixpanel if configured.
Used for: user_signed_up, agent_executed, workflow_completed, hitl_approved,
budget_warning, beta_feedback_submitted, etc.

Env vars:
    POSTHOG_API_KEY   — PostHog project API key
    POSTHOG_HOST      — defaults to https://app.posthog.com (or self-hosted)
    MIXPANEL_TOKEN    — Mixpanel project token
    SENTRY_DSN        — Sentry DSN for error tracking (initialized separately)

If none are set, calls are no-ops (so business logic isn't affected).
"""
from __future__ import annotations

import base64
import json
import os
import threading
import urllib.request
from typing import Any


_posthog_lock = threading.Lock()


def _posthog_send(event: str, distinct_id: str, properties: dict[str, Any]) -> bool:
    api_key = os.environ.get("POSTHOG_API_KEY")
    if not api_key:
        return False
    host = os.environ.get("POSTHOG_HOST", "https://app.posthog.com").rstrip("/")

    try:
        payload = {
            "api_key": api_key,
            "event": event,
            "distinct_id": distinct_id,
            "properties": {
                **properties,
                "$lib": "aos-backend",
                "$lib_version": "1.0.0-beta",
            },
        }
        req = urllib.request.Request(
            f"{host}/capture/",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with _posthog_lock:
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.status < 400
    except Exception as exc:
        print(f"[analytics] PostHog error: {exc}")
        return False


def _mixpanel_send(event: str, distinct_id: str, properties: dict[str, Any]) -> bool:
    token = os.environ.get("MIXPANEL_TOKEN")
    if not token:
        return False
    try:
        payload = {
            "event": event,
            "properties": {
                "token": token,
                "distinct_id": distinct_id,
                **properties,
            },
        }
        encoded = base64.b64encode(json.dumps(payload).encode()).decode()
        req = urllib.request.Request(
            f"https://api.mixpanel.com/track?data={encoded}",
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status < 400
    except Exception as exc:
        print(f"[analytics] Mixpanel error: {exc}")
        return False


def track(event: str, distinct_id: str = "anonymous", properties: dict | None = None) -> None:
    """Fire an analytics event to whichever provider is configured."""
    props = properties or {}
    if not _posthog_send(event, distinct_id, props):
        _mixpanel_send(event, distinct_id, props)


def identify(distinct_id: str, properties: dict | None = None) -> None:
    """Update user properties in the analytics provider."""
    props = properties or {}
    api_key = os.environ.get("POSTHOG_API_KEY")
    if api_key:
        host = os.environ.get("POSTHOG_HOST", "https://app.posthog.com").rstrip("/")
        try:
            req = urllib.request.Request(
                f"{host}/capture/",
                data=json.dumps({
                    "api_key": api_key,
                    "event": "$identify",
                    "distinct_id": distinct_id,
                    "properties": {"$set": props},
                }).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with _posthog_lock:
                urllib.request.urlopen(req, timeout=5)
        except Exception:
            pass
