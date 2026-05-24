from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Lead, Ticket, QueueItem
from .services import OpsService


User = get_user_model()


class OpsServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ops-user", email="ops@example.com", password="pass12345")

    @override_settings()
    def test_create_lead_enqueues_queue_item(self):
        lead, queue_item = OpsService.create_lead(
            owner=self.user,
            data={
                "name": "Ada Lovelace",
                "email": "ada@example.com",
                "company": "Analytical Engines Ltd",
                "source": "outbound",
            },
        )
        self.assertEqual(Lead.objects.count(), 1)
        self.assertEqual(QueueItem.objects.count(), 1)
        self.assertEqual(queue_item.lead_id, lead.id)
        self.assertEqual(lead.account.name, "Analytical Engines Ltd")

    @patch("apps.ops.connectors.FallbackBridge.dispatch")
    def test_process_queue_item_uses_fallback_when_no_vendors(self, dispatch):
        dispatch.return_value.delivered = True
        dispatch.return_value.message = "sent"
        dispatch.return_value.payload = {"ok": True}
        lead, queue_item = OpsService.create_lead(
            owner=self.user,
            data={"name": "Grace Hopper", "email": "grace@example.com", "company": "Cobol Co"},
        )
        queue_item = OpsService.process_queue_item(queue_item)
        self.assertIn(queue_item.status, [QueueItem.Status.COMPLETED, QueueItem.Status.WAITING_BRIDGE])
        self.assertTrue(queue_item.attempts >= 1)


class OpsApiTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ops-api", email="ops-api@example.com", password="pass12345")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_overview_and_create_flow(self):
        response = self.client.get("/api/ops/overview/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("counts", response.data)

        lead_resp = self.client.post(
            "/api/ops/leads/",
            {
                "name": "Jordan Smith",
                "email": "jordan@example.com",
                "company": "Example Co",
                "source": "inbound",
            },
            format="json",
        )
        self.assertEqual(lead_resp.status_code, 201)
        self.assertEqual(QueueItem.objects.count(), 1)

        ticket_resp = self.client.post(
            "/api/ops/tickets/",
            {
                "requester_name": "Jordan Smith",
                "requester_email": "jordan@example.com",
                "subject": "Need help onboarding",
                "body": "How do I connect my tools?",
                "priority": "NORMAL",
            },
            format="json",
        )
        self.assertEqual(ticket_resp.status_code, 201)
        self.assertEqual(Ticket.objects.count(), 1)

        queue_resp = self.client.post("/api/ops/queue/process/", {"limit": 10}, format="json")
        self.assertEqual(queue_resp.status_code, 200)
        self.assertIn("processed", queue_resp.data)
