# Usage Guide

## Starting the System

```bash
./start.sh
```

Once running, the system is available at:
- **API** — `http://localhost:8000`
- **Swagger UI** — `http://localhost:8000/api/docs/swagger/`
- **Admin** — `http://localhost:8000/admin/` (admin / admin1234)
- **Metrics** — `http://localhost:8000/metrics`

---

## Running a Swarm Agent

The primary way to use the system is through `orchestrator.py`, which dispatches specialized agents governed by AOS.

```bash
cd agent-swarm
source .env

# Run a single agent goal
python orchestrator.py "Research the top 10 enterprise prospects in the fintech space"

# Specify an engine explicitly
python orchestrator.py "Write a backend API for user authentication" --engine claude

# Run in a specific project directory
python orchestrator.py "Refactor the billing module" --project-dir /path/to/project
```

Every dispatch automatically:
1. Calls `POST /api/swarm/policy/check/` — AOS evaluates whether the agent is allowed to run
2. Executes the agent via the LLM engine
3. Calls `POST /api/swarm/usage/report/` — records tokens, cost, duration
4. Calls `POST /api/swarm/traces/` — emits a `TraceStep` record

---

## Using Specific Agents

You can target a specific agent category or agent by crafting your goal:

### Engineering Agents
```bash
python orchestrator.py "Build a REST API with Django for a task management app"
python orchestrator.py "Review the security vulnerabilities in backend/apps/billing/"
python orchestrator.py "Write unit tests for the policy engine module"
python orchestrator.py "Optimize the database queries in agent_intelligence/views.py"
```

### Sales Agents
```bash
python orchestrator.py "Create an account expansion strategy for Acme Corp (250 employees, SaaS)"
python orchestrator.py "Write a discovery call framework for enterprise AI platform sales"
python orchestrator.py "Analyze our pipeline and identify deals at risk of stalling"
```

### Marketing Agents
```bash
python orchestrator.py "Create a LinkedIn content strategy for an enterprise AI startup"
python orchestrator.py "Write a SEO-optimized blog post about AI governance for CISOs"
python orchestrator.py "Build a paid media strategy for a B2B SaaS product launch"
```

### Finance / Operations
```bash
python orchestrator.py "Set up a vendor payment workflow with multi-rail support"
python orchestrator.py "Create a budget tracking template for an AI platform team"
```

### Compliance
```bash
python orchestrator.py "Audit our data handling practices against HIPAA requirements"
python orchestrator.py "Create a security policy checklist for SOC2 readiness"
```

---

## Using the AOS REST API Directly

All API endpoints require a JWT token in the `Authorization` header.

**Get a token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access'])")
```

**Register an agent:**
```bash
curl -s -X POST http://localhost:8000/api/registry/agents/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "finance-analyst",
    "agent_type": "FUNCTIONAL",
    "department": "Finance"
  }'
```

**Execute an agent via AOS:**
```bash
curl -s -X POST http://localhost:8000/api/intelligence/execute/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "<agent-uuid>",
    "task": "Summarize Q3 revenue performance",
    "context": {"quarter": "Q3", "year": 2025}
  }'
```

**Query the knowledge base:**
```bash
curl -s -X POST http://localhost:8000/api/knowledge/collections/<id>/query/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are our data retention policies?", "top_k": 5}'
```

**Check usage and cost:**
```bash
curl -s "http://localhost:8000/api/billing/usage/summary/?agent_id=<id>" \
  -H "Authorization: Bearer $TOKEN"
```

See [API Reference](./api-reference.md) for the full endpoint catalogue.

---

## Managing Policies

### View existing policies
```bash
curl -s http://localhost:8000/api/policies/policies/ \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### Create a DENY policy for a specific agent
```bash
curl -s -X POST http://localhost:8000/api/policies/policies/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Block External API Calls After Hours",
    "resources": ["tool:external-api", "tool:web-fetch"],
    "effect": "DENY",
    "priority": 10,
    "is_active": true,
    "conditions": [
      {"field": "context.hour", "operator": "gt", "value": "18"}
    ]
  }'
```

