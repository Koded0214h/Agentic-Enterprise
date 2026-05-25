import logging

from django.utils import timezone

logger = logging.getLogger(__name__)


class FallbackBridge:
    """
    Dispatch fallback notifications when a QueueItem fails.
    - On retry failure: fires a webhook to the project's fallback_webhook_url (if set).
    - On dead-letter (final): fires an email alert to fallback_alert_email (if set).
    Both are themselves queued as low-priority QueueItems so sync status stays durable.
    """

    @classmethod
    def trigger(cls, item, error: str, *, final: bool = False) -> None:
        project = item.project
        if final:
            cls._email_alert(project, item, error)
        else:
            cls._webhook_notify(project, item, error)

    @classmethod
    def _webhook_notify(cls, project, item, error: str) -> None:
        webhook_url = project.metadata.get("fallback_webhook_url")
        if not webhook_url:
            logger.debug(
                "No fallback_webhook_url on project %s — skipping webhook", project.id
            )
            return

        from ..models import QueueItem, QueueItemType

        QueueItem.objects.create(
            project=project,
            item_type=QueueItemType.WEBHOOK_DISPATCH,
            priority=-1,  # below normal work so it doesn't crowd real jobs
            payload={
                "url": webhook_url,
                "event": "queue_item_failed",
                "queue_item_id": str(item.id),
                "item_type": item.item_type,
                "retry_count": item.retry_count,
                "error": error,
                "timestamp": timezone.now().isoformat(),
            },
        )
        logger.info(
            "Fallback webhook queued for project %s (failed item %s)", project.id, item.id
        )

    @classmethod
    def _email_alert(cls, project, item, error: str) -> None:
        alert_email = project.metadata.get("fallback_alert_email")
        if not alert_email:
            logger.debug(
                "No fallback_alert_email on project %s — skipping email alert", project.id
            )
            return

        from ..models import QueueItem, QueueItemType

        QueueItem.objects.create(
            project=project,
            item_type=QueueItemType.EMAIL_DISPATCH,
            priority=-1,
            payload={
                "to": alert_email,
                "subject": f"[AOS] Dead queue item in project '{project.name}'",
                "body": (
                    f"Queue item {item.id} ({item.item_type}) has failed permanently "
                    f"after {item.retry_count} retries.\n\nLast error:\n{error}"
                ),
            },
        )
        logger.error(
            "Dead-letter email alert queued for project %s (item %s)", project.id, item.id
        )
