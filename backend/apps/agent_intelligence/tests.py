import os
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.agent_registry.models import Agent, AgentType
from apps.agent_intelligence.models import (
    LLMConfig, AgentCapability, Conversation, TraceStep,
    WorkflowTask, PendingAction, Message,
)
from apps.agent_intelligence.utils.agent_factory import LangGraphAgentFactory
from apps.policy_engine.models import Policy, PolicyEffect
from apps.billing.services import BudgetExceededError
import uuid

User = get_user_model()

class OrchestrationAndTraceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="orchestrator", password="pass")
        self.llm_config = LLMConfig.objects.create(
            name="Test LLM", provider="GEMINI", model_name="gemini-pro"
        )
        
        # Sub-agent
        self.sub_agent = Agent.objects.create(
            name="SubWorker", owner=self.user, identity_key=str(uuid.uuid4())
        )
        AgentCapability.objects.create(agent=self.sub_agent, primary_llm=self.llm_config)
        
        # Supervisor
        self.supervisor = Agent.objects.create(
            name="Supervisor", owner=self.user, identity_key=str(uuid.uuid4())
        )
        self.cap = AgentCapability.objects.create(
            agent=self.supervisor, 
            primary_llm=self.llm_config,
            graph_type="MULTI_AGENT"
        )
        self.cap.sub_agents.add(self.sub_agent)

    @patch('apps.agent_intelligence.utils.agent_factory.LLMManager.get_llm')
    def test_supervisor_graph_compilation(self, mock_get_llm):
        """Verify that the supervisor graph can be compiled correctly."""
        mock_get_llm.return_value = MagicMock()
        app = LangGraphAgentFactory.create_agent(self.supervisor)
        self.assertIsNotNone(app)
        
    def test_trace_step_creation(self):
        """Test that TraceSteps are recorded in the database."""
        conv = Conversation.objects.create(agent=self.supervisor)
        
        TraceStep.objects.create(
            conversation=conv,
            node_name="test_node",
            duration_ms=150,
            output_data={"result": "success"}
        )
        
        self.assertEqual(TraceStep.objects.filter(conversation=conv).count(), 1)
        self.assertEqual(TraceStep.objects.first().node_name, "test_node")


class SecurityAndHITLTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="security_user", password="pass")
        self.agent = Agent.objects.create(
            name="SecureAgent", owner=self.user, identity_key=str(uuid.uuid4())
        )

    def test_api_key_encryption(self):
        """Test that LLMConfig API keys are encrypted in the database."""
        raw_key = "sk-sensitive-12345"
        config = LLMConfig.objects.create(
            name="Encrypted Config",
            provider="OPENAI",
            model_name="gpt-4",
            api_key=raw_key
        )
        
        # Verify it's encrypted in the DB
        config.refresh_from_db()
        self.assertNotEqual(config.api_key, raw_key)
        self.assertTrue(config.api_key.startswith("gAAAA")) # Fernet header
        
        # Verify it's decrypted via property
        self.assertEqual(config.decrypted_api_key, raw_key)

    def test_pending_action_flow(self):
        """Test the lifecycle of a PendingAction."""
        from .models import Conversation, PendingAction
        conv = Conversation.objects.create(agent=self.agent, status="PENDING_APPROVAL")
        pending = PendingAction.objects.create(
            conversation=conv,
            agent=self.agent,
            action_type="task",
            resource="agent:execute",
            state_snapshot={"task": "do something"}
        )
        
        self.assertEqual(pending.status, "PENDING")
        
        # Simulate approval via the ViewSet logic (simplified)
        pending.status = "APPROVED"
        pending.save()
        conv.status = "ACTIVE"
        conv.save()
        
        self.assertEqual(Conversation.objects.get(id=conv.id).status, "ACTIVE")
        self.assertEqual(PendingAction.objects.get(id=pending.id).status, "APPROVED")


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

User = get_user_model()


def _make_mock_executor(reply="Test agent reply"):
    """Return a mock LangGraph executor whose invoke() returns a plausible state."""
    msg = MagicMock()
    msg.content = reply
    msg.type = "ai"
    executor = MagicMock()
    executor.invoke.return_value = {"messages": [msg]}
    return executor