### Test a policy without executing
```bash
curl -s -X POST http://localhost:8000/api/policies/policies/<policy-id>/evaluate/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resource": "tool:external-api", "action": "call", "context": {"hour": 20}}'
```

See [Policy Engine](./policy-engine.md) for the full policy authoring guide.

---

## Viewing Agent Traces

After running an agent, view its execution trace:

```bash
# List all conversations for an agent
curl -s "http://localhost:8000/api/intelligence/conversations/?agent=<agent-id>" \
  -H "Authorization: Bearer $TOKEN"

# View trace steps for a conversation
curl -s "http://localhost:8000/api/intelligence/conversations/<conv-id>/traces/" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## Managing the Knowledge Base

### Create a collection
```bash
curl -s -X POST http://localhost:8000/api/knowledge/collections/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Company Policies", "description": "Internal HR and legal documents"}'
```

### Upload and index a document
```bash
curl -s -X POST http://localhost:8000/api/knowledge/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/policy.pdf" \
  -F "collection=<collection-id>"

# Trigger processing (chunking + embedding)
curl -s -X POST http://localhost:8000/api/knowledge/documents/<doc-id>/process/ \
  -H "Authorization: Bearer $TOKEN"
```

### Grant a swarm agent access to a collection
```bash
curl -s -X POST http://localhost:8000/api/knowledge/collections/<id>/grant_access/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "<agent-uuid>"}'
```

---

## Viewing Billing and Usage

```bash
# Usage by agent
curl -s "http://localhost:8000/api/billing/usage/?agent=<id>" \
  -H "Authorization: Bearer $TOKEN"

# Cost summary with date filter
curl -s "http://localhost:8000/api/billing/usage/summary/?start_date=2025-01-01&end_date=2025-12-31" \
  -H "Authorization: Bearer $TOKEN"

# All departments
curl -s http://localhost:8000/api/billing/departments/ \
  -H "Authorization: Bearer $TOKEN"

# Budget status
curl -s http://localhost:8000/api/billing/budgets/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Human-in-the-Loop Approvals

When a policy has the `ESCALATE` effect, the swarm agent is paused and a `PendingAction` is created.

**View pending approvals:**
```bash
curl -s http://localhost:8000/api/intelligence/pending-actions/ \
  -H "Authorization: Bearer $TOKEN"
```

**Approve an action:**
```bash
curl -s -X POST http://localhost:8000/api/intelligence/pending-actions/<id>/approve/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision": "APPROVED", "notes": "Reviewed and approved for this execution"}'
```

**Deny an action:**
```bash
curl -s -X POST http://localhost:8000/api/intelligence/pending-actions/<id>/approve/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision": "DENIED", "notes": "Insufficient justification"}'
```

---

## Management Commands Reference

```bash
cd backend && source .venv/bin/activate

# Sync all swarm agents into AOS registry
python manage.py sync_swarm_agents

# Seed default allow policies
python manage.py default_policies

# Run with production settings (skips permissive defaults)
python manage.py default_policies --env production

# Django standard commands
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
python manage.py test
```

---

## Monitoring

```bash
# Live backend log
tail -f .logs/backend.log

# Prometheus metrics
curl http://localhost:8000/metrics | grep agent_

# Admin panel (full data browser)
open http://localhost:8000/admin/
```

Key Prometheus metrics exposed:

| Metric | Type | Description |
|---|---|---|
| `agent_token_usage_total` | Counter | Total tokens used, labelled by agent and provider |
| `agent_execution_duration_seconds` | Histogram | Execution latency per LangGraph node |
| `agent_anomaly_total` | Counter | Flagged anomalies |
| `django_http_requests_total` | Counter | HTTP requests by method, view, status |
