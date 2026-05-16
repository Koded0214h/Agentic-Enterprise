"""
AOS Multi-Agent Orchestration

Provides:
  * TaskGraph         — a DAG of subtasks with explicit dependencies
  * TaskNode          — one node = one agent execution
  * GraphOrchestrator — runs the DAG with topological-order scheduling +
                        parallel execution of independent siblings + cascading
                        cancellation on upstream failure
  * AgentMessageBus   — pub/sub channel for inter-agent communication during
                        a graph run (broadcast and direct messages)

The NativeAgentWorker stays focused on a single agent's loop. This module sits
above it and lets a planner agent emit a DAG of subtasks for other agents to
execute, share intermediate results, and depend on each other.
"""
from __future__ import annotations

import asyncio
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Awaitable, Callable

from .events import EventBus, EventType, AOSEvent


# ---------------------------------------------------------------------------
# TaskNode + TaskGraph
# ---------------------------------------------------------------------------

@dataclass
class TaskNode:
    """One unit of work — an agent execution within a DAG."""
    id: str
    agent_name: str
    task: str
    depends_on: list[str] = field(default_factory=list)
    permissions: list[str] = field(default_factory=list)
    timeout_seconds: int = 600
    workspace_dir: str = "."
    department_id: str = ""
    agent_category: str = ""
    # Populated as the graph runs:
    status: str = "pending"  # pending | running | completed | failed | cancelled | skipped
    result: dict | None = None
    started_at: float = 0.0
    finished_at: float = 0.0
    error: str = ""

    @property
    def duration_ms(self) -> int:
        if self.started_at and self.finished_at:
            return int((self.finished_at - self.started_at) * 1000)
        return 0

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_name": self.agent_name,
            "task": self.task[:300],
            "depends_on": self.depends_on,
            "status": self.status,
            "duration_ms": self.duration_ms,
            "error": self.error,
        }


