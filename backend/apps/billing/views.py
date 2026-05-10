from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UsageRecord, DepartmentCostCenter, AgentBudget
from .serializers import (
    UsageRecordSerializer,
    DepartmentCostCenterSerializer,
    AgentBudgetSerializer,
)
from .services import BillingService
from apps.agent_registry.models import Agent


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

    @action(detail=False, methods=["get"])
    def summary(self, request):
        agent_id = request.query_params.get("agent_id")
        department_id = request.query_params.get("department_id")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        summary = BillingService.get_usage_summary(
            agent_id=agent_id,
            department_id=department_id,
            start_date=start_date,
            end_date=end_date,
        )
        return Response(summary)


class AgentBudgetViewSet(viewsets.ModelViewSet):
    queryset = AgentBudget.objects.all()
    serializer_class = AgentBudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def status(self, request):
        """
        Return budget status for an agent or department.
        ?agent_id=<uuid>  OR  ?department_id=<uuid>
        """
        agent_id = request.query_params.get("agent_id")
        department_id = request.query_params.get("department_id")

        if agent_id:
            try:
                agent = Agent.objects.get(id=agent_id, owner=request.user)
            except Agent.DoesNotExist:
                return Response({"error": "Agent not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(BillingService.get_budget_status(agent=agent))

        if department_id:
            try:
                dept = DepartmentCostCenter.objects.get(id=department_id)
            except DepartmentCostCenter.DoesNotExist:
                return Response({"error": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(BillingService.get_budget_status(department=dept))

        return Response(
            {"error": "Provide agent_id or department_id"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def reset_monthly(self, request):
        """Admin-only: manually trigger the monthly spend reset."""
        count = BillingService.reset_monthly_budgets()
        return Response({"reset": count, "message": f"{count} budget(s) reset to $0"})
