import logging
from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

logger = logging.getLogger(__name__)

# Exponential backoff delays in seconds: 30s → 2min → 10min
BACKOFF_SECONDS = [30, 120, 600]


class QueueProcessor:
    """
    Sweeps pending/retrying QueueItems and dispatches each one.
    Retry backoff and dead-letter promotion are handled here so the
    Celery task stays thin.
    """

    @classmethod
    def process_pending(cls) -> dict:
        from ..models import QueueItem, QueueItemStatus

        now = timezone.now()
        items = (
            QueueItem.objects.filter(
                status__in=[QueueItemStatus.PENDING, QueueItemStatus.RETRYING],
            )
            .filter(
                Q(scheduled_at__isnull=True) | Q(scheduled_at__lte=now),
                Q(next_retry_at__isnull=True) | Q(next_retry_at__lte=now),
            )
            .order_by("-priority", "created_at")[:50]
        )

        results = {"processed": 0, "failed": 0, "dead": 0}
        for item in items:
            outcome = cls.process_item(item)
            results[outcome] = results.get(outcome, 0) + 1
        return results

    @classmethod
    def process_item(cls, item) -> str:
        from ..models import QueueItemStatus
        from .fallback import FallbackBridge

        item.status = QueueItemStatus.PROCESSING
        item.started_at = timezone.now()
        item.save(update_fields=["status", "started_at", "updated_at"])

        try:
            result = cls._dispatch(item)
            item.status = QueueItemStatus.COMPLETED
            item.result = result
            item.completed_at = timezone.now()
            item.save(update_fields=["status", "result", "completed_at", "updated_at"])
            logger.info("QueueItem %s completed (%s)", item.id, item.item_type)
            return "processed"
        except Exception as exc:
            logger.warning("QueueItem %s failed: %s", item.id, exc)
            return cls._handle_failure(item, str(exc), FallbackBridge)

    @classmethod
    def _dispatch(cls, item) -> dict:
        from ..models import QueueItemType

        dispatch_map = {
            QueueItemType.LEAD_SYNC: cls._sync_lead,
            QueueItemType.TICKET_SYNC: cls._sync_ticket,
            QueueItemType.OPPORTUNITY_SYNC: cls._sync_opportunity,
            QueueItemType.ACCOUNT_SYNC: cls._sync_account,
            QueueItemType.WEBHOOK_DISPATCH: cls._dispatch_webhook,
            QueueItemType.EMAIL_DISPATCH: cls._dispatch_email,
        }
        handler = dispatch_map.get(item.item_type)
        if handler is None:
            raise ValueError(f"No handler for item_type '{item.item_type}'")
        return handler(item)

    @classmethod
    def _handle_failure(cls, item, error: str, FallbackBridge) -> str:
        from ..models import QueueItemStatus

        item.retry_count += 1
        item.error_message = error

        if item.can_retry:
            delay_index = min(item.retry_count - 1, len(BACKOFF_SECONDS) - 1)
            delay = BACKOFF_SECONDS[delay_index]
            item.next_retry_at = timezone.now() + timedelta(seconds=delay)
            item.status = QueueItemStatus.RETRYING
            item.save(
                update_fields=[
                    "retry_count", "error_message", "next_retry_at", "status", "updated_at"
                ]
            )
            FallbackBridge.trigger(item, error, final=False)
            logger.info(
                "QueueItem %s retrying in %ds (attempt %d/%d)",
                item.id, delay, item.retry_count, item.max_retries,
            )
            return "failed"
        else:
            item.status = QueueItemStatus.DEAD
            item.save(
                update_fields=["retry_count", "error_message", "status", "updated_at"]
            )
            logger.error(
                "QueueItem %s is DEAD after %d retries: %s",
                item.id, item.retry_count, error,
            )
            FallbackBridge.trigger(item, error, final=True)
            return "dead"

    # ── sync handlers (stubs wired to Sprint 2 CRM/support adapters) ─────────

    @staticmethod
    def _sync_lead(item) -> dict:
        from ..models import Lead, SyncStatus

        lead_id = item.payload.get("lead_id")
        if lead_id:
            Lead.objects.filter(id=lead_id).update(
                sync_status=SyncStatus.SYNCED,
                last_synced_at=timezone.now(),
            )
        return {"synced": lead_id}

    @staticmethod
    def _sync_ticket(item) -> dict:
        from ..models import Ticket, SyncStatus

        ticket_id = item.payload.get("ticket_id")
        if ticket_id:
            Ticket.objects.filter(id=ticket_id).update(
                sync_status=SyncStatus.SYNCED,
                last_synced_at=timezone.now(),
            )
        return {"synced": ticket_id}

    @staticmethod
    def _sync_opportunity(item) -> dict:
        from ..models import Opportunity, SyncStatus

        opp_id = item.payload.get("opportunity_id")
        if opp_id:
            Opportunity.objects.filter(id=opp_id).update(
                sync_status=SyncStatus.SYNCED,
                last_synced_at=timezone.now(),
            )
        return {"synced": opp_id}

    @staticmethod
    def _sync_account(item) -> dict:
        return {"synced": item.payload.get("account_id")}

    @staticmethod
    def _dispatch_webhook(item) -> dict:
        return {"dispatched": item.payload.get("url")}

    @staticmethod
    def _dispatch_email(item) -> dict:
        return {"sent_to": item.payload.get("to")}