def _allow_policy(resources=None):
    """Create a global ALLOW policy (no agents/roles → applies to everyone)."""
    return Policy.objects.create(
        name="Global Allow",
        effect=PolicyEffect.ALLOW,
        resources=resources or ["agent:*"],
        is_active=True,
        priority=10,
    )


# ---------------------------------------------------------------------------
# LLMConfigViewSet
# ---------------------------------------------------------------------------

class LLMConfigViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="llmuser", password="pass")
        self.client.force_authenticate(user=self.user)

    def test_create_llm_config(self):
        resp = self.client.post("/api/intelligence/llm-configs/", {
            "name": "Claude 3", "provider": "CLAUDE", "model_name": "claude-3-opus",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["name"], "Claude 3")

    def test_list_llm_configs(self):
        LLMConfig.objects.create(name="GPT-4", provider="OPENAI", model_name="gpt-4")
        resp = self.client.get("/api/intelligence/llm-configs/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_retrieve_llm_config(self):
        cfg = LLMConfig.objects.create(name="Gemini", provider="GEMINI", model_name="gemini-pro")
        resp = self.client.get(f"/api/intelligence/llm-configs/{cfg.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["model_name"], "gemini-pro")

    def test_update_llm_config(self):
        cfg = LLMConfig.objects.create(name="Orig", provider="GEMINI", model_name="gemini-pro")
        resp = self.client.patch(f"/api/intelligence/llm-configs/{cfg.id}/", {"name": "Updated"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["name"], "Updated")

    def test_delete_llm_config(self):
        cfg = LLMConfig.objects.create(name="ToDelete", provider="GEMINI", model_name="gemini-pro")
        resp = self.client.delete(f"/api/intelligence/llm-configs/{cfg.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_recommendations_action(self):
        resp = self.client.get("/api/intelligence/llm-configs/recommendations/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("general_reasoning", resp.data)

    def test_unauthenticated_blocked(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get("/api/intelligence/llm-configs/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# AgentCapabilityViewSet
# ---------------------------------------------------------------------------

class AgentCapabilityViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="capuser", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = Agent.objects.create(
            name="CapAgent", owner=self.user,
            agent_type=AgentType.FUNCTIONAL, identity_key=str(uuid.uuid4()),
        )
        self.llm = LLMConfig.objects.create(name="TestLLM", provider="CLAUDE", model_name="claude-3-haiku")

    def test_create_capability(self):
        resp = self.client.post("/api/intelligence/capabilities/", {
            "agent": str(self.agent.id),
            "primary_llm": str(self.llm.id),
            "graph_type": "REACT",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_list_own_capabilities(self):
        AgentCapability.objects.create(agent=self.agent, primary_llm=self.llm)
        resp = self.client.get("/api/intelligence/capabilities/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_other_users_capability_not_visible(self):
        other_user = User.objects.create_user(username="other_cap", password="pass")
        other_agent = Agent.objects.create(
            name="OtherCapAgent", owner=other_user, identity_key=str(uuid.uuid4())
        )
        AgentCapability.objects.create(agent=other_agent, primary_llm=self.llm)
        resp = self.client.get("/api/intelligence/capabilities/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)

    def test_enable_tool_action(self):
        cap = AgentCapability.objects.create(agent=self.agent, primary_llm=self.llm)
        resp = self.client.post(
            f"/api/intelligence/capabilities/{cap.id}/enable_tool/",
            {"tool_name": "web_search"}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("web_search", resp.data["tools_enabled"])

    def test_enable_tool_requires_tool_name(self):
        cap = AgentCapability.objects.create(agent=self.agent, primary_llm=self.llm)
        resp = self.client.post(f"/api/intelligence/capabilities/{cap.id}/enable_tool/", {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# ConversationViewSet
# ---------------------------------------------------------------------------

class ConversationViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="convuser", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = Agent.objects.create(
            name="ConvAgent", owner=self.user,
            agent_type=AgentType.FUNCTIONAL, identity_key=str(uuid.uuid4()),
        )
        self.llm = LLMConfig.objects.create(name="TestLLM2", provider="CLAUDE", model_name="claude-3")
        self.cap = AgentCapability.objects.create(agent=self.agent, primary_llm=self.llm)
        _allow_policy()

    def test_create_conversation(self):
        resp = self.client.post("/api/intelligence/conversations/", {
            "agent": str(self.agent.id),
            "title": "Test conv",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_list_own_conversations(self):
        Conversation.objects.create(agent=self.agent, title="Mine")
        resp = self.client.get("/api/intelligence/conversations/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    @patch("apps.agent_intelligence.views.LangGraphAgentFactory.create_agent")
    def test_message_returns_reply(self, mock_create):
        mock_create.return_value = _make_mock_executor("Hello from agent")
        conv = Conversation.objects.create(agent=self.agent)
        resp = self.client.post(
            f"/api/intelligence/conversations/{conv.id}/message/",
            {"content": "Hi"}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["response"], "Hello from agent")

    @patch("apps.agent_intelligence.views.BillingService.check_budget")
    def test_message_budget_exceeded_returns_402(self, mock_budget):
        mock_budget.side_effect = BudgetExceededError("Over limit")
        conv = Conversation.objects.create(agent=self.agent)
        resp = self.client.post(
            f"/api/intelligence/conversations/{conv.id}/message/",
            {"content": "Hi"}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        self.assertIn("Budget exceeded", resp.data["error"])

    def test_message_empty_content_returns_400(self):
        conv = Conversation.objects.create(agent=self.agent)
        resp = self.client.post(
            f"/api/intelligence/conversations/{conv.id}/message/",
            {"content": "  "}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_traces_action_returns_trace_steps(self):
        conv = Conversation.objects.create(agent=self.agent)
        TraceStep.objects.create(conversation=conv, node_name="start_node", duration_ms=10)
        resp = self.client.get(f"/api/intelligence/conversations/{conv.id}/traces/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["node_name"], "start_node")

    def test_other_users_conversation_not_listed(self):
        other_user = User.objects.create_user(username="other_conv", password="pass")
        other_agent = Agent.objects.create(name="OtherAgent2", owner=other_user, identity_key=str(uuid.uuid4()))
        Conversation.objects.create(agent=other_agent)
        resp = self.client.get("/api/intelligence/conversations/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for conv in resp.data:
            self.assertNotEqual(conv["agent"], str(other_agent.id))


# ---------------------------------------------------------------------------
# WorkflowTaskViewSet
# ---------------------------------------------------------------------------

class WorkflowTaskViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="taskuser", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = Agent.objects.create(
            name="TaskAgent", owner=self.user,
            agent_type=AgentType.FUNCTIONAL, identity_key=str(uuid.uuid4()),
        )

    def test_create_task(self):
        resp = self.client.post("/api/intelligence/tasks/", {
            "agent": str(self.agent.id),
            "description": "Summarise the report",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["status"], "PENDING")

    def test_list_own_tasks(self):
        WorkflowTask.objects.create(agent=self.agent, description="Task A")
        resp = self.client.get("/api/intelligence/tasks/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_add_dependency(self):
        t1 = WorkflowTask.objects.create(agent=self.agent, description="First")
        t2 = WorkflowTask.objects.create(agent=self.agent, description="Second")
        resp = self.client.post(
            f"/api/intelligence/tasks/{t2.id}/add_dependency/",
            {"dependency_id": str(t1.id)}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn(t1, t2.depends_on.all())

    def test_add_dependency_not_found(self):
        t = WorkflowTask.objects.create(agent=self.agent, description="Solo")
        resp = self.client.post(
            f"/api/intelligence/tasks/{t.id}/add_dependency/",
            {"dependency_id": str(uuid.uuid4())}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_ready_action_returns_runnable_tasks(self):
        WorkflowTask.objects.create(agent=self.agent, description="No deps")
        resp = self.client.get("/api/intelligence/tasks/ready/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_run_dag_empty_task_ids(self):
        resp = self.client.post("/api/intelligence/tasks/run_dag/", {"task_ids": []}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# PendingActionViewSet
# ---------------------------------------------------------------------------

class PendingActionViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="hitluser", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = Agent.objects.create(
            name="HITLAgent", owner=self.user,
            agent_type=AgentType.FUNCTIONAL, identity_key=str(uuid.uuid4()),
        )
        self.conv = Conversation.objects.create(agent=self.agent, status="PENDING_APPROVAL")
        self.pending = PendingAction.objects.create(
            conversation=self.conv,
            agent=self.agent,
            action_type="task",
            resource="agent:execute",
            state_snapshot={"task": "write a report"},
        )

    def test_list_pending_actions(self):
        resp = self.client.get("/api/intelligence/pending-actions/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_retrieve_pending_action(self):
        resp = self.client.get(f"/api/intelligence/pending-actions/{self.pending.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["action_type"], "task")

    def test_deny_pending_action(self):
        resp = self.client.post(
            f"/api/intelligence/pending-actions/{self.pending.id}/approve/",
            {"decision": "DENIED"}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.pending.refresh_from_db()
        self.assertEqual(self.pending.status, "DENIED")

    def test_approve_already_decided_returns_400(self):
        self.pending.status = "APPROVED"
        self.pending.save()
        resp = self.client.post(
            f"/api/intelligence/pending-actions/{self.pending.id}/approve/",
            {"decision": "APPROVED"}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_invalid_decision_returns_400(self):
        resp = self.client.post(
            f"/api/intelligence/pending-actions/{self.pending.id}/approve/",
            {"decision": "MAYBE"}, format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# AgentExecuteView
# ---------------------------------------------------------------------------

class AgentExecuteViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="execuser", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = Agent.objects.create(
            name="ExecAgent", owner=self.user,
            agent_type=AgentType.FUNCTIONAL, identity_key=str(uuid.uuid4()),
        )
        self.llm = LLMConfig.objects.create(name="ExecLLM", provider="CLAUDE", model_name="claude-3")
        AgentCapability.objects.create(agent=self.agent, primary_llm=self.llm)
        _allow_policy()

    @patch("apps.agent_intelligence.views.LangGraphAgentFactory.create_agent")
    def test_execute_agent_returns_response(self, mock_create):
        mock_create.return_value = _make_mock_executor("Task complete")
        resp = self.client.post("/api/intelligence/execute/", {
            "agent_id": str(self.agent.id),
            "task": "Do something useful",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["response"], "Task complete")
        self.assertEqual(resp.data["agent_name"], "ExecAgent")

    def test_execute_unknown_agent_returns_404(self):
        resp = self.client.post("/api/intelligence/execute/", {
            "agent_id": str(uuid.uuid4()),
            "task": "Orphan task",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    @patch("apps.agent_intelligence.views.BillingService.check_budget")
    def test_execute_budget_exceeded_returns_402(self, mock_budget):
        mock_budget.side_effect = BudgetExceededError("Agent over budget")
        resp = self.client.post("/api/intelligence/execute/", {
            "agent_id": str(self.agent.id),
            "task": "Costly task",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_402_PAYMENT_REQUIRED)

    def test_execute_no_capability_returns_400(self):
        bare_agent = Agent.objects.create(
            name="BareAgent", owner=self.user, identity_key=str(uuid.uuid4()),
        )
        resp = self.client.post("/api/intelligence/execute/", {
            "agent_id": str(bare_agent.id),
            "task": "Some task",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_execute_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post("/api/intelligence/execute/", {
            "agent_id": str(self.agent.id), "task": "t",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("apps.agent_intelligence.views.LangGraphAgentFactory.create_agent")
    def test_execute_langgraph_exception_returns_500(self, mock_create):
        mock_create.side_effect = RuntimeError("LangGraph crashed")
        resp = self.client.post("/api/intelligence/execute/", {
            "agent_id": str(self.agent.id),
            "task": "Crash task",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
