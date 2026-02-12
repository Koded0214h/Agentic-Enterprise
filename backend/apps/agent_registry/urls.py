from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgentViewSet, RoleViewSet

router = DefaultRouter()
router.register(r"agents", AgentViewSet, basename="agent")
router.register(r"roles", RoleViewSet, basename="role")

urlpatterns = [
    path("", include(router.urls)),
]