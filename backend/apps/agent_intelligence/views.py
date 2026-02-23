import logging

from rest_framework import viewsets, permissions, status
from rest_framework.generics import views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import (
    LLMConfig, AgentCapability, Conversation,
    Message, ToolDefinition, WorkflowTask, TraceStep, PendingAction
)
from .serializers import (
    LLMConfigSerializer, AgentCapabilitySerializer,
    ConversationSerializer, MessageSerializer,
    ToolDefinitionSerializer, AgentExecuteSerializer,
    WorkflowTaskSerializer, TraceStepSerializer, PendingActionSerializer
)
from .utils.llm_manager import LLMManager
from .utils.tool_registry import ToolRegistry
from .utils.agent_factory import LangGraphAgentFactory
from apps.agent_registry.models import Agent
from apps.policy_engine.utils import PolicyEvaluator
from apps.billing.services import BillingService
import time

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _record_usage(agent, conversation, start_time):
    """Calculate and record usage for a turn."""
    duration_ms = int((time.time() - start_time) * 1000)
    
    # Basic token estimation if not provided by result (would be better to get from result)
    # For now, we'll just record the compute time.
    # A more advanced version would parse the LangGraph result for actual token usage.
    
    BillingService.record_usage(
        agent=agent,
        resource_type="conversation",
        resource_id=conversation.id,
        compute_time_ms=duration_ms,
        cost=float(conversation.total_cost) # Use the cost calculated in models or updated during turn
    )


def _check_policy(agent, action: str, context: dict = None):
    """Run the policy evaluator; return (decision, reason, policy)."""
    evaluator = PolicyEvaluator(agent)
    decision, policy, reason = evaluator.evaluate(
        resource="agent:execute",
        action=action,
        context=context or {},
    )
    return decision, reason, policy


def _extract_reply(result: dict) -> str:
    """Pull the final assistant text out of a LangGraph result dict."""
    last = result["messages"][-1]
    if hasattr(last, "content"):
        return last.content
    if isinstance(last, dict):
        return last.get("content", "")
    return str(last)


_ROLE_MAP = {
    # DB values → LangChain-accepted role strings.
    "USER":   "user",
    "AGENT":  "assistant",
    "SYSTEM": "system",
    "TOOL":   "tool",
}

def _persist_history(conversation, result_messages):
    """Save all new assistant/tool messages from the graph execution to the DB."""
    # Get the count of existing messages to avoid duplicates
    existing_count = conversation.messages.count()
    
    # New messages start after the existing ones
    # Note: result_messages contains the FULL history (including user msg)
    new_messages = result_messages[existing_count:]
    
    for msg in new_messages:
        role = "AGENT"
        if hasattr(msg, 'type'):
            if msg.type == 'human': role = "USER"
            elif msg.type == 'system': role = "SYSTEM"
            elif msg.type == 'tool': role = "TOOL"
        
        content = msg.content if hasattr(msg, 'content') else str(msg)
        if not content: continue # skip empty
        
        # Only save if it's not the user's initial message (which we saved manually)
        # or if we want to be safe, just skip USER roles in persist
        if role != "USER":
            Message.objects.create(
                conversation=conversation,
                role=role,
                content=content
            )


def _build_agent_state(agent, capability, conversation, content: str) -> dict:
    """
    Construct the initial LangGraph state dict for one agent turn.

    Prior conversation turns are included so the graph's MemorySaver has
    something to seed from on the first invocation of a thread.
    """
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


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------

class LLMConfigViewSet(viewsets.ModelViewSet):
    """Manage LLM configurations."""
    queryset = LLMConfig.objects.all()
    serializer_class = LLMConfigSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def recommendations(self, request):
        """Return recommended configs for every known purpose."""
        purposes = [
            "general_reasoning",
            "specialized_reasoning",
            "multi_agent",
            "embeddings",
            "high_speed",
        ]
        return Response({p: LLMManager.get_recommended_config(p) for p in purposes})


