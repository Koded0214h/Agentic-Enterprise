"""
End-to-end test for the native swarm execution path.

Drives the real plan -> execute -> ship task graph (TaskGraph, GraphOrchestrator,
EventBus) through `_native_graph_runner`, with the LLM call (`run_agent`) mocked
so no real API key or tokens are needed. Asserts that:

  * the graph runs to completion (exit code 0),
  * the "execute" agent's file writes land in the run workspace,
  * durable run state is persisted to SwarmExecutionContext.

This is the one green E2E test that converts "we think the swarm works" into
"we can prove the orchestration wiring works" — catching regressions in the
bridge without paying for live model calls.
"""
import shutil
import sys
import uuid
from pathlib import Path
from unittest import mock

from django.test import TestCase

from apps.swarm_bridge import views
from apps.swarm_bridge.models import SwarmExecutionContext, SwarmEngine


class _FakeResult:
    """Stand-in for runtime.worker.AgentResult."""

    def __init__(self, output: str):
        self.success = True
        self.error = ""
        self.output = output
        self.tokens_input = 0
        self.tokens_output = 0

    def to_dict(self) -> dict:
        return {"success": True, "output": self.output, "error": ""}


def _make_fake_run_agent(written: list):
    """Return an async run_agent stand-in. The 'execute' node writes a real
    file to its workspace, mirroring what a real agent's file.write tool does."""

    async def _fake_run_agent(*, agent_name, task, permissions, execution_id,
                              workspace_dir, agent_category, timeout_seconds,
                              engine_override):
        node_id = execution_id.rsplit(":", 1)[-1]
        if node_id == "execute":
            target = Path(workspace_dir) / "index.html"
            target.write_text("<!doctype html><title>built by aos</title>")
            written.append(target)
        return _FakeResult(output=f"{agent_name}: done")

    return _fake_run_agent


class SwarmRunE2ETest(TestCase):
    def setUp(self):
        # Make the native runtime importable so we can patch its run_agent.
        if str(views._SWARM_ROOT) not in sys.path:
            sys.path.insert(0, str(views._SWARM_ROOT))
        import runtime  # noqa: E402
        self.runtime = runtime
        self.run_id = str(uuid.uuid4())
        self.workspace = Path("/tmp/aos-workspace") / self.run_id

    def tearDown(self):
        views._RUNS.pop(self.run_id, None)
        shutil.rmtree(self.workspace, ignore_errors=True)

    def test_native_run_writes_files_and_completes(self):
        ctx = SwarmExecutionContext.objects.create(
            id=self.run_id,
            aos_agent=None,
            project=None,
            swarm_agent_name="native-run",
            engine=SwarmEngine.GENERIC,
            task_summary="build a landing page",
            status="running",
            run_lines=[],
            run_exit_code=None,
        )
        run = {
            "lines": [], "done": False, "exit_code": None,
            "goal": "build a landing page", "engine": "native",
            "model": "", "ctx_id": str(ctx.id),
        }
        views._RUNS[self.run_id] = run

        written: list = []
        fake = _make_fake_run_agent(written)
        with mock.patch.object(self.runtime, "run_agent", fake):
            views._native_graph_runner(self.run_id, run, run["goal"], "")

        # Graph ran to completion.
        self.assertEqual(run["exit_code"], 0, msg=f"tail: {run['lines'][-6:]}")
        self.assertTrue(run["done"])

        # The execute agent's file write landed in the workspace.
        self.assertTrue(written, "execute node never wrote a file")
        self.assertTrue((self.workspace / "index.html").is_file())

        # Durable state persisted.
        ctx.refresh_from_db()
        self.assertEqual(ctx.status, "completed")
        self.assertEqual(ctx.run_exit_code, 0)

    def test_preflight_reports_missing_llm_key(self):
        """Preflight fails (critical) when no LLM provider key is configured."""
        with mock.patch.dict("os.environ", {
            "GEMINI_API_KEY": "", "ANTHROPIC_API_KEY": "",
            "OPENAI_API_KEY": "", "MISTRAL_API_KEY": "",
        }, clear=False):
            report = views._preflight()
        llm = next(c for c in report["checks"] if c["name"] == "llm_provider")
        self.assertFalse(llm["ok"])
        self.assertFalse(report["ok"])

    def test_preflight_passes_with_a_key(self):
        with mock.patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}, clear=False):
            report = views._preflight()
        llm = next(c for c in report["checks"] if c["name"] == "llm_provider")
        self.assertTrue(llm["ok"])
        # runtime + workspace are real and should pass in the test env.
        self.assertTrue(report["ok"])
