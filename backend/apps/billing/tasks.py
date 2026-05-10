from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(name="apps.billing.tasks.reset_monthly_budgets")
def reset_monthly_budgets():
    """Celery beat task: zero out current_month_spend on all active budgets."""
    from .services import BillingService
    count = BillingService.reset_monthly_budgets()
    logger.info("Monthly budget reset task completed: %d budget(s) cleared", count)
    return {"reset": count}
