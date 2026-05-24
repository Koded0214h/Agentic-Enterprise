from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet, ProjectMemberViewSet, ProjectActivityViewSet, ProjectGoalViewSet, ProjectArtifactViewSet

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"members", ProjectMemberViewSet, basename="project-member")
router.register(r"activities", ProjectActivityViewSet, basename="project-activity")
router.register(r"goals", ProjectGoalViewSet, basename="project-goal")
router.register(r"artifacts", ProjectArtifactViewSet, basename="project-artifact")

urlpatterns = [
    path("", include(router.urls)),
]
