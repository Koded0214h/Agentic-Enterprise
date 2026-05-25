# Autonomous Agent Operating System (AOS)

> Enterprise Control Plane for AI Agents — Governance · Orchestration · Observability · Billing

AOS is the infrastructure layer that sits above AI agent frameworks. It does not replace LangGraph, CrewAI, or Agent Swarm — it governs them. Every agent dispatch is policy-checked, metered, traced, and auditable.

---

## Documentation

**[Full documentation →](./docs/index.md)**

| Guide | Description |
|---|---|
| [Architecture](./docs/architecture.md) | How the control plane and execution engine fit together |
| [Setup & Installation](./docs/setup.md) | Prerequisites, environment config, first-time startup |
| [Usage Guide](./docs/usage.md) | Running agents, using the API, real examples |
| [API Reference](./docs/api-reference.md) | All 50+ REST endpoints with request/response schemas |
| [Agent Catalogue](./docs/agents.md) | All 245 swarm agents organized by category |
| [Policy Engine](./docs/policy-engine.md) | Writing governance rules, conditions, compliance templates |
| [Swarm Bridge](./docs/swarm-bridge.md) | How AOS and Agent Swarm communicate |
| [Billing & Metering](./docs/billing.md) | Cost tracking, budgets, department chargeback |
| [Observability](./docs/observability.md) | Traces, audit logs, Prometheus metrics |
| [Security](./docs/security.md) | Auth, RBAC, encryption, production cautions |
| [Configuration](./docs/configuration.md) | All environment variables and settings |
| [Contributing](./docs/contributing.md) | Adding agents, skills, API modules |
| [My Docs](./docs/my-docs/index.md) | Project-based startup model, autonomy gaps, implementation plan |
| [Koded Master Plan](./koded-master-plan.md) | Root plan for the Koded startup operating model |

---

## What Is AOS?

```
┌─────────────────────────────────────────────────────────────────┐
│                  AOS Django Backend (Port 8000)                 │
│                                                                 │
│  Agent IAM & Registry    Policy & Governance Engine             │
│  Usage Metering          Observability & Audit Logs             │
│  Knowledge Base (RAG)    Swarm Bridge (/api/swarm/)             │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / JWT
┌───────────────────────────────▼─────────────────────────────────┐
│              Agent Swarm (245+ Specialized Agents)              │
│                                                                 │
│  Engineering · Marketing · Sales · Finance · Compliance         │
│  Product · Strategy · Design · QA · Support · Game Dev          │
│                                                                 │
│  Self-Healing · Engine-Agnostic (Claude / Gemini / Custom)      │
│  5-Phase Workflow · Cross-Session Memory                        │
└─────────────────────────────────────────────────────────────────┘
```

**AOS provides:**
- **Agent Identity & IAM** — unique cryptographic identity, JWT sessions, RBAC roles
- **Policy Enforcement** — declarative rules with 10 operators, 4 effects (ALLOW/DENY/AUDIT/ESCALATE)
- **Orchestration** — multi-agent supervisor graphs via LangGraph
- **Observability** — full execution traces, immutable audit logs, Prometheus metrics
- **Billing** — token + compute cost tracking with department-level chargeback

**Agent Swarm provides:**
- 245 specialized agents across 20 business domains
- 5-phase autonomous workflow (questionnaire → plan → execute → debug → ship)
- Self-healing with 5 recovery strategies (retry, reassign, simplify, fallback, escalate)
- LLM engine agnosticism (Claude, Gemini, or custom CLI)
- Cross-session memory with compressed learnings

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git, curl

### One-command start

```bash
git clone <repo-url> Agentic-Enterprise
cd Agentic-Enterprise

# Add your API keys to backend/.env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> backend/.env
echo "GEMINI_API_KEY=AIza..."     >> backend/.env

# Start everything
./start.sh
```

`start.sh` handles migrations, policy seeding, agent sync, JWT provisioning, and a smoke test automatically. See [Setup Guide](./docs/setup.md) for full details.

### Run a governed agent

```bash
cd agent-swarm
source .env
python orchestrator.py "Research top 10 enterprise fintech prospects"
```

Every dispatch is automatically policy-checked, token-metered, and trace-logged by AOS.

---

## Services

| Service | URL | Credentials |
|---|---|---|
| REST API | http://localhost:8000 | JWT via `/api/token/` |
| Swagger UI | http://localhost:8000/api/docs/swagger/ | — |
| Admin Panel | http://localhost:8000/admin/ | admin / admin1234 |
| Prometheus | http://localhost:8000/metrics | — |

---

## System at a Glance

| Metric | Value |
|---|---|
| Swarm agents | 245 |
| Agent categories | 20 |
| REST API endpoints | 50+ |
| Policy condition operators | 10 |
| LLM providers supported | 6 |
| Self-healing strategies | 5 |

---

## Manage the System

```bash
./start.sh              # Start everything
./start.sh --stop       # Kill all managed processes
./start.sh --status     # Show running PIDs

# Backend management (from backend/ with .venv active)
python manage.py sync_swarm_agents     # Sync 245 agents into AOS registry
python manage.py default_policies      # Seed default governance policies
python manage.py migrate               # Apply database migrations
python manage.py createsuperuser       # Create admin user
```

---

## Architecture Summary

The system consists of two components that operate together:

**`backend/`** — Django REST API serving as the control plane:
- `apps/agent_registry/` — Agent identity and metadata
- `apps/agent_gateway/` — Authentication and request auditing
- `apps/policy_engine/` — Declarative governance and rule evaluation
- `apps/agent_intelligence/` — LangGraph execution and trace logging
- `apps/knowledge_base/` — ChromaDB RAG and document management
- `apps/billing/` — Usage metering and cost attribution
- `apps/swarm_bridge/` — Integration bridge to Agent Swarm

**`agent-swarm/`** — Multi-agent execution engine:
- `orchestrator.py` — 5-phase workflow dispatcher
- `core/aos_client.py` — HTTP client connecting swarm to AOS bridge
- `core/self_healer.py` — Automatic failure recovery
- `agents/` — 245 specialized agent definitions
- `skills/` — 239 reusable knowledge modules
- `commands/` — 125 workflow templates

Full architecture: [docs/architecture.md](./docs/architecture.md)

---

## Security Notice

Before deploying outside localhost:

- Change `SECRET_KEY` in `backend/backend/settings.py`
- Set `DEBUG=False`
- Change the admin password (`admin1234`)
- Use PostgreSQL instead of SQLite
- Enable HTTPS via a reverse proxy

Full security guide: [docs/security.md](./docs/security.md)

---

## License

See [LICENSE](./LICENSE)
