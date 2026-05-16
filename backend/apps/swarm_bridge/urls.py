from django.urls import path
from .views import (
    SwarmAgentRegisterView,
    SwarmPolicyCheckView,
    SwarmUsageReportView,
    SwarmTraceEventView,
    SwarmKBQueryView,
    SwarmExecutionContextDetailView,
    SwarmRunView,
    SwarmRunStreamView,
    SwarmRunPollView,
    SwarmRunInputView,
    SwarmRunStatusView,
    SwarmRunCancelView,
    ExecutionEventStreamView,
    ExecutionReplayView,
    ExecutionCancelView,
    CouncilReviewView,
    WorkflowGraphRunView,
    WorkflowTemplateLaunchView,
    WorkflowTemplatesListView,
)

urlpatterns = [
    # 1. Agent registration
    path("agents/register/", SwarmAgentRegisterView.as_view(), name="swarm-agent-register"),

    # 2. Pre-execution policy gate
    path("policy/check/", SwarmPolicyCheckView.as_view(), name="swarm-policy-check"),

    # 3. Post-execution usage metering
    path("usage/report/", SwarmUsageReportView.as_view(), name="swarm-usage-report"),

    # 4. Trace events
    path("traces/", SwarmTraceEventView.as_view(), name="swarm-traces"),

    # 5. Knowledge base enrichment
    path("kb/query/", SwarmKBQueryView.as_view(), name="swarm-kb-query"),

    # Execution context read-back / escalation polling
    path(
        "executions/<uuid:execution_id>/",
        SwarmExecutionContextDetailView.as_view(),
        name="swarm-execution-detail",
    ),

    # Native execution — real-time SSE event stream (Phase 3)
    path(
        "executions/<uuid:execution_id>/stream/",
        ExecutionEventStreamView.as_view(),
        name="swarm-execution-stream",
    ),

    # Native execution — full event replay for audit (Phase 4)
    path(
        "executions/<uuid:execution_id>/replay/",
        ExecutionReplayView.as_view(),
        name="swarm-execution-replay",
    ),

    # Native execution — cancel signal
    path(
        "executions/<uuid:execution_id>/cancel/",
        ExecutionCancelView.as_view(),
        name="swarm-execution-cancel",
    ),

    # Council multi-agent review
    path("council/review/", CouncilReviewView.as_view(), name="swarm-council-review"),

    # Multi-agent DAG / workflow graph execution
    path("workflows/graph/", WorkflowGraphRunView.as_view(), name="swarm-workflow-graph"),

    # Workflow templates (one-click multi-agent demos)
    path("workflows/templates/", WorkflowTemplatesListView.as_view(), name="swarm-workflow-templates"),
    path(
        "workflows/templates/<str:template_id>/launch/",
        WorkflowTemplateLaunchView.as_view(),
        name="swarm-workflow-template-launch",
    ),

    # Swarm run lifecycle
    path("run/",                          SwarmRunView.as_view(),        name="swarm-run"),
    path("run/<str:run_id>/",             SwarmRunStatusView.as_view(),  name="swarm-run-status"),
    path("run/<str:run_id>/stream/",      SwarmRunStreamView.as_view(),  name="swarm-run-stream"),
    path("run/<str:run_id>/poll/",        SwarmRunPollView.as_view(),    name="swarm-run-poll"),
    path("run/<str:run_id>/input/",       SwarmRunInputView.as_view(),   name="swarm-run-input"),
    path("run/<str:run_id>/cancel/",      SwarmRunCancelView.as_view(),  name="swarm-run-cancel"),
]
