import logging
from decimal import Decimal
from django.utils import timezone
from .models import UsageRecord, DepartmentCostCenter, AgentBudget

logger = logging.getLogger(__name__)


class BudgetExceededError(Exception):
    """Raised when an agent or department has exceeded its budget limit."""
    def __init__(self, message, budget=None):
        super().__init__(message)
        self.budget = budget


class BillingService:

    @staticmethod
    def check_budget(agent, estimated_cost: float = 0.0) -> None:
        """
        Hard-block execution if agent or its department is over budget.
        Raises BudgetExceededError if limit is exceeded.
        """
        cost = Decimal(str(estimated_cost))

        # Agent-level budget check
        agent_budget = AgentBudget.objects.filter(agent=agent, is_active=True).first()
        if agent_budget:
            projected = agent_budget.current_month_spend + cost
            if projected > agent_budget.monthly_limit:
                raise BudgetExceededError(
                    f"Agent '{agent.name}' would exceed monthly budget "
                    f"(${agent_budget.current_month_spend:.4f} + ${cost:.4f} "
                    f"> ${agent_budget.monthly_limit:.2f})",
                    budget=agent_budget,
                )
            # Alert threshold warning logged (non-blocking)
            threshold = agent_budget.monthly_limit * Decimal(agent_budget.alert_threshold_percentage) / 100
            if agent_budget.current_month_spend >= threshold:
                logger.warning(
                    "Agent '%s' has reached %s%% of monthly budget ($%.4f / $%.2f)",
                    agent.name,
                    agent_budget.alert_threshold_percentage,
                    agent_budget.current_month_spend,
                    agent_budget.monthly_limit,
                )

        # Department-level budget check
        if agent.department:
            dept_budget = AgentBudget.objects.filter(department=agent.department, is_active=True).first()
            if dept_budget:
                projected = dept_budget.current_month_spend + cost
                if projected > dept_budget.monthly_limit:
                    raise BudgetExceededError(
                        f"Department '{agent.department.name}' would exceed monthly budget "
                        f"(${dept_budget.current_month_spend:.4f} + ${cost:.4f} "
                        f"> ${dept_budget.monthly_limit:.2f})",
                        budget=dept_budget,
                    )

    @staticmethod
    def record_usage(agent, resource_type, resource_id, tokens_input=0, tokens_output=0,
                     compute_time_ms=0, cost=0.0):
        """Record a single usage event and update budgets."""
        try:
            department = agent.department
            record = UsageRecord.objects.create(
                agent=agent,
                department=department,
                tokens_input=tokens_input,
                tokens_output=tokens_output,
                compute_time_ms=compute_time_ms,
                cost=cost,
                resource_id=resource_id,
                resource_type=resource_type,
            )
            BillingService._update_budget(agent=agent, cost=cost)
            if department:
                BillingService._update_budget(department=department, cost=cost)
            return record
        except Exception as e:
            logger.error("Failed to record usage for agent %s: %s", agent.id, e)
            return None

    @staticmethod
    def _update_budget(agent=None, cost: float = 0.0, department=None):
        from django.db.models import F
        cost = Decimal(str(cost))
        if agent:
            AgentBudget.objects.filter(agent=agent, is_active=True).update(
                current_month_spend=F("current_month_spend") + cost
            )
        elif department:
            AgentBudget.objects.filter(department=department, is_active=True).update(
                current_month_spend=F("current_month_spend") + cost
            )

    # Legacy public alias kept for compatibility
    @staticmethod
    def update_budget(agent=None, cost=0.0, department=None):
        BillingService._update_budget(agent=agent, cost=cost, department=department)

    @staticmethod
    def reset_monthly_budgets():
        """
        Zero out current_month_spend on all active budgets.
        Called by Celery beat on the 1st of every month.
        """
        updated = AgentBudget.objects.filter(is_active=True).update(
            current_month_spend=Decimal("0.000000"),
            last_reset_at=timezone.now(),
        )
        logger.info("Monthly budget reset: %d budget(s) cleared", updated)
        return updated

    @staticmethod
    def get_usage_summary(agent_id=None, department_id=None, start_date=None, end_date=None):
        from django.db.models import Sum, Count
        query = UsageRecord.objects.all()
        if agent_id:
            query = query.filter(agent_id=agent_id)
        if department_id:
            query = query.filter(department_id=department_id)
        if start_date:
            query = query.filter(created_at__gte=start_date)
        if end_date:
            query = query.filter(created_at__lte=end_date)
        return query.aggregate(
            total_cost=Sum("cost"),
            total_tokens_input=Sum("tokens_input"),
            total_tokens_output=Sum("tokens_output"),
            total_compute_time=Sum("compute_time_ms"),
            record_count=Count("id"),
        )

    @staticmethod
    def get_budget_status(agent=None, department=None) -> dict:
        """Return current spend vs limit with percentage for dashboards."""
        budget = None
        if agent:
            budget = AgentBudget.objects.filter(agent=agent, is_active=True).first()
        elif department:
            budget = AgentBudget.objects.filter(department=department, is_active=True).first()
        if not budget:
            return {"has_budget": False}
        limit = float(budget.monthly_limit)
        spend = float(budget.current_month_spend)
        pct = round((spend / limit * 100) if limit > 0 else 0, 2)
        return {
            "has_budget": True,
            "monthly_limit": limit,
            "current_spend": spend,
            "remaining": round(limit - spend, 6),
            "percent_used": pct,
            "alert_threshold": budget.alert_threshold_percentage,
            "over_alert": pct >= budget.alert_threshold_percentage,
            "over_limit": spend >= limit,
        }
