import logging

from rest_framework import viewsets, permissions, status
from rest_framework.generics import views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import (
    LLMConfig, AgentCapability, Conversation,
    Message, ToolDefinition,
)
from .serializers import (
    LLMConfigSerializer, AgentCapabilitySerializer,
    ConversationSerializer, MessageSerializer,
    ToolDefinitionSerializer, AgentExecuteSerializer,
)
from .utils.llm_manager import LLMManager
from .utils.tool_registry import ToolRegistry
from .utils.agent_factory import LangGraphAgentFactory
from apps.agent_registry.models import Agent
from apps.policy_engine.utils import PolicyEvaluator

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _check_policy(agent, action: str, context: dict = None):
    """Run the policy evaluator; return (decision, reason)."""
    evaluator = PolicyEvaluator(agent)
    decision, _policy, reason = evaluator.evaluate(
        resource="agent:execute",
        action=action,
        context=context or {},
    )
    return decision, reason


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
    # LangChain rejects 'agent'; the correct canonical value is 'assistant'.
    # Full accepted set: 'human'/'user', 'ai'/'assistant', 'system', 'tool'.
    "USER":   "user",
    "AGENT":  "assistant",
    "SYSTEM": "system",
    "TOOL":   "tool",
}


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

        decision, reason = _check_policy(
            agent, "chat", {"conversation_id": str(conversation.id)}
        )
        if decision == "DENY":
            return Response(
                {"error": f"Policy denied: {reason}"},
                status=status.HTTP_403_FORBIDDEN,
            )

        content = request.data.get("content", "").strip()
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

        try:
            executor = LangGraphAgentFactory.create_react_agent(agent, capability)
            state = _build_agent_state(agent, capability, conversation, content)
            # MemorySaver requires thread_id in the configurable dict so it
            # knows which checkpoint stream to read/write.  Using conversation.id
            # means each conversation has its own isolated memory thread and
            # subsequent turns correctly resume from the previous checkpoint.
            config = {"configurable": {"thread_id": str(conversation.id)}}
            result = executor.invoke(state, config=config)
            reply = _extract_reply(result)
        except Exception:
            logger.exception("Agent execution failed for conversation %s", conversation.id)
            return Response(
                {"error": "Agent execution failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        agent_message = Message.objects.create(
            conversation=conversation, role="AGENT", content=reply
        )

        conversation.updated_at = timezone.now()
        conversation.save()

        return Response({
            "response": reply,
            # Bug fix: UUID fields must be stringified — if left as UUID
            # objects the test script receives a non-string value that, when
            # embedded in a URL, produces a double-slash path like
            # /conversations//message/ causing a 404.
            "conversation_id": str(conversation.id),
            "message_id": str(agent_message.id),
        })


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

        decision, reason = _check_policy(agent, "task", {"task_preview": task[:100]})
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
            status="ACTIVE",
            llm_config=capability.primary_llm,
        )

        Message.objects.create(conversation=conversation, role="USER", content=task)

        try:
            executor = LangGraphAgentFactory.create_react_agent(agent, capability)
            state = _build_agent_state(agent, capability, conversation, task)
            config = {"configurable": {"thread_id": str(conversation.id)}}
            result = executor.invoke(state, config=config)
            reply = _extract_reply(result)
        except Exception:
            logger.exception("Agent execution failed for agent %s", agent.id)
            conversation.status = "FAILED"
            conversation.save()
            return Response(
                {"error": "Agent execution failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        Message.objects.create(conversation=conversation, role="AGENT", content=reply)

        conversation.status = "COMPLETED"
        conversation.save()

        return Response({
            "conversation_id": str(conversation.id),  # stringified — see above
            "response": reply,
            "agent_id": str(agent.id),
            "agent_name": agent.name,
        })