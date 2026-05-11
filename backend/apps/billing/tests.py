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


# ---------------------------------------------------------------------------
# View tests
# ---------------------------------------------------------------------------
from rest_framework.test import APIClient
from rest_framework import status as drf_status


class DepartmentCostCenterViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="deptview", password="pass")
        self.client.force_authenticate(user=self.user)

    def test_create_department(self):
        resp = self.client.post("/api/billing/departments/", {
            "name": "Engineering", "code": "ENG-01",
        }, format="json")
        self.assertEqual(resp.status_code, drf_status.HTTP_201_CREATED)
        self.assertEqual(resp.data["code"], "ENG-01")

    def test_list_departments(self):
        DepartmentCostCenter.objects.create(name="Sales", code="SAL-01", manager=self.user)
        resp = self.client.get("/api/billing/departments/")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_retrieve_department(self):
        dept = DepartmentCostCenter.objects.create(name="Finance", code="FIN-01", manager=self.user)
        resp = self.client.get(f"/api/billing/departments/{dept.id}/")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertEqual(resp.data["name"], "Finance")

    def test_delete_department(self):
        dept = DepartmentCostCenter.objects.create(name="ToDelete", code="DEL-99", manager=self.user)
        resp = self.client.delete(f"/api/billing/departments/{dept.id}/")
        self.assertEqual(resp.status_code, drf_status.HTTP_204_NO_CONTENT)

    def test_unauthenticated_blocked(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get("/api/billing/departments/")
        self.assertEqual(resp.status_code, drf_status.HTTP_401_UNAUTHORIZED)


class UsageRecordViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="usageview", password="pass")
        self.client.force_authenticate(user=self.user)
        self.dept = DepartmentCostCenter.objects.create(name="UsageDept", code="USG-01", manager=self.user)
        self.agent = Agent.objects.get_or_create(
            name="UsageViewAgent",
            owner=self.user,
            defaults={
                "agent_type": AgentType.FUNCTIONAL,
                "identity_key": str(uuid.uuid4()),
                "department": self.dept,
            },
        )[0]

    def test_list_own_usage_records(self):
        BillingService.record_usage(self.agent, "chat", uuid.uuid4(), cost=0.10)
        resp = self.client.get("/api/billing/usage/")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_other_users_records_not_visible(self):
        other_user = User.objects.create_user(username="other_usage", password="pass")
        other_agent = Agent.objects.create(
            name="OtherUsageAgent", owner=other_user, identity_key=str(uuid.uuid4()),
        )
        BillingService.record_usage(other_agent, "chat", uuid.uuid4(), cost=5.0)
        resp = self.client.get("/api/billing/usage/")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        for rec in resp.data:
            self.assertNotEqual(rec["agent"], str(other_agent.id))

    def test_summary_action(self):
        BillingService.record_usage(self.agent, "test", uuid.uuid4(), cost=1.50)
        BillingService.record_usage(self.agent, "test", uuid.uuid4(), cost=0.75)
        resp = self.client.get(f"/api/billing/usage/summary/?agent_id={self.agent.id}")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertEqual(float(resp.data["total_cost"]), 2.25)
        self.assertEqual(resp.data["record_count"], 2)

    def test_summary_by_department(self):
        BillingService.record_usage(self.agent, "test", uuid.uuid4(), cost=3.0)
        resp = self.client.get(f"/api/billing/usage/summary/?department_id={self.dept.id}")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertGreaterEqual(float(resp.data["total_cost"] or 0), 3.0)

    def test_usage_records_are_read_only(self):
        resp = self.client.post("/api/billing/usage/", {"agent": str(self.agent.id), "cost": 99}, format="json")
        self.assertEqual(resp.status_code, drf_status.HTTP_405_METHOD_NOT_ALLOWED)


class AgentBudgetViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="budgetview", password="pass")
        self.admin = User.objects.create_superuser(username="adminview", password="pass")
        self.client.force_authenticate(user=self.user)
        self.dept = DepartmentCostCenter.objects.create(name="BudgetDept", code="BGT-01", manager=self.user)
        self.agent = Agent.objects.get_or_create(
            name="BudgetViewAgent",
            owner=self.user,
            defaults={
                "agent_type": AgentType.FUNCTIONAL,
                "identity_key": str(uuid.uuid4()),
                "department": self.dept,
            },
        )[0]

    def test_create_agent_budget(self):
        resp = self.client.post("/api/billing/budgets/", {
            "agent": str(self.agent.id),
            "monthly_limit": "100.00",
        }, format="json")
        self.assertEqual(resp.status_code, drf_status.HTTP_201_CREATED)
        self.assertEqual(float(resp.data["monthly_limit"]), 100.0)

    def test_list_budgets(self):
        AgentBudget.objects.create(agent=self.agent, monthly_limit=200.0)
        resp = self.client.get("/api/billing/budgets/")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_status_by_agent(self):
        AgentBudget.objects.create(agent=self.agent, monthly_limit=50.0, current_month_spend=10.0)
        resp = self.client.get(f"/api/billing/budgets/status/?agent_id={self.agent.id}")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertTrue(resp.data["has_budget"])
        self.assertEqual(float(resp.data["monthly_limit"]), 50.0)
        self.assertEqual(float(resp.data["current_spend"]), 10.0)
        self.assertEqual(float(resp.data["remaining"]), 40.0)

    def test_status_by_department(self):
        AgentBudget.objects.create(department=self.dept, monthly_limit=500.0)
        resp = self.client.get(f"/api/billing/budgets/status/?department_id={self.dept.id}")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertTrue(resp.data["has_budget"])

    def test_status_no_budget_returns_has_budget_false(self):
        resp = self.client.get(f"/api/billing/budgets/status/?agent_id={self.agent.id}")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertFalse(resp.data["has_budget"])

    def test_status_missing_params_returns_400(self):
        resp = self.client.get("/api/billing/budgets/status/")
        self.assertEqual(resp.status_code, drf_status.HTTP_400_BAD_REQUEST)

    def test_reset_monthly_admin_only(self):
        AgentBudget.objects.create(agent=self.agent, monthly_limit=100.0, current_month_spend=45.0)
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post("/api/billing/budgets/reset_monthly/")
        self.assertEqual(resp.status_code, drf_status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data["reset"], 1)
        self.agent.budget.refresh_from_db()
        self.assertEqual(float(self.agent.budget.current_month_spend), 0.0)

    def test_reset_monthly_non_admin_returns_403(self):
        resp = self.client.post("/api/billing/budgets/reset_monthly/")
        self.assertEqual(resp.status_code, drf_status.HTTP_403_FORBIDDEN)
