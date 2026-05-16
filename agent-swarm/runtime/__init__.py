"""
AOS Native Execution Runtime

Phase 1 of the rearchitecture described in docs/new_architecture.md.
Runs in parallel with the existing CLI adapter (engines/adapter.py).

Usage — run an agent natively:

    from runtime import run_agent

    result = await run_agent(
        agent_name="sales-account-strategist",
        task="Analyse Q2 pipeline and identify top 5 expansion opportunities",
        permissions=["file.read", "github.read"],
        execution_id="...",   # optional; generated if omitted
    )
    print(result.output)

Usage — enqueue via Celery:

    from runtime import enqueue_agent

    job_id = enqueue_agent(
        agent_name="engineering-backend-architect",
        task="Review the auth middleware and flag security issues",
        permissions=["file.read", "shell.run", "github.read"],
        priority=5,
    )
"""
from __future__ import annotations

import asyncio
import uuid

from .events import EventType, TraceEmitter, get_bus
from .jobs import AgentJob, RetryPolicy, enqueue
from .providers import get_provider
from .recovery import RecoveryEngine
from .tools import ToolRegistry
from .worker import AgentDefinition, AgentMemory, AgentResult, NativeAgentWorker

# Initialise the recovery engine (subscribes to bus events)
_recovery = RecoveryEngine()


async def run_agent(
    agent_name: str,
    task: str,
    permissions: list[str] | None = None,
    execution_id: str | None = None,
    workspace_dir: str = ".",
    department_id: str = "",
    agent_category: str = "",
    timeout_seconds: int = 1800,
) -> AgentResult:
    """
    Run an agent natively (async). Suitable for direct calls and tests.
    For production queue-based execution, use enqueue_agent().
    """
    eid = execution_id or str(uuid.uuid4())
    perms = permissions or ["file.read"]

    agent_def = AgentDefinition.load(agent_name)
    provider = get_provider(agent_def.category or agent_category)
    registry = ToolRegistry.for_agent(perms)
    memory = AgentMemory(agent_name)
    tracer = TraceEmitter(eid, agent_name, department_id)

    worker = NativeAgentWorker(
        agent_def=agent_def,
        provider=provider,
        tool_registry=registry,
        memory=memory,
        tracer=tracer,
        workspace_dir=workspace_dir,
        department_id=department_id,
    )

    job = AgentJob(
        job_id=str(uuid.uuid4()),
        execution_id=eid,
        agent_id=agent_name,
        agent_category=agent_def.category or agent_category,
        task=task,
        system_prompt=agent_def.system_prompt,
        tools=registry.names(),
        permissions=perms,
        policy_context={},
        timeout_seconds=timeout_seconds,
        workspace_dir=workspace_dir,
        department_id=department_id,
    )

    tracer.emit(EventType.TASK_STARTED, {"agent": agent_name, "task": task[:500]})
    result = await worker.run(job)
    event = EventType.TASK_COMPLETED if result.success else EventType.TASK_FAILED
    tracer.emit(event, {"duration_ms": result.duration_ms, "error": result.error})

    return result


def enqueue_agent(
    agent_name: str,
    task: str,
    permissions: list[str] | None = None,
    execution_id: str | None = None,
    workspace_dir: str = ".",
    department_id: str = "",
    agent_category: str = "",
    priority: int = 5,
    timeout_seconds: int = 1800,
) -> str:
    """
    Enqueue an agent job via Celery.
    Returns the job ID. Falls back to synchronous execution if Celery is unavailable.
    """
    eid = execution_id or str(uuid.uuid4())

    try:
        agent_def = AgentDefinition.load(agent_name)
        category = agent_def.category or agent_category
    except FileNotFoundError:
        category = agent_category

    job = AgentJob(
        job_id=str(uuid.uuid4()),
        execution_id=eid,
        agent_id=agent_name,
        agent_category=category,
        task=task,
        system_prompt="",   # worker loads this from the .md file
        tools=[],           # worker resolves from permissions
        permissions=permissions or ["file.read"],
        policy_context={},
        priority=priority,
        timeout_seconds=timeout_seconds,
        workspace_dir=workspace_dir,
        department_id=department_id,
    )

    return enqueue(job)


__all__ = [
    "run_agent",
    "enqueue_agent",
    "AgentJob",
    "AgentResult",
    "AgentDefinition",
    "EventType",
    "TraceEmitter",
    "get_bus",
    "ToolRegistry",
    "RecoveryEngine",
]