class AgentCapabilityViewSet(viewsets.ModelViewSet):
    """Configure agent capabilities and LLM assignments."""
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
            return Response(
                {"error": "tool_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if tool_name not in capability.tools_enabled:
            capability.tools_enabled.append(tool_name)
            capability.save()
        return Response({"tools_enabled": capability.tools_enabled})


class ToolDefinitionViewSet(viewsets.ModelViewSet):
    """Register and manage tools."""
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
    """Manage agent conversations."""
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(agent__owner=self.request.user)

    @action(detail=True, methods=["post"])
    def message(self, request, pk=None):
        """Send one message turn and get the agent reply."""
        conversation = self.get_object()
        agent = conversation.agent

        decision, reason, policy = _check_policy(
            agent, "chat", {"conversation_id": str(conversation.id)}
        )
        if decision == "DENY":
            return Response(
                {"error": f"Policy denied: {reason}"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        content = request.data.get("content", "").strip()

        if decision == "ESCALATE":
            # Pause execution and create PendingAction
            PendingAction.objects.create(
                conversation=conversation,
                agent=agent,
                action_type="chat",
                resource="agent:execute",
                reason=reason,
                state_snapshot={"content": content} # Simplified for now
            )
            conversation.status = "PENDING_APPROVAL"
            conversation.save()
            return Response(
                {"status": "PENDING_APPROVAL", "reason": reason},
                status=status.HTTP_202_ACCEPTED
            )
        if not content:
            return Response(
                {"error": "Message content required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not hasattr(agent, "capability"):
            return Response(
                {"error": "Agent has no capability configuration"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        capability = agent.capability

        # Persist user turn before running the agent so it's included in
        # the state we pass to _build_agent_state.
        Message.objects.create(conversation=conversation, role="USER", content=content)

        start_time = time.time()
        try:
            executor = LangGraphAgentFactory.create_agent(agent)
            state = _build_agent_state(agent, capability, conversation, content)
            # MemorySaver requires thread_id in the configurable dict so it
            # knows which checkpoint stream to read/write.  Using conversation.id
            # means each conversation has its own isolated memory thread and
            # subsequent turns correctly resume from the previous checkpoint.
            config = {"configurable": {"thread_id": str(conversation.id)}}
            result = executor.invoke(state, config=config)
            reply = _extract_reply(result)
            
            # Record usage
            _record_usage(agent, conversation, start_time)
            
            # Persist all intermediate messages
            _persist_history(conversation, result["messages"])
        except Exception:
            logger.exception("Agent execution failed for conversation %s", conversation.id)
            return Response(
                {"error": "Agent execution failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        conversation.updated_at = timezone.now()
        conversation.save()

        return Response({
            "response": reply,
            "conversation_id": str(conversation.id),
        })

    @action(detail=True, methods=['get'])
    def traces(self, request, pk=None):
        """Get the execution trace for this conversation."""
        conversation = self.get_object()
        traces = conversation.traces.all()
        serializer = TraceStepSerializer(traces, many=True)
        return Response(serializer.data)


class WorkflowTaskViewSet(viewsets.ModelViewSet):
    """Manage long-running agent tasks and dependencies."""
    queryset = WorkflowTask.objects.all()
    serializer_class = WorkflowTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(agent__owner=self.request.user)

    @action(detail=True, methods=['post'])
    def add_dependency(self, request, pk=None):
        task = self.get_object()
        dep_id = request.data.get('dependency_id')
        try:
            dependency = WorkflowTask.objects.get(id=dep_id, agent__owner=request.user)
            task.depends_on.add(dependency)
            return Response({'status': 'dependency added'})
        except WorkflowTask.DoesNotExist:
            return Response({'error': 'Dependency task not found'}, status=status.HTTP_404_NOT_FOUND)


class PendingActionViewSet(viewsets.ModelViewSet):
    """Review and approve/deny escalated agent actions."""
    queryset = PendingAction.objects.all()
    serializer_class = PendingActionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(agent__owner=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        pending = self.get_object()
        if pending.status != 'PENDING':
            return Response({'error': 'Action already decided'}, status=status.HTTP_400_BAD_REQUEST)
        
        decision = request.data.get('decision') # 'APPROVED' or 'DENIED'
        if decision not in ['APPROVED', 'DENIED']:
            return Response({'error': 'Invalid decision'}, status=status.HTTP_400_BAD_REQUEST)
        
        pending.status = decision
        pending.decided_by = request.user
        pending.decided_at = timezone.now()
        pending.save()
        
        conversation = pending.conversation
        if decision == 'APPROVED':
            conversation.status = 'ACTIVE'
            conversation.save()
            
            # Resume execution
            agent = pending.agent
            capability = agent.capability
            
            # For MVP: Re-run the last message or task
            # In a more advanced version, we'd resume from the exact LangGraph checkpoint
            content = pending.state_snapshot.get('content') or pending.state_snapshot.get('task')
            
            start_time = time.time()
            try:
                executor = LangGraphAgentFactory.create_agent(agent)
                state = _build_agent_state(agent, capability, conversation, content)
                config = {"configurable": {"thread_id": str(conversation.id)}}
                result = executor.invoke(state, config=config)
                reply = _extract_reply(result)
                _record_usage(agent, conversation, start_time)
                
                # Persist all intermediate messages
                _persist_history(conversation, result["messages"])
                
                conversation.status = "COMPLETED"
                conversation.save()
                
                return Response({'status': 'Approved and executed', 'response': reply})
            except Exception:
                logger.exception("Resume execution failed")
                conversation.status = "FAILED"
                conversation.save()
                return Response({'error': 'Failed to resume'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            conversation.status = 'FAILED'
            conversation.save()
            return Response({'status': 'Denied'})



# ---------------------------------------------------------------------------
# Direct execution view
# ---------------------------------------------------------------------------

class AgentExecuteView(views.APIView):
    """
    One-shot execution: creates a conversation, runs the agent, returns result.

    Previously this was a stub that returned a hardcoded string and never
    called LangGraph, causing every downstream URL built from the response
    to be blank (the conversation_id was correct but the agent never ran,
    and the test script's follow-up URLs used an empty conversation_id from
    a failed JSON parse → double-slash 404s).
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
            return Response(
                {"error": "Agent not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        decision, reason, policy = _check_policy(agent, "task", {"task_preview": task[:100]})
        if decision == "DENY":
            return Response(
                {"error": f"Policy denied: {reason}"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not hasattr(agent, "capability"):
            return Response(
                {"error": "Agent has no capability configuration"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        capability = agent.capability

        conversation = Conversation.objects.create(
            agent=agent,
            title=f"Task: {task[:50]}",
            status="PENDING_APPROVAL" if decision == "ESCALATE" else "ACTIVE",
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
                state_snapshot={"task": task}
            )
            return Response(
                {
                    "conversation_id": str(conversation.id),
                    "status": "PENDING_APPROVAL",
                    "reason": reason
                },
                status=status.HTTP_202_ACCEPTED
            )

        start_time = time.time()
        try:
            executor = LangGraphAgentFactory.create_agent(agent)
            state = _build_agent_state(agent, capability, conversation, task)
            config = {"configurable": {"thread_id": str(conversation.id)}}
            result = executor.invoke(state, config=config)
            reply = _extract_reply(result)
            
            # Record usage
            _record_usage(agent, conversation, start_time)
            
            # Persist all intermediate messages
            _persist_history(conversation, result["messages"])
        except Exception:
            logger.exception("Agent execution failed for agent %s", agent.id)
            conversation.status = "FAILED"
            conversation.save()
            return Response(
                {"error": "Agent execution failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        conversation.status = "COMPLETED"
        conversation.save()

        return Response({
            "conversation_id": str(conversation.id),
            "response": reply,
            "agent_id": str(agent.id),
            "agent_name": agent.name,
        })
            