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
from .orchestration import (
    AgentMessage,
    AgentMessageBus,
    GraphOrchestrator,
    TaskGraph,
    TaskNode,
    delegate_subtask,
)
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
    engine_override: str = "",
) -> AgentResult:
    """
    Run an agent natively (async). Suitable for direct calls and tests.
    For production queue-based execution, use enqueue_agent().

    engine_override: if set (e.g. "claude", "gemini"), forces all agents in
    this call to use that provider regardless of their category routing.
    """
    eid = execution_id or str(uuid.uuid4())
    perms = permissions or ["file.read"]

    agent_def = AgentDefinition.load(agent_name)
    provider = get_provider(agent_def.category or agent_category, engine_override=engine_override)
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
    "run_graph",
    "AgentJob",
    "AgentResult",
    "AgentDefinition",
    "EventType",
    "TraceEmitter",
    "get_bus",
    "ToolRegistry",
    "RecoveryEngine",
    # Multi-agent orchestration
    "TaskGraph",
    "TaskNode",
    "GraphOrchestrator",
    "AgentMessage",
    "AgentMessageBus",
    "delegate_subtask",
]


async def run_graph(graph: TaskGraph, execution_id: str | None = None) -> dict:
    """
    Run a TaskGraph end-to-end with the native agent runtime as node executor.
    Each TaskNode is executed by run_agent, with upstream outputs injected
    into the prompt as ``## Upstream results`` context.
    """
    eid = execution_id or str(uuid.uuid4())

    async def _executor(node: TaskNode, upstream: dict[str, dict], bus: AgentMessageBus) -> dict:
        # Compose a context block from upstream outputs
        context_block = ""
        if upstream:
            parts = []
            for dep_id, out in upstream.items():
                txt = (out or {}).get("output", "")
                if txt:
                    parts.append(f"### From {dep_id}\n{txt[:8000]}")
            if parts:
                context_block = "\n\n## Upstream results\n\n" + "\n\n".join(parts)

        # Drain any inter-agent messages directed at this node's agent
        msgs = bus.inbox(node.agent_name)
        if msgs:
            context_block += "\n\n## Messages from peer agents\n\n" + "\n".join(
                f"- {m.sender}: {str(m.payload)[:500]}" for m in msgs
            )

        composed_task = node.task + context_block

        result = await run_agent(
            agent_name=node.agent_name,
            task=composed_task,
            permissions=node.permissions,
            execution_id=f"{eid}:{node.id}",
            workspace_dir=node.workspace_dir,
            department_id=node.department_id,
            agent_category=node.agent_category,
            timeout_seconds=node.timeout_seconds,
        )
        if not result.success:
            raise RuntimeError(result.error or "Agent execution failed")
        return result.to_dict()

    orchestrator = GraphOrchestrator(graph=graph, executor=_executor, execution_id=eid)
    return await orchestrator.run()
