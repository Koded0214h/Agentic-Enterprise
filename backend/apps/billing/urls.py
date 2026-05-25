from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsageRecordViewSet,
    DepartmentCostCenterViewSet,
    AgentBudgetViewSet,
    WorkflowCostSummaryView,
    UsageAlertsView,
    FinanceOverviewView,
)

router = DefaultRouter()
router.register(r'usage', UsageRecordViewSet)
router.register(r'departments', DepartmentCostCenterViewSet)
router.register(r'budgets', AgentBudgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('overview/', FinanceOverviewView.as_view(), name='finance-overview'),
    path('workflow-costs/', WorkflowCostSummaryView.as_view(), name='workflow-costs'),
    path('usage-alerts/', UsageAlertsView.as_view(), name='usage-alerts'),
]
