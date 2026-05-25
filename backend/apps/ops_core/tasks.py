from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(name="apps.ops_core.tasks.process_queue")
def process_queue():
    """Celery beat task: sweep pending/retrying QueueItems every minute."""
    from .services.queue_processor import QueueProcessor

    results = QueueProcessor.process_pending()
    logger.info("Queue sweep complete: %s", results)
    return results


@shared_task(
    name="apps.ops_core.tasks.process_queue_item",
    bind=True,
    max_retries=0,  # retry logic lives inside QueueProcessor, not Celery
)
def process_queue_item(self, queue_item_id: str):
    """Process a single QueueItem by ID — dispatched immediately on creation."""
    from .models import QueueItem
    from .services.queue_processor import QueueProcessor

    try:
        item = QueueItem.objects.get(id=queue_item_id)
    except QueueItem.DoesNotExist:
        logger.warning("process_queue_item: QueueItem %s not found", queue_item_id)
        return {"error": "not_found", "id": queue_item_id}

    return QueueProcessor.process_item(item)
