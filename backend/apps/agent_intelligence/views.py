import json
import logging
import time

from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.generics import views
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    LLMConfig, AgentCapability, Conversation,
    Message, ToolDefinition, WorkflowTask, TraceStep, PendingAction,
)
from .serializers import (
    LLMConfigSerializer, AgentCapabilitySerializer,
    ConversationSerializer, MessageSerializer,
    ToolDefinitionSerializer, AgentExecuteSerializer,
    WorkflowTaskSerializer, TraceStepSerializer, PendingActionSerializer,
)
from .utils.llm_manager import LLMManager
from .utils.tool_registry import ToolRegistry
from .utils.agent_factory import LangGraphAgentFactory
from .utils.dag_scheduler import DAGScheduler
from apps.agent_registry.models import Agent
from apps.policy_engine.utils import PolicyEvaluator
from apps.billing.services import BillingService, BudgetExceededError

logger = logging.getLogger(__name__)

# Baseline cost estimate per execution turn (USD) used for pre-flight budget check.
_ESTIMATED_COST_PER_TURN = 0.002


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _record_usage(agent, conversation, start_time):
    duration_ms = int((time.time() - start_time) * 1000)
    BillingService.record_usage(
        agent=agent,
        resource_type="conversation",
        resource_id=conversation.id,
        compute_time_ms=duration_ms,
        cost=float(conversation.total_cost),
    )


def _check_policy(agent, action: str, context: dict = None):
    evaluator = PolicyEvaluator(agent)
    decision, policy, reason = evaluator.evaluate(
        resource="agent:execute",
        action=action,
        context=context or {},
    )
    return decision, reason, policy


def _extract_reply(result: dict) -> str:
    last = result["messages"][-1]
    if hasattr(last, "content"):
        return last.content
    if isinstance(last, dict):
        return last.get("content", "")
    return str(last)


_ROLE_MAP = {
    "USER": "user",
    "AGENT": "assistant",
    "SYSTEM": "system",
    "TOOL": "tool",
}


def _persist_history(conversation, result_messages):
    existing_count = conversation.messages.count()
    new_messages = result_messages[existing_count:]
    for msg in new_messages:
        role = "AGENT"
        if hasattr(msg, "type"):
            if msg.type == "human":
                role = "USER"
            elif msg.type == "system":
                role = "SYSTEM"
            elif msg.type == "tool":
                role = "TOOL"
        content = msg.content if hasattr(msg, "content") else str(msg)
        if not content:
            continue
        if role != "USER":
            Message.objects.create(conversation=conversation, role=role, content=content)


def _build_agent_state(agent, capability, conversation, content: str) -> dict:
    prior = [
        {
            "role": _ROLE_MAP.get(msg.role.upper(), "user"),
            "content": msg.content,
        }
        for msg in conversation.messages.order_by("created_at")
    ]
    return {
        "messages": prior + [{"role": "user", "content": content}],
        "agent_id": str(agent.id),
        "conversation_id": str(conversation.id),
        "iterations": 0,
        "max_iterations": getattr(capability, "max_iterations", 10),
    }


def _budget_guard(agent):
    """Return 402 response dict if budget exceeded, else None."""
    try:
        BillingService.check_budget(agent, estimated_cost=_ESTIMATED_COST_PER_TURN)
    except BudgetExceededError as exc:
        return Response(
            {"error": "Budget exceeded", "detail": str(exc)},
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )
    return None


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------

class LLMConfigViewSet(viewsets.ModelViewSet):
    queryset = LLMConfig.objects.all()
    serializer_class = LLMConfigSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def recommendations(self, request):
        purposes = [
            "general_reasoning", "specialized_reasoning",
            "multi_agent", "embeddings", "high_speed",
        ]
        return Response({p: LLMManager.get_recommended_config(p) for p in purposes})


class AgentCapabilityViewSet(viewsets.ModelViewSet):
    queryset = AgentCapability.objects.all()
    serializer_class = AgentCapabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(agent__owner=self.request.user)

    @action(detail=True, methods=["post"])
    def enable_tool(self, request, pk=None):
        capability = self.get_object()
        tool_name = request.data.get("tool_name")
        if not tool_name:
            return Response({"error": "tool_name is required"}, status=status.HTTP_400_BAD_REQUEST)
        if tool_name not in capability.tools_enabled:
            capability.tools_enabled.append(tool_name)
            capability.save()
        return Response({"tools_enabled": capability.tools_enabled})


class ToolDefinitionViewSet(viewsets.ModelViewSet):
    queryset = ToolDefinition.objects.all()
    serializer_class = ToolDefinitionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def available(self, request):
        tools = ToolRegistry.get_registry().list_available_tools()
        return Response(tools)


class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(agent__owner=self.request.user)

    @action(detail=True, methods=["post"])
    def message(self, request, pk=None):
        conversation = self.get_object()
        agent = conversation.agent

        # Budget check (hard block)
        budget_err = _budget_guard(agent)
        if budget_err:
            return budget_err

        decision, reason, policy = _check_policy(
            agent, "chat", {"conversation_id": str(conversation.id)}
        )
        if decision == "DENY":
            return Response({"error": f"Policy denied: {reason}"}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get("content", "").strip()

        if decision == "ESCALATE":
            # Snapshot full conversation history so resumption is reliable
            # regardless of DB consistency at approval time.
            prior_messages = list(
                conversation.messages.order_by("created_at").values("role", "content")
            )
            PendingAction.objects.create(
                conversation=conversation,
                agent=agent,
                action_type="chat",
                resource="agent:execute",
                reason=reason,
                state_snapshot={
                    "content": content,
                    "messages": prior_messages,
                    "agent_id": str(agent.id),
                    "conversation_id": str(conversation.id),
                },
            )
            conversation.status = "PENDING_APPROVAL"
            conversation.save()
            return Response(
                {"status": "PENDING_APPROVAL", "reason": reason},
                status=status.HTTP_202_ACCEPTED,
            )

        if not content:
            return Response({"error": "Message content required"}, status=status.HTTP_400_BAD_REQUEST)

        if not hasattr(agent, "capability"):
            return Response({"error": "Agent has no capability configuration"}, status=status.HTTP_400_BAD_REQUEST)

        capability = agent.capability
        Message.objects.create(conversation=conversation, role="USER", content=content)

        start_time = time.time()
        try:
            executor = LangGraphAgentFactory.create_agent(agent)
            state = _build_agent_state(agent, capability, conversation, content)
            config = {"configurable": {"thread_id": str(conversation.id)}}
            result = executor.invoke(state, config=config)
            reply = _extract_reply(result)
            _record_usage(agent, conversation, start_time)
            _persist_history(conversation, result["messages"])
        except Exception:
            logger.exception("Agent execution failed for conversation %s", conversation.id)
            return Response({"error": "Agent execution failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        conversation.updated_at = timezone.now()
        conversation.save()
        return Response({"response": reply, "conversation_id": str(conversation.id)})

    @action(detail=True, methods=["get"])
    def traces(self, request, pk=None):
        conversation = self.get_object()
        traces = conversation.traces.all()
        return Response(TraceStepSerializer(traces, many=True).data)


class WorkflowTaskViewSet(viewsets.ModelViewSet):
    queryset = WorkflowTask.objects.all()
    serializer_class = WorkflowTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(agent__owner=self.request.user)

    @action(detail=True, methods=["post"])
    def add_dependency(self, request, pk=None):
        task = self.get_object()
        dep_id = request.data.get("dependency_id")
        try:
            dependency = WorkflowTask.objects.get(id=dep_id, agent__owner=request.user)
            task.depends_on.add(dependency)
            return Response({"status": "dependency added"})
        except WorkflowTask.DoesNotExist:
            return Response({"error": "Dependency task not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["post"])
    def run_dag(self, request):
        """
        Execute a set of tasks in DAG order.
        Body: { "task_ids": ["uuid1", "uuid2", ...] }
        Returns: execution results per task in topological order.
        """
        task_ids = request.data.get("task_ids", [])
        if not task_ids:
            return Response({"error": "task_ids required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            results = DAGScheduler.run_workflow(task_ids, owner=request.user)
            return Response(results)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def ready(self, request):
        """Return tasks that have all dependencies satisfied (runnable now)."""
        runnable = DAGScheduler.get_runnable_tasks(owner=request.user)
        return Response(WorkflowTaskSerializer(runnable, many=True).data)


class PendingActionViewSet(viewsets.ModelViewSet):
    queryset = PendingAction.objects.all()
    serializer_class = PendingActionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(agent__owner=self.request.user)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        pending = self.get_object()
        if pending.status != "PENDING":
            return Response({"error": "Action already decided"}, status=status.HTTP_400_BAD_REQUEST)

        decision = request.data.get("decision")
        if decision not in ["APPROVED", "DENIED"]:
            return Response({"error": "Invalid decision"}, status=status.HTTP_400_BAD_REQUEST)

        pending.status = decision
        pending.decided_by = request.user
        pending.decided_at = timezone.now()
        pending.save()

        conversation = pending.conversation
        if decision == "APPROVED":
            conversation.status = "ACTIVE"
            conversation.save()

            agent = pending.agent
            if not hasattr(agent, "capability"):
                return Response({"error": "Agent has no capability"}, status=status.HTTP_400_BAD_REQUEST)

            content = (
                pending.state_snapshot.get("content")
                or pending.state_snapshot.get("task")
                or ""
            )
            if not content:
                return Response({"error": "No resumable content in state snapshot"}, status=status.HTTP_400_BAD_REQUEST)

            # Budget check before resuming
            budget_err = _budget_guard(agent)
            if budget_err:
                return budget_err

            start_time = time.time()
            try:
                executor = LangGraphAgentFactory.create_agent(agent)

                # Prefer snapshot-stored message history over DB query — more reliable
                # on resume because the snapshot was taken at the exact moment of escalation.
                snapshot_messages = pending.state_snapshot.get("messages")
                if snapshot_messages:
                    state = {
                        "messages": [
                            {
                                "role": _ROLE_MAP.get(m["role"].upper(), "user"),
                                "content": m["content"],
                            }
                            for m in snapshot_messages
                        ] + [{"role": "user", "content": content}],
                        "agent_id": str(agent.id),
                        "conversation_id": str(conversation.id),
                        "iterations": 0,
                        "max_iterations": getattr(
                            getattr(agent, "capability", None), "max_iterations", 10
                        ),
                    }
                else:
                    # Fallback: rebuild from DB (old behaviour)
                    state = _build_agent_state(agent, agent.capability, conversation, content)

                config = {"configurable": {"thread_id": str(conversation.id)}}
                result = executor.invoke(state, config=config)
                reply = _extract_reply(result)
                _record_usage(agent, conversation, start_time)
                _persist_history(conversation, result["messages"])
                conversation.status = "COMPLETED"
                conversation.save()
                return Response({"status": "Approved and executed", "response": reply})
            except Exception:
                logger.exception("Resume execution failed")
                conversation.status = "FAILED"
                conversation.save()
                return Response({"error": "Failed to resume"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            conversation.status = "FAILED"
            conversation.save()
            return Response({"status": "Denied"})


# ---------------------------------------------------------------------------
# Direct execution view (one-shot)
# ---------------------------------------------------------------------------

class AgentExecuteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AgentExecuteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        agent_id = serializer.validated_data["agent_id"]
        task = serializer.validated_data["task"]

        try:
            agent = Agent.objects.get(id=agent_id, owner=request.user)
        except Agent.DoesNotExist:
            return Response({"error": "Agent not found"}, status=status.HTTP_404_NOT_FOUND)

        # Hard budget check before anything runs
        budget_err = _budget_guard(agent)
        if budget_err:
            return budget_err

        decision, reason, policy = _check_policy(agent, "task", {"task_preview": task[:100]})
        if decision == "DENY":
            return Response({"error": f"Policy denied: {reason}"}, status=status.HTTP_403_FORBIDDEN)

        if not hasattr(agent, "capability"):
            return Response({"error": "Agent has no capability configuration"}, status=status.HTTP_400_BAD_REQUEST)

        capability = agent.capability
        conv_status = "PENDING_APPROVAL" if decision == "ESCALATE" else "ACTIVE"
        conversation = Conversation.objects.create(
            agent=agent,
            title=f"Task: {task[:50]}",
            status=conv_status,
            llm_config=capability.primary_llm,
        )
        Message.objects.create(conversation=conversation, role="USER", content=task)

        if decision == "ESCALATE":
            PendingAction.objects.create(
                conversation=conversation,
                agent=agent,
                action_type="task",
                resource="agent:execute",
                reason=reason,
                state_snapshot={
                    "task": task,
                    "content": task,
                    "messages": [{"role": "user", "content": task}],
                    "agent_id": str(agent.id),
                    "conversation_id": str(conversation.id),
                },
            )
            return Response(
                {
                    "conversation_id": str(conversation.id),
                    "status": "PENDING_APPROVAL",
                    "reason": reason,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        start_time = time.time()
        try:
            executor = LangGraphAgentFactory.create_agent(agent)
            state = _build_agent_state(agent, capability, conversation, task)
            config = {"configurable": {"thread_id": str(conversation.id)}}
            result = executor.invoke(state, config=config)
            reply = _extract_reply(result)
            _record_usage(agent, conversation, start_time)
            _persist_history(conversation, result["messages"])
        except Exception:
            logger.exception("Agent execution failed for agent %s", agent.id)
            conversation.status = "FAILED"
            conversation.save()
            return Response({"error": "Agent execution failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        conversation.status = "COMPLETED"
        conversation.save()
        return Response({
            "conversation_id": str(conversation.id),
            "response": reply,
            "agent_id": str(agent.id),
            "agent_name": agent.name,
        })


# ---------------------------------------------------------------------------
# Streaming SSE execution view
# ---------------------------------------------------------------------------

class AgentStreamView(views.APIView):
    """
    Server-Sent Events streaming endpoint.

    POST /api/intelligence/execute/stream/
    Body: { "agent_id": "...", "task": "..." }

    The client receives newline-delimited SSE chunks:
        data: {"type": "token", "content": "Hello"}
        data: {"type": "done", "conversation_id": "..."}
        data: {"type": "error", "detail": "..."}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AgentExecuteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        agent_id = serializer.validated_data["agent_id"]
        task = serializer.validated_data["task"]

        try:
            agent = Agent.objects.get(id=agent_id, owner=request.user)
        except Agent.DoesNotExist:
            return Response({"error": "Agent not found"}, status=status.HTTP_404_NOT_FOUND)

        budget_err = _budget_guard(agent)
        if budget_err:
            return budget_err

        decision, reason, _ = _check_policy(agent, "task", {"task_preview": task[:100]})
        if decision == "DENY":
            return Response({"error": f"Policy denied: {reason}"}, status=status.HTTP_403_FORBIDDEN)

        if not hasattr(agent, "capability"):
            return Response({"error": "Agent has no capability configuration"}, status=status.HTTP_400_BAD_REQUEST)

        capability = agent.capability
        conversation = Conversation.objects.create(
            agent=agent,
            title=f"Stream: {task[:50]}",
            status="ACTIVE",
            llm_config=capability.primary_llm,
        )
        Message.objects.create(conversation=conversation, role="USER", content=task)

        def event_stream():
            try:
                executor = LangGraphAgentFactory.create_agent(agent)
                state = _build_agent_state(agent, capability, conversation, task)
                config = {"configurable": {"thread_id": str(conversation.id)}}

                full_reply = []
                for chunk in executor.stream(state, config=config, stream_mode="values"):
                    msgs = chunk.get("messages", [])
                    if msgs:
                        last = msgs[-1]
                        content = getattr(last, "content", "") or ""
                        if content:
                            full_reply.append(content)
                            payload = json.dumps({"type": "token", "content": content})
                            yield f"data: {payload}\n\n"

                conversation.status = "COMPLETED"
                conversation.save()
                Message.objects.create(
                    conversation=conversation,
                    role="AGENT",
                    content="".join(full_reply),
                )
                BillingService.record_usage(
                    agent=agent,
                    resource_type="stream_conversation",
                    resource_id=conversation.id,
                    cost=_ESTIMATED_COST_PER_TURN,
                )
                done_payload = json.dumps({"type": "done", "conversation_id": str(conversation.id)})
                yield f"data: {done_payload}\n\n"

            except Exception as exc:
                logger.exception("Streaming execution failed for agent %s", agent.id)
                conversation.status = "FAILED"
                conversation.save()
                err_payload = json.dumps({"type": "error", "detail": str(exc)})
                yield f"data: {err_payload}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
