from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UsageRecord, DepartmentCostCenter, AgentBudget
from .serializers import (
    UsageRecordSerializer, 
    DepartmentCostCenterSerializer, 
    AgentBudgetSerializer
)
from .services import BillingService

class DepartmentCostCenterViewSet(viewsets.ModelViewSet):
    queryset = DepartmentCostCenter.objects.all()
    serializer_class = DepartmentCostCenterSerializer
    permission_classes = [permissions.IsAuthenticated]

class UsageRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UsageRecord.objects.all()
    serializer_class = UsageRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return UsageRecord.objects.all()
        return UsageRecord.objects.filter(agent__owner=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        agent_id = request.query_params.get('agent_id')
        department_id = request.query_params.get('department_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        summary = BillingService.get_usage_summary(
            agent_id=agent_id,
            department_id=department_id,
            start_date=start_date,
            end_date=end_date
        )
        return Response(summary)

class AgentBudgetViewSet(viewsets.ModelViewSet):
    queryset = AgentBudget.objects.all()
    serializer_class = AgentBudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
