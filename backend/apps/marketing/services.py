import hashlib
import os
from decimal import Decimal

import requests
from django.conf import settings
from django.db.models import Sum
from django.utils import timezone

from apps.ops_core.models import QueueItem, QueueItemType

from .models import Campaign, CampaignMetric, ContentCalendarItem


class UploadPostClient:
    def __init__(self):
        self.base_url = getattr(settings, "UPLOADPOST_API_URL", "") or os.getenv("UPLOADPOST_API_URL", "")
        self.api_key = getattr(settings, "UPLOADPOST_API_KEY", "") or os.getenv("UPLOADPOST_API_KEY", "")
        self.user = getattr(settings, "UPLOADPOST_USER", "") or os.getenv("UPLOADPOST_USER", "")

    @property
    def configured(self):
        return bool(self.base_url and self.api_key and self.user)

    def publish(self, item):
        payload = {
            "platform": item.platform,
            "caption": item.caption,
            "media_urls": item.media_urls,
            "scheduled_at": item.scheduled_at.isoformat() if item.scheduled_at else None,
        }
        if not self.configured:
            digest = hashlib.sha256(f"{item.id}:{item.updated_at}".encode("utf-8")).hexdigest()[:16]
            return {
                "dry_run": True,
                "request_id": f"dryrun-{digest}",
                "post_id": f"post-{digest}",
                "platform": item.platform,
            }

        response = requests.post(
            f"{self.base_url.rstrip('/')}/api/uploadposts",
            json=payload,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "X-Upload-Post-User": self.user,
            },
            timeout=20,
        )
        response.raise_for_status()
        return response.json()

    def post_analytics(self, request_id):
        if not self.configured:
            return {
                "request_id": request_id,
                "impressions": 1200,
                "reach": 980,
                "clicks": 46,
                "likes": 88,
                "comments": 9,
                "shares": 14,
                "saves": 11,
                "conversions": 3,
                "spend": "0.00",
                "dry_run": True,
            }

        response = requests.get(
            f"{self.base_url.rstrip('/')}/api/uploadposts/post-analytics/{request_id}",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "X-Upload-Post-User": self.user,
            },
            timeout=20,
        )
        response.raise_for_status()
        return response.json()


