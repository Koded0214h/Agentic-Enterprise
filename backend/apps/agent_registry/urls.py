from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgentViewSet, RoleViewSet, AgentTrustPolicyViewSet

router = DefaultRouter()
router.register(r"agents", AgentViewSet, basename="agent")
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"trust", AgentTrustPolicyViewSet, basename="trust")

urlpatterns = [
    path("", include(router.urls)),
]