# API Reference

All endpoints require a JWT Bearer token unless otherwise noted.

**Base URL:** `http://localhost:8000`

**Get a token:**
```bash
POST /api/token/
{"username": "admin", "password": "admin1234"}
→ {"access": "<jwt>", "refresh": "<jwt>"}
```

**Refresh a token:**
```bash
POST /api/token/refresh/
{"refresh": "<refresh-token>"}
→ {"access": "<new-jwt>"}
```

---

## Agent Registry `/api/registry/`

### `GET /api/registry/agents/`
List all registered agents. Supports filtering.

**Query params:** `?status=RUNNING&agent_type=FUNCTIONAL&source=SWARM`

**Response:**
```json
[{
  "id": "uuid",
  "name": "sales-account-strategist",
  "agent_type": "FUNCTIONAL",
  "source": "SWARM",
  "status": "RUNNING",
  "identity_key": "swarm_abc123...",
  "department": null,
  "roles": [],
  "metadata": {"source_category": "sales"},
  "version": "2.2",
  "created_at": "2025-04-18T10:00:00Z"
}]
```

### `POST /api/registry/agents/`
Register a new agent.

**Body:**
```json
{
  "name": "my-finance-agent",
  "agent_type": "FUNCTIONAL",
  "department": "Finance",
  "metadata": {}
}
```

### `GET /api/registry/agents/{id}/`
Fetch a single agent by UUID.

### `PATCH /api/registry/agents/{id}/`
Update agent fields (name, department, metadata, status).

### `DELETE /api/registry/agents/{id}/`
Decommission an agent.

### `POST /api/registry/agents/{id}/pause/`
Pause agent execution. Sets `status=PAUSED`.

### `POST /api/registry/agents/{id}/resume/`
Resume a paused agent. Sets `status=RUNNING`.

### `POST /api/registry/agents/{id}/execute/`
Queue a background Celery task for this agent.

**Body:** `{"task": "Run quarterly analysis"}`

---

### `GET /api/registry/roles/`
List all RBAC roles.

### `POST /api/registry/roles/`
Create a role.

**Body:**
```json
{
  "name": "finance-readonly",
  "permissions": ["billing:read", "reports:read"]
}
```

---

## Agent Gateway `/api/gateway/`

### `POST /api/gateway/login/`
Authenticate an agent and get a session JWT.

**Body:**
```json
{
  "identity_key": "swarm_abc123...",
  "agent_name": "sales-account-strategist"
}
```

**Response:**
```json
{
  "token": "<jwt>",
  "session_id": "uuid",
  "expires_at": "2025-04-19T10:00:00Z"
}
```

### `POST /api/gateway/logout/`
Revoke the current agent session.

---

## Policy Engine `/api/policies/`

### `GET /api/policies/policies/`
List all policies. Filter: `?effect=DENY&is_active=true`

### `POST /api/policies/policies/`
Create a policy.

**Body:**
```json
{
  "name": "Block Production Writes After Hours",
  "description": "Deny write operations in prod after 6 PM",
  "resources": ["agent:execute", "tool:database"],
  "effect": "DENY",
  "priority": 50,
  "risk_level": 80,
  "is_active": true,
  "valid_from": null,
  "valid_until": null
}
```

**Effect values:** `ALLOW` | `DENY` | `AUDIT` | `ESCALATE`

### `GET /api/policies/policies/{id}/`
Fetch a single policy.

### `PATCH /api/policies/policies/{id}/`
Update a policy.

### `DELETE /api/policies/policies/{id}/`
Delete a policy.

### `POST /api/policies/policies/{id}/evaluate/`
Test a policy against a hypothetical request.

**Body:**
```json
{
  "resource": "tool:external-api",
  "action": "call",
  "context": {"hour": 20, "environment": "prod"}
}
```

**Response:**
```json
{
  "decision": "DENY",
  "reason": "Policy 'Block Production Writes After Hours' applied with effect DENY",
  "policy_id": "uuid"
}
```

### `POST /api/policies/policies/{id}/duplicate/`
Clone a policy. Returns the new policy record.

---

### `GET /api/policies/conditions/`
List all policy conditions.

### `POST /api/policies/conditions/`
Add a condition to a policy.

**Body:**
```json
{
  "policy": "policy-uuid",
  "field": "context.environment",
  "operator": "eq",
  "value": "prod"
}
```

**Operators:** `eq` `neq` `gt` `lt` `contains` `not_contains` `in` `not_in` `between` `regex`

---

### `GET /api/policies/assignments/`
List policy assignments.

### `POST /api/policies/assignments/`
Assign a policy to a specific agent or role.

**Body:**
```json
{
  "policy": "policy-uuid",
  "agent": "agent-uuid",
  "role": null
}
```

