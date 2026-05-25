from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.projects.models import Project
from .models import (
    Account,
    Lead,
    Opportunity,
    Ticket,
    Touchpoint,
    QueueItem,
    QueueItemStatus,
    QueueItemType,
    SyncStatus,
)
from .services.queue_processor import QueueProcessor
from .services.fallback import FallbackBridge

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_user(username="testuser", password="testpass"):
    return User.objects.create_user(username=username, password=password)


def make_project(owner, name="Test Project", slug="test-project"):
    return Project.objects.create(
        name=name,
        slug=slug,
        owner=owner,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Feature 1: ops objects are project-scoped
# ─────────────────────────────────────────────────────────────────────────────

class AccountModelTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)
        self.client.force_authenticate(user=self.user)

    def test_account_requires_project(self):
        account = Account.objects.create(project=self.project, name="Acme Corp")
        self.assertEqual(account.project, self.project)
        self.assertEqual(str(account.project_id), str(self.project.id))

    def test_account_create_via_api(self):
        url = reverse("account-list")
        resp = self.client.post(url, {
            "project": str(self.project.id),
            "name": "Globex",
            "domain": "globex.com",
            "size": "enterprise",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Account.objects.count(), 1)
        self.assertEqual(Account.objects.first().project, self.project)

    def test_account_list_scoped_to_owner(self):
        other_user = make_user("other", "pass")
        other_project = make_project(other_user, "Other Project", "other-project")
        Account.objects.create(project=self.project, name="Mine")
        Account.objects.create(project=other_project, name="Theirs")

        url = reverse("account-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        names = [a["name"] for a in resp.data]
        self.assertIn("Mine", names)
        self.assertNotIn("Theirs", names)

    def test_account_enqueue_sync(self):
        account = Account.objects.create(project=self.project, name="SyncCo")
        url = reverse("account-enqueue-sync", args=[account.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(
            QueueItem.objects.filter(
                project=self.project,
                item_type=QueueItemType.ACCOUNT_SYNC,
            ).count(),
            1,
        )


class LeadModelTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)
        self.client.force_authenticate(user=self.user)

    def test_lead_tied_to_project(self):
        lead = Lead.objects.create(project=self.project, email="lead@example.com")
        self.assertEqual(lead.project, self.project)
        self.assertEqual(lead.sync_status, SyncStatus.PENDING)

    def test_lead_create_via_api(self):
        url = reverse("lead-list")
        resp = self.client.post(url, {
            "project": str(self.project.id),
            "email": "new@lead.com",
            "first_name": "Ada",
            "last_name": "Lovelace",
            "source": "web",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        lead = Lead.objects.get(email="new@lead.com")
        self.assertEqual(lead.project, self.project)

    def test_lead_enqueue_sync(self):
        lead = Lead.objects.create(project=self.project, email="sync@lead.com")
        url = reverse("lead-enqueue-sync", args=[lead.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(
            QueueItem.objects.filter(
                project=self.project,
                item_type=QueueItemType.LEAD_SYNC,
            ).count(),
            1,
        )


class OpportunityModelTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)
        self.client.force_authenticate(user=self.user)

    def test_opportunity_tied_to_project(self):
        opp = Opportunity.objects.create(
            project=self.project, name="Big Deal", value=50000
        )
        self.assertEqual(opp.project, self.project)
        self.assertEqual(opp.stage, "prospecting")

    def test_opportunity_create_via_api(self):
        url = reverse("opportunity-list")
        resp = self.client.post(url, {
            "project": str(self.project.id),
            "name": "Enterprise Deal",
            "stage": "qualification",
            "value": "25000.00",
            "currency": "USD",
            "probability": 40,
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


class TicketModelTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)
        self.client.force_authenticate(user=self.user)

    def test_ticket_tied_to_project(self):
        ticket = Ticket.objects.create(
            project=self.project,
            subject="Login broken",
            priority="high",
        )
        self.assertEqual(ticket.project, self.project)
        self.assertEqual(ticket.status, "open")

    def test_ticket_create_via_api(self):
        url = reverse("ticket-list")
        resp = self.client.post(url, {
            "project": str(self.project.id),
            "subject": "Can't log in",
            "body": "Error 500 on login page",
            "priority": "critical",
            "channel": "email",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_ticket_resolve_action(self):
        ticket = Ticket.objects.create(
            project=self.project, subject="Bug", priority="low"
        )
        url = reverse("ticket-resolve", args=[ticket.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, "resolved")
        self.assertIsNotNone(ticket.resolved_at)

    def test_ticket_enqueue_sync(self):
        ticket = Ticket.objects.create(
            project=self.project, subject="Sync Me"
        )
        url = reverse("ticket-enqueue-sync", args=[ticket.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(
            QueueItem.objects.filter(
                project=self.project,
                item_type=QueueItemType.TICKET_SYNC,
            ).count(),
            1,
        )


class TouchpointModelTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)
        self.client.force_authenticate(user=self.user)

    def test_touchpoint_tied_to_project(self):
        tp = Touchpoint.objects.create(
            project=self.project,
            type="email",
            direction="outbound",
            occurred_at=timezone.now(),
        )
        self.assertEqual(tp.project, self.project)

    def test_touchpoint_create_via_api(self):
        url = reverse("touchpoint-list")
        resp = self.client.post(url, {
            "project": str(self.project.id),
            "type": "call",
            "direction": "inbound",
            "summary": "Discovery call with prospect",
            "occurred_at": timezone.now().isoformat(),
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        tp = Touchpoint.objects.first()
        self.assertEqual(tp.recorded_by, self.user)


class GlobalBucketGuardTests(APITestCase):
    """Verify that no ops object can exist without a project FK."""

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)

    def test_account_cannot_exist_without_project(self):
        with self.assertRaises(Exception):
            Account.objects.create(name="Orphan")

    def test_lead_cannot_exist_without_project(self):
        with self.assertRaises(Exception):
            Lead.objects.create(email="orphan@test.com")

    def test_ticket_cannot_exist_without_project(self):
        with self.assertRaises(Exception):
            Ticket.objects.create(subject="Orphan")


# ─────────────────────────────────────────────────────────────────────────────
# Feature 2: queue processor and fallback bridge
# ─────────────────────────────────────────────────────────────────────────────

class QueueItemModelTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)
        self.client.force_authenticate(user=self.user)

    def test_queue_item_tied_to_project(self):
        item = QueueItem.objects.create(
            project=self.project,
            item_type=QueueItemType.LEAD_SYNC,
            payload={"lead_id": "abc"},
        )
        self.assertEqual(item.status, QueueItemStatus.PENDING)
        self.assertTrue(item.can_retry)

    def test_queue_item_list_via_api(self):
        QueueItem.objects.create(
            project=self.project,
            item_type=QueueItemType.TICKET_SYNC,
            payload={},
        )
        url = reverse("queueitem-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_queue_item_list_scoped_to_owner(self):
        other_user = make_user("other2", "pass")
        other_project = make_project(other_user, "Other2", "other2")
        QueueItem.objects.create(
            project=self.project, item_type=QueueItemType.LEAD_SYNC, payload={}
        )
        QueueItem.objects.create(
            project=other_project, item_type=QueueItemType.TICKET_SYNC, payload={}
        )
        url = reverse("queueitem-list")
        resp = self.client.get(url)
        self.assertEqual(len(resp.data), 1)

    def test_retry_dead_item_via_api(self):
        item = QueueItem.objects.create(
            project=self.project,
            item_type=QueueItemType.LEAD_SYNC,
            payload={},
            status=QueueItemStatus.DEAD,
            retry_count=3,
        )
        url = reverse("queueitem-retry", args=[item.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_202_ACCEPTED)
        item.refresh_from_db()
        self.assertEqual(item.status, QueueItemStatus.PENDING)
        self.assertEqual(item.retry_count, 0)

    def test_retry_pending_item_rejected(self):
        item = QueueItem.objects.create(
            project=self.project,
            item_type=QueueItemType.LEAD_SYNC,
            payload={},
            status=QueueItemStatus.PENDING,
        )
        url = reverse("queueitem-retry", args=[item.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class QueueProcessorTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)

    def _make_item(self, item_type=QueueItemType.LEAD_SYNC, payload=None, **kwargs):
        return QueueItem.objects.create(
            project=self.project,
            item_type=item_type,
            payload=payload or {},
            **kwargs,
        )

    def test_process_pending_lead_sync(self):
        lead = Lead.objects.create(project=self.project, email="q@test.com")
        item = self._make_item(
            item_type=QueueItemType.LEAD_SYNC,
            payload={"lead_id": str(lead.id)},
        )
        results = QueueProcessor.process_pending()
        self.assertEqual(results["processed"], 1)
        item.refresh_from_db()
        self.assertEqual(item.status, QueueItemStatus.COMPLETED)
        lead.refresh_from_db()
        self.assertEqual(lead.sync_status, SyncStatus.SYNCED)
        self.assertIsNotNone(lead.last_synced_at)

    def test_process_pending_ticket_sync(self):
        ticket = Ticket.objects.create(project=self.project, subject="T1")
        item = self._make_item(
            item_type=QueueItemType.TICKET_SYNC,
            payload={"ticket_id": str(ticket.id)},
        )
        QueueProcessor.process_pending()
        ticket.refresh_from_db()
        self.assertEqual(ticket.sync_status, SyncStatus.SYNCED)

    def test_process_pending_opportunity_sync(self):
        opp = Opportunity.objects.create(project=self.project, name="Deal A")
        item = self._make_item(
            item_type=QueueItemType.OPPORTUNITY_SYNC,
            payload={"opportunity_id": str(opp.id)},
        )
        QueueProcessor.process_pending()
        opp.refresh_from_db()
        self.assertEqual(opp.sync_status, SyncStatus.SYNCED)

    def test_failed_item_transitions_to_retrying(self):
        item = self._make_item(
            item_type=QueueItemType.LEAD_SYNC,
            payload={"lead_id": "nonexistent-id"},
        )
        # patch _dispatch to raise to simulate failure
        original_dispatch = QueueProcessor._dispatch

        def _fail(i):
            raise RuntimeError("CRM unavailable")

        QueueProcessor._dispatch = staticmethod(_fail)
        try:
            outcome = QueueProcessor.process_item(item)
        finally:
            QueueProcessor._dispatch = original_dispatch

        self.assertEqual(outcome, "failed")
        item.refresh_from_db()
        self.assertEqual(item.status, QueueItemStatus.RETRYING)
        self.assertEqual(item.retry_count, 1)
        self.assertIsNotNone(item.next_retry_at)
        self.assertIn("CRM unavailable", item.error_message)

    def test_item_promoted_to_dead_after_max_retries(self):
        item = self._make_item(
            item_type=QueueItemType.LEAD_SYNC,
            payload={},
            retry_count=3,
            max_retries=3,
        )
        original_dispatch = QueueProcessor._dispatch

        def _fail(i):
            raise RuntimeError("permanent failure")

        QueueProcessor._dispatch = staticmethod(_fail)
        try:
            outcome = QueueProcessor.process_item(item)
        finally:
            QueueProcessor._dispatch = original_dispatch

        self.assertEqual(outcome, "dead")
        item.refresh_from_db()
        self.assertEqual(item.status, QueueItemStatus.DEAD)

    def test_scheduled_item_not_picked_up_early(self):
        from datetime import timedelta

        item = self._make_item(
            item_type=QueueItemType.LEAD_SYNC,
            payload={},
            scheduled_at=timezone.now() + timedelta(hours=1),
        )
        results = QueueProcessor.process_pending()
        self.assertEqual(results.get("processed", 0), 0)
        item.refresh_from_db()
        self.assertEqual(item.status, QueueItemStatus.PENDING)

    def test_unknown_item_type_raises(self):
        item = self._make_item(item_type=QueueItemType.CAMPAIGN, payload={})
        with self.assertRaises(ValueError):
            QueueProcessor._dispatch(item)


class FallbackBridgeTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        self.project = make_project(self.user)

    def _make_failing_item(self, extra_retries=0):
        return QueueItem.objects.create(
            project=self.project,
            item_type=QueueItemType.LEAD_SYNC,
            payload={},
            status=QueueItemStatus.FAILED,
            retry_count=1 + extra_retries,
            error_message="CRM down",
        )

    def test_webhook_queued_on_retry_failure(self):
        self.project.metadata = {"fallback_webhook_url": "https://hooks.example.com/fail"}
        self.project.save()
        item = self._make_failing_item()
        FallbackBridge.trigger(item, "CRM down", final=False)
        webhook_items = QueueItem.objects.filter(
            project=self.project,
            item_type=QueueItemType.WEBHOOK_DISPATCH,
        )
        self.assertEqual(webhook_items.count(), 1)
        payload = webhook_items.first().payload
        self.assertEqual(payload["event"], "queue_item_failed")
        self.assertEqual(payload["queue_item_id"], str(item.id))

    def test_email_queued_on_dead_letter(self):
        self.project.metadata = {"fallback_alert_email": "ops@example.com"}
        self.project.save()
        item = self._make_failing_item(extra_retries=2)
        FallbackBridge.trigger(item, "total failure", final=True)
        email_items = QueueItem.objects.filter(
            project=self.project,
            item_type=QueueItemType.EMAIL_DISPATCH,
        )
        self.assertEqual(email_items.count(), 1)
        payload = email_items.first().payload
        self.assertEqual(payload["to"], "ops@example.com")
        self.assertIn("total failure", payload["body"])

    def test_no_webhook_when_url_not_configured(self):
        item = self._make_failing_item()
        FallbackBridge.trigger(item, "error", final=False)
        self.assertEqual(
            QueueItem.objects.filter(item_type=QueueItemType.WEBHOOK_DISPATCH).count(), 0
        )

    def test_no_email_when_address_not_configured(self):
        item = self._make_failing_item()
        FallbackBridge.trigger(item, "error", final=True)
        self.assertEqual(
            QueueItem.objects.filter(item_type=QueueItemType.EMAIL_DISPATCH).count(), 0
        )

    def test_sync_status_persistence_after_processor_run(self):
        lead = Lead.objects.create(project=self.project, email="persist@test.com")
        item = QueueItem.objects.create(
            project=self.project,
            item_type=QueueItemType.LEAD_SYNC,
            payload={"lead_id": str(lead.id)},
        )
        QueueProcessor.process_item(item)
        item.refresh_from_db()
        lead.refresh_from_db()
        self.assertEqual(item.status, QueueItemStatus.COMPLETED)
        self.assertIsNotNone(item.completed_at)
        self.assertEqual(lead.sync_status, SyncStatus.SYNCED)
        self.assertIsNotNone(lead.last_synced_at)
