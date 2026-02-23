from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsageRecordViewSet, 
    DepartmentCostCenterViewSet, 
    AgentBudgetViewSet
)

router = DefaultRouter()
router.register(r'usage', UsageRecordViewSet)
router.register(r'departments', DepartmentCostCenterViewSet)
router.register(r'budgets', AgentBudgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
