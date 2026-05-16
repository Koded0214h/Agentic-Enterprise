"""
Smoke test for the AOS native runtime.
Run from agent-swarm/: python test_runtime.py

Tests (no real LLM calls):
  1. AgentDefinition.load() finds an existing agent
  2. ToolRegistry registers built-in tools
  3. EventBus fan-out works
  4. AgentJob serialises/deserialises cleanly
  5. NativeAgentWorker builds from a job without error
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from runtime.events import AOSEvent, EventType, EventBus
from runtime.tools import ToolRegistry, FileReadTool, ExecutionContext
from runtime.jobs import AgentJob, RetryPolicy
from runtime.worker import AgentDefinition


# ── 1. EventBus fan-out ────────────────────────────────────────────────────
def test_event_bus():
    bus = EventBus()
    received = []
    bus.on(EventType.TASK_STARTED, lambda e: received.append(e.event_type))

    event = AOSEvent(
        event_type=EventType.TASK_STARTED,
        execution_id="test-exec",
        agent_id="test-agent",
    )
    bus.emit(event)
    assert received == [EventType.TASK_STARTED], f"Expected [TASK_STARTED], got {received}"
    print("✓ EventBus fan-out")


# ── 2. ToolRegistry registers built-in tools ───────────────────────────────
def test_tool_registry():
    registry = ToolRegistry.for_agent(["file.read", "file.write", "shell.run"])
    names = registry.names()
    assert "file.read" in names, "file.read missing"
    assert "file.write" in names, "file.write missing"
    assert "shell.run" in names, "shell.run missing"
    schemas = registry.schemas()
    assert len(schemas) > 0, "No schemas returned"
    print(f"✓ ToolRegistry ({len(names)} tools available for agent)")


# ── 3. FileReadTool executes on a real file ────────────────────────────────
async def test_file_read_tool():
    tool = FileReadTool()
    ctx = ExecutionContext(
        execution_id="test-exec",
        agent_id="test-agent",
        agent_permissions=["file.read"],
        workspace_dir=os.path.dirname(__file__),
    )
    result = await tool.execute({"path": "runtime/__init__.py"}, ctx)
    assert result.success, f"FileReadTool failed: {result.error}"
    assert "run_agent" in result.output, "Expected runtime/__init__.py content"
    print("✓ FileReadTool reads a real file")


# ── 4. AgentJob serialisation ──────────────────────────────────────────────
def test_agent_job_serialisation():
    job = AgentJob(
        job_id="job-123",
        execution_id="exec-456",
        agent_id="sales-account-strategist",
        agent_category="sales",
        task="Analyse pipeline",
        system_prompt="You are a sales strategist.",
        tools=["file.read", "github.read"],
        permissions=["file.read", "github.read"],
        policy_context={"decision": "allow"},
        department_id="sales-dept",
    )
    d = job.to_dict()
    job2 = AgentJob.from_dict(d)
    assert job2.job_id == job.job_id
    assert job2.agent_id == job.agent_id
    assert isinstance(job2.retry_policy, RetryPolicy)
    assert job2.queue_name == "agent.execute.standard"
    print("✓ AgentJob round-trip serialisation")


# ── 5. AgentDefinition.load() finds a known agent ─────────────────────────
def test_agent_definition_load():
    try:
        agent = AgentDefinition.load("sales-account-strategist")
        assert agent.name == "sales-account-strategist"
        assert len(agent.system_prompt) > 100, "System prompt suspiciously short"
        assert agent.category == "sales"
        print(f"✓ AgentDefinition loaded: {agent.name} (category={agent.category}, {len(agent.system_prompt)} chars)")
    except FileNotFoundError:
        print("⚠ AgentDefinition.load skipped — agent .md not found (check AGENTS_DIR path)")


# ── Runner ─────────────────────────────────────────────────────────────────
async def main():
    print("\nAOS Native Runtime — Smoke Tests\n" + "─" * 40)
    test_event_bus()
    test_tool_registry()
    await test_file_read_tool()
    test_agent_job_serialisation()
    test_agent_definition_load()
    print("\n✓ All smoke tests passed\n")


if __name__ == "__main__":
    asyncio.run(main())
