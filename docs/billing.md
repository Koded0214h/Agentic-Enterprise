# Billing & Metering

AOS tracks every token consumed, every millisecond of compute, and every dollar spent across all agents and departments.

---

## How Cost Is Calculated

Cost is calculated per execution using the rates stored on `LLMConfig`:

```
cost = (tokens_input / 1000) × cost_per_1k_tokens_input
     + (tokens_output / 1000) × cost_per_1k_tokens_output
```

Example for Claude Sonnet:
```
tokens_input  = 1,200  × ($0.003 / 1k) = $0.0036
tokens_output =   800  × ($0.015 / 1k) = $0.0120
total_cost    = $0.0156
```

Set rates when creating an `LLMConfig`:
```bash
curl -X POST http://localhost:8000/api/intelligence/llm-configs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Claude Sonnet 4.6",
    "provider": "CLAUDE",
    "model_name": "claude-sonnet-4-6",
    "cost_per_1k_tokens_input": "0.003000",
    "cost_per_1k_tokens_output": "0.015000"
  }'
```

---

## UsageRecord

Every execution creates a `UsageRecord`. For swarm executions, this is created by `POST /api/swarm/usage/report/`. For native LangGraph executions, it is created by `BillingService.record_usage()`.

| Field | Description |
|---|---|
| `agent` | FK to the executing agent |
| `department` | FK to the agent's `DepartmentCostCenter` |
| `tokens_input` | Input token count |
| `tokens_output` | Output token count |
| `compute_time_ms` | Wall clock execution time in milliseconds |
| `cost` | Calculated cost in USD |
| `currency` | Currency code (default: USD) |
| `resource_id` | UUID of the related `Conversation`, `WorkflowTask`, or `SwarmExecutionContext` |
| `resource_type` | Type label for the resource |

---

## Departments (Cost Centers)

Group agents by department for chargeback reporting.

```bash
# Create a department
curl -X POST http://localhost:8000/api/billing/departments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Marketing", "code": "MKT-001"}'

# List departments
curl http://localhost:8000/api/billing/departments/ \
  -H "Authorization: Bearer $TOKEN"
```

Assign an agent to a department by setting `agent.department`:
```bash
curl -X PATCH http://localhost:8000/api/registry/agents/<agent-id>/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"department": "<dept-uuid>"}'
```

---

## Budgets

Set a monthly spending cap for an agent or department.

```bash
# Set a $50/month budget for an agent
curl -X POST http://localhost:8000/api/billing/budgets/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "<agent-uuid>",
    "monthly_limit": "50.00",
    "alert_threshold": "40.00",
    "is_active": true
  }'
```

| Field | Description |
|---|---|
| `monthly_limit` | Hard limit in USD |
| `alert_threshold` | Alert at this spend level (soft limit) |
| `current_month_spend` | Running total — updated on every `usage/report` |
| `last_reset` | When the monthly counter was last reset |
| `is_active` | Whether enforcement is enabled |

**Budget enforcement:** When `current_month_spend >= monthly_limit`, the policy check returns `deny` with reason `"Budget limit exceeded"` before even consulting the policy engine. This cannot be overridden by an ALLOW policy.

> **Note:** Budget counters are not automatically reset on the first of each month. Add a Celery beat task or cron job to run a management command that resets `current_month_spend` monthly.

---

## Usage Queries

```bash
# All usage records
GET /api/billing/usage/

# Filter by agent
GET /api/billing/usage/?agent=<uuid>

# Filter by department
GET /api/billing/usage/?department=<uuid>

# Filter by date range
GET /api/billing/usage/?start_date=2025-04-01&end_date=2025-04-30

# Aggregate summary
GET /api/billing/usage/summary/
```

**Summary response:**
```json
{
  "total_cost_usd": "127.45",
  "total_tokens_input": 42000000,
  "total_tokens_output": 18000000,
  "total_compute_ms": 924000,
  "record_count": 3120
}
```

---

## Department Chargeback Report

To generate a per-department cost breakdown:

```bash
# Get all departments with their UUIDs
curl http://localhost:8000/api/billing/departments/ \
  -H "Authorization: Bearer $TOKEN"

# Query each department's usage
curl "http://localhost:8000/api/billing/usage/summary/?department=<dept-uuid>&start_date=2025-04-01" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Known Billing Gaps

| Feature | Status |
|---|---|
| Automatic monthly budget reset | Not implemented — manual or cron required |
| Budget alert notifications (email/Slack) | Not implemented |
| Cost allocation rules (fixed vs. shared) | Not implemented |
| Cost center hierarchies | Not implemented |
| Invoice generation | Not implemented |
| Stripe / ERP integration | Not implemented |

These are Phase 2 features. The metering data is fully captured — the missing pieces are reporting UI and downstream integrations.
