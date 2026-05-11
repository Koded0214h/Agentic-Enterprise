import uuid

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.agent_registry.models import Agent, AgentType, AgentStatus
from apps.billing.models import DepartmentCostCenter, AgentBudget
from apps.policy_engine.models import Policy, PolicyEffect
from .models import SwarmExecutionContext, SwarmAgentManifest, SwarmEngine

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_agent(user, name="SwarmTestAgent"):
    return Agent.objects.create(
        name=name,
        owner=user,
        agent_type=AgentType.FUNCTIONAL,
        identity_key=str(uuid.uuid4()),
        status=AgentStatus.RUNNING,
    )


def make_manifest(agent, swarm_name="test-agent"):
    return SwarmAgentManifest.objects.create(
        aos_agent=agent,
        swarm_name=swarm_name,
        source_category="engineering",
        file_path=f"agents/engineering/{swarm_name}.md",
    )


def make_context(agent, execution_id=None):
    return SwarmExecutionContext.objects.create(
        id=execution_id or uuid.uuid4(),
        aos_agent=agent,
        swarm_agent_name="test-agent",
        engine=SwarmEngine.CLAUDE,
        task_summary="Test task",
    )


# ---------------------------------------------------------------------------
# 1. Agent Registration
# ---------------------------------------------------------------------------

class SwarmAgentRegisterViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="swarm_reg", password="pass")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("swarm-agent-register")

    def test_register_new_agent_returns_201(self):
        data = {
            "name": "engineering-lead",
            "source_category": "engineering",
            "file_path": "agents/engineering/engineering-lead.md",
            "description": "Leads engineering tasks",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["created"])
        self.assertEqual(response.data["swarm_name"], "engineering-lead")
        self.assertIn("aos_agent_id", response.data)
        self.assertIn("identity_key", response.data)

    def test_register_creates_agent_and_manifest_in_db(self):
        data = {
            "name": "product-manager",
            "source_category": "product",
            "file_path": "agents/product/product-manager.md",
        }
        self.client.post(self.url, data, format="json")
        self.assertTrue(Agent.objects.filter(name="product-manager").exists())
        self.assertTrue(SwarmAgentManifest.objects.filter(swarm_name="product-manager").exists())

    def test_register_agent_identity_key_prefixed_swarm(self):
        data = {
            "name": "swarm-key-test",
            "source_category": "core",
            "file_path": "agents/core/swarm-key-test.md",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertTrue(response.data["identity_key"].startswith("swarm_"))

    def test_register_existing_agent_returns_200_and_updates_manifest(self):
        agent = make_agent(self.user, "sales-rep")
        SwarmAgentManifest.objects.create(
            aos_agent=agent,
            swarm_name="sales-rep",
            source_category="sales",
            file_path="agents/sales/sales-rep.md",
        )
        data = {
            "name": "sales-rep",
            "source_category": "sales",
            "file_path": "agents/sales/sales-rep-v2.md",
            "description": "Updated description",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["created"])
        manifest = SwarmAgentManifest.objects.get(swarm_name="sales-rep")
        self.assertEqual(manifest.file_path, "agents/sales/sales-rep-v2.md")
        self.assertEqual(manifest.description, "Updated description")

    def test_register_existing_agent_does_not_duplicate(self):
        agent = make_agent(self.user, "no-dupe")
        SwarmAgentManifest.objects.create(
            aos_agent=agent,
            swarm_name="no-dupe",
            source_category="core",
            file_path="agents/core/no-dupe.md",
        )
        data = {"name": "no-dupe", "source_category": "core", "file_path": "agents/core/no-dupe.md"}
        self.client.post(self.url, data, format="json")
        self.assertEqual(Agent.objects.filter(name="no-dupe").count(), 1)

    def test_register_missing_required_fields_returns_400(self):
        response = self.client.post(self.url, {"name": "incomplete"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# 2. Policy Check
# ---------------------------------------------------------------------------

class SwarmPolicyCheckViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="swarm_policy", password="pass")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("swarm-policy-check")

    def _payload(self, agent_name="ghost-agent", execution_id=None):
        return {
            "execution_id": str(execution_id or uuid.uuid4()),
            "agent_name": agent_name,
            "task": "Run a market analysis report",
            "engine": "claude",
            "environment": "dev",
        }

    def test_unknown_agent_defaults_to_allow(self):
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["decision"], "allow")

    def test_creates_execution_context(self):
        eid = uuid.uuid4()
        self.client.post(self.url, self._payload(execution_id=eid), format="json")
        self.assertTrue(SwarmExecutionContext.objects.filter(id=eid).exists())

    def test_execution_context_stores_agent_name(self):
        eid = uuid.uuid4()
        self.client.post(self.url, self._payload(agent_name="ghost-agent", execution_id=eid), format="json")
        ctx = SwarmExecutionContext.objects.get(id=eid)
        self.assertEqual(ctx.swarm_agent_name, "ghost-agent")

    def test_same_execution_id_is_idempotent(self):
        eid = uuid.uuid4()
        payload = self._payload(execution_id=eid)
        self.client.post(self.url, payload, format="json")
        self.client.post(self.url, payload, format="json")
        self.assertEqual(SwarmExecutionContext.objects.filter(id=eid).count(), 1)

    def test_policy_decision_persisted_on_context(self):
        eid = uuid.uuid4()
        self.client.post(self.url, self._payload(execution_id=eid), format="json")
        ctx = SwarmExecutionContext.objects.get(id=eid)
        self.assertIsNotNone(ctx.policy_decision)

    def test_known_agent_with_global_allow_policy(self):
        agent = make_agent(self.user, "allowed-agent")
        make_manifest(agent, "allowed-agent")
        Policy.objects.create(
            name="Global Allow Swarm",
            effect=PolicyEffect.ALLOW,
            resources=["swarm:execute"],
            is_active=True,
        )
        response = self.client.post(self.url, self._payload("allowed-agent"), format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["decision"], "allow")

    def test_known_agent_with_targeted_deny_policy(self):
        agent = make_agent(self.user, "denied-agent")
        make_manifest(agent, "denied-agent")
        policy = Policy.objects.create(
            name="Deny Swarm Agent",
            effect=PolicyEffect.DENY,
            resources=["swarm:execute"],
            is_active=True,
        )
        policy.agents.add(agent)
        response = self.client.post(self.url, self._payload("denied-agent"), format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["decision"], "deny")

    def test_budget_exceeded_returns_deny(self):
        dept = DepartmentCostCenter.objects.create(name="Finance", code="FIN-01", manager=self.user)
        agent = make_agent(self.user, "budget-blown-agent")
        agent.department = dept
        agent.save()
        make_manifest(agent, "budget-blown-agent")
        AgentBudget.objects.create(
            agent=agent,
            monthly_limit="10.00",
            current_month_spend="10.00",
            is_active=True,
        )
        response = self.client.post(self.url, self._payload("budget-blown-agent"), format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["decision"], "deny")
        self.assertIn("Budget", response.data["reason"])

    def test_response_includes_execution_id(self):
        eid = uuid.uuid4()
        response = self.client.post(self.url, self._payload(execution_id=eid), format="json")
        self.assertEqual(response.data["execution_id"], str(eid))

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# 3. Usage Report
# ---------------------------------------------------------------------------

class SwarmUsageReportViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="swarm_usage", password="pass")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("swarm-usage-report")
        self.agent = make_agent(self.user)
        self.eid = uuid.uuid4()
        self.ctx = make_context(self.agent, self.eid)

    def _payload(self, execution_id=None):
        return {
            "execution_id": str(execution_id or self.eid),
            "agent_name": "test-agent",
            "engine": "claude",
            "tokens_input": 500,
            "tokens_output": 300,
            "cost_usd": "0.002500",
            "duration_ms": 1200,
        }

    def test_report_usage_returns_recorded(self):
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "recorded")
        self.assertEqual(response.data["execution_id"], str(self.eid))

    def test_report_usage_creates_usage_record(self):
        from apps.billing.models import UsageRecord
        self.client.post(self.url, self._payload(), format="json")
        record = UsageRecord.objects.get(agent=self.agent)
        self.assertEqual(record.tokens_input, 500)
        self.assertEqual(record.tokens_output, 300)
        self.assertEqual(record.resource_type, "swarm_execution")

    def test_report_usage_id_in_response(self):
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertIsNotNone(response.data["usage_record_id"])

    def test_report_usage_updates_context_metrics(self):
        self.client.post(self.url, self._payload(), format="json")
        self.ctx.refresh_from_db()
        self.assertEqual(self.ctx.tokens_input, 500)
        self.assertEqual(self.ctx.tokens_output, 300)
        self.assertEqual(self.ctx.duration_ms, 1200)
        self.assertIsNotNone(self.ctx.completed_at)

    def test_report_zero_cost_no_budget_update(self):
        payload = self._payload()
        payload["cost_usd"] = "0.000000"
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unknown_execution_id_returns_404(self):
        response = self.client.post(self.url, self._payload(execution_id=uuid.uuid4()), format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# 4. Trace Events
# ---------------------------------------------------------------------------

class SwarmTraceEventViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="swarm_trace", password="pass")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("swarm-traces")
        self.agent = make_agent(self.user)
        self.eid = uuid.uuid4()
        self.ctx = make_context(self.agent, self.eid)

    def _payload(self, execution_id=None, phase="execute", event_type="phase_start"):
        return {
            "execution_id": str(execution_id or self.eid),
            "agent_name": "test-agent",
            "phase": phase,
            "event_type": event_type,
            "payload": {"input": "do research", "output": {}},
        }

    def test_trace_event_returns_recorded(self):
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "recorded")
        self.assertEqual(response.data["event_type"], "phase_start")

    def test_trace_event_creates_trace_step(self):
        from apps.agent_intelligence.models import TraceStep
        self.client.post(self.url, self._payload(), format="json")
        self.assertTrue(TraceStep.objects.filter(node_name="execute:phase_start").exists())

    def test_trace_step_id_in_response(self):
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertIsNotNone(response.data.get("trace_step_id"))

    def test_trace_event_creates_conversation_anchor(self):
        from apps.agent_intelligence.models import Conversation
        self.client.post(self.url, self._payload(), format="json")
        self.assertTrue(Conversation.objects.filter(session_id=self.eid).exists())

    def test_multiple_phases_create_separate_trace_steps(self):
        from apps.agent_intelligence.models import TraceStep
        self.client.post(self.url, self._payload(phase="planner", event_type="phase_start"), format="json")
        self.client.post(self.url, self._payload(phase="execute", event_type="phase_start"), format="json")
        self.assertEqual(TraceStep.objects.count(), 2)

    def test_unknown_execution_id_returns_404(self):
        response = self.client.post(self.url, self._payload(execution_id=uuid.uuid4()), format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# 5. Knowledge Base Query
# ---------------------------------------------------------------------------

class SwarmKBQueryViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="swarm_kb", password="pass")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("swarm-kb-query")

    def test_kb_query_returns_200_with_results_list(self):
        response = self.client.get(self.url, {"q": "enterprise AI strategy"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertIsInstance(response.data["results"], list)

    def test_kb_query_echoes_query_string(self):
        response = self.client.get(self.url, {"q": "sales pipeline optimisation"})
        self.assertEqual(response.data["query"], "sales pipeline optimisation")

    def test_kb_query_respects_top_k_parameter(self):
        response = self.client.get(self.url, {"q": "test", "top_k": "3"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["top_k"], 3)

    def test_kb_query_top_k_out_of_range_returns_400(self):
        response = self.client.get(self.url, {"q": "test", "top_k": "50"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_kb_query_missing_q_returns_400(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_kb_query_no_collections_returns_empty_list(self):
        # No KB collections in test DB — search_knowledge_base returns [] silently
        response = self.client.get(self.url, {"q": "anything"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url, {"q": "test"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# 6. Execution Context Read-back
# ---------------------------------------------------------------------------

class SwarmExecutionContextDetailViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="swarm_ctx", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = make_agent(self.user)
        self.eid = uuid.uuid4()
        self.ctx = make_context(self.agent, self.eid)

    def test_get_existing_context_returns_200(self):
        url = reverse("swarm-execution-detail", args=[self.eid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data["id"]), str(self.eid))
        self.assertEqual(response.data["swarm_agent_name"], "test-agent")

    def test_context_response_contains_expected_fields(self):
        url = reverse("swarm-execution-detail", args=[self.eid])
        response = self.client.get(url)
        for field in ("id", "swarm_agent_name", "engine", "policy_decision", "task_summary"):
            self.assertIn(field, response.data)

    def test_get_nonexistent_context_returns_404(self):
        url = reverse("swarm-execution-detail", args=[uuid.uuid4()])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        url = reverse("swarm-execution-detail", args=[self.eid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
