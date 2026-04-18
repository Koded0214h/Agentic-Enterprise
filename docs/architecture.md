# Architecture

## Overview

AOS is composed of two tightly integrated systems:

1. **AOS Django Backend** — the control plane (governance, IAM, billing, observability)
2. **Agent Swarm** — the execution engine (245+ specialized agents, multi-LLM, self-healing)

Neither system is complete without the other. The Django backend provides the trust infrastructure; Agent Swarm provides the autonomous execution capability.

---

## Repository Structure

```
Agentic-Enterprise/
├── start.sh                    # Unified startup script
├── PRD.md                      # Product requirements document
├── docs/                       # This documentation
│
├── backend/                    # Django control plane
│   ├── apps/
│   │   ├── agent_registry/     # Agent identity & metadata
│   │   ├── agent_gateway/      # Authentication entry point
│   │   ├── policy_engine/      # Governance & rule evaluation
│   │   ├── agent_intelligence/ # LangGraph execution, traces
│   │   ├── knowledge_base/     # RAG, vector store, documents
│   │   ├── billing/            # Usage metering, cost attribution
│   │   └── swarm_bridge/       # AOS ↔ Swarm integration layer
│   ├── backend/                # Django settings, urls, wsgi
│   ├── .venv/                  # Python virtual environment
│   └── requirements.txt
│
└── agent-swarm/                # Execution engine
    ├── orchestrator.py         # 5-phase workflow dispatcher
    ├── core/
    │   ├── aos_client.py       # HTTP client → AOS bridge
    │   ├── self_healer.py      # Auto-recovery strategies
    │   ├── workspace.py        # Isolated project workspaces
    │   ├── command_executor.py # Safety-classified shell execution
    │   └── dashboard.py        # Execution monitoring
    ├── agents/                 # 245+ .md agent definitions
    ├── skills/                 # 239 reusable knowledge modules
    ├── commands/               # 125 executable workflow templates
    ├── engines/                # LLM adapter layer
    ├── swarm.config.json       # Agent registry config
    └── .env                    # AOS connection (auto-written by start.sh)
```

---

## Backend Django Apps

### `agent_registry`
The source of truth for agent identity.

| Model | Purpose |
|---|---|
| `Agent` | Core record: `identity_key`, owner, department, type, status, roles |
| `Role` | RBAC role with a JSON permissions list |
| `AgentSource` | Enum: `AOS` (native) or `SWARM` (imported from swarm) |
| `AgentType` | EXECUTIVE, FUNCTIONAL, SUB_AGENT, OBSERVER |

Every swarm agent is synced here as a `SWARM`-sourced `Agent` record via `sync_swarm_agents`.

---

### `agent_gateway`
Authentication layer — every agent request enters here.

| Model | Purpose |
|---|---|
| `AgentSession` | JWT session with revocation support |
| `AgentRequestLog` | Audit trail of all HTTP requests |

- Custom `AgentAuthentication` supports both JWT tokens and direct identity keys
- Sessions track IP address, user agent, expiry

---

### `policy_engine`
Declarative governance — the most critical module for enterprise trust.

| Model | Purpose |
|---|---|
| `Policy` | Rule definition: resources, effect, priority, conditions |
| `PolicyCondition` | Field-operator-value condition on the request context |
| `PolicyAssignment` | Assigns a policy to specific agents or roles |
| `PolicyAuditLog` | Immutable log of every policy decision |

**Effects:** `ALLOW` | `DENY` | `AUDIT` | `ESCALATE`

**Condition operators:** `eq`, `neq`, `gt`, `lt`, `contains`, `not_contains`, `in`, `not_in`, `between`, `regex`

The `PolicyEvaluator` class evaluates all applicable policies in priority order. An explicit `DENY` always wins.

See [Policy Engine](./policy-engine.md) for full details.

---

### `agent_intelligence`
LLM execution, LangGraph orchestration, and trace logging.

| Model | Purpose |
|---|---|
| `LLMConfig` | API key (encrypted), provider, model, cost rates, rate limits |
| `AgentCapability` | Graph type, tools enabled, sub-agents, RAG config |
| `Conversation` | Session with full message history and token accounting |
| `Message` | Individual turn (SYSTEM / USER / AGENT / TOOL) |
| `ToolDefinition` | Registered tool with JSON Schema params and rate limits |
| `WorkflowTask` | Long-running task with DAG dependency support |
| `TraceStep` | Individual LangGraph node execution (input, output, duration) |
| `PendingAction` | Human-in-the-loop approval queue with state snapshot |

**Graph types supported:**
- `REACT` — single agent with tool loop
- `MULTI_AGENT` — supervisor routes to worker sub-agents
- `PLAN_EXECUTE` — planner produces tasks, executor runs them
- `CUSTOM` — user-defined topology

---

### `knowledge_base`
RAG (Retrieval-Augmented Generation) and document management.

