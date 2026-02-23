from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.agent_registry.models import Agent, AgentType
from .models import UsageRecord, DepartmentCostCenter, AgentBudget
from .services import BillingService
import uuid

User = get_user_model()

class BillingTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testbill", password="pass")
        self.dept = DepartmentCostCenter.objects.create(
            name="Research Dept", code="RD-01", manager=self.user
        )
        self.agent = Agent.objects.get_or_create(
            name="BillingAgent",
            owner=self.user,
            defaults={
                'agent_type': AgentType.FUNCTIONAL,
                'identity_key': str(uuid.uuid4()),
                'department': self.dept
            }
        )[0]
        self.budget = AgentBudget.objects.create(
            department=self.dept,
            monthly_limit=50.0
        )

    def test_record_usage_and_budget_update(self):
        """Test that recording usage creates a record and updates the budget."""
        BillingService.record_usage(
            agent=self.agent,
            resource_type="chat",
            resource_id=uuid.uuid4(),
            tokens_input=100,
            tokens_output=200,
            cost=0.50
        )
        
        record = UsageRecord.objects.get(agent=self.agent)
        self.assertEqual(record.cost, 0.50)
        self.assertEqual(record.department, self.dept)
        
        self.budget.refresh_from_db()
        self.assertEqual(float(self.budget.current_month_spend), 0.50)

    def test_usage_summary(self):
        """Test the aggregation logic in get_usage_summary."""
        BillingService.record_usage(self.agent, "test", uuid.uuid4(), cost=1.0)
        BillingService.record_usage(self.agent, "test", uuid.uuid4(), cost=2.0)
        
        summary = BillingService.get_usage_summary(department_id=self.dept.id)
        self.assertEqual(float(summary['total_cost']), 3.0)
        self.assertEqual(summary['record_count'], 2)
