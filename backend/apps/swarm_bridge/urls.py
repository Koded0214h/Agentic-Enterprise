from django.urls import path
from .views import (
    SwarmAgentRegisterView,
    SwarmPolicyCheckView,
    SwarmUsageReportView,
    SwarmTraceEventView,
    SwarmKBQueryView,
    SwarmExecutionContextDetailView,
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
]