| Model | Purpose |
|---|---|
| `KnowledgeCollection` | Logical grouping of documents with per-agent access control |
| `Document` | Uploaded file (PDF, DOCX, TXT, MD) with processing status |
| `DocumentChunk` | Text segment with embedding ID reference |
| `QueryLog` | Audit trail: query, retrieved chunks, relevance scores, response |

Vector store: **ChromaDB** (local persistent). Embeddings: **Gemini Embedding 001**.

---

### `billing`
Usage metering and cost attribution.

| Model | Purpose |
|---|---|
| `DepartmentCostCenter` | Organizational unit for chargeback grouping |
| `UsageRecord` | Granular: agent, tokens in/out, compute ms, cost USD |
| `AgentBudget` | Monthly limit, current spend, alert threshold per agent or dept |

Cost is calculated from `LLMConfig.cost_per_1k_tokens_input/output` and recorded on every execution.

---

### `swarm_bridge`
The integration contract between Agent Swarm and AOS.

| Model | Purpose |
|---|---|
| `SwarmExecutionContext` | Anchors one swarm agent run — links to policy decision, usage, traces |
| `SwarmAgentManifest` | Stores the parsed `.md` definition from swarm.config.json |

**Bridge endpoints** (`/api/swarm/`):

| Endpoint | Called by | Purpose |
|---|---|---|
| `POST /agents/register/` | `sync_swarm_agents` command | Upsert swarm agent into AOS registry |
| `POST /policy/check/` | `core/aos_client.py` before dispatch | Pre-execution governance gate |
| `POST /usage/report/` | `core/aos_client.py` after dispatch | Post-execution metering |
| `POST /traces/` | `core/aos_client.py` on phase events | Emit `TraceStep` records |
| `GET /kb/query/` | Swarm agents needing context | RAG context enrichment |
| `GET /executions/<id>/` | Swarm polling for escalation status | Read execution context |

---

## Agent Swarm Internals

### 5-Phase Workflow
Every `orchestrator.py` run goes through:

```
1. QUESTIONNAIRE  — requirements clarification agent
2. PLANNER        — architecture and task decomposition
3. EXECUTE        — parallel dispatch of specialist agents
4. DEBUG          — self_healer.py recovers from failures
5. SHIP           — verification and delivery
```

### Self-Healing Strategies
When an agent fails, `core/self_healer.py` tries in order:

| Strategy | What it does |
|---|---|
| `RETRY` | Same agent, same task (up to 3 attempts) |
| `REASSIGN` | Different agent for the same task |
| `SIMPLIFY` | Break the failed task into smaller subtasks |
| `FALLBACK` | Switch to a different LLM engine |
| `ESCALATE` | Flag for human review |

### Engine Agnosticism
The swarm runs on any CLI agent via `engines/adapter.py`:

| Engine | Command |
|---|---|
| `claude` | `claude` (Anthropic Claude Code) |
| `gemini` | `gemini` (Google Gemini CLI) |
| `generic` | Configurable template |

If the primary engine is unavailable, the swarm auto-detects a fallback.

---

## Data Flow: A Single Swarm Execution

```
orchestrator.py dispatch_agent("sales-account-strategist", task)
    │
    ├─► aos_client.policy_check(execution_id, agent_name, task)
    │       └─► POST /api/swarm/policy/check/
    │               └─► PolicyEvaluator.evaluate("swarm:execute", ...)
    │                       └─► Returns: allow | deny | escalate
    │
    ├─► [if allow] engine.run(agent_definition, task)
    │       └─► claude --task "..." --system agent.md
    │               └─► LLM executes with tools
    │
    ├─► aos_client.usage_report(execution_id, tokens, cost, duration)
    │       └─► POST /api/swarm/usage/report/
    │               └─► UsageRecord created, AgentBudget updated
    │
    └─► aos_client.emit_trace(execution_id, phase, event_type, payload)
            └─► POST /api/swarm/traces/
                    └─► TraceStep created in DB
```

---

## Persistence

| Data | Storage |
|---|---|
| All structured data | SQLite (dev) / PostgreSQL (prod) |
| Vector embeddings | ChromaDB (local persistent at `backend/chroma_db/`) |
| Agent session state | LangGraph `MemorySaver` (in-memory, keyed by conversation ID) |
| Swarm workspace outputs | `agent-swarm/memory/` directory |
| Prometheus metrics | In-process (scrape at `/metrics`) |
| Background tasks | Celery + Redis (optional) |

---

## Deployment Targets

AOS is a 12-factor app. Deployment options:

| Target | Status |
|---|---|
| Local development | `./start.sh` |
| Docker Compose | `backend/docker-compose.yml` |
| Kubernetes | K8s-compatible, no Helm charts yet |
| Cloud (AWS/GCP/Azure) | Supported via container deployment |
