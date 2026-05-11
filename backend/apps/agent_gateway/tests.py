import uuid

from django.contrib.auth import get_user_model
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