class MarketingService:
    @classmethod
    def enqueue_publish(cls, item):
        item.status = ContentCalendarItem.Status.QUEUED
        item.error_message = ""
        item.save(update_fields=["status", "error_message", "updated_at"])
        campaign = item.campaign
        if campaign.status == Campaign.Status.DRAFT:
            campaign.status = Campaign.Status.SCHEDULED
            campaign.save(update_fields=["status", "updated_at"])
        return QueueItem.objects.create(
            project=item.project,
            item_type=QueueItemType.CAMPAIGN,
            payload={"action": "publish_calendar_item", "calendar_item_id": str(item.id)},
            scheduled_at=item.scheduled_at,
        )

    @classmethod
    def enqueue_analytics(cls, campaign):
        return QueueItem.objects.create(
            project=campaign.project,
            item_type=QueueItemType.CAMPAIGN,
            payload={"action": "ingest_campaign_analytics", "campaign_id": str(campaign.id)},
        )

    @classmethod
    def process_queue_item(cls, item):
        action = item.payload.get("action")
        if action == "publish_calendar_item":
            return cls.publish_calendar_item(item.payload["calendar_item_id"])
        if action == "ingest_campaign_analytics":
            return cls.ingest_campaign_analytics(item.payload["campaign_id"])
        raise ValueError(f"Unsupported campaign queue action '{action}'")

    @classmethod
    def publish_calendar_item(cls, item_id, client=None):
        client = client or UploadPostClient()
        calendar_item = ContentCalendarItem.objects.select_related("campaign", "project").get(id=item_id)
        calendar_item.status = ContentCalendarItem.Status.PUBLISHING
        calendar_item.error_message = ""
        calendar_item.save(update_fields=["status", "error_message", "updated_at"])
        campaign = calendar_item.campaign
        campaign.status = Campaign.Status.PUBLISHING
        campaign.save(update_fields=["status", "updated_at"])

        try:
            result = client.publish(calendar_item)
        except Exception as exc:
            calendar_item.status = ContentCalendarItem.Status.FAILED
            calendar_item.error_message = str(exc)
            calendar_item.save(update_fields=["status", "error_message", "updated_at"])
            campaign.status = Campaign.Status.FAILED
            campaign.save(update_fields=["status", "updated_at"])
            raise

        request_id = str(result.get("request_id") or result.get("id") or "")
        post_id = str(result.get("post_id") or result.get("external_post_id") or request_id)
        calendar_item.status = ContentCalendarItem.Status.PUBLISHED
        calendar_item.uploadpost_request_id = request_id
        calendar_item.external_post_id = post_id
        calendar_item.publish_result = result
        calendar_item.published_at = timezone.now()
        calendar_item.save(
            update_fields=[
                "status",
                "uploadpost_request_id",
                "external_post_id",
                "publish_result",
                "published_at",
                "updated_at",
            ]
        )
        campaign.status = Campaign.Status.LIVE
        campaign.save(update_fields=["status", "updated_at"])
        return {"published": str(calendar_item.id), "request_id": request_id, "post_id": post_id}

    @classmethod
    def ingest_campaign_analytics(cls, campaign_id, client=None, metrics_payload=None):
        client = client or UploadPostClient()
        campaign = Campaign.objects.get(id=campaign_id)
        items = campaign.calendar_items.filter(status=ContentCalendarItem.Status.PUBLISHED)
        created = []
        for item in items:
            raw = metrics_payload or client.post_analytics(item.uploadpost_request_id or item.external_post_id)
            metric = CampaignMetric.objects.create(
                campaign=campaign,
                calendar_item=item,
                project=campaign.project,
                source="upload_post",
                impressions=int(raw.get("impressions") or 0),
                reach=int(raw.get("reach") or 0),
                clicks=int(raw.get("clicks") or 0),
                likes=int(raw.get("likes") or 0),
                comments=int(raw.get("comments") or 0),
                shares=int(raw.get("shares") or 0),
                saves=int(raw.get("saves") or 0),
                conversions=int(raw.get("conversions") or 0),
                spend=Decimal(str(raw.get("spend") or "0")),
                raw=raw,
                captured_at=timezone.now(),
            )
            created.append(metric)
        cls.refresh_campaign_feedback(campaign)
        return {"campaign_id": str(campaign.id), "metrics_created": len(created)}

    @classmethod
    def refresh_campaign_feedback(cls, campaign):
        totals = campaign.metrics.aggregate(
            impressions=Sum("impressions"),
            reach=Sum("reach"),
            clicks=Sum("clicks"),
            likes=Sum("likes"),
            comments=Sum("comments"),
            shares=Sum("shares"),
            saves=Sum("saves"),
            conversions=Sum("conversions"),
            spend=Sum("spend"),
        )
        summary = {key: int(value or 0) for key, value in totals.items() if key != "spend"}
        summary["spend"] = str(totals.get("spend") or Decimal("0"))
        engagement = summary["clicks"] + summary["likes"] + summary["comments"] + summary["shares"] + summary["saves"]
        impressions = max(summary["impressions"], 1)
        summary["engagement_rate"] = round(engagement / impressions, 4)

        suggestions = []
        if summary["impressions"] == 0:
            suggestions.append("Publish the first scheduled post before measuring performance.")
        if summary["engagement_rate"] < 0.05 and summary["impressions"] > 0:
            suggestions.append("Test a sharper hook and stronger first-line CTA on the next post.")
        if summary["clicks"] and not summary["conversions"]:
            suggestions.append("Review the landing page offer because clicks are not converting.")
        if summary["conversions"] > 0:
            suggestions.append("Promote the best-performing post into a follow-up campaign.")
        if campaign.calendar_items.filter(status=ContentCalendarItem.Status.FAILED).exists():
            suggestions.append("Retry failed posts before planning new creative.")

        campaign.performance_summary = summary
        campaign.next_action_suggestions = suggestions
        campaign.status = Campaign.Status.MEASURING if campaign.calendar_items.exists() else campaign.status
        campaign.save(
            update_fields=[
                "performance_summary",
                "next_action_suggestions",
                "status",
                "updated_at",
            ]
        )
        return summary

    @classmethod
    def overview(cls, owner, project=None):
        campaigns = Campaign.objects.filter(owner=owner)
        items = ContentCalendarItem.objects.filter(owner=owner)
        metrics = CampaignMetric.objects.filter(campaign__owner=owner)
        if project:
            campaigns = campaigns.filter(project=project)
            items = items.filter(project=project)
            metrics = metrics.filter(project=project)
        totals = metrics.aggregate(
            impressions=Sum("impressions"),
            clicks=Sum("clicks"),
            conversions=Sum("conversions"),
        )
        failed_posts = items.filter(status=ContentCalendarItem.Status.FAILED).count()
        return {
            "counts": {
                "campaigns": campaigns.count(),
                "live_campaigns": campaigns.filter(status__in=[Campaign.Status.LIVE, Campaign.Status.MEASURING]).count(),
                "scheduled_posts": items.filter(status__in=[ContentCalendarItem.Status.SCHEDULED, ContentCalendarItem.Status.QUEUED]).count(),
                "failed_posts": failed_posts,
            },
            "performance": {
                "impressions": int(totals["impressions"] or 0),
                "clicks": int(totals["clicks"] or 0),
                "conversions": int(totals["conversions"] or 0),
            },
            "connectors": {
                "upload_post": UploadPostClient().configured,
                "mode": "live" if UploadPostClient().configured else "dry_run",
            },
        }
