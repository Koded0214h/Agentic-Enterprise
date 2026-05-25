"""
Swarm Bridge Serializers

These form the typed integration contract between the agent-swarm runtime
and the AOS control plane. Every swarm → AOS API call is validated here.
"""
from rest_framework import serializers
from .models import SwarmExecutionContext, SwarmAgentManifest, SwarmEngine, SwarmEnvironment, SwarmWorkflowPhase


# ---------------------------------------------------------------------------
# Inbound: Swarm → AOS
# ---------------------------------------------------------------------------

class SwarmPolicyCheckSerializer(serializers.Serializer):
    """
    POST /api/swarm/policy/check/

    Swarm calls this before executing an agent. AOS evaluates policies and
    returns allow | deny | escalate.
    """
    execution_id = serializers.UUIDField(
        help_text="Client-generated UUID for this execution. Used to correlate all subsequent calls."
    )
    agent_name = serializers.CharField(
        max_length=255,
        help_text="Swarm agent identifier, e.g. 'sales-account-strategist'",
    )
    task = serializers.CharField(
        help_text="The task string being sent to the agent.",
    )
    engine = serializers.ChoiceField(
        choices=SwarmEngine.choices,
        default=SwarmEngine.CLAUDE,
    )
    environment = serializers.ChoiceField(
        choices=SwarmEnvironment.choices,
        default=SwarmEnvironment.DEV,
    )
    workflow_phase = serializers.ChoiceField(
        choices=SwarmWorkflowPhase.choices,
        required=False,
        allow_null=True,
    )
    context = serializers.DictField(
        required=False,
        default=dict,
        help_text="Optional arbitrary context passed from the swarm orchestrator.",
    )
    project_id = serializers.UUIDField(required=False, allow_null=True)


class PolicyCheckResponseSerializer(serializers.Serializer):
    """Response body for POST /api/swarm/policy/check/"""
    decision = serializers.ChoiceField(choices=["allow", "deny", "audit", "escalate", "throttle"])
    reason = serializers.CharField()
    policy_id = serializers.UUIDField(allow_null=True)
    pending_action_id = serializers.UUIDField(
        allow_null=True,
        help_text="Set when decision=escalate. Swarm polls this until approved/rejected.",
    )
    execution_id = serializers.UUIDField()


class SwarmUsageReportSerializer(serializers.Serializer):
    """
    POST /api/swarm/usage/report/

    Swarm sends this after an agent finishes. AOS creates a UsageRecord
    and rolls up spend against the agent's budget.
    """
    execution_id = serializers.UUIDField(
        help_text="Must match the execution_id from the policy check call.",
    )
    agent_name = serializers.CharField(max_length=255)
    engine = serializers.ChoiceField(choices=SwarmEngine.choices)
    tokens_input = serializers.IntegerField(min_value=0, default=0)
    tokens_output = serializers.IntegerField(min_value=0, default=0)
    cost_usd = serializers.DecimalField(
        max_digits=12,
        decimal_places=6,
        min_value=0,
        default=0,
    )
    duration_ms = serializers.IntegerField(min_value=0, default=0)
    success = serializers.BooleanField(default=True)
    error_message = serializers.CharField(required=False, allow_blank=True, default="")
    project_id = serializers.UUIDField(required=False, allow_null=True)


class SwarmTraceEventSerializer(serializers.Serializer):
    """
    POST /api/swarm/traces/

    Swarm emits one event per workflow phase transition or notable step.
    AOS stores these as TraceStep records linked to the execution.
    """
    execution_id = serializers.UUIDField()
    agent_name = serializers.CharField(max_length=255)
    phase = serializers.ChoiceField(choices=SwarmWorkflowPhase.choices)
    event_type = serializers.CharField(
        max_length=100,
        help_text="e.g. 'phase_start', 'phase_complete', 'tool_call', 'error'",
    )
    payload = serializers.DictField(
        required=False,
        default=dict,
        help_text="Arbitrary structured data for this trace event.",
    )
    timestamp = serializers.DateTimeField(required=False, allow_null=True)
    project_id = serializers.UUIDField(required=False, allow_null=True)


class SwarmKBQuerySerializer(serializers.Serializer):
    """
    GET /api/swarm/kb/query/?q=<task>&agent=<name>&top_k=5

    Swarm queries AOS knowledge base before agent execution to enrich context.
    """
    q = serializers.CharField(help_text="Search query derived from the task.")
    agent = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Agent name — used to scope KB results to relevant domains.",
    )
    top_k = serializers.IntegerField(min_value=1, max_value=20, default=5)


# ---------------------------------------------------------------------------
# Inbound: Agent Registration (used by sync_swarm_agents command + API)
# ---------------------------------------------------------------------------

class SwarmAgentRegistrationSerializer(serializers.Serializer):
    """
    POST /api/swarm/agents/register/

    Registers a single swarm agent in AOS. Batch variant accepts a list.
    """
    name = serializers.CharField(max_length=255)
    source_category = serializers.CharField(max_length=100)
    file_path = serializers.CharField(max_length=500)
    preferred_engine = serializers.ChoiceField(
        choices=SwarmEngine.choices,
        required=False,
        allow_null=True,
    )
    description = serializers.CharField(required=False, allow_blank=True, default="")
    raw_markdown = serializers.CharField(required=False, allow_blank=True, default="")


class SwarmAgentRegistrationResponseSerializer(serializers.Serializer):
    """Response for agent registration."""
    aos_agent_id = serializers.UUIDField()
    identity_key = serializers.CharField()
    swarm_name = serializers.CharField()
    created = serializers.BooleanField(help_text="True if newly created, False if updated.")


# ---------------------------------------------------------------------------
# Model serializers (for reading back stored data)
# ---------------------------------------------------------------------------

class SwarmExecutionContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = SwarmExecutionContext
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