---

### `GET /api/policies/audit-logs/`
View immutable policy decision logs.

**Query params:** `?agent=<id>&decision=DENY&start_date=2025-01-01`

**Response:**
```json
[{
  "id": "uuid",
  "agent": "uuid",
  "policy": "uuid",
  "resource": "swarm:execute",
  "action": "dispatch:sales-account-strategist",
  "decision": "ALLOW",
  "reason": "Policy 'Global Allow - Swarm Dispatch' applied",
  "execution_time_ms": 4,
  "request_data": {},
  "created_at": "2025-04-18T10:01:23Z"
}]
```

---

### `POST /api/policies/check/`
One-shot permission check. Returns allow/deny without creating an execution context.

**Body:**
```json
{
  "agent_id": "uuid",
  "resource": "tool:database",
  "action": "write",
  "context": {}
}
```

---

## Agent Intelligence `/api/intelligence/`

### `POST /api/intelligence/execute/`
Execute an agent on a one-shot task.

**Body:**
```json
{
  "agent_id": "uuid",
  "task": "Summarize Q3 financial performance",
  "context": {"quarter": "Q3"}
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "response": "Q3 revenue was...",
  "tokens_used": 1240,
  "cost_usd": "0.003100",
  "duration_ms": 2800
}
```

---

### `GET /api/intelligence/llm-configs/`
List LLM configurations.

### `POST /api/intelligence/llm-configs/`
Create an LLM config.

**Body:**
```json
{
  "name": "Claude Sonnet Production",
  "provider": "CLAUDE",
  "model_name": "claude-sonnet-4-6",
  "api_key": "sk-ant-...",
  "temperature": 0.7,
  "max_tokens": 4096,
  "cost_per_1k_tokens_input": "0.003000",
  "cost_per_1k_tokens_output": "0.015000"
}
```

**Provider values:** `CLAUDE` `GEMINI` `OPENAI` `MISTRAL` `LLAMA` `CUSTOM`

---

### `GET /api/intelligence/capabilities/`
List agent capability configurations.

### `POST /api/intelligence/capabilities/`
Configure an agent's execution capabilities.

**Body:**
```json
{
  "agent": "uuid",
  "llm_config": "uuid",
  "graph_type": "REACT",
  "tools_enabled": ["web-search", "code-interpreter"],
  "memory_type": "BUFFER",
  "max_iterations": 10,
  "timeout_seconds": 120,
  "rag_enabled": false
}
```

**Graph types:** `REACT` `PLAN_EXECUTE` `MULTI_AGENT` `CUSTOM`

---

### `GET /api/intelligence/conversations/`
List all conversations.

### `GET /api/intelligence/conversations/{id}/`
Fetch a conversation with full message history.

### `POST /api/intelligence/conversations/{id}/message/`
Send a new message turn to an active conversation.

**Body:** `{"content": "What were the top risks identified?"}`

### `GET /api/intelligence/conversations/{id}/traces/`
Get all `TraceStep` records for this conversation.

---

### `GET /api/intelligence/tools/`
List registered tools.

### `GET /api/intelligence/tools/available/`
List tools available to the current agent.

### `POST /api/intelligence/tools/`
Register a new tool.

**Body:**
```json
{
  "name": "crm-lookup",
  "tool_type": "API",
  "description": "Look up a company in the CRM by domain",
  "endpoint": "https://api.crm.internal/companies",
  "parameters": {
    "type": "object",
    "properties": {
      "domain": {"type": "string", "description": "Company domain"}
    },
    "required": ["domain"]
  },
  "rate_limit_per_minute": 30
}
```

---

### `GET /api/intelligence/tasks/`
List workflow tasks.

### `POST /api/intelligence/tasks/`
Create a workflow task.

### `POST /api/intelligence/tasks/{id}/add_dependency/`
Add a task dependency (DAG edge).

**Body:** `{"depends_on_task_id": "uuid"}`

---

### `GET /api/intelligence/pending-actions/`
List all pending human-in-the-loop approvals.

### `POST /api/intelligence/pending-actions/{id}/approve/`
Approve or deny a pending action.

**Body:**
```json
{
  "decision": "APPROVED",
  "notes": "Reviewed and approved for this run"
}
```

**Decision values:** `APPROVED` | `DENIED`

---

## Knowledge Base `/api/knowledge/`

### `GET /api/knowledge/collections/`
List knowledge collections.

### `POST /api/knowledge/collections/`
Create a collection.

**Body:**
```json
{
  "name": "Company Policies",
  "description": "Internal HR and legal documents",
  "embedding_model": "text-embedding-004",
  "chunk_size": 1000,
  "chunk_overlap": 200
}
```

