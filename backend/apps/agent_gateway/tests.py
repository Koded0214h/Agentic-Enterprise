import uuid

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.agent_registry.models import Agent, AgentType
from .models import AgentSession

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_agent(user, name="GatewayAgent"):
    key = str(uuid.uuid4())
    return Agent.objects.create(
        name=name,
        owner=user,
        agent_type=AgentType.FUNCTIONAL,
        identity_key=key,
    ), key


# ---------------------------------------------------------------------------
# AgentLoginView
# ---------------------------------------------------------------------------

class AgentLoginViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="pass")
        self.agent, self.key = make_agent(self.user)
        self.url = reverse("agent-login")

    def test_valid_credentials_return_token(self):
        data = {"agent_id": str(self.agent.id), "identity_key": self.key}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.data)
        self.assertEqual(response.data["token_type"], "Bearer")
        self.assertEqual(str(response.data["agent_id"]), str(self.agent.id))

    def test_valid_login_creates_session(self):
        data = {"agent_id": str(self.agent.id), "identity_key": self.key}
        self.client.post(self.url, data, format="json")
        self.assertEqual(AgentSession.objects.filter(agent=self.agent).count(), 1)

    def test_wrong_identity_key_rejected(self):
        data = {"agent_id": str(self.agent.id), "identity_key": "wrong-key"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_agent_rejected(self):
        data = {"agent_id": str(uuid.uuid4()), "identity_key": self.key}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_fields_rejected(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_no_auth_required_for_login(self):
        # Login endpoint must be publicly accessible.
        data = {"agent_id": str(self.agent.id), "identity_key": self.key}
        response = self.client.post(self.url, data, format="json")
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# AgentLogoutView
# ---------------------------------------------------------------------------

class AgentLogoutViewTest(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="owner", password="pass")
        self.agent, self.key = make_agent(self.user)

    def _login(self):
        url = reverse("agent-login")
        data = {"agent_id": str(self.agent.id), "identity_key": self.key}
        return self.client.post(url, data, format="json").data

    def test_logout_revokes_session(self):
        login_data = self._login()
        token = login_data["access_token"]
        url = reverse("agent-logout")
        response = self.client.post(
            url, HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session = AgentSession.objects.get(agent=self.agent)
        self.assertIsNotNone(session.revoked_at)

    def test_logout_with_invalid_token_returns_400(self):
        url = reverse("agent-logout")
        response = self.client.post(
            url, HTTP_AUTHORIZATION="Bearer not-a-real-token"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# UserRegisterView
# ---------------------------------------------------------------------------

class UserRegisterViewTest(APITestCase):
    def setUp(self):
        cache.clear()
        self.url = reverse("user-register")

    def test_successful_registration(self):
        data = {
            "email": "new@example.com",
            "password": "securepass123",
            "first_name": "Ada",
            "last_name": "Lovelace",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "new@example.com")
        self.assertTrue(User.objects.filter(email="new@example.com").exists())

    def test_duplicate_email_rejected(self):
        User.objects.create_user(username="existing", email="taken@example.com", password="pass")
        data = {"email": "taken@example.com", "password": "securepass123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_short_password_rejected(self):
        data = {"email": "short@example.com", "password": "123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_missing_email_rejected(self):
        data = {"password": "securepass123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_password_rejected(self):
        data = {"email": "nopwd@example.com"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_normalised_to_lowercase(self):
        data = {"email": "UPPER@Example.COM", "password": "securepass123"}
        self.client.post(self.url, data, format="json")
        self.assertTrue(User.objects.filter(email="upper@example.com").exists())

    def test_registration_does_not_require_auth(self):
        data = {"email": "open@example.com", "password": "securepass123"}
        response = self.client.post(self.url, data, format="json")
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# UserMeView
# ---------------------------------------------------------------------------

class UserMeViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="meuser",
            email="me@example.com",
            password="pass",
            first_name="Me",
            last_name="User",
        )
        self.url = reverse("user-me")

    def test_authenticated_user_gets_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "me@example.com")
        self.assertEqual(response.data["first_name"], "Me")
        self.assertEqual(response.data["username"], "meuser")
        self.assertFalse(response.data["is_staff"])

    def test_unauthenticated_request_rejected(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_flag_reflected(self):
        self.user.is_staff = True
        self.user.save()
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertTrue(response.data["is_staff"])


# ---------------------------------------------------------------------------
# GoogleSSOView
# ---------------------------------------------------------------------------

from unittest.mock import MagicMock, patch


class GoogleSSOViewTest(APITestCase):
    url = "/api/gateway/auth/sso/google/"

    def _mock_google_resp(self, email="google@example.com", given_name="Ada", family_name="Lovelace", aud=None):
        resp = MagicMock()
        resp.status_code = 200
        resp.json.return_value = {
            "email": email,
            "given_name": given_name,
            "family_name": family_name,
            "aud": aud or "google-client-id",
        }
        resp.raise_for_status = MagicMock()
        return resp

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    def test_valid_token_creates_new_user(self, mock_get):
        mock_get.return_value = self._mock_google_resp()
        resp = self.client.post(self.url, {"id_token": "valid-token"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", resp.data)
        self.assertTrue(User.objects.filter(email="google@example.com").exists())

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    def test_valid_token_returns_tokens_for_existing_user(self, mock_get):
        User.objects.create_user(username="goog", email="google@example.com", password="x")
        mock_get.return_value = self._mock_google_resp()
        resp = self.client.post(self.url, {"id_token": "valid-token"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertEqual(User.objects.filter(email="google@example.com").count(), 1)

    def test_missing_id_token_returns_400(self):
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    def test_google_api_failure_returns_401(self, mock_get):
        import httpx as httpx_lib
        mock_get.side_effect = httpx_lib.HTTPError("network error")
        resp = self.client.post(self.url, {"id_token": "bad-token"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    def test_missing_email_in_token_returns_400(self, mock_get):
        resp_mock = MagicMock()
        resp_mock.raise_for_status = MagicMock()
        resp_mock.json.return_value = {"given_name": "NoEmail"}
        mock_get.return_value = resp_mock
        resp = self.client.post(self.url, {"id_token": "no-email-token"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    @patch("django.conf.settings.GOOGLE_CLIENT_ID", "expected-client-id", create=True)
    def test_audience_mismatch_returns_401(self, mock_get):
        mock_get.return_value = self._mock_google_resp(aud="wrong-client-id")
        with self.settings(GOOGLE_CLIENT_ID="expected-client-id"):
            resp = self.client.post(self.url, {"id_token": "bad-aud-token"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# GitHubSSOView
# ---------------------------------------------------------------------------

class GitHubSSOViewTest(APITestCase):
    url = "/api/gateway/auth/sso/github/"

    def _mock_token_resp(self, access_token="gh-access-token"):
        resp = MagicMock()
        resp.raise_for_status = MagicMock()
        resp.json.return_value = {"access_token": access_token}
        return resp

    def _mock_profile_resp(self, login="gh_user", email="gh@example.com", name="GitHub User"):
        resp = MagicMock()
        resp.raise_for_status = MagicMock()
        resp.json.return_value = {"login": login, "email": email, "name": name}
        return resp

    def test_missing_code_returns_400(self):
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unconfigured_github_returns_501(self):
        with self.settings(GITHUB_CLIENT_ID=None, GITHUB_CLIENT_SECRET=None):
            resp = self.client.post(self.url, {"code": "some-code"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_501_NOT_IMPLEMENTED)

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    @patch("apps.agent_gateway.oauth_views.httpx.post")
    def test_valid_code_creates_new_user(self, mock_post, mock_get):
        mock_post.return_value = self._mock_token_resp()
        mock_get.return_value = self._mock_profile_resp()
        with self.settings(GITHUB_CLIENT_ID="cid", GITHUB_CLIENT_SECRET="csecret"):
            resp = self.client.post(self.url, {"code": "valid-code"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", resp.data)
        self.assertTrue(User.objects.filter(email="gh@example.com").exists())

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    @patch("apps.agent_gateway.oauth_views.httpx.post")
    def test_valid_code_returns_tokens_for_existing_user(self, mock_post, mock_get):
        User.objects.create_user(username="gh_user", email="gh@example.com", password="x")
        mock_post.return_value = self._mock_token_resp()
        mock_get.return_value = self._mock_profile_resp()
        with self.settings(GITHUB_CLIENT_ID="cid", GITHUB_CLIENT_SECRET="csecret"):
            resp = self.client.post(self.url, {"code": "valid-code"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(email="gh@example.com").count(), 1)

    @patch("apps.agent_gateway.oauth_views.httpx.post")
    def test_github_token_exchange_failure_returns_401(self, mock_post):
        import httpx as httpx_lib
        mock_post.side_effect = httpx_lib.HTTPError("timeout")
        with self.settings(GITHUB_CLIENT_ID="cid", GITHUB_CLIENT_SECRET="csecret"):
            resp = self.client.post(self.url, {"code": "bad-code"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    @patch("apps.agent_gateway.oauth_views.httpx.post")
    def test_no_email_on_github_account_returns_400(self, mock_post, mock_get):
        mock_post.return_value = self._mock_token_resp()
        profile_resp = MagicMock()
        profile_resp.raise_for_status = MagicMock()
        profile_resp.json.return_value = {"login": "no_email_user", "email": None, "name": "No Email"}
        emails_resp = MagicMock()
        emails_resp.raise_for_status = MagicMock()
        emails_resp.json.return_value = []  # No verified primary email
        mock_get.side_effect = [profile_resp, emails_resp]
        with self.settings(GITHUB_CLIENT_ID="cid", GITHUB_CLIENT_SECRET="csecret"):
            resp = self.client.post(self.url, {"code": "no-email-code"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.agent_gateway.oauth_views.httpx.get")
    @patch("apps.agent_gateway.oauth_views.httpx.post")
    def test_no_access_token_in_response_returns_401(self, mock_post, mock_get):
        bad_token_resp = MagicMock()
        bad_token_resp.raise_for_status = MagicMock()
        bad_token_resp.json.return_value = {"error": "bad_verification_code", "error_description": "Code expired"}
        mock_post.return_value = bad_token_resp
        with self.settings(GITHUB_CLIENT_ID="cid", GITHUB_CLIENT_SECRET="csecret"):
            resp = self.client.post(self.url, {"code": "expired-code"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# SAMLSSOView (stub)
# ---------------------------------------------------------------------------

class SAMLSSOViewTest(APITestCase):
    url = "/api/gateway/auth/sso/saml/"

    def test_saml_returns_501_not_implemented(self):
        resp = self.client.post(self.url, {"SAMLResponse": "base64stuff"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_501_NOT_IMPLEMENTED)
        self.assertIn("error", resp.data)
