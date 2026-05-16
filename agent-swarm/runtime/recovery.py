"""
AOS Native Runtime — Recovery Engine

Adapted from core/self_healer.py for the native execution model.
Recovery now fires on typed AOSEvents (not subprocess errors), and can
retry at the tool level (no LLM cost) before escalating to the agent level.

Five strategies are unchanged:
  RETRY     — same agent, same task, exponential backoff
  REASSIGN  — different agent, same task (uses existing substitute map)
  SIMPLIFY  — decompose the task and retry the smallest piece
  FALLBACK  — switch LLM provider
  ESCALATE  — create HITL entry in AOS, pause execution
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from enum import Enum

from .events import AOSEvent, EventType, get_bus


class RecoveryStrategy(str, Enum):
    RETRY    = "retry"
    REASSIGN = "reassign"
    SIMPLIFY = "simplify"
    FALLBACK = "fallback"
    ESCALATE = "escalate"


@dataclass
class RecoveryAction:
    strategy: RecoveryStrategy
    execution_id: str
    agent_id: str
    task: str
    metadata: dict


# Agent substitute map — mirrors core/self_healer.py
_AGENT_SUBSTITUTES: dict[str, list[str]] = {
    "frontend-dev":   ["engineering-frontend-developer", "engineering-rapid-prototyper"],
    "backend-dev":    ["engineering-backend-architect", "engineering-senior-developer"],
    "devops":         ["engineering-devops-automator", "engineering-sre"],
    "security":       ["engineering-security-engineer", "engineering-threat-detection-engineer"],
    "qa-tester":      ["testing-api-tester", "testing-reality-checker"],
    "tech-lead":      ["engineering-software-architect", "engineering-code-reviewer"],
    "project-manager":["project-management-project-shepherd", "project-manager-senior"],
}

_PROVIDER_FALLBACK_ORDER = ["anthropic", "openai", "gemini"]


class RecoveryEngine:
    """
    Subscribes to AGENT_FAILED and TOOL_FAILED events.
    Decides recovery strategy and emits RECOVERY_STRATEGY events.
    """

    MAX_RETRIES = 3

    def __init__(self) -> None:
        self._retry_counts: dict[str, int] = {}
        self._provider_idx: dict[str, int] = {}
        bus = get_bus()
        bus.on(EventType.AGENT_FAILED, self._on_agent_failed)
        bus.on(EventType.TOOL_FAILED, self._on_tool_failed)

    def _on_agent_failed(self, event: AOSEvent) -> None:
        key = event.execution_id
        retries = self._retry_counts.get(key, 0)
        error = event.payload.get("error", "")
        strategy = self._select_strategy(error, retries)
        self._retry_counts[key] = retries + 1
        self._emit_recovery(event, strategy, retries)

    def _on_tool_failed(self, event: AOSEvent) -> None:
        """Tool-level failures: attempt RETRY before escalating to agent."""
        key = f"tool:{event.execution_id}:{event.payload.get('tool', '')}"
        retries = self._retry_counts.get(key, 0)
        if retries < 2:
            self._retry_counts[key] = retries + 1
            get_bus().emit(AOSEvent(
                event_type=EventType.TOOL_RETRIED,
                execution_id=event.execution_id,
                agent_id=event.agent_id,
                payload={
                    "tool": event.payload.get("tool"),
                    "retry": retries + 1,
                    "backoff_seconds": (retries + 1) * 2,
                },
            ))
        # Otherwise let the agent-level loop handle it via error propagation.

    def _select_strategy(self, error: str, retries: int) -> RecoveryStrategy:
        error_lower = error.lower()

        if "timeout" in error_lower or "timed out" in error_lower:
            if retries < self.MAX_RETRIES:
                return RecoveryStrategy.RETRY
            return RecoveryStrategy.SIMPLIFY

        if "rate" in error_lower or "429" in error_lower:
            if retries < 2:
                return RecoveryStrategy.RETRY
            return RecoveryStrategy.FALLBACK

        if "auth" in error_lower or "401" in error_lower or "403" in error_lower:
            return RecoveryStrategy.FALLBACK

        if "not found" in error_lower and "agent" in error_lower:
            return RecoveryStrategy.REASSIGN

        if "model" in error_lower or "unsupported" in error_lower:
            return RecoveryStrategy.FALLBACK

        if retries < self.MAX_RETRIES:
            return RecoveryStrategy.RETRY

        return RecoveryStrategy.ESCALATE

    def _emit_recovery(self, event: AOSEvent, strategy: RecoveryStrategy, retries: int) -> None:
        payload: dict = {
            "strategy": strategy.value,
            "retries_so_far": retries,
        }

        if strategy == RecoveryStrategy.RETRY:
            backoff = 5 * (retries + 1)
            payload["backoff_seconds"] = backoff
            payload["message"] = f"Retry #{retries + 1} in {backoff}s"
            time.sleep(backoff)

        elif strategy == RecoveryStrategy.REASSIGN:
            agent_id = event.agent_id
            subs = _AGENT_SUBSTITUTES.get(agent_id, [])
            payload["substitute_agent"] = subs[0] if subs else agent_id
            payload["message"] = f"Reassigning {agent_id} → {payload['substitute_agent']}"

        elif strategy == RecoveryStrategy.SIMPLIFY:
            original_task = event.payload.get("task", "")
            payload["simplified_task"] = (
                f"The following task failed ({retries} times). Complete ONLY the smallest "
                f"possible sub-task:\n\nORIGINAL: {original_task[:500]}\n\n"
                f"ERROR: {event.payload.get('error', '')[:300]}"
            )

        elif strategy == RecoveryStrategy.FALLBACK:
            key = event.execution_id
            idx = self._provider_idx.get(key, 0)
            next_provider = _PROVIDER_FALLBACK_ORDER[(idx + 1) % len(_PROVIDER_FALLBACK_ORDER)]
            self._provider_idx[key] = idx + 1
            payload["next_provider"] = next_provider
            payload["message"] = f"Switching provider → {next_provider}"

        elif strategy == RecoveryStrategy.ESCALATE:
            payload["message"] = (
                f"ESCALATION: {event.agent_id} failed after {retries} attempts. "
                "Human review required."
            )
            payload["requires_human"] = True
            self._create_hitl_entry(event, payload)

        get_bus().emit(AOSEvent(
            event_type=EventType.RECOVERY_STRATEGY,
            execution_id=event.execution_id,
            agent_id=event.agent_id,
            payload=payload,
        ))

    def _create_hitl_entry(self, event: AOSEvent, payload: dict) -> None:
        """Create a PendingAction entry in the AOS backend for human review."""
        try:
            from core import aos_client
            if not aos_client.ENABLED:
                return
            aos_client.emit_trace(
                execution_id=event.execution_id,
                agent_name=event.agent_id,
                phase="debug",
                event_type=EventType.HITL_RAISED,
                payload={**event.payload, **payload},
            )
        except Exception:
            pass