### `POST /api/knowledge/collections/{id}/query/`
Run a RAG query against a collection.

**Body:**
```json
{
  "query": "What is the data retention policy for customer PII?",
  "top_k": 5
}
```

**Response:**
```json
{
  "query": "...",
  "response": "According to document X...",
  "sources": [
    {"title": "Data Policy v2.pdf", "content": "...", "relevance": 0.94, "page": 3}
  ],
  "performance": {"retrieval_ms": 45, "generation_ms": 800, "total_ms": 845}
}
```

### `POST /api/knowledge/collections/{id}/grant_access/`
Grant an agent read access to a collection.

**Body:** `{"agent_id": "uuid"}`

### `POST /api/knowledge/collections/{id}/revoke_access/`
Revoke agent access.

**Body:** `{"agent_id": "uuid"}`

---

### `GET /api/knowledge/documents/`
List documents.

### `POST /api/knowledge/documents/`
Upload a document.

**Multipart form:** `file=@document.pdf`, `collection=<collection-uuid>`

### `POST /api/knowledge/documents/{id}/process/`
Trigger chunking and embedding for a document.

### `GET /api/knowledge/queries/`
View RAG query history and audit log.

---

## Billing `/api/billing/`

### `GET /api/billing/usage/`
List usage records. Filter: `?agent=<id>&start_date=2025-01-01&end_date=2025-12-31`

### `GET /api/billing/usage/summary/`
Aggregate usage stats.

**Query params:** `?agent=<id>` or `?department=<id>` or `?start_date=...&end_date=...`

**Response:**
```json
{
  "total_cost_usd": "14.23",
  "total_tokens_input": 4200000,
  "total_tokens_output": 1800000,
  "total_compute_ms": 92400,
  "record_count": 312
}
```

### `GET /api/billing/departments/`
List cost centers.

### `POST /api/billing/departments/`
Create a department cost center.

**Body:**
```json
{
  "name": "Engineering",
  "code": "ENG-001"
}
```

### `GET /api/billing/budgets/`
List agent budgets.

### `POST /api/billing/budgets/`
Set a budget.

**Body:**
```json
{
  "agent": "uuid",
  "monthly_limit": "100.00",
  "alert_threshold": "80.00",
  "is_active": true
}
```

---

## Swarm Bridge `/api/swarm/`

These endpoints are called by `agent-swarm/core/aos_client.py`. You can also call them directly.

### `POST /api/swarm/agents/register/`
Register or update a swarm agent in AOS.

**Body:**
```json
{
  "name": "sales-account-strategist",
  "source_category": "sales",
  "file_path": "sales/sales-account-strategist.md",
  "description": "Enterprise account expansion strategist",
  "preferred_engine": "claude"
}
```

### `POST /api/swarm/policy/check/`
Pre-execution governance gate.

**Body:**
```json
{
  "execution_id": "uuid",
  "agent_name": "sales-account-strategist",
  "task": "Research Acme Corp for expansion opportunities",
  "engine": "claude",
  "environment": "dev",
  "workflow_phase": "execute"
}
```

**Response:**
```json
{
  "decision": "allow",
  "reason": "Policy 'Global Allow - Swarm Dispatch' applied with effect ALLOW",
  "policy_id": "uuid",
  "pending_action_id": null,
  "execution_id": "uuid"
}
```

### `POST /api/swarm/usage/report/`
Post-execution metering.

**Body:**
```json
{
  "execution_id": "uuid",
  "agent_name": "sales-account-strategist",
  "engine": "claude",
  "tokens_input": 1200,
  "tokens_output": 800,
  "cost_usd": "0.004200",
  "duration_ms": 3200,
  "success": true
}
```

### `POST /api/swarm/traces/`
Emit a workflow trace event.

**Body:**
```json
{
  "execution_id": "uuid",
  "agent_name": "sales-account-strategist",
  "phase": "execute",
  "event_type": "agent_complete",
  "payload": {
    "output": {"summary": "Found 10 prospects"},
    "duration_ms": 3200
  }
}
```

### `GET /api/swarm/kb/query/`
Query the AOS knowledge base for context enrichment.

**Query params:** `?q=enterprise+sales+strategy&agent=sales-account-strategist&top_k=5`

### `GET /api/swarm/executions/{execution_id}/`
Read back an execution context. Used to poll escalation status.

---

## Documentation & Schema

| Endpoint | Description |
|---|---|
| `GET /api/schema/` | OpenAPI 3.0 schema (JSON) |
| `GET /api/docs/swagger/` | Interactive Swagger UI |
| `GET /api/docs/redoc/` | ReDoc documentation |
| `GET /metrics` | Prometheus metrics |
| `GET /admin/` | Django admin panel |
