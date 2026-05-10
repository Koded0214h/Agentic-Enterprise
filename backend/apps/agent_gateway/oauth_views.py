"""
SSO / OAuth2 endpoints for human users.

Supported providers:
  - Google   — verifies a Google ID token (from frontend sign-in)
  - GitHub   — exchanges an OAuth2 code for a user profile
  - SAML     — stub, requires python3-saml + IdP configuration

Flow:
  1. Frontend obtains provider token/code.
  2. POST to /api/auth/sso/<provider>/ with that token/code.
  3. AOS verifies it, upserts the Django User, returns a JWT pair.
"""
import logging

import httpx
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)
User = get_user_model()

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


def _jwt_for_user(user) -> dict:
    """Return a simple-jwt token pair for a Django User."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user_id": str(user.id),
        "email": user.email,
        "username": user.username,
    }


class GoogleSSOView(APIView):
    """
    POST /api/auth/sso/google/
    Body: { "id_token": "<Google ID token from frontend>" }

    Verifies the token against Google's tokeninfo endpoint, then upserts
    the user and returns an AOS JWT pair.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        id_token = request.data.get("id_token")
        if not id_token:
            return Response({"error": "id_token required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resp = httpx.get(GOOGLE_TOKENINFO_URL, params={"id_token": id_token}, timeout=10)
            resp.raise_for_status()
            info = resp.json()
        except Exception as exc:
            logger.warning("Google token verification failed: %s", exc)
            return Response({"error": "Invalid Google token"}, status=status.HTTP_401_UNAUTHORIZED)

        # Validate audience (client_id) if configured
        google_client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        if google_client_id and info.get("aud") != google_client_id:
            return Response({"error": "Token audience mismatch"}, status=status.HTTP_401_UNAUTHORIZED)

        email = info.get("email")
        if not email:
            return Response({"error": "Email not available in token"}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0],
                "first_name": info.get("given_name", ""),
                "last_name": info.get("family_name", ""),
            },
        )
        return Response(_jwt_for_user(user), status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class GitHubSSOView(APIView):
    """
    POST /api/auth/sso/github/
    Body: { "code": "<GitHub OAuth code>", "redirect_uri": "..." }

    Exchanges the code for a GitHub access token, fetches the user profile,
    then upserts the user and returns an AOS JWT pair.

    Requires settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get("code")
        redirect_uri = request.data.get("redirect_uri", "")
        if not code:
            return Response({"error": "code required"}, status=status.HTTP_400_BAD_REQUEST)

        client_id = getattr(settings, "GITHUB_CLIENT_ID", None)
        client_secret = getattr(settings, "GITHUB_CLIENT_SECRET", None)
        if not client_id or not client_secret:
            return Response(
                {"error": "GitHub OAuth not configured on this server"},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        # Exchange code → access_token
        try:
            token_resp = httpx.post(
                GITHUB_TOKEN_URL,
                json={"client_id": client_id, "client_secret": client_secret, "code": code, "redirect_uri": redirect_uri},
                headers={"Accept": "application/json"},
                timeout=10,
            )
            token_resp.raise_for_status()
            token_data = token_resp.json()
        except Exception as exc:
            logger.warning("GitHub token exchange failed: %s", exc)
            return Response({"error": "GitHub token exchange failed"}, status=status.HTTP_401_UNAUTHORIZED)

        access_token = token_data.get("access_token")
        if not access_token:
            return Response(
                {"error": token_data.get("error_description", "No access token returned")},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        gh_headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}

        try:
            user_resp = httpx.get(GITHUB_USER_URL, headers=gh_headers, timeout=10)
            user_resp.raise_for_status()
            profile = user_resp.json()
        except Exception as exc:
            logger.warning("GitHub profile fetch failed: %s", exc)
            return Response({"error": "Could not fetch GitHub profile"}, status=status.HTTP_502_BAD_GATEWAY)

        # GitHub may not expose the primary email in the profile; fetch separately
        email = profile.get("email")
        if not email:
            try:
                emails_resp = httpx.get(GITHUB_EMAILS_URL, headers=gh_headers, timeout=10)
                emails_resp.raise_for_status()
                primary = next(
                    (e["email"] for e in emails_resp.json() if e.get("primary") and e.get("verified")),
                    None,
                )
                email = primary
            except Exception:
                pass

        if not email:
            return Response({"error": "No verified email on GitHub account"}, status=status.HTTP_400_BAD_REQUEST)

        username = profile.get("login") or email.split("@")[0]
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "first_name": (profile.get("name") or "").split(" ")[0],
                "last_name": " ".join((profile.get("name") or "").split(" ")[1:]),
            },
        )
        return Response(_jwt_for_user(user), status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class SAMLSSOView(APIView):
    """
    SAML 2.0 SSO — stub.

    To enable:
      1. pip install python3-saml
      2. Configure settings.SAML_SETTINGS with your IdP metadata
      3. Implement the assertion parser below

    POST /api/auth/sso/saml/
    Body: { "SAMLResponse": "<base64 assertion>" }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        return Response(
            {
                "error": "SAML SSO not yet configured",
                "detail": (
                    "Install python3-saml, add SAML_SETTINGS to Django settings, "
                    "and implement assertion parsing in oauth_views.SAMLSSOView.post()"
                ),
            },
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )
