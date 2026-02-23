from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LLMConfigViewSet, AgentCapabilityViewSet,
    ToolDefinitionViewSet, ConversationViewSet,
    WorkflowTaskViewSet, AgentExecuteView,
    PendingActionViewSet
)

router = DefaultRouter()
router.register(r'llm-configs', LLMConfigViewSet)
router.register(r'capabilities', AgentCapabilityViewSet)
router.register(r'tools', ToolDefinitionViewSet)
router.register(r'conversations', ConversationViewSet)
router.register(r'tasks', WorkflowTaskViewSet)
router.register(r'pending-actions', PendingActionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('execute/', AgentExecuteView.as_view(), name='agent-execute'),
]