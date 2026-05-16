from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Agent, Role, AgentStatus, AgentTrustPolicy
from .serializers import AgentSerializer, RoleSerializer, AgentTrustPolicySerializer
from apps.agent_intelligence.tasks import execute_agent_background


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission: only owners can edit an agent.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class AgentViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for Agent resources.
    """
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["agent_type", "status", "owner", "environment"]
    search_fields = ["name", "version"]
    ordering_fields = ["created_at", "updated_at", "name"]

    def perform_create(self, serializer):
        # Automatically set the owner to the current user
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def pause(self, request, pk=None):
        agent = self.get_object()
        if agent.owner != request.user:
            return Response({"detail": "Not owner."}, status=status.HTTP_403_FORBIDDEN)
        agent.status = AgentStatus.PAUSED
        agent.save()
        return Response({"status": "paused"})

    @action(detail=True, methods=["post"])
    def resume(self, request, pk=None):
        agent = self.get_object()
        if agent.owner != request.user:
            return Response({"detail": "Not owner."}, status=status.HTTP_403_FORBIDDEN)
        agent.status = AgentStatus.RUNNING
        agent.save()
        return Response({"status": "running"})

    @action(detail=True, methods=["post"])
    def execute(self, request, pk=None):
        agent = self.get_object()
        task_description = request.data.get("task")
        if not task_description:
            return Response({"error": "Task description required"}, status=status.HTTP_400_BAD_REQUEST)

        # Trigger Celery task
        execute_agent_background.delay(str(agent.id), task_description)

        return Response({"status": "Task queued for background execution"})

    @action(detail=True, methods=["get"])
    def detail_full(self, request, pk=None):
        """
        GET /api/registry/agents/<id>/detail_full/
        Enriched agent detail — capability, recent traces, budget, manifest,
        recent conversations. Powers the frontend agent detail page.
        """
        from apps.agent_intelligence.models import (
            AgentCapability, TraceStep, Conversation,
        )
        from apps.billing.models import AgentBudget
        from apps.swarm_bridge.models import SwarmAgentManifest
        from django.utils import timezone
        from datetime import timedelta

        agent = self.get_object()
        since = timezone.now() - timedelta(days=7)

        capability = AgentCapability.objects.filter(agent=agent).first()
        budget = AgentBudget.objects.filter(agent=agent).first()
        manifest = SwarmAgentManifest.objects.filter(aos_agent=agent).first()

        recent_traces = list(
            TraceStep.objects.filter(agent=agent, created_at__gte=since)
            .order_by("-created_at")
            .values("id", "step_type", "summary", "created_at")[:25]
        )

        recent_convos = list(
            Conversation.objects.filter(agent=agent)
            .order_by("-created_at")
            .values("id", "title", "created_at")[:10]
        )

        return Response({
            "agent": AgentSerializer(agent).data,
            "capability": {
                "system_prompt": (capability.system_prompt[:2000] + "…") if capability and capability.system_prompt and len(capability.system_prompt) > 2000 else (capability.system_prompt if capability else ""),
                "model": getattr(capability, "model", "") if capability else "",
                "max_iterations": getattr(capability, "max_iterations", 10) if capability else 10,
                "tools_enabled": getattr(capability, "tools", []) if capability else [],
            } if capability else None,
            "budget": {
                "monthly_limit": str(budget.monthly_limit) if budget else None,
                "current_month_spend": str(budget.current_month_spend) if budget else None,
                "alert_threshold_percentage": getattr(budget, "alert_threshold_percentage", 80) if budget else None,
                "is_active": budget.is_active if budget else False,
            } if budget else None,
            "manifest": {
                "swarm_name": manifest.swarm_name,
                "source_category": manifest.source_category,
                "file_path": manifest.file_path,
                "preferred_engine": manifest.preferred_engine,
            } if manifest else None,
            "recent_traces": recent_traces,
            "recent_conversations": recent_convos,
            "stats": {
                "traces_last_7d": len(recent_traces),
                "conversations_last_7d": len(recent_convos),
            },
        })


class RoleViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Role resources."""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]


class AgentTrustPolicyViewSet(viewsets.ModelViewSet):
    """
    Manage agent-to-agent trust relationships.

    GET  /api/registry/trust/           — list all trust policies owned by requesting user
    POST /api/registry/trust/           — create a trust grant/deny
    POST /api/registry/trust/check/     — check if source may call target
    """
    queryset = AgentTrustPolicy.objects.all()
    serializer_class = AgentTrustPolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AgentTrustPolicy.objects.filter(source_agent__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["post"])
    def check(self, request):
        """
        Body: { "source_agent_id": "...", "target_agent_id": "..." }
        Returns: { "allowed": true/false, "reason": "..." }
        """
        source_id = request.data.get("source_agent_id")
        target_id = request.data.get("target_agent_id")
        if not source_id or not target_id:
            return Response(
                {"error": "source_agent_id and target_agent_id required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            source = Agent.objects.get(id=source_id)
            target = Agent.objects.get(id=target_id)
        except Agent.DoesNotExist:
            return Response({"error": "Agent not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            trust = AgentTrustPolicy.objects.get(source_agent=source, target_agent=target)
            if not trust.is_valid():
                return Response({"allowed": False, "reason": "Trust policy expired"})
            return Response({"allowed": trust.allowed, "reason": trust.reason or "Explicit policy"})
        except AgentTrustPolicy.DoesNotExist:
            # Default: allow in dev/staging, deny in prod
            if source.environment == "prod" or target.environment == "prod":
                return Response({"allowed": False, "reason": "No explicit trust policy; prod default is DENY"})
            return Response({"allowed": True, "reason": "No explicit policy; non-prod default is ALLOW"})