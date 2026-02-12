from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgentLoginView, AgentLogoutView

router = DefaultRouter()

urlpatterns = [
    path('auth/login/', AgentLoginView.as_view(), name='agent-login'),
    path('auth/logout/', AgentLogoutView.as_view(), name='agent-logout'),
    path('', include(router.urls)),
]