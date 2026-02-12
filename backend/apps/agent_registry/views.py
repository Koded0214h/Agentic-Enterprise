from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend  # requires django-filter
from .models import Agent, Role, AgentStatus
from .serializers import AgentSerializer, RoleSerializer


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
    filterset_fields = ["agent_type", "status", "owner"]
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


class RoleViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for Role resources.
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]  # can be refined later
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]