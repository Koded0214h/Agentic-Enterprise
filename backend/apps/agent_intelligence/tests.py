from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.agent_registry.models import Agent, AgentType
from apps.agent_intelligence.models import LLMConfig, AgentCapability, Conversation, TraceStep
from apps.agent_intelligence.utils.agent_factory import LangGraphAgentFactory
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

    def test_supervisor_graph_compilation(self):
        """Verify that the supervisor graph can be compiled correctly."""
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
