from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # Agent auth
    AgentLoginView,
    AgentLogoutView,
    # User auth
    UserRegisterView,
    UserMeView,
    UserAvatarView,
    # Password reset
    PasswordResetRequestView,
    PasswordResetConfirmView,
    # Workspaces
    WorkspaceViewSet,
    WorkspaceInviteView,
    WorkspaceAcceptInviteView,
    # LLM provider configs
    LLMProviderConfigViewSet,
    # Waitlist
    WaitlistView,
    # Beta / feedback
    BetaInviteCodeValidateView,
    FeedbackView,
)
from .oauth_views import GoogleSSOView, GitHubSSOView, SAMLSSOView

router = DefaultRouter()
router.register(r'workspaces', WorkspaceViewSet, basename='workspace')
router.register(r'llm-configs', LLMProviderConfigViewSet, basename='llm-config')

urlpatterns = [
    # ── Agent auth ──────────────────────────────────────────────────────────
    path('auth/login/', AgentLoginView.as_view(), name='agent-login'),
    path('auth/logout/', AgentLogoutView.as_view(), name='agent-logout'),

    # ── User auth ────────────────────────────────────────────────────────────
    path('auth/register/', UserRegisterView.as_view(), name='user-register'),
    path('auth/me/', UserMeView.as_view(), name='user-me'),
    path('auth/me/avatar/', UserAvatarView.as_view(), name='user-avatar'),

    # Task 2 – token refresh
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Task 1 – password reset
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # ── SSO / OAuth2 ─────────────────────────────────────────────────────────
    path('auth/sso/google/', GoogleSSOView.as_view(), name='sso-google'),
    path('auth/sso/github/', GitHubSSOView.as_view(), name='sso-github'),
    path('auth/sso/saml/', SAMLSSOView.as_view(), name='sso-saml'),

    # Task 6 – Waitlist
    path('auth/waitlist/', WaitlistView.as_view(), name='waitlist'),

    # Task 7 – Beta invite validation & feedback
    path('auth/invite/validate/', BetaInviteCodeValidateView.as_view(), name='invite-validate'),
    path('auth/feedback/', FeedbackView.as_view(), name='feedback'),

    # Task 4 – Workspace sub-actions (non-viewset routes)
    path('workspaces/<uuid:workspace_id>/invite/', WorkspaceInviteView.as_view(), name='workspace-invite'),
    path('workspaces/accept-invite/', WorkspaceAcceptInviteView.as_view(), name='workspace-accept-invite'),

    # ViewSet routes (workspaces CRUD + llm-configs CRUD + test action)
    path('', include(router.urls)),
]
