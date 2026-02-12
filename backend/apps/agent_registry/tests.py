from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Agent, Role, AgentStatus
from .utils import generate_agent_token

User = get_user_model()


class AgentRegistryTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.role = Role.objects.create(
            name="Developer",
            permissions=["agent:create", "agent:read"]
        )

    def test_create_agent(self):
        url = reverse("agent-list")
        data = {
            "name": "Test Executive",
            "agent_type": "EXECUTIVE",
            "version": "2.0.0",
            "role_ids": [str(self.role.id)],
            "metadata": {"purpose": "testing"}
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Agent.objects.count(), 1)
        agent = Agent.objects.first()
        self.assertEqual(agent.owner, self.user)
        self.assertEqual(agent.name, "Test Executive")
        self.assertIsNotNone(agent.identity_key)
        self.assertEqual(agent.roles.count(), 1)

    def test_list_agents_only_owned(self):
        # Create an agent owned by the authenticated user
        agent1 = Agent.objects.create(
            name="Agent1",
            owner=self.user,
            identity_key=generate_agent_token()
        )
        # Create an agent owned by another user
        other_user = User.objects.create_user(username="other", password="test")
        Agent.objects.create(
            name="Agent2",
            owner=other_user,
            identity_key=generate_agent_token()
        )

        url = reverse("agent-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # By default, all agents are visible; ownership enforced at object level
        self.assertEqual(len(response.data), 2)  # but permission checks happen on detail actions
        # We can also filter by owner
        response = self.client.get(url, {"owner": self.user.id})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Agent1")

    def test_retrieve_agent_not_owner(self):
        other_user = User.objects.create_user(username="other", password="test")
        agent = Agent.objects.create(
            name="Secret Agent",
            owner=other_user,
            identity_key=generate_agent_token()
        )
        url = reverse("agent-detail", args=[agent.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # SAFE method allowed
        # But update should be forbidden
        response = self.client.patch(url, {"name": "Hacked"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_pause_agent(self):
        agent = Agent.objects.create(
            name="Worker",
            owner=self.user,
            identity_key=generate_agent_token(),
            status=AgentStatus.RUNNING
        )
        url = reverse("agent-pause", args=[agent.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        agent.refresh_from_db()
        self.assertEqual(agent.status, AgentStatus.PAUSED)

    def test_role_crud(self):
        # Create role
        url = reverse("role-list")
        data = {"name": "Analyst", "permissions": ["data:read"]}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # List roles
        response = self.client.get(url)
        self.assertEqual(len(response.data), 2)  # including setUp role

        # Retrieve role
        role_id = response.data[0]["id"]
        url_detail = reverse("role-detail", args=[role_id])
        response = self.client.get(url_detail)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Update role
        response = self.client.patch(url_detail, {"description": "Can read data"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Delete role
        response = self.client.delete(url_detail)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)