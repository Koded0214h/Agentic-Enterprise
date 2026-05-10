from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgentLoginView, AgentLogoutView
from .oauth_views import GoogleSSOView, GitHubSSOView, SAMLSSOView

router = DefaultRouter()

urlpatterns = [
    path("auth/login/", AgentLoginView.as_view(), name="agent-login"),
    path("auth/logout/", AgentLogoutView.as_view(), name="agent-logout"),
    # SSO / OAuth2
    path("auth/sso/google/", GoogleSSOView.as_view(), name="sso-google"),
    path("auth/sso/github/", GitHubSSOView.as_view(), name="sso-github"),
    path("auth/sso/saml/", SAMLSSOView.as_view(), name="sso-saml"),
    path("", include(router.urls)),
]