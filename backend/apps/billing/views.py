from django.utils import timezone
from rest_framework import views, viewsets, permissions, status
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
from apps.projects.models import Project
from backend.invoice_manager import get_invoices
from backend.mrr_calculator import calculate_mrr


class DepartmentCostCenterViewSet(viewsets.ModelViewSet):
    queryset = DepartmentCostCenter.objects.all()
    serializer_class = DepartmentCostCenterSerializer
    permission_classes = [permissions.IsAuthenticated]


class UsageRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UsageRecord.objects.all()
    serializer_class = UsageRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get("project_id")
        if self.request.user.is_staff:
            qs = UsageRecord.objects.all()
        else:
            qs = UsageRecord.objects.filter(agent__owner=self.request.user)
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    @action(detail=False, methods=["get"])
    def summary(self, request):
        agent_id = request.query_params.get("agent_id")
        department_id = request.query_params.get("department_id")
        project_id = request.query_params.get("project_id")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        summary = BillingService.get_usage_summary(
            agent_id=agent_id,
            department_id=department_id,
            start_date=start_date,
            end_date=end_date,
            project_id=project_id,
        )
        return Response(summary)

    @action(detail=False, methods=['get'])
    def history(self, request):
        days = int(request.query_params.get('days', 30))
        project_id = request.query_params.get("project_id")
        since = timezone.now() - timezone.timedelta(days=days)
        qs = self.get_queryset().filter(created_at__gte=since).select_related('agent')
        if project_id:
            qs = qs.filter(project_id=project_id)

        from django.core.paginator import Paginator
        page_num = int(request.query_params.get('page', 1))
        paginator = Paginator(qs, 50)
        page = paginator.get_page(page_num)

        results = []
        for record in page:
            results.append({
                'id': str(record.id),
                'created_at': record.created_at.isoformat(),
                'agent_name': record.agent.name if record.agent else 'Unknown',
                'resource_type': record.resource_type,
                'resource_id': str(record.resource_id) if record.resource_id else None,
                'workflow_id': str(record.workflow_id) if record.workflow_id else None,
                'workflow_name': record.workflow_name,
                'tokens_input': record.tokens_input,
                'tokens_output': record.tokens_output,
                'cost': float(record.cost),
                'currency': record.currency,
            })

        total_cost_qs = self.get_queryset().filter(created_at__gte=since)
        from django.db.models import Sum
        total_cost = total_cost_qs.aggregate(total=Sum('cost'))['total'] or 0

        return Response({
            'results': results,
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_num,
            'total_cost': float(total_cost),
            'days': days,
        })


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
        project_id = request.query_params.get("project_id")

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

        if project_id:
            try:
                project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
            budget = AgentBudget.objects.filter(project=project, is_active=True).first()
            if not budget:
                return Response({"has_budget": False})
            limit = float(budget.monthly_limit)
            spend = float(budget.current_month_spend)
            pct = round((spend / limit * 100) if limit > 0 else 0, 2)
            return Response({
                "has_budget": True,
                "monthly_limit": limit,
                "current_spend": spend,
                "remaining": round(limit - spend, 6),
                "percent_used": pct,
                "alert_threshold": budget.alert_threshold_percentage,
                "over_alert": pct >= budget.alert_threshold_percentage,
                "over_limit": spend >= limit,
            })

        return Response(
            {"error": "Provide agent_id, department_id, or project_id"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def reset_monthly(self, request):
        """Admin-only: manually trigger the monthly spend reset."""
        count = BillingService.reset_monthly_budgets()
        return Response({"reset": count, "message": f"{count} budget(s) reset to $0"})


class WorkflowCostSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum, Count
        project_id = request.query_params.get("project_id")
        qs = UsageRecord.objects.filter(workflow_id__isnull=False)
        if project_id:
            qs = qs.filter(project_id=project_id)
        workflow_costs = (
            qs
            .values('workflow_id', 'workflow_name')
            .annotate(
                total_cost=Sum('cost'),
                total_tokens_input=Sum('tokens_input'),
                total_tokens_output=Sum('tokens_output'),
                record_count=Count('id'),
            )
            .order_by('-total_cost')[:50]
        )
        return Response({
            'workflows': [
                {
                    'workflow_id': str(w['workflow_id']),
                    'workflow_name': w['workflow_name'] or 'Unnamed Workflow',
                    'total_cost': float(w['total_cost'] or 0),
                    'total_tokens_input': w['total_tokens_input'] or 0,
                    'total_tokens_output': w['total_tokens_output'] or 0,
                    'record_count': w['record_count'],
                }
                for w in workflow_costs
            ]
        })


class UsageAlertsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        budgets = AgentBudget.objects.filter(is_active=True).select_related('agent', 'department')
        if project_id:
            budgets = budgets.filter(project_id=project_id)
        alerts = []
        for budget in budgets:
            if not budget.monthly_limit:
                continue
            pct = float(budget.current_month_spend / budget.monthly_limit * 100)
            if pct >= budget.alert_threshold_percentage:
                name = budget.agent.name if budget.agent else (budget.department.name if budget.department else 'Unknown')
                severity = 'critical' if pct >= 90 else 'warning'
                alerts.append({
                    'agent_id': str(budget.agent.id) if budget.agent else None,
                    'agent_name': name,
                    'current_spend': float(budget.current_month_spend),
                    'monthly_limit': float(budget.monthly_limit),
                    'percentage_used': round(pct, 1),
                    'threshold': budget.alert_threshold_percentage,
                    'severity': severity,
                })
        return Response({'alerts': alerts, 'total_alerts': len(alerts)})


class FinanceOverviewView(views.APIView):
    """
    Consolidated finance snapshot covering usage, budgets, invoices, and an
    estimated MRR based on paid invoice history.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        usage_summary = BillingService.get_usage_summary(project_id=project_id)
        budgets = AgentBudget.objects.filter(is_active=True)
        if project_id:
            budgets = budgets.filter(project_id=project_id)
        invoices = []
        try:
            invoices = get_invoices()
        except Exception:
            invoices = []

        paid_amounts = [
            float(inv.get("amount", 0) or 0)
            for inv in invoices
            if str(inv.get("status", "")).lower() == "paid"
        ]
        estimated_mrr = calculate_mrr(paid_amounts) if paid_amounts else 0.0
        open_invoices = [inv for inv in invoices if str(inv.get("status", "")).lower() != "paid"]

        over_alert = 0
        over_limit = 0
        for budget in budgets.select_related("agent", "department"):
            if not budget.monthly_limit:
                continue
            pct = float(budget.current_month_spend / budget.monthly_limit * 100)
            if pct >= budget.alert_threshold_percentage:
                over_alert += 1
            if pct >= 100:
                over_limit += 1

        return Response({
            "usage_summary": {
                "total_cost": float(usage_summary.get("total_cost") or 0),
                "total_tokens_input": int(usage_summary.get("total_tokens_input") or 0),
                "total_tokens_output": int(usage_summary.get("total_tokens_output") or 0),
                "total_compute_time": int(usage_summary.get("total_compute_time") or 0),
                "record_count": int(usage_summary.get("record_count") or 0),
            },
            "budget_summary": {
                "active_budgets": budgets.count(),
                "over_alert": over_alert,
                "over_limit": over_limit,
            },
            "invoice_summary": {
                "invoice_count": len(invoices),
                "open_invoice_count": len(open_invoices),
                "paid_invoice_total": float(sum(paid_amounts)),
            },
            "estimated_mrr": float(estimated_mrr),
        })
