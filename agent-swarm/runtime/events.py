"""
AOS Native Runtime — Event System

Typed event bus. Every meaningful thing that happens in the native
execution runtime emits an AOSEvent. Consumers (billing, audit log,
dashboard, Prometheus) subscribe to specific event types.

Events are:
  1. Fan-out in-process to registered listeners (sync + async)
  2. Forwarded to the AOS bridge via aos_client.emit_trace()
"""
from __future__ import annotations

import asyncio
import json
import os
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable, Awaitable
import uuid

# ---------------------------------------------------------------------------
# Redis publisher (opt-in — only active when REDIS_URL is set)
# ---------------------------------------------------------------------------

_REDIS_URL = os.environ.get("REDIS_URL", os.environ.get("CELERY_BROKER_URL", ""))
_redis_client = None


def _get_redis():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    if not _REDIS_URL:
        return None
    try:
        import redis
        _redis_client = redis.from_url(_REDIS_URL, decode_responses=True)
        return _redis_client
    except Exception:
        return None


def _redis_publish(event: "AOSEvent") -> None:
    r = _get_redis()
    if r is None:
        return
    try:
        channel = f"aos:events:{event.execution_id}"
        r.publish(channel, json.dumps(event.to_dict()))
        # Also publish to a global stream so the dashboard can show all live events
        r.publish("aos:events:*", json.dumps(event.to_dict()))
    except Exception:
        pass


class EventType:
    # Task lifecycle
    TASK_STARTED        = "task.started"
    TASK_COMPLETED      = "task.completed"
    TASK_FAILED         = "task.failed"

    # Agent lifecycle
    AGENT_DISPATCHED    = "agent.dispatched"
    AGENT_STARTED       = "agent.started"
    AGENT_COMPLETED     = "agent.completed"
    AGENT_FAILED        = "agent.failed"

    # LLM
    LLM_REQUEST         = "llm.request"
    LLM_RESPONSE        = "llm.response"
    LLM_STREAM_CHUNK    = "llm.stream_chunk"

    # Tools
    TOOL_CALLED         = "tool.called"
    TOOL_COMPLETED      = "tool.completed"
    TOOL_FAILED         = "tool.failed"
    TOOL_RETRIED        = "tool.retried"

    # Governance
    POLICY_CHECKED      = "policy.checked"
    POLICY_DENIED       = "policy.denied"
    HITL_RAISED         = "hitl.raised"
    HITL_APPROVED       = "hitl.approved"
    HITL_REJECTED       = "hitl.rejected"

    # Memory
    MEMORY_LOADED       = "memory.loaded"
    MEMORY_STORED       = "memory.stored"

    # Self-healing
    RECOVERY_TRIGGERED  = "recovery.triggered"
    RECOVERY_STRATEGY   = "recovery.strategy"


@dataclass
class AOSEvent:
    event_type: str
    execution_id: str
    agent_id: str
    payload: dict = field(default_factory=dict)
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    duration_ms: int | None = None
    risk_score: int | None = None
    department_id: str = ""

    def to_dict(self) -> dict:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "execution_id": self.execution_id,
            "agent_id": self.agent_id,
            "payload": self.payload,
            "timestamp": self.timestamp.isoformat(),
            "duration_ms": self.duration_ms,
            "risk_score": self.risk_score,
            "department_id": self.department_id,
        }


SyncListener = Callable[[AOSEvent], None]
AsyncListener = Callable[[AOSEvent], Awaitable[None]]


class EventBus:
    """
    In-process fan-out event bus. Async listeners run as fire-and-forget
    tasks; sync listeners run inline (keep them fast).
    """

    def __init__(self) -> None:
        self._sync: dict[str, list[SyncListener]] = {}
        self._async: dict[str, list[AsyncListener]] = {}

    def on(self, event_type: str, listener: SyncListener) -> None:
        self._sync.setdefault(event_type, []).append(listener)

    def on_async(self, event_type: str, listener: AsyncListener) -> None:
        self._async.setdefault(event_type, []).append(listener)

    def emit(self, event: AOSEvent) -> None:
        for listener in self._sync.get(event.event_type, []):
            try:
                listener(event)
            except Exception as exc:
                print(f"[EventBus] sync listener error on {event.event_type}: {exc}")

        async_listeners = self._async.get(event.event_type, [])
        if async_listeners:
            loop = None
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                pass

            for listener in async_listeners:
                if loop:
                    loop.create_task(listener(event))
                else:
                    try:
                        asyncio.run(listener(event))
                    except Exception as exc:
                        print(f"[EventBus] async listener error on {event.event_type}: {exc}")


_bus = EventBus()


def get_bus() -> EventBus:
    return _bus


class TraceEmitter:
    """
    Per-execution event emitter. Publishes events to the in-process bus
    and forwards them to the AOS bridge (fire-and-forget, non-blocking).
    """

    def __init__(self, execution_id: str, agent_id: str, department_id: str = ""):
        self.execution_id = execution_id
        self.agent_id = agent_id
        self.department_id = department_id
        self._start = time.monotonic()

    def emit(
        self,
        event_type: str,
        payload: dict | None = None,
        duration_ms: int | None = None,
        risk_score: int | None = None,
    ) -> AOSEvent:
        event = AOSEvent(
            event_type=event_type,
            execution_id=self.execution_id,
            agent_id=self.agent_id,
            payload=payload or {},
            duration_ms=duration_ms,
            risk_score=risk_score,
            department_id=self.department_id,
        )
        _bus.emit(event)
        self._forward_to_aos(event)
        return event

    def elapsed_ms(self) -> int:
        return int((time.monotonic() - self._start) * 1000)

    def _forward_to_aos(self, event: AOSEvent) -> None:
        try:
            from core import aos_client
            if not aos_client.ENABLED:
                return
            phase = self._infer_phase(event.event_type)
            aos_client.emit_trace(
                execution_id=self.execution_id,
                agent_name=self.agent_id,
                phase=phase,
                event_type=event.event_type,
                payload=event.to_dict(),
            )
        except Exception:
            pass

        # Redis pub/sub — enables real-time SSE streaming to the frontend.
        # Opt-in: only active when REDIS_URL is set in environment.
        _redis_publish(event)

    @staticmethod
    def _infer_phase(event_type: str) -> str:  # noqa: E301
        if event_type.startswith("task."):
            return "execute"
        if event_type.startswith("llm."):
            return "execute"
        if event_type.startswith("tool."):
            return "execute"
        if event_type.startswith("policy.") or event_type.startswith("hitl."):
            return "questionnaire"
        if event_type.startswith("recovery."):
            return "debug"
        if event_type.startswith("memory."):
            return "planner"
        return "execute"
