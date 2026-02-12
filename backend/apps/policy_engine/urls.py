from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PolicyViewSet, PolicyConditionViewSet,
    PolicyAssignmentViewSet, PolicyAuditLogViewSet,
    PolicyCheckView
)

router = DefaultRouter()
router.register(r'policies', PolicyViewSet)
router.register(r'conditions', PolicyConditionViewSet)
router.register(r'assignments', PolicyAssignmentViewSet)
router.register(r'audit-logs', PolicyAuditLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('check/', PolicyCheckView.as_view(), name='policy-check'),
]