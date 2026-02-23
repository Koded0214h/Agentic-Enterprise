import logging
from django.utils import timezone
from .models import UsageRecord, DepartmentCostCenter, AgentBudget
from apps.agent_intelligence.models import Conversation

logger = logging.getLogger(__name__)

class BillingService:
    @staticmethod
    def record_usage(agent, resource_type, resource_id, tokens_input=0, tokens_output=0, compute_time_ms=0, cost=0.0):
        """Record a single usage event."""
        try:
            # Determine department for chargeback
            department = agent.department
            
            # Create usage record
            record = UsageRecord.objects.create(
                agent=agent,
                department=department,
                tokens_input=tokens_input,
                tokens_output=tokens_output,
                compute_time_ms=compute_time_ms,
                cost=cost,
                resource_id=resource_id,
                resource_type=resource_type
            )
            
            # Update budget if it exists
            BillingService.update_budget(agent, cost)
            if department:
                BillingService.update_budget(None, cost, department)
                
            return record
        except Exception as e:
            logger.error(f"Failed to record usage for agent {agent.id}: {e}")
            return None

    @staticmethod
    def update_budget(agent=None, cost=0.0, department=None):
        """Update the current spend for an agent or department budget."""
        from django.db.models import F
        
        if agent:
            AgentBudget.objects.filter(agent=agent, is_active=True).update(
                current_month_spend=F('current_month_spend') + cost
            )
        elif department:
            AgentBudget.objects.filter(department=department, is_active=True).update(
                current_month_spend=F('current_month_spend') + cost
            )

    @staticmethod
    def get_usage_summary(agent_id=None, department_id=None, start_date=None, end_date=None):
        """Get aggregated usage stats."""
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
            total_cost=Sum('cost'),
            total_tokens_input=Sum('tokens_input'),
            total_tokens_output=Sum('tokens_output'),
            total_compute_time=Sum('compute_time_ms'),
            record_count=Count('id')
        )
