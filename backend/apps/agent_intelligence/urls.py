from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LLMConfigViewSet, AgentCapabilityViewSet,
    ToolDefinitionViewSet, ConversationViewSet,
    WorkflowTaskViewSet, AgentExecuteView, AgentStreamView,
    PendingActionViewSet,
    ToolAnalyticsView, FailureAnalyticsView,
    EscalationView,
    TaskFailureAnalyticsView, RetryAnalyticsView, WorkflowGraphView,
    ProviderPricingView,
)

router = DefaultRouter()
router.register(r"llm-configs", LLMConfigViewSet)
router.register(r"capabilities", AgentCapabilityViewSet)
router.register(r"tools", ToolDefinitionViewSet)
router.register(r"conversations", ConversationViewSet)
router.register(r"tasks", WorkflowTaskViewSet)
router.register(r"pending-actions", PendingActionViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("execute/", AgentExecuteView.as_view(), name="agent-execute"),
    path("execute/stream/", AgentStreamView.as_view(), name="agent-execute-stream"),
    path("escalations/", EscalationView.as_view(), name="escalations"),
    path("tool-analytics/", ToolAnalyticsView.as_view(), name="tool-analytics"),
    path("failure-analytics/", FailureAnalyticsView.as_view(), name="failure-analytics"),
    path("analytics/failures/", TaskFailureAnalyticsView.as_view(), name="task-failure-analytics"),
    path("analytics/retries/", RetryAnalyticsView.as_view(), name="retry-analytics"),
    path("analytics/workflow-graph/", WorkflowGraphView.as_view(), name="workflow-graph"),
    path("providers/pricing/", ProviderPricingView.as_view(), name="provider-pricing"),
]