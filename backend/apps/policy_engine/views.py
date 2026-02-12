import uuid
from rest_framework import views, viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Policy, PolicyCondition, PolicyAssignment, PolicyAuditLog
from .serializers import (
    PolicySerializer, 
    PolicyConditionSerializer,
    PolicyAssignmentSerializer,
    PolicyAuditLogSerializer,
    PolicyEvaluateSerializer
)
from .utils import PolicyEvaluator
from apps.agent_registry.models import Agent


class PolicyViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for managing policies.
    """
    queryset = Policy.objects.all()
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'effect', 'risk_level']
    search_fields = ['name', 'description']
    ordering_fields = ['priority', 'created_at', 'name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def evaluate(self, request, pk=None):
        """
        Test a policy against a sample request.
        """
        policy = self.get_object()
        serializer = PolicyEvaluateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create a temporary evaluator
        agent_id = serializer.validated_data.get('agent_id')
        try:
            agent = Agent.objects.get(id=agent_id)
        except Agent.DoesNotExist:
            return Response(
                {'error': 'Agent not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        evaluator = PolicyEvaluator(agent)
        
        # Only consider this single policy
        evaluator.applicable_policies = [policy]
        
        decision, _, reason = evaluator.evaluate(
            resource=serializer.validated_data['resource'],
            action=serializer.validated_data['action'],
            context=serializer.validated_data.get('context', {})
        )
        
        return Response({
            'policy_id': policy.id,
            'policy_name': policy.name,
            'decision': decision,
            'reason': reason,
        })
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        Duplicate an existing policy.
        """
        original = self.get_object()
        
        # Copy the policy
        new_policy = Policy.objects.get(pk=original.pk)
        new_policy.pk = None
        new_policy.id = uuid.uuid4()
        new_policy.name = f"{original.name} (Copy)"
        new_policy.created_by = request.user
        new_policy.calls_made = 0
        new_policy.save()
        
        # Copy conditions
        new_policy.conditions.set(original.conditions.all())
        
        serializer = self.get_serializer(new_policy)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PolicyConditionViewSet(viewsets.ModelViewSet):
    queryset = PolicyCondition.objects.all()
    serializer_class = PolicyConditionSerializer
    permission_classes = [permissions.IsAuthenticated]


class PolicyAssignmentViewSet(viewsets.ModelViewSet):
    queryset = PolicyAssignment.objects.all()
    serializer_class = PolicyAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['policy', 'agent', 'role']


class PolicyAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view of policy audit logs.
    """
    queryset = PolicyAuditLog.objects.all()
    serializer_class = PolicyAuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['agent', 'decision', 'resource']
    ordering_fields = ['-created_at']
    
    def get_queryset(self):
        # Users can only see logs for agents they own
        if self.request.user.is_staff:
            return PolicyAuditLog.objects.all()
        return PolicyAuditLog.objects.filter(agent__owner=self.request.user)


class PolicyCheckView(views.APIView):
    """
    Check if an agent can perform an action.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        agent_id = request.data.get('agent_id')
        resource = request.data.get('resource')
        action = request.data.get('action')
        context = request.data.get('context', {})
        
        try:
            agent = Agent.objects.get(id=agent_id, owner=request.user)
        except Agent.DoesNotExist:
            return Response(
                {'error': 'Agent not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        evaluator = PolicyEvaluator(agent)
        decision, policy, reason = evaluator.evaluate(resource, action, context)
        
        return Response({
            'agent_id': agent.id,
            'resource': resource,
            'action': action,
            'decision': decision,
            'policy_id': policy.id if policy else None,
            'policy_name': policy.name if policy else None,
            'reason': reason,
            'timestamp': timezone.now(),
        })