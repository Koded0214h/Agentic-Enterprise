"""
Swarm Bridge Views

Five integration endpoints that form the AOS↔Swarm contract:

  1. POST /api/swarm/agents/register/   — register a swarm agent in AOS
  2. POST /api/swarm/policy/check/      — pre-execution policy gate
  3. POST /api/swarm/usage/report/      — post-execution metering
  4. POST /api/swarm/traces/            — emit trace events
  5. GET  /api/swarm/kb/query/          — enrich context from knowledge base
"""
import json
import os
import re
import subprocess
import sys
import threading
import time
import uuid
import secrets
from decimal import Decimal
from pathlib import Path

from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.agent_registry.models import Agent, AgentType, AgentStatus
from apps.billing.models import UsageRecord
from apps.policy_engine.models import PolicyAuditLog, PolicyEffect
from apps.policy_engine.utils import PolicyEvaluator
from apps.agent_intelligence.models import TraceStep
from apps.agent_intelligence.prompt_guard import guard_task_input, PromptInjectionError
from apps.agent_intelligence.security_logger import log_security_event

from .models import SwarmExecutionContext, SwarmAgentManifest, SwarmEngine
from .serializers import (
    SwarmPolicyCheckSerializer,
    SwarmUsageReportSerializer,
    SwarmTraceEventSerializer,
    SwarmKBQuerySerializer,
    SwarmAgentRegistrationSerializer,
    SwarmAgentRegistrationResponseSerializer,
    SwarmExecutionContextSerializer,
)


def _resolve_aos_agent(agent_name: str) -> Agent | None:
    """Look up an AOS Agent by swarm name (via SwarmAgentManifest)."""
    try:
        return SwarmAgentManifest.objects.select_related("aos_agent").get(
            swarm_name=agent_name
        ).aos_agent
    except SwarmAgentManifest.DoesNotExist:
        return None


# ---------------------------------------------------------------------------
# 1. Agent Registration
# ---------------------------------------------------------------------------

class SwarmAgentRegisterView(APIView):
    """
    POST /api/swarm/agents/register/

    Upserts a swarm agent into AOS Agent Registry and creates/updates its
    SwarmAgentManifest. Returns the AOS agent ID and identity key.

    Used by the sync_swarm_agents management command and can also be called
    directly for single-agent registration.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SwarmAgentRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        manifest_qs = SwarmAgentManifest.objects.filter(swarm_name=data["name"])

        if manifest_qs.exists():
            manifest = manifest_qs.select_related("aos_agent").get()
            agent = manifest.aos_agent

            # Update manifest fields
            manifest.source_category = data["source_category"]
            manifest.file_path = data["file_path"]
            manifest.preferred_engine = data.get("preferred_engine")
            manifest.description = data.get("description", "")
            manifest.raw_markdown = data.get("raw_markdown", "")
            manifest.save()

            created = False
        else:
            # Create AOS Agent record
            agent = Agent.objects.create(
                name=data["name"],
                agent_type=AgentType.FUNCTIONAL,
                owner=request.user,
                identity_key=f"swarm_{secrets.token_urlsafe(32)}",
                status=AgentStatus.RUNNING,
                metadata={
                    "source": "swarm",
                    "source_category": data["source_category"],
                    "file_path": data["file_path"],
                },
            )

            SwarmAgentManifest.objects.create(
                aos_agent=agent,
                swarm_name=data["name"],
                source_category=data["source_category"],
                file_path=data["file_path"],
                preferred_engine=data.get("preferred_engine"),
                description=data.get("description", ""),
                raw_markdown=data.get("raw_markdown", ""),
            )

            created = True

        response_serializer = SwarmAgentRegistrationResponseSerializer({
            "aos_agent_id": agent.id,
            "identity_key": agent.identity_key,
            "swarm_name": data["name"],
            "created": created,
        })

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# 2. Policy Check
# ---------------------------------------------------------------------------

class SwarmPolicyCheckView(APIView):
    """
    POST /api/swarm/policy/check/

    Pre-execution gate. Swarm calls this before running any agent.
    Returns {decision: allow|deny|escalate, reason, policy_id, pending_action_id}.

    Creates a SwarmExecutionContext to anchor all subsequent calls
    (usage report, traces) for this execution_id.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SwarmPolicyCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            guard_task_input(data["task"])
        except PromptInjectionError as exc:
            log_security_event(
                'INJECTION_ATTEMPT',
                user=request.user,
                detail=str(exc),
                request=request,
            )
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        execution_id = data["execution_id"]
        agent_name = data["agent_name"]
        aos_agent = _resolve_aos_agent(agent_name)

        # Create or retrieve the execution context
        ctx, _ = SwarmExecutionContext.objects.get_or_create(
            id=execution_id,
            defaults={
                "aos_agent": aos_agent,
                "swarm_agent_name": agent_name,
                "engine": data.get("engine", SwarmEngine.CLAUDE),
                "workflow_phase": data.get("workflow_phase"),
                "environment": data.get("environment", "dev"),
                "task_summary": data["task"][:500],
                "started_at": timezone.now(),
            },
        )

        # ----------------------------------------------------------------
        # Policy evaluation via AOS PolicyEvaluator
        # ----------------------------------------------------------------
        decision = "allow"
        reason = "No AOS agent record — default allow"
        policy_id = None
        pending_action_id = None

        if aos_agent:
            # Budget pre-check: fast-path deny before hitting policy engine
            budget = getattr(aos_agent, "budget", None)
            if budget and budget.is_active and budget.current_month_spend >= budget.monthly_limit:
                decision = "deny"
                reason = (
                    f"Budget limit exceeded: "
                    f"${budget.current_month_spend} / ${budget.monthly_limit} monthly"
                )
            else:
                evaluator = PolicyEvaluator(aos_agent)
                effect, policy, reason = evaluator.evaluate(
                    resource="swarm:execute",
                    action=f"dispatch:{agent_name}",
                    context={
                        "execution_id": str(execution_id),
                        "task": data["task"][:200],
                        "engine": data.get("engine"),
                        "environment": data.get("environment", "dev"),
                        "workflow_phase": data.get("workflow_phase"),
                    },
                )
                decision = effect.lower()  # PolicyEffect values: ALLOW/DENY/AUDIT/ESCALATE
                if policy:
                    policy_id = str(policy.id)

                if effect == PolicyEffect.ESCALATE:
                    # Create a PendingAction so a human can approve before swarm continues
                    from apps.agent_intelligence.models import PendingAction, Conversation
                    conv, _ = Conversation.objects.get_or_create(
                        session_id=str(execution_id),
                        defaults={"agent": aos_agent, "status": "active"},
                    )
                    pending = PendingAction.objects.create(
                        conversation=conv,
                        agent=aos_agent,
                        action_type="swarm_dispatch",
                        resource=f"swarm:execute:{agent_name}",
                        state_snapshot={
                            "execution_id": str(execution_id),
                            "task": data["task"][:500],
                            "engine": data.get("engine"),
                        },
                    )
                    pending_action_id = str(pending.id)

        # Persist decision on execution context
        ctx.policy_decision = decision
        ctx.policy_reason = reason
        ctx.save(update_fields=["policy_decision", "policy_reason"])

        response_data = {
            "decision": decision,
            "reason": reason,
            "policy_id": policy_id,
            "pending_action_id": pending_action_id,
            "execution_id": str(execution_id),
        }
        if decision == "throttle":
            response_data["retry_after_seconds"] = 30
        return Response(response_data)


# ---------------------------------------------------------------------------
# 3. Usage Report
# ---------------------------------------------------------------------------

class SwarmUsageReportView(APIView):
    """
    POST /api/swarm/usage/report/

    Post-execution metering. Swarm calls this after an agent finishes.
    AOS creates a UsageRecord and updates budget spend.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SwarmUsageReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        execution_id = data["execution_id"]

        try:
            ctx = SwarmExecutionContext.objects.select_related("aos_agent").get(
                id=execution_id
            )
        except SwarmExecutionContext.DoesNotExist:
            return Response(
                {"error": f"No execution context found for id={execution_id}. "
                           "Call /policy/check/ first."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Update execution context with final metrics
        ctx.tokens_input = data["tokens_input"]
        ctx.tokens_output = data["tokens_output"]
        ctx.cost_usd = data["cost_usd"]
        ctx.duration_ms = data["duration_ms"]
        ctx.completed_at = timezone.now()
        ctx.save(update_fields=[
            "tokens_input", "tokens_output", "cost_usd",
            "duration_ms", "completed_at",
        ])

        # Create AOS UsageRecord if we have an agent
        usage_record = None
        if ctx.aos_agent:
            usage_record = UsageRecord.objects.create(
                agent=ctx.aos_agent,
                department=ctx.aos_agent.department,
                tokens_input=data["tokens_input"],
                tokens_output=data["tokens_output"],
                compute_time_ms=data["duration_ms"],
                cost=data["cost_usd"],
                resource_id=execution_id,
                resource_type="swarm_execution",
            )

            # Update budget spend
            budget = getattr(ctx.aos_agent, "budget", None)
            if budget and budget.is_active:
                budget.current_month_spend = (
                    Decimal(str(budget.current_month_spend)) + Decimal(str(data["cost_usd"]))
                )
                budget.save(update_fields=["current_month_spend"])

        return Response({
            "status": "recorded",
            "execution_id": str(execution_id),
            "usage_record_id": str(usage_record.id) if usage_record else None,
            "cost_usd": str(data["cost_usd"]),
        })


# ---------------------------------------------------------------------------
# 4. Trace Events
# ---------------------------------------------------------------------------

class SwarmTraceEventView(APIView):
    """
    POST /api/swarm/traces/

    Swarm emits one event per workflow phase or notable step.
    Stored for observability and full execution replay.

    Phase 5 will wire these into the AOS TraceStep model and Prometheus.
    For Phase 0, we persist them on the execution context as JSONB metadata.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SwarmTraceEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        execution_id = data["execution_id"]

        try:
            ctx = SwarmExecutionContext.objects.get(id=execution_id)
        except SwarmExecutionContext.DoesNotExist:
            return Response(
                {"error": f"No execution context for id={execution_id}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Resolve or create a Conversation anchor for this execution so
        # TraceStep (which requires a Conversation FK) can be created.
        from apps.agent_intelligence.models import Conversation

        conv = None
        if ctx.aos_agent:
            conv, _ = Conversation.objects.get_or_create(
                session_id=str(execution_id),
                defaults={"agent": ctx.aos_agent, "status": "active"},
            )

        trace_step = None
        if conv:
            payload = data.get("payload") or {}
            trace_step = TraceStep.objects.create(
                conversation=conv,
                node_name=f"{data['phase']}:{data['event_type']}",
                input_data=payload.get("input", {}),
                output_data=payload.get("output", {}),
                duration_ms=payload.get("duration_ms", 0),
            )

        return Response({
            "status": "recorded",
            "execution_id": str(execution_id),
            "event_type": data["event_type"],
            "trace_step_id": str(trace_step.id) if trace_step else None,
        })


# ---------------------------------------------------------------------------
# 5. Knowledge Base Query
# ---------------------------------------------------------------------------

class SwarmKBQueryView(APIView):
    """
    GET /api/swarm/kb/query/?q=<task>&agent=<name>&top_k=5

    Proxies a semantic search against the AOS knowledge base (Chroma + embeddings).
    Returns relevant documents to enrich the swarm agent's context before execution.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = SwarmKBQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Delegate to the existing knowledge_base app
        try:
            from apps.knowledge_base.utils import search_knowledge_base
            results = search_knowledge_base(
                query=data["q"],
                top_k=data["top_k"],
            )
        except Exception as exc:
            # KB may not be fully initialised in all environments
            return Response(
                {"error": f"Knowledge base unavailable: {exc}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({
            "query": data["q"],
            "agent": data.get("agent", ""),
            "top_k": data["top_k"],
            "results": results,
        })


# ---------------------------------------------------------------------------
# Execution Context read-back (for polling / debugging)
# ---------------------------------------------------------------------------

class SwarmExecutionContextDetailView(APIView):
    """
    GET /api/swarm/executions/<execution_id>/

    Read back an execution context. Used by swarm to poll escalation status
    and by AOS operators to inspect a run.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, execution_id):
        try:
            ctx = SwarmExecutionContext.objects.get(id=execution_id)
        except SwarmExecutionContext.DoesNotExist:
            return Response(
                {"error": "Execution context not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(SwarmExecutionContextSerializer(ctx).data)


# agent-swarm lives two levels above backend/
_SWARM_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "agent-swarm"

# Live run handles only. Durable state lives on SwarmExecutionContext.
_RUNS: dict = {}

_RUN_DONE_STATES = {"completed", "failed", "cancelled", "denied"}


def _run_context_snapshot(ctx: SwarmExecutionContext) -> dict:
    """Shape a persisted execution context into the run payload used by the UI."""
    lines = list(ctx.run_lines or [])
    done = ctx.status in _RUN_DONE_STATES
    return {
        "lines": lines,
        "done": done,
        "exit_code": ctx.run_exit_code,
        "goal": ctx.task_summary or "",
        "engine": ctx.engine,
        "model": "",
        "ctx_id": str(ctx.id),
    }


def _load_run_state(run_id: str) -> dict | None:
    """Return live in-memory state if available, otherwise hydrate from DB."""
    run = _RUNS.get(run_id)
    if run is not None:
        return run
    ctx = SwarmExecutionContext.objects.filter(id=run_id).first()
    if not ctx:
        return None
    return _run_context_snapshot(ctx)


def _persist_run_state(run_id: str, *, status: str | None = None, exit_code: int | None = None) -> None:
    """Persist the live native run buffer so stream/poll survive restarts."""
    run = _RUNS.get(run_id)
    if not run:
        return
    ctx_id = run.get("ctx_id")
    if not ctx_id:
        return
    updates = {
        "run_lines": run.get("lines", []),
    }
    if status is not None:
        updates["status"] = status
    if exit_code is not None:
        updates["run_exit_code"] = exit_code
    if status in {"completed", "failed", "cancelled", "denied"}:
        updates["completed_at"] = timezone.now()
    try:
        SwarmExecutionContext.objects.filter(id=ctx_id).update(**updates)
    except Exception:
        # Best-effort durability. The live run still continues if persistence fails.
        pass


def _append_run_line(run_id: str, content: str) -> None:
    run = _RUNS.get(run_id)
    if not run:
        return
    if run.get("cancelled") and content != "[sys] Run cancelled by user":
        return
    if run.get("done"):
        return
    run["lines"].append({"type": "line", "content": content})
    _persist_run_state(run_id, status="running")


def _finish_run(run_id: str, exit_code: int, status: str) -> None:
    run = _RUNS.get(run_id)
    if not run:
        return
    run["done"] = True
    run["exit_code"] = exit_code
    _append = {"type": "done", "exit_code": exit_code}
    if status == "cancelled":
        _append["cancelled"] = True
    run["lines"].append(_append)
    _persist_run_state(run_id, status=status, exit_code=exit_code)


def _pick_specialist(goal: str) -> tuple[str, str]:
    """Route a free-form goal to the most appropriate specialist agent."""
    g = goal.lower()
    if any(k in g for k in ("frontend", " ui ", "react", "component", "css", "design system")):
        return "engineering-frontend-developer", "engineering"
    if any(k in g for k in ("devops", "deploy", "docker", "kubernetes", "ci/cd", "infrastructure", "pipeline")):
        return "devops", "engineering"
    if any(k in g for k in ("sale", "lead", "outreach", "crm", "prospect", "pitch", "cold email")):
        return "sales-account-strategist", "sales"
    if any(k in g for k in ("market", "campaign", "social media", "email marketing", "brand", "launch", "content")):
        return "marketing-content-creator", "marketing"
    if any(k in g for k in ("product", "prd", "roadmap", "user story", "priorit", "feature")):
        return "product-manager", "product"
    if any(k in g for k in ("research", "competitor", "market size", "tam", "trend", "analysis", "landscape")):
        return "strategy-competitor-analyst", "strategy"
    return "engineering-backend-architect", "engineering"


def _native_graph_runner(run_id: str, run: dict, goal: str) -> None:
    """
    Background thread: runs a 3-agent DAG (plan → execute → ship) using the
    native LLM runtime. Emits terminal lines into run['lines'] so the polling
    endpoint can stream them to the frontend.
    """
    import asyncio as _asyncio
    import sys as _sys
    _sys.path.insert(0, str(_SWARM_ROOT))

    def _emit(content: str) -> None:
        _append_run_line(run_id, content)

    try:
        from runtime.orchestration import TaskGraph, TaskNode, GraphOrchestrator
        from runtime.events import EventBus, EventType
        from runtime import run_agent
    except Exception as exc:
        _emit(f"[error] Failed to import native runtime: {exc}")
        run["exit_code"] = 1
        return

    specialist_name, specialist_category = _pick_specialist(goal)

    # Create an isolated workspace directory for this run
    import os as _os
    workspace = Path(f"/tmp/aos-workspace/{run_id}")
    workspace.mkdir(parents=True, exist_ok=True)

    _emit(f"[sys] run {run_id[:8]} — native runtime (no CLI required)")
    _emit(f"[sys] goal: {goal[:200]}")
    _emit(f"[sys] specialist: {specialist_name}")
    _emit(f"[sys] workspace: {workspace}")
    _emit("")
    _emit("PHASE 1/5 | QUESTIONNAIRE")
    _emit("  Routing goal to specialist agents...")
    _emit("")

    perms = ["file.read", "file.write", "shell.run"]
    graph = TaskGraph(id=run_id)

    graph.add(TaskNode(
        id="plan",
        agent_name="planner",
        agent_category="strategy",
        task=(
            f"You are planning work for this goal:\n\n  '{goal}'\n\n"
            "Produce a concise execution plan with these sections:\n"
            "  1. PROBLEM — what's being solved (2-3 sentences)\n"
            "  2. APPROACH — the strategy and key steps\n"
            "  3. DELIVERABLES — exact files and artefacts that will be created\n"
            "  4. FILE STRUCTURE — list every file path to be created\n"
            "  5. SUCCESS METRIC — one measurable outcome\n\n"
            "Be specific and decisive. A specialist agent will execute against this plan verbatim."
        ),
        permissions=perms,
        workspace_dir=str(workspace),
        timeout_seconds=120,
    ))

    graph.add(TaskNode(
        id="execute",
        agent_name=specialist_name,
        agent_category=specialist_category,
        task=(
            f"Build this:\n\n  '{goal}'\n\n"
            "Use the planner's output above as your blueprint.\n\n"
            "IMPORTANT — you MUST create actual files. Use your file_write tool to write "
            "every file to disk. Do NOT just describe what to build — BUILD IT.\n\n"
            "For each file:\n"
            "  1. Call file_write with the correct path and complete file contents\n"
            "  2. After writing, confirm: '[wrote] path/to/file'\n\n"
            "Start with the most critical files first. Write complete, working code — "
            "no placeholders, no TODOs. A developer should be able to run this immediately."
        ),
        depends_on=["plan"],
        permissions=perms,
        workspace_dir=str(workspace),
        timeout_seconds=600,
    ))

    graph.add(TaskNode(
        id="ship",
        agent_name="marketing-content-creator",
        agent_category="marketing",
        task=(
            f"Write the final delivery summary for:\n\n  '{goal}'\n\n"
            "Based on all the work above, write a clear summary with:\n"
            "  - WHAT WAS BUILT — every file created and what it does\n"
            "  - HOW TO RUN — exact commands to boot the project locally\n"
            "  - NEXT STEPS — the 3 most important immediate actions\n"
            "  - QUICK WINS — things shippable in the next 48 hours\n"
        ),
        depends_on=["execute"],
        permissions=perms,
        workspace_dir=str(workspace),
        timeout_seconds=120,
    ))

    bus = EventBus()

    def _on_agent_started(event):
        node_id = event.payload.get("node_id", "")
        agent = event.payload.get("agent_name", node_id)
        if node_id == "plan":
            _emit("PHASE 2/5 | PLANNER")
            _emit(f"  [sys] agent: {agent}")
        elif node_id == "execute":
            _emit("")
            _emit("PHASE 3/5 | EXECUTE")
            _emit(f"  Dispatching to {agent}")
        elif node_id == "ship":
            _emit("")
            _emit("PHASE 5/5 | SHIP")
            _emit(f"  [sys] agent: {agent}")

    def _on_agent_completed(event):
        node_id = event.payload.get("node_id", "")
        dur_ms = event.payload.get("duration_ms", 0)
        _emit(f"  SUCCESS {node_id} ({dur_ms // 1000}s)")

    def _on_agent_failed(event):
        node_id = event.payload.get("node_id", "")
        err = event.payload.get("error", "unknown error")
        _emit(f"  FAILED {node_id}: {err[:200]}")

    bus.on(EventType.AGENT_STARTED, _on_agent_started)
    bus.on(EventType.AGENT_COMPLETED, _on_agent_completed)
    bus.on(EventType.AGENT_FAILED, _on_agent_failed)

    async def _executor(node, upstream, _msg_bus):
        if run.get("cancelled"):
            raise RuntimeError("Run cancelled by user")
        context_block = ""
        if upstream:
            parts = []
            for dep_id, out in upstream.items():
                txt = (out or {}).get("output", "")
                if txt:
                    parts.append(f"### From {dep_id}\n{txt[:8000]}")
            if parts:
                context_block = "\n\n## Upstream results\n\n" + "\n\n".join(parts)

        result = await run_agent(
            agent_name=node.agent_name,
            task=node.task + context_block,
            permissions=node.permissions,
            execution_id=f"{run_id}:{node.id}",
            agent_category=node.agent_category,
            timeout_seconds=node.timeout_seconds,
        )
        if not result.success:
            raise RuntimeError(result.error or "Agent execution failed")

        if result.output:
            _emit("")
            _emit("[sys] agent response:")
            for line in result.output.split("\n"):
                _emit(line)
            _emit("")

        return result.to_dict()

    try:
        orchestrator = GraphOrchestrator(
            graph=graph,
            executor=_executor,
            event_bus=bus,
            execution_id=run_id,
        )
        result = _asyncio.run(orchestrator.run())
        run["exit_code"] = 0 if result["success"] else 1
        _emit("")

        # List files written to workspace
        written = []
        for root, dirs, files in _os.walk(workspace):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for f in files:
                rel = _os.path.relpath(_os.path.join(root, f), workspace)
                written.append(rel)
        if written:
            _emit(f"[sys] workspace: {workspace}")
            _emit(f"[sys] {len(written)} file(s) written:")
            for f in sorted(written):
                size = _os.path.getsize(workspace / f)
                _emit(f"  ✓ {f}  ({size:,} bytes)")
        else:
            _emit(f"[sys] workspace: {workspace} (no files written — agent output only)")

        status_word = "complete" if result["success"] else "finished with errors"
        _emit(f"[sys] run {status_word} — exit {run['exit_code']}")
    except Exception as exc:
        import traceback as _tb
        _emit(f"[error] {exc}")
        _emit(_tb.format_exc()[-600:])
        run["exit_code"] = 1
    finally:
        if not run.get("done"):
            status = "completed" if run.get("exit_code") == 0 else "failed"
            _finish_run(run_id, run.get("exit_code", 1), status)


class SwarmRunView(APIView):
    """
    POST /api/swarm/run/
    Start a native multi-agent run. Returns run_id immediately.
    Body: { "goal": "..." }

    Runs plan → execute → ship via the native LLM runtime (no CLI subprocess).
    Progress is streamed via GET /api/swarm/run/<run_id>/poll/.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        goal = (request.data.get("goal") or "").strip()
        if not goal:
            return Response({"error": "goal is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            guard_task_input(goal)
        except PromptInjectionError as exc:
            log_security_event(
                'INJECTION_ATTEMPT',
                user=request.user,
                detail=str(exc),
                request=request,
            )
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        run_id = str(uuid.uuid4())
        ctx = SwarmExecutionContext.objects.create(
            id=run_id,
            aos_agent=None,
            swarm_agent_name="native-run",
            engine=SwarmEngine.GENERIC,
            task_summary=goal[:500],
            status="running",
            started_at=timezone.now(),
            run_lines=[],
            run_exit_code=None,
        )
        run = {
            "lines": [],
            "done": False,
            "exit_code": None,
            "goal": goal,
            "engine": "native",
            "model": "",
            "ctx_id": str(ctx.id),
        }
        _RUNS[run_id] = run

        t = threading.Thread(
            target=_native_graph_runner,
            args=(run_id, run, goal),
            daemon=True,
        )
        t.start()

        return Response({"run_id": run_id, "goal": goal, "engine": "native", "model": ""})


class SwarmRunStreamView(APIView):
    """
    GET /api/swarm/run/<run_id>/stream/
    SSE stream. Replays history then tails new lines. Sends a ping every 15s to keep alive.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, run_id):
        run = _load_run_state(run_id)
        if not run:
            return Response({"error": "Run not found"}, status=status.HTTP_404_NOT_FOUND)

        def _stream():
            idx = 0
            last_ping = time.time()
            while True:
                # Drain buffered lines
                while idx < len(run["lines"]):
                    yield f"data: {json.dumps(run['lines'][idx])}\n\n"
                    idx += 1

                if run["done"]:
                    yield f"data: {json.dumps({'type': 'done', 'exit_code': run['exit_code']})}\n\n"
                    break

                # Keepalive ping every 15s
                if time.time() - last_ping > 15:
                    yield f"data: {json.dumps({'type': 'ping'})}\n\n"
                    last_ping = time.time()

                time.sleep(0.1)

        response = StreamingHttpResponse(_stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response


class SwarmRunPollView(APIView):
    """
    GET /api/swarm/run/<run_id>/poll/?from=N
    Returns lines[N:] as a plain JSON response. Frontend polls this every 500ms.
    Works through any proxy — no streaming required.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, run_id):
        run = _load_run_state(run_id)
        if not run:
            return Response({"error": "Run not found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            from_idx = int(request.query_params.get("from", 0))
        except (TypeError, ValueError):
            from_idx = 0
        return Response({
            "lines": run["lines"][from_idx:],
            "done": run["done"],
            "exit_code": run["exit_code"],
            "total": len(run["lines"]),
        })


class SwarmRunInputView(APIView):
    """
    POST /api/swarm/run/<run_id>/input/
    Send a line of stdin to the running orchestrator process.
    Body: { "text": "yes" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, run_id):
        run = _load_run_state(run_id)
        if not run:
            return Response({"error": "Run not found"}, status=status.HTTP_404_NOT_FOUND)
        if run["done"]:
            return Response({"error": "Run has already finished"}, status=status.HTTP_410_GONE)
        return Response(
            {"error": "Native swarm runs do not accept interactive stdin input"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class SwarmRunStatusView(APIView):
    """GET /api/swarm/run/<run_id>/  — lightweight status poll."""
    permission_classes = [IsAuthenticated]

    def get(self, request, run_id):
        run = _load_run_state(run_id)
        if not run:
            return Response({"error": "Run not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "run_id": run_id,
            "goal": run["goal"],
            "engine": run["engine"],
            "model": run.get("model", ""),
            "done": run["done"],
            "exit_code": run["exit_code"],
            "line_count": len(run["lines"]),
        })


class SwarmRunCancelView(APIView):
    """
    POST /api/swarm/run/<run_id>/cancel/
    Terminate the orchestrator process for a running swarm run.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, run_id):
        run = _load_run_state(run_id)
        if not run:
            return Response({"error": "Run not found"}, status=status.HTTP_404_NOT_FOUND)
        if run["done"]:
            return Response({"detail": "Run already completed", "run_id": run_id})
        run_obj = _RUNS.get(run_id)
        if run_obj is not None:
            _append_run_line(run_id, "[sys] Run cancelled by user")
            run_obj["cancelled"] = True
            _finish_run(run_id, -1, "cancelled")
        else:
            try:
                ctx = SwarmExecutionContext.objects.get(id=run_id)
                ctx.status = "cancelled"
                ctx.run_exit_code = -1
                ctx.completed_at = timezone.now()
                ctx.run_lines = list(ctx.run_lines or []) + [
                    {"type": "line", "content": "[sys] Run cancelled by user"},
                    {"type": "done", "exit_code": -1, "cancelled": True},
                ]
                ctx.save(update_fields=["status", "run_exit_code", "completed_at", "run_lines"])
            except SwarmExecutionContext.DoesNotExist:
                pass
        return Response({"ok": True, "run_id": run_id, "detail": "Cancelled"})


class ExecutionCancelView(APIView):
    """
    POST /api/swarm/executions/<execution_id>/cancel/
    Cancel a native execution by setting a Redis cancellation flag.
    The NativeAgentWorker checks this flag between iterations.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, execution_id):
        redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
        try:
            import redis
            r = redis.from_url(redis_url, decode_responses=True)
            cancel_key = f"aos:cancel:{execution_id}"
            r.set(cancel_key, "1", ex=3600)
            r.publish(f"aos:events:{execution_id}", json.dumps({
                "type": "task.cancelled",
                "execution_id": str(execution_id),
                "timestamp": timezone.now().isoformat(),
            }))
        except Exception:
            pass

        # Update DB record if it exists
        try:
            ctx = SwarmExecutionContext.objects.get(id=execution_id)
            ctx.status = "cancelled"
            ctx.save(update_fields=["status"])
        except SwarmExecutionContext.DoesNotExist:
            pass

        return Response({"ok": True, "execution_id": str(execution_id), "detail": "Cancellation signal sent"})


class WorkflowTemplateLaunchView(APIView):
    """
    POST /api/swarm/workflows/templates/<template_id>/launch/
    Body: { "idea": "..." }

    Builds the template DAG with the user-supplied idea and runs it.
    Returns the orchestration result with per-node status.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, template_id):
        idea = request.data.get("idea", "").strip()
        if not idea:
            return Response({"detail": "idea is required"}, status=status.HTTP_400_BAD_REQUEST)

        execution_id = str(uuid.uuid4())

        try:
            import asyncio
            import sys as _sys
            _sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "agent-swarm"))
            from runtime.templates import get_template
            from runtime import run_graph

            template = get_template(template_id)
            if not template:
                return Response({"detail": f"Unknown template: {template_id}"}, status=status.HTTP_404_NOT_FOUND)

            graph = template["build"](idea)
            graph.id = execution_id

            # Create a SwarmExecutionContext so the replay endpoint has an
            # anchor for this run (and Observe shows agent/status/engine).
            ctx = SwarmExecutionContext.objects.create(
                id=execution_id,
                aos_agent=None,
                swarm_agent_name=f"template:{template_id}",
                engine=SwarmEngine.GENERIC,
                task_summary=idea[:500],
                started_at=timezone.now(),
                status="running",
            )

            result = asyncio.run(run_graph(graph, execution_id=execution_id))

            # Mark context complete + persist a TraceStep per graph node so the
            # replay endpoint returns something useful for native runs.
            from apps.agent_intelligence.models import Conversation, TraceStep

            ctx.status = "completed" if result.get("success") else "failed"
            ctx.completed_at = timezone.now()
            ctx.save(update_fields=["status", "completed_at"])

            try:
                # Conversation.agent is non-null FK, but a template run has no
                # single owning agent. Resolve one in priority order:
                #   1. SwarmAgentManifest mapping for the first node's swarm name
                #   2. Any agent owned by the launching user
                #   3. Get-or-create a per-user "swarm-orchestrator" agent
                from apps.agent_registry.models import Agent

                nodes_out = result.get("graph", {}).get("nodes", []) or []
                anchor_agent = None
                for n in nodes_out:
                    manifest = SwarmAgentManifest.objects.filter(
                        swarm_name=n.get("agent_name", "")
                    ).select_related("aos_agent").first()
                    if manifest and manifest.aos_agent:
                        anchor_agent = manifest.aos_agent
                        break

                if anchor_agent is None and request.user.is_authenticated:
                    anchor_agent = Agent.objects.filter(owner=request.user).first()

                if anchor_agent is None and request.user.is_authenticated:
                    anchor_agent, _ = Agent.objects.get_or_create(
                        name="swarm-orchestrator",
                        owner=request.user,
                        defaults={
                            "identity_key": f"swarm-orchestrator:{request.user.id}:{secrets.token_hex(8)}",
                            "description": "System anchor for template / multi-agent swarm runs",
                        },
                    )

                # Persist on the execution context so Observe replay can resolve
                # policy logs + display the agent name.
                if anchor_agent and ctx.aos_agent_id != anchor_agent.id:
                    ctx.aos_agent = anchor_agent
                    ctx.save(update_fields=["aos_agent"])

                if anchor_agent is None:
                    raise RuntimeError("No anchor agent resolvable for trace persistence")

                conv, _ = Conversation.objects.get_or_create(
                    session_id=execution_id,
                    defaults={"agent": anchor_agent, "title": f"Template {template_id}"},
                )
                for node in nodes_out:
                    TraceStep.objects.create(
                        conversation=conv,
                        node_name=f"{node['id']}:{node['agent_name']}",
                        input_data={"task": node.get("task", "")[:1000], "depends_on": node.get("depends_on", [])},
                        output_data={
                            "status": node.get("status"),
                            "output": (node.get("output") or "")[:3000],
                            "error": node.get("error", ""),
                            "tokens_in": node.get("tokens_input", 0),
                            "tokens_out": node.get("tokens_output", 0),
                        },
                        duration_ms=node.get("duration_ms", 0),
                    )
            except Exception as trace_err:
                # Trace persistence is best-effort — don't fail the response if it errors.
                import logging
                logging.getLogger(__name__).warning("Trace persistence failed: %s", trace_err)

            return Response({
                "execution_id": execution_id,
                "template_id": template_id,
                "idea": idea,
                **result,
            })
        except ImportError:
            return Response(
                {"detail": "Swarm runtime not available in this environment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as exc:
            import traceback
            return Response(
                {"detail": str(exc), "trace": traceback.format_exc()[-2000:]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class WorkflowTemplatesListView(APIView):
    """GET /api/swarm/workflows/templates/ — list available templates."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            import sys as _sys
            _sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "agent-swarm"))
            from runtime.templates import TEMPLATES
            return Response({
                "templates": [
                    {
                        "id": tid,
                        "name": t["name"],
                        "description": t["description"],
                        "agents": t["agents"],
                        "estimated_minutes": t["estimated_minutes"],
                    }
                    for tid, t in TEMPLATES.items()
                ]
            })
        except ImportError:
            return Response({"templates": []})


class WorkflowGraphRunView(APIView):
    """
    POST /api/swarm/workflows/graph/
    Run a multi-agent DAG. Body:
      {
        "nodes": [
          {"id": "a", "agent": "planner", "task": "...", "depends_on": []},
          {"id": "b", "agent": "engineering-backend-architect", "task": "...", "depends_on": ["a"]},
          ...
        ],
        "permissions": ["file.read", "github.read"]
      }
    Returns the orchestration result with per-node status.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        nodes_in = request.data.get("nodes") or []
        if not nodes_in:
            return Response({"detail": "nodes is required"}, status=status.HTTP_400_BAD_REQUEST)

        default_perms = request.data.get("permissions") or ["file.read"]
        execution_id = str(uuid.uuid4())

        try:
            import asyncio
            import sys as _sys
            _sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "agent-swarm"))
            from runtime import TaskGraph, TaskNode, run_graph

            graph = TaskGraph(id=execution_id)
            for nd in nodes_in:
                graph.add(TaskNode(
                    id=str(nd["id"]),
                    agent_name=str(nd["agent"]),
                    task=str(nd.get("task", "")),
                    depends_on=list(nd.get("depends_on", [])),
                    permissions=list(nd.get("permissions", default_perms)),
                    timeout_seconds=int(nd.get("timeout_seconds", 600)),
                    workspace_dir=str(nd.get("workspace_dir", ".")),
                    department_id=str(nd.get("department_id", "")),
                    agent_category=str(nd.get("agent_category", "")),
                ))
            result = asyncio.run(run_graph(graph, execution_id=execution_id))
            return Response(result)
        except ImportError:
            return Response(
                {"detail": "Swarm runtime not available in this environment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CouncilReviewView(APIView):
    """
    POST /api/swarm/council/review/
    Run a multi-agent council review on a proposed action.
    Body: { "action": "...", "context": {...}, "reviewers": ["architecture", "security", ...] }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action = request.data.get("action", "").strip()
        if not action:
            return Response({"detail": "action is required"}, status=status.HTTP_400_BAD_REQUEST)

        context = request.data.get("context", {})
        reviewers = request.data.get("reviewers") or None
        execution_id = str(uuid.uuid4())

        try:
            import asyncio
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "agent-swarm"))
            from runtime.council import CouncilCoordinator
            coordinator = CouncilCoordinator()
            decision = asyncio.run(coordinator.review(
                proposed_action=action,
                context=context,
                execution_id=execution_id,
                reviewers=reviewers,
            ))
            return Response(decision.as_dict)
        except ImportError:
            # Swarm runtime not available — return stub response
            return Response({
                "verdict": "CONDITIONAL_APPROVE",
                "aggregate_score": 72.0,
                "risk_level": "medium",
                "summary": f"Council review stub: '{action[:80]}'. Install swarm runtime for full review.",
                "conditions": ["Enable swarm runtime for full council review"],
                "duration_ms": 0,
                "opinions": [],
            })
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# Native execution event stream (Phase 3)
# ---------------------------------------------------------------------------

