# AOS Documentation

**Autonomous Agent Operating System** — Enterprise Control Plane for AI Agents

> AOS is the governance, orchestration, and billing layer that sits above AI agent frameworks. It does not replace LangGraph, CrewAI, or Agent Swarm — it governs them.

---

## Documentation Index

| Document | Description |
|---|---|
| [Architecture](./architecture.md) | System design, components, and how AOS + Agent Swarm fit together |
| [Setup & Installation](./setup.md) | Prerequisites, environment configuration, first-time startup |
| [Usage Guide](./usage.md) | Running agents, dispatching swarm workflows, real examples |
| [API Reference](./api-reference.md) | Every REST endpoint documented with request/response schemas |
| [Agent Catalogue](./agents.md) | All 245+ swarm agents organized by category |
| [Policy Engine](./policy-engine.md) | Writing policies, conditions, effects, compliance templates |
| [Swarm Bridge](./swarm-bridge.md) | How AOS and Agent Swarm communicate end-to-end |
| [Billing & Metering](./billing.md) | Token tracking, cost attribution, budgets, chargebacks |
| [Observability](./observability.md) | Trace logging, Prometheus metrics, audit logs |
| [Security](./security.md) | Auth, JWT, RBAC, encryption, cautions, threat model |
| [Configuration Reference](./configuration.md) | All environment variables and config files |
| [Contributing & Extending](./contributing.md) | Adding agents, skills, policies, and API modules |

---

## What is AOS?

AOS is a **secure enterprise control plane** for AI agents. It provides:

- **Agent Identity & IAM** — Every agent has a cryptographic identity, roles, and scoped permissions
- **Policy Enforcement** — Declarative rules govern what each agent can do, when, and to what resources
- **Orchestration** — Multi-agent supervisor graphs coordinate complex workflows
- **Observability** — Full execution traces, decision logs, and Prometheus metrics
- **Billing** — Token/compute cost tracking with department-level chargeback

AOS is paired with **Agent Swarm** — a library of 245+ specialized agents (marketing, sales, engineering, finance, compliance) that AOS governs, meters, and audits on every execution.

---

## Quick Start

```bash
# Clone and start everything
git clone <repo>
cd Agentic-Enterprise
./start.sh

# Run a governed swarm agent
cd agent-swarm
source .env
python orchestrator.py "Research top 10 fintech enterprise prospects"
```

Full setup guide: [Setup & Installation](./setup.md)

---

## System at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        start.sh                                 │
│        (bootstraps, migrates, seeds policies, syncs agents)     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────▼────────────────────┐
        │       AOS Django Backend               │
        │  ┌────────────┐  ┌──────────────────┐  │
        │  │Agent IAM   │  │ Policy Engine    │  │
        │  │Registry    │  │ (Governance)     │  │
        │  └────────────┘  └──────────────────┘  │
        │  ┌────────────┐  ┌──────────────────┐  │
        │  │Billing &   │  │ Observability    │  │
        │  │Metering    │  │ Traces + Metrics │  │
        │  └────────────┘  └──────────────────┘  │
        │  ┌────────────┐  ┌──────────────────┐  │
        │  │Knowledge   │  │ Swarm Bridge     │  │
        │  │Base (RAG)  │  │ /api/swarm/      │  │
        │  └────────────┘  └────────┬─────────┘  │
        └───────────────────────────│────────────┘
                                    │ HTTP (JWT)
        ┌───────────────────────────▼────────────┐
        │         Agent Swarm                    │
        │  orchestrator.py + core/aos_client.py  │
        │  245+ specialized agents               │
        │  Self-healing · Engine-agnostic        │
        └────────────────────────────────────────┘
```

---

## Key Numbers

| Metric | Value |
|---|---|
| Swarm agents registered | 245 |
| REST API endpoints | 50+ |
| Agent categories | 20 |
| Policy operators | 10 |
| Supported LLM providers | 6 (Claude, Gemini, OpenAI, Mistral, Llama, Custom) |
| Self-healing strategies | 5 (retry, reassign, simplify, fallback, escalate) |
