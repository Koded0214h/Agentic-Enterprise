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

        return Response({
            "decision": decision,
            "reason": reason,
            "policy_id": policy_id,
            "pending_action_id": pending_action_id,
            "execution_id": str(execution_id),
        })


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


_ANSI_RE = re.compile(r'\x1b\[[0-9;]*[mGKHF]')

# agent-swarm lives two levels above backend/
_SWARM_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "agent-swarm"


class SwarmRunView(APIView):
    """
    POST /api/swarm/run/

    Launch an orchestrator run and stream output line-by-line via SSE.

    Body:
        { "goal": "Build a B2B SaaS for X", "engine": "claude" }

    Events:
        data: {"type": "line",  "content": "..."}
        data: {"type": "done",  "exit_code": 0}
        data: {"type": "error", "detail": "..."}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        goal = (request.data.get("goal") or "").strip()
        engine = (request.data.get("engine") or "claude").strip()

        if not goal:
            return Response({"error": "goal is required"}, status=status.HTTP_400_BAD_REQUEST)

        orchestrator = _SWARM_ROOT / "orchestrator.py"
        if not orchestrator.exists():
            return Response(
                {"error": f"Orchestrator not found at {orchestrator}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Build env — inherit current env, overlay swarm .env if present
        env = os.environ.copy()
        env_file = _SWARM_ROOT / ".env"
        if env_file.exists():
            for raw in env_file.read_text().splitlines():
                raw = raw.strip()
                if raw and not raw.startswith("#") and "=" in raw:
                    k, v = raw.split("=", 1)
                    env[k.strip()] = v.strip()

        def _stream():
            try:
                proc = subprocess.Popen(
                    [sys.executable, str(orchestrator), goal, "--engine", engine],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,
                    cwd=str(_SWARM_ROOT),
                    env=env,
                )
                for raw_line in proc.stdout:
                    clean = _ANSI_RE.sub("", raw_line).rstrip()
                    if clean:
                        yield f"data: {json.dumps({'type': 'line', 'content': clean})}\n\n"
                proc.wait()
                yield f"data: {json.dumps({'type': 'done', 'exit_code': proc.returncode})}\n\n"
            except Exception as exc:
                yield f"data: {json.dumps({'type': 'error', 'detail': str(exc)})}\n\n"

        response = StreamingHttpResponse(_stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