@dataclass
class TaskGraph:
    """
    A DAG of TaskNodes. Use `add()` to insert nodes; `validate()` to check the
    graph is acyclic and references resolve.
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    nodes: dict[str, TaskNode] = field(default_factory=dict)

    def add(self, node: TaskNode) -> "TaskGraph":
        if node.id in self.nodes:
            raise ValueError(f"Duplicate node id: {node.id}")
        self.nodes[node.id] = node
        return self

    def validate(self) -> None:
        # Ensure all dependencies reference existing nodes
        for node in self.nodes.values():
            for dep in node.depends_on:
                if dep not in self.nodes:
                    raise ValueError(f"Node {node.id!r} depends on unknown node {dep!r}")
        # Cycle detection via DFS
        WHITE, GRAY, BLACK = 0, 1, 2
        color = {nid: WHITE for nid in self.nodes}

        def dfs(nid: str) -> None:
            color[nid] = GRAY
            for dep in self.nodes[nid].depends_on:
                if color[dep] == GRAY:
                    raise ValueError(f"Cycle detected through {nid!r} → {dep!r}")
                if color[dep] == WHITE:
                    dfs(dep)
            color[nid] = BLACK

        for nid in self.nodes:
            if color[nid] == WHITE:
                dfs(nid)

    def ready_nodes(self) -> list[TaskNode]:
        """Nodes with all dependencies completed and themselves still pending."""
        ready = []
        for node in self.nodes.values():
            if node.status != "pending":
                continue
            if all(self.nodes[d].status == "completed" for d in node.depends_on):
                ready.append(node)
        return ready

    def is_finished(self) -> bool:
        return all(n.status in ("completed", "failed", "cancelled", "skipped") for n in self.nodes.values())

    def descendants(self, node_id: str) -> set[str]:
        """Return all downstream node ids reachable from this node."""
        result: set[str] = set()
        stack = [node_id]
        # Build reverse-adjacency: who depends on me?
        downstream: dict[str, list[str]] = defaultdict(list)
        for nid, node in self.nodes.items():
            for dep in node.depends_on:
                downstream[dep].append(nid)
        while stack:
            current = stack.pop()
            for nxt in downstream.get(current, []):
                if nxt not in result:
                    result.add(nxt)
                    stack.append(nxt)
        return result

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nodes": [n.to_dict() for n in self.nodes.values()],
        }


# ---------------------------------------------------------------------------
# Agent message bus (inter-agent communication during a graph run)
# ---------------------------------------------------------------------------

@dataclass
class AgentMessage:
    sender: str
    recipient: str  # specific agent_id or "*" for broadcast
    payload: dict
    timestamp: float = field(default_factory=time.time)


class AgentMessageBus:
    """
    Tiny in-process pub/sub for agents in the same graph run.

    Usage from within an agent execution context:
        await bus.send("frontend-dev", {"api_schema": {...}})        # direct
        await bus.broadcast({"build_failed": True})                  # to all
        msgs = bus.inbox("backend-dev")                              # drain
    """

    def __init__(self) -> None:
        self._inboxes: dict[str, list[AgentMessage]] = defaultdict(list)
        self._broadcasts: list[AgentMessage] = []
        self._lock = asyncio.Lock()

    async def send(self, sender: str, recipient: str, payload: dict) -> None:
        async with self._lock:
            self._inboxes[recipient].append(AgentMessage(sender, recipient, payload))

    async def broadcast(self, sender: str, payload: dict) -> None:
        async with self._lock:
            self._broadcasts.append(AgentMessage(sender, "*", payload))

    def inbox(self, recipient: str, since: float = 0.0) -> list[AgentMessage]:
        """Return direct messages + relevant broadcasts since `since`."""
        direct = [m for m in self._inboxes.get(recipient, []) if m.timestamp >= since]
        broad = [m for m in self._broadcasts if m.timestamp >= since and m.sender != recipient]
        return sorted(direct + broad, key=lambda m: m.timestamp)


# ---------------------------------------------------------------------------
# Graph orchestrator
# ---------------------------------------------------------------------------

# Callable signature: async (node, upstream_outputs, bus) -> result_dict
NodeExecutor = Callable[[TaskNode, dict[str, dict], AgentMessageBus], Awaitable[dict]]


class GraphOrchestrator:
    """
    Executes a TaskGraph with topological scheduling and parallel sibling
    execution. Failed nodes cascade-cancel their descendants. Emits AOSEvents
    for graph lifecycle so the existing observability stack can stream them.
    """

    def __init__(
        self,
        graph: TaskGraph,
        executor: NodeExecutor,
        event_bus: EventBus | None = None,
        execution_id: str = "",
        max_parallel: int = 6,
    ) -> None:
        self.graph = graph
        self.executor = executor
        self.event_bus = event_bus or EventBus()
        self.execution_id = execution_id or str(uuid.uuid4())
        self.max_parallel = max_parallel
        self.message_bus = AgentMessageBus()
        self._sem = asyncio.Semaphore(max_parallel)

    async def run(self) -> dict:
        """Run the graph end-to-end. Returns {"success": bool, "nodes": [...]}"""
        self.graph.validate()
        start = time.monotonic()
        await self._emit(EventType.WORKFLOW_STARTED, {
            "graph_id": self.graph.id,
            "node_count": len(self.graph.nodes),
        })

        in_flight: dict[str, asyncio.Task] = {}

        while not self.graph.is_finished():
            # Schedule everything that's currently ready
            for node in self.graph.ready_nodes():
                if node.id in in_flight:
                    continue
                in_flight[node.id] = asyncio.create_task(self._run_node(node))

            if not in_flight:
                # Nothing ready and nothing running — deadlock means everything is
                # blocked on a failed/cancelled ancestor; mark remainders as skipped.
                for n in self.graph.nodes.values():
                    if n.status == "pending":
                        n.status = "skipped"
                break

            # Wait for at least one running task to finish
            done, _ = await asyncio.wait(
                in_flight.values(), return_when=asyncio.FIRST_COMPLETED
            )
            # Remove finished tasks from in_flight
            finished_ids = [
                nid for nid, task in in_flight.items() if task in done
            ]
            for nid in finished_ids:
                in_flight.pop(nid, None)

        success = all(n.status == "completed" for n in self.graph.nodes.values())
        await self._emit(
            EventType.WORKFLOW_COMPLETED if success else EventType.WORKFLOW_FAILED,
            {
                "graph_id": self.graph.id,
                "duration_ms": int((time.monotonic() - start) * 1000),
                "completed": sum(1 for n in self.graph.nodes.values() if n.status == "completed"),
                "failed": sum(1 for n in self.graph.nodes.values() if n.status == "failed"),
                "skipped": sum(1 for n in self.graph.nodes.values() if n.status == "skipped"),
            },
        )

        return {
            "success": success,
            "execution_id": self.execution_id,
            "graph": self.graph.to_dict(),
        }

    async def _run_node(self, node: TaskNode) -> None:
        async with self._sem:
            node.status = "running"
            node.started_at = time.monotonic()
            await self._emit(EventType.AGENT_STARTED, {
                "node_id": node.id,
                "agent_name": node.agent_name,
                "depends_on": node.depends_on,
            })

            # Gather upstream outputs to feed downstream agents
            upstream_outputs = {
                d: (self.graph.nodes[d].result or {})
                for d in node.depends_on
            }

            try:
                result = await self.executor(node, upstream_outputs, self.message_bus)
                node.result = result
                node.status = "completed"
                await self._emit(EventType.AGENT_COMPLETED, {
                    "node_id": node.id,
                    "duration_ms": int((time.monotonic() - node.started_at) * 1000),
                })
            except Exception as exc:
                node.status = "failed"
                node.error = str(exc)[:500]
                await self._emit(EventType.AGENT_FAILED, {
                    "node_id": node.id,
                    "error": node.error,
                })
                # Cascade: cancel descendants
                for dep_id in self.graph.descendants(node.id):
                    dep = self.graph.nodes[dep_id]
                    if dep.status == "pending":
                        dep.status = "cancelled"
                        dep.error = f"Cancelled due to upstream failure: {node.id}"
                        await self._emit(EventType.AGENT_FAILED, {
                            "node_id": dep_id,
                            "error": dep.error,
                        })
            finally:
                node.finished_at = time.monotonic()

    async def _emit(self, event_type: str, data: dict) -> None:
        event = AOSEvent(
            event_type=event_type,
            execution_id=self.execution_id,
            agent_id="orchestrator",
            payload={**data, "orchestrator": "graph"},
        )
        try:
            self.event_bus.emit(event)
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Subtask delegation helper
# ---------------------------------------------------------------------------

def delegate_subtask(
    parent_node: TaskNode,
    subtask_agent: str,
    subtask: str,
    extra_depends_on: list[str] | None = None,
) -> TaskNode:
    """
    Construct a child TaskNode that depends on `parent_node` plus any extras.
    Useful when a planner-style agent decides at runtime to spawn helper agents.
    """
    return TaskNode(
        id=f"{parent_node.id}/{uuid.uuid4().hex[:8]}",
        agent_name=subtask_agent,
        task=subtask,
        depends_on=[parent_node.id] + (extra_depends_on or []),
        permissions=parent_node.permissions,
        workspace_dir=parent_node.workspace_dir,
        department_id=parent_node.department_id,
        agent_category=parent_node.agent_category,
    )
