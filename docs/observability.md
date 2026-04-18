# Observability

AOS provides four layers of observability: execution traces, policy audit logs, Prometheus metrics, and HTTP request logs.

---

## Execution Traces

Every LangGraph node execution and every swarm phase event creates a `TraceStep` record.

### Viewing traces
```bash
# All traces for a conversation
GET /api/intelligence/conversations/{id}/traces/
```

**TraceStep record:**
```json
{
  "id": "uuid",
  "conversation": "uuid",
  "node_name": "execute:agent_complete",
  "input_data": {"task": "Research enterprise prospects"},
  "output_data": {"summary": "Found 10 prospects matching ICP"},
  "duration_ms": 3200,
  "is_loop": false,
  "risk_score": 0,
  "created_at": "2025-04-18T10:01:23Z"
}
```

### Trace node naming convention

For swarm bridge events:
- `node_name` = `"{phase}:{event_type}"` (e.g., `execute:agent_complete`, `debug:recovery_attempt`)

For native LangGraph executions:
- `node_name` = the LangGraph node name (e.g., `agent`, `tools`, `supervisor`, `Researcher`)

---

## Policy Audit Logs

Every policy evaluation creates an immutable `PolicyAuditLog` entry.

```bash
# All audit logs
GET /api/policies/audit-logs/

# Filter by decision
GET /api/policies/audit-logs/?decision=DENY

# Filter by agent
GET /api/policies/audit-logs/?agent=<agent-uuid>

# Filter by date range
GET /api/policies/audit-logs/?start_date=2025-04-01&end_date=2025-04-30
```

Audit logs are **never deleted** by the system. They are the authoritative compliance record.

---

## HTTP Request Logs

The `agent_gateway` app records every authenticated HTTP request:

```bash
# View request audit trail
GET /api/gateway/ → (admin panel: Agent Request Logs)
```

`AgentRequestLog` captures: agent identity, method, path, status code, IP address, user agent, and timestamp.

---

## Prometheus Metrics

Metrics are exposed at `GET /metrics` (the standard Prometheus scrape endpoint).

### Custom AOS metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `agent_token_usage_total` | Counter | `agent_id`, `provider` | Cumulative token consumption |
| `agent_execution_duration_seconds` | Histogram | `node_name` | Execution latency per LangGraph node |
| `agent_anomaly_total` | Counter | `agent_id`, `anomaly_type` | Flagged anomalies |

### Django / DRF metrics (via django-prometheus)

| Metric | Description |
|---|---|
| `django_http_requests_total` | Requests by method, view, status |
| `django_http_request_duration_seconds` | Request latency |
| `django_db_execute_total` | DB query count |
| `django_db_execute_duration_seconds` | DB query latency |

### Scraping with Prometheus

Add to `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'aos-backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Example Grafana queries

```promql
# Token spend rate (last 5 minutes)
rate(agent_token_usage_total[5m])

# 95th percentile execution latency
histogram_quantile(0.95, rate(agent_execution_duration_seconds_bucket[5m]))

# Policy deny rate
rate(django_http_requests_total{view="SwarmPolicyCheckView",status="200"}[5m])
```

---

## Application Logs

Backend logs stream to `.logs/backend.log` when started via `start.sh`.

```bash
# Live tail
tail -f .logs/backend.log

# Filter for errors
grep "ERROR\|CRITICAL" .logs/backend.log

# Filter for policy denials
grep "DENY\|denied" .logs/backend.log
```

Django's logging is configured via `settings.py`. To increase verbosity:
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'apps.policy_engine': {'handlers': ['console'], 'level': 'DEBUG'},
        'apps.swarm_bridge': {'handlers': ['console'], 'level': 'DEBUG'},
    }
}
```

---

## Swarm Execution Dashboard

`agent-swarm/core/dashboard.py` provides a runtime execution monitor. Each agent dispatch is tracked:

| Status | Meaning |
|---|---|
| `IDLE` | Not yet dispatched |
| `RUNNING` | Currently executing |
| `SUCCESS` | Completed successfully |
| `FAILED` | Execution error |
| `DEBUGGING` | Self-healer is attempting recovery |
| `TIMEOUT` | Exceeded time limit |
| `ESCALATED` | Awaiting human-in-the-loop approval |

The dashboard records: start time, end time, duration, attempt count, output size, and error messages per agent.

---

## Query Logs (Knowledge Base)

Every RAG query is logged to `QueryLog`:

```bash
GET /api/knowledge/queries/
```

Each record contains: agent, collection, query text, retrieved chunk IDs, relevance scores, generated response, token usage, retrieval time, and generation time. Useful for tuning embedding quality and identifying knowledge gaps.

---

## Observability Gaps (Known)

The following are planned but not yet implemented:

| Feature | Status |
|---|---|
| Grafana dashboard templates | Not included (Prometheus config only) |
| Distributed tracing (Jaeger/Zipkin) | Not implemented |
| Real-time alerting (PagerDuty/Slack) | Not implemented |
| Anomaly detection (declared in metrics, not called) | Partial |
| Log aggregation (ELK/Datadog export) | Not implemented |
| Hallucination risk scoring | Planned for Phase 2 |

To add Slack alerting on DENY decisions, create a Django signal or middleware that watches `PolicyAuditLog` creation with `decision=DENY` and posts to a webhook.