class ExecutionEventStreamView(APIView):
    """
    GET /api/swarm/executions/<execution_id>/stream/

    Server-Sent Events stream for a native execution.
    Subscribers receive every AOSEvent emitted by the NativeAgentWorker
    in real time via Redis pub/sub.

    Falls back to polling TraceStep from the DB when Redis is not available.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, execution_id):
        # EventSource API cannot set Authorization headers — accept token via query param.
        token = request.query_params.get("token", "")
        if token and not request.auth:
            from rest_framework_simplejwt.authentication import JWTAuthentication
            try:
                from rest_framework.request import Request as DRFRequest
                from django.http import HttpRequest
                fake = HttpRequest()
                fake.META["HTTP_AUTHORIZATION"] = f"Bearer {token}"
                validated = JWTAuthentication().authenticate(DRFRequest(fake))
                if validated is None:
                    return Response({"error": "Unauthorized"}, status=401)
            except Exception:
                return Response({"error": "Unauthorized"}, status=401)

        redis_url = os.environ.get("REDIS_URL", os.environ.get("CELERY_BROKER_URL", ""))
        if redis_url:
            return self._stream_from_redis(request, str(execution_id), redis_url)
        return self._stream_from_db(request, str(execution_id))

    def _stream_from_redis(self, request, execution_id: str, redis_url: str):
        def _generate():
            try:
                import redis
                r = redis.from_url(redis_url, decode_responses=True)
                pubsub = r.pubsub()
                pubsub.subscribe(f"aos:events:{execution_id}")
                yield f"data: {json.dumps({'type': 'connected', 'execution_id': execution_id})}\n\n"
                last_ping = time.time()
                for message in pubsub.listen():
                    if message["type"] == "message":
                        yield f"data: {message['data']}\n\n"
                        try:
                            data = json.loads(message["data"])
                            if data.get("event_type") in ("task.completed", "task.failed"):
                                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                                break
                        except Exception:
                            pass
                    if time.time() - last_ping > 15:
                        yield f"data: {json.dumps({'type': 'ping'})}\n\n"
                        last_ping = time.time()
            except Exception as exc:
                yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

        response = StreamingHttpResponse(_generate(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def _stream_from_db(self, request, execution_id: str):
        """Poll TraceStep from DB when Redis is unavailable."""
        def _generate():
            from apps.agent_intelligence.models import TraceStep
            from apps.swarm_bridge.models import SwarmExecutionContext
            import django.utils.timezone as tz

            yield f"data: {json.dumps({'type': 'connected', 'execution_id': execution_id, 'mode': 'poll'})}\n\n"
            last_id = None
            last_ping = time.time()
            polls = 0
            MAX_POLLS = 600  # 60s at 100ms interval

            while polls < MAX_POLLS:
                qs = TraceStep.objects.filter(
                    conversation__session_id=execution_id
                ).order_by("created_at")
                if last_id:
                    qs = qs.filter(id__gt=last_id)

                for step in qs:
                    event_data = {
                        "event_type": "trace.step",
                        "execution_id": execution_id,
                        "agent_id": str(step.conversation.agent_id),
                        "payload": {
                            "node": step.node_name,
                            "input": step.input_data,
                            "output": step.output_data,
                            "risk_score": step.risk_score,
                            "is_loop": step.is_loop,
                        },
                        "duration_ms": step.duration_ms,
                        "timestamp": step.created_at.isoformat(),
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"
                    last_id = step.id

                # Check if context is done
                ctx = SwarmExecutionContext.objects.filter(id=execution_id).first()
                if ctx and ctx.status in ("completed", "failed", "denied"):
                    yield f"data: {json.dumps({'type': 'done', 'status': ctx.status})}\n\n"
                    break

                if time.time() - last_ping > 15:
                    yield f"data: {json.dumps({'type': 'ping'})}\n\n"
                    last_ping = time.time()

                time.sleep(0.1)
                polls += 1

        response = StreamingHttpResponse(_generate(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        response["Access-Control-Allow-Origin"] = "*"
        return response


# ---------------------------------------------------------------------------
# Execution replay (Phase 4 — enterprise audit)
# ---------------------------------------------------------------------------

class ExecutionReplayView(APIView):
    """
    GET /api/swarm/executions/<execution_id>/replay/

    Returns every event recorded for an execution, ordered chronologically.
    Used for compliance audit ("show me exactly what the agent did in this run")
    and for debugging failed executions.

    Response includes: TraceStep records + PolicyAuditLog entries for this execution.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, execution_id):
        from apps.agent_intelligence.models import TraceStep
        from apps.policy_engine.models import PolicyAuditLog

        eid_str = str(execution_id)

        # TraceSteps are anchored to a Conversation whose session_id == execution_id
        # (see SwarmTraceEventView which writes them that way). Match either by
        # the conversation's session_id OR by trace records that mention this
        # execution_id in their input/output JSON payload.
        steps = TraceStep.objects.filter(
            conversation__session_id=eid_str
        ).order_by("created_at").values(
            "id", "node_name", "input_data", "output_data",
            "duration_ms", "risk_score", "is_loop", "created_at",
        )

        # PolicyAuditLog has no direct execution_id; filter by the agent that
        # ran this execution. We resolve the agent from SwarmExecutionContext.
        ctx = SwarmExecutionContext.objects.filter(id=execution_id).first()
        policy_logs = []
        if ctx and ctx.aos_agent_id:
            policy_logs = list(
                PolicyAuditLog.objects.filter(
                    agent_id=ctx.aos_agent_id,
                    created_at__gte=ctx.started_at,
                ).order_by("created_at").values(
                    "id", "policy__name", "decision", "reason",
                    "resource", "action", "created_at",
                )
            )

        # Shape events so the Observe live-feed renderer can read them directly.
        # Observe expects: {event_type, timestamp, duration_ms, payload:{node,
        # tokens_in, tokens_out, error, ...}} — see EVENT_LABEL in Observe.jsx.
        events = []
        for step in steps:
            out = step["output_data"] or {}
            status_str = out.get("status", "")
            if status_str == "failed":
                etype = "agent.failed"
            elif status_str == "completed":
                etype = "agent.completed"
            else:
                etype = "trace.step"
            events.append({
                "source": "trace",
                "event_type": etype,
                "timestamp": step["created_at"].isoformat() if step["created_at"] else None,
                "duration_ms": step["duration_ms"],
                "payload": {
                    "node": step["node_name"],
                    "input": step["input_data"],
                    "output": out,
                    "output_length": len(str(out.get("output", ""))),
                    "tokens_in": out.get("tokens_in", 0),
                    "tokens_out": out.get("tokens_out", 0),
                    "error": out.get("error", ""),
                    "status": status_str,
                    "risk_score": step["risk_score"],
                    "is_loop": step["is_loop"],
                },
            })

        for log in policy_logs:
            decision = (log["decision"] or "").lower()
            etype = "policy.denied" if decision in ("deny", "denied") else "policy.checked"
            events.append({
                "source": "policy",
                "event_type": etype,
                "timestamp": log["created_at"].isoformat() if log["created_at"] else None,
                "payload": {
                    "policy": log["policy__name"],
                    "decision": log["decision"],
                    "resource": log["resource"],
                    "action": log["action"],
                    "reason": log["reason"],
                },
            })

        events.sort(key=lambda e: e["timestamp"] or "")

        return Response({
            "execution_id": eid_str,
            "agent": ctx.swarm_agent_name if ctx else None,
            "status": ctx.status if ctx else None,
            "engine": ctx.engine if ctx else None,
            "events": events,
            "total_events": len(events),
        })


class ExecutionListView(APIView):
    """
    GET /api/swarm/executions/
    Lists recent swarm executions (most recent first).
    Supports ?type=template to filter to template launches only.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = SwarmExecutionContext.objects.order_by("-started_at")
        exec_type = request.query_params.get("type", "")
        if exec_type == "template":
            qs = qs.filter(swarm_agent_name__startswith="template:")
        qs = qs[:30]
        results = []
        for ctx in qs:
            name = ctx.swarm_agent_name or ""
            template_id = name.replace("template:", "") if name.startswith("template:") else ""
            duration_s = None
            if ctx.started_at and ctx.completed_at:
                duration_s = int((ctx.completed_at - ctx.started_at).total_seconds())
            results.append({
                "id": str(ctx.id),
                "template_id": template_id,
                "swarm_agent_name": name,
                "status": ctx.status or "unknown",
                "task_summary": (ctx.task_summary or "")[:160],
                "started_at": ctx.started_at.isoformat() if ctx.started_at else None,
                "completed_at": ctx.completed_at.isoformat() if ctx.completed_at else None,
                "duration_s": duration_s,
            })
        return Response({"results": results, "count": len(results)})
