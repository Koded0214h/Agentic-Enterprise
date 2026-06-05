from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.ops_core.models import QueueItem, QueueItemStatus, QueueItemType
from apps.ops_core.services.queue_processor import QueueProcessor
from apps.projects.models import Project, ProjectMember

from .models import Campaign, CampaignMetric, ContentCalendarItem
from .services import MarketingService

User = get_user_model()


def make_project(user, slug="marketing-project"):
    project = Project.objects.create(
        owner=user,
        name="Marketing Project",
        slug=slug,
        stage=Project.Stage.LAUNCH,
        status=Project.Status.ACTIVE,
    )
    ProjectMember.objects.create(project=project, user=user, role=ProjectMember.Role.OWNER)
    return project


class MarketingServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="marketing-user", email="m@example.com", password="pass12345")
        self.project = make_project(self.user)
        self.campaign = Campaign.objects.create(
            owner=self.user,
            project=self.project,
            name="Launch Campaign",
            objective="Drive waitlist signups",
            audience="Founder operators",
            channels=["instagram"],
        )
        self.item = ContentCalendarItem.objects.create(
            owner=self.user,
            project=self.project,
            campaign=self.campaign,
            title="Launch carousel",
            platform=ContentCalendarItem.Platform.INSTAGRAM,
            caption="Meet the new operating loop.",
            media_urls=["https://cdn.example.com/1.png"],
            scheduled_at=timezone.now(),
        )

    def test_publish_enqueue_creates_project_scoped_campaign_queue_item(self):
        queue_item = MarketingService.enqueue_publish(self.item)
        self.item.refresh_from_db()
        self.campaign.refresh_from_db()
        self.assertEqual(queue_item.project_id, self.project.id)
        self.assertEqual(queue_item.item_type, QueueItemType.CAMPAIGN)
        self.assertEqual(queue_item.payload["calendar_item_id"], str(self.item.id))
        self.assertEqual(self.item.status, ContentCalendarItem.Status.QUEUED)
        self.assertEqual(self.campaign.status, Campaign.Status.SCHEDULED)

    def test_campaign_queue_processor_publishes_with_dry_run_upload_post(self):
        queue_item = MarketingService.enqueue_publish(self.item)
        outcome = QueueProcessor.process_item(queue_item)
        self.assertEqual(outcome, "processed")
        queue_item.refresh_from_db()
        self.item.refresh_from_db()
        self.campaign.refresh_from_db()
        self.assertEqual(queue_item.status, QueueItemStatus.COMPLETED)
        self.assertEqual(self.item.status, ContentCalendarItem.Status.PUBLISHED)
        self.assertTrue(self.item.uploadpost_request_id.startswith("dryrun-"))
        self.assertEqual(self.campaign.status, Campaign.Status.LIVE)

    def test_analytics_ingestion_updates_feedback_suggestions(self):
        MarketingService.publish_calendar_item(self.item.id)
        result = MarketingService.ingest_campaign_analytics(
            self.campaign.id,
            metrics_payload={
                "impressions": 2000,
                "reach": 1500,
                "clicks": 80,
                "likes": 100,
                "comments": 10,
                "shares": 12,
                "saves": 8,
                "conversions": 4,
                "spend": "25.00",
            },
        )
        self.campaign.refresh_from_db()
        self.assertEqual(result["metrics_created"], 1)
        self.assertEqual(CampaignMetric.objects.count(), 1)
        self.assertEqual(self.campaign.performance_summary["impressions"], 2000)
        self.assertIn("Promote the best-performing post", " ".join(self.campaign.next_action_suggestions))


class MarketingApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="marketing-api", email="ma@example.com", password="pass12345")
        self.project = make_project(self.user, slug="marketing-api-project")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_campaign_plan_publish_measure_api_flow(self):
        create_resp = self.client.post(
            "/api/marketing/campaigns/",
            {
                "project": str(self.project.id),
                "name": "Beta Launch",
                "objective": "Recruit beta founders",
                "audience": "B2B SaaS founders",
                "channels": ["instagram", "linkedin"],
                "budget": "150.00",
                "currency": "USD",
            },
            format="json",
        )
        self.assertEqual(create_resp.status_code, 201)
        campaign_id = create_resp.data["id"]

        calendar_resp = self.client.post(
            "/api/marketing/calendar/",
            {
                "campaign": campaign_id,
                "title": "Founder proof post",
                "platform": "instagram",
                "caption": "AOS plans, publishes, and measures campaign work.",
                "media_urls": ["https://cdn.example.com/proof.png"],
                "scheduled_at": timezone.now().isoformat(),
            },
            format="json",
        )
        self.assertEqual(calendar_resp.status_code, 201)

        publish_resp = self.client.post(f"/api/marketing/campaigns/{campaign_id}/publish/", {}, format="json")
        self.assertEqual(publish_resp.status_code, 202)
        self.assertEqual(publish_resp.data["queued"], 1)
        queue_item = QueueItem.objects.get(item_type=QueueItemType.CAMPAIGN)
        QueueProcessor.process_item(queue_item)

        analytics_resp = self.client.post(
            f"/api/marketing/campaigns/{campaign_id}/ingest_analytics/",
            {
                "impressions": 1000,
                "reach": 900,
                "clicks": 60,
                "likes": 75,
                "comments": 6,
                "shares": 9,
                "saves": 5,
                "conversions": 2,
            },
            format="json",
        )
        self.assertEqual(analytics_resp.status_code, 200)

        overview_resp = self.client.get(f"/api/marketing/overview/?project_id={self.project.id}")
        self.assertEqual(overview_resp.status_code, 200)
        self.assertEqual(overview_resp.data["counts"]["campaigns"], 1)
        self.assertEqual(overview_resp.data["performance"]["impressions"], 1000)
