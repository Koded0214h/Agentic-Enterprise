PRODUCT REQUIREMENTS DOCUMENT (PRD)
Product Name: Autonomous Agent Operating System (AOS)
Subtitle: Enterprise Control Plane + Autonomous Startup Engine for AI Agents

Last Updated: 2026-05-10
Status: Active Development — Backend ~55–60% complete, Swarm merged

---

## 1. Executive Summary

AI agents are moving into production across enterprises — automating workflows, interacting with sensitive systems, and making semi-autonomous decisions. Enterprises currently lack:

- Centralized governance
- Agent identity management
- Policy enforcement
- Cross-agent orchestration visibility
- Audit and compliance tooling
- Usage metering

**AOS solves this.** It is a secure, enterprise-grade control plane to deploy, manage, observe, govern, and monetize multi-agent systems at scale.

**Positioning:** Kubernetes + IAM + Observability + Billing — purpose-built for AI agents.

### The Bigger Vision (Updated)

AOS is not just governance infrastructure. The platform's ultimate goal is to allow any person or company to describe a startup or business goal and have AOS autonomously build and operate it — end to end — using AI agents. Revenue generation, product development, marketing, sales, customer support, finance: all orchestrated by AOS agents under enterprise-grade policy guardrails.

**Think of it as:** Give AOS a description of your startup. It builds the product, acquires customers, handles support, manages finances, and grows the business — all autonomously, with humans setting the guardrails and approving high-risk actions.

---

## 2. Problem Statement

Enterprises deploying AI agents face five critical risks:

1. **No Governance Layer** — Agents operate with unclear permissions and unbounded tool access.
2. **No Agent Identity** — Agents cannot be uniquely authenticated or audited across systems.
3. **No Observability** — Limited visibility into agent-to-agent interactions or failure chains.
4. **Regulatory Exposure** — Financial, healthcare, and government organizations require traceable decision logs.
5. **No Monetization Infrastructure** — Internal AI usage lacks chargeback or cost attribution systems.

Existing tools (LangGraph, CrewAI, AutoGen) are development frameworks, not enterprise operating systems. Agent Swarm collections (like the 245-agent swarm merged here) provide execution muscle but lack governance, identity, and auditability.

**AOS bridges this gap.** It sits above execution frameworks as the governance and orchestration layer.

---

## 3. Product Vision

AOS becomes the default operating layer for enterprise AI agents, and the first platform enabling autonomous startup operations:

- Deploy agents safely under cryptographic identity
- Enforce policies dynamically before every execution
- Audit all autonomous behavior with immutable logs
- Monitor performance in real time with trace-level visibility
- Attribute and monetize AI usage per department or project
- **Orchestrate entire business functions autonomously** — marketing, sales, product, finance, support

AOS does not replace agent frameworks. It governs them.

---

## 4. Target Customers

### Enterprise (Primary Market — Governance SaaS)
- Financial institutions
- Healthcare networks
- Government agencies
- Large enterprises with internal AI platforms

**Buyer Persona:** CTO, Head of AI/ML Platform, CISO, VP Infrastructure, Platform Engineering Lead

**Early Adopter Profile:**
- Already deploying 5+ AI agents in production
- Concerned about compliance and risk
- Has dedicated AI or platform team

### Founders & Operators (Emerging Market — Autonomous Startup Engine)
- Solo founders and small teams who want to build a SaaS or business autonomously
- Agencies wanting to offer AI-operated client services
- Operators who want to monetize agent-run workflows without hiring large teams

---

## 5. Core Product Pillars

### Pillar 1: Agent Identity & Access Management (Agent IAM)
**Implemented:**
- Unique cryptographic identity per agent (`identity_key` UUID token)
- JWT-based sessions with revocation (`AgentSession` model)
- Role-based access control (`Role` model with JSON permission lists)
- Agent types: EXECUTIVE, FUNCTIONAL, SUB_AGENT, OBSERVER
- Agent source tracking: AOS-native vs. Swarm-imported
- Department cost center assignment per agent
- Full request audit log (`AgentRequestLog`)

**Still Needed:**
- Fine-grained object-level permissions
- Environment isolation (dev/staging/prod) per agent
- Agent-to-agent trust policies
- SSO / SAML / OAuth integration

---

### Pillar 2: Policy & Governance Engine
**Implemented:**
- Declarative policy model (`Policy`, `PolicyCondition`, `PolicyAssignment`)
- Effects: ALLOW, DENY, AUDIT, ESCALATE
- Condition operators: eq, neq, gt, lt, contains, not_contains, in, not_in, between, regex
- Priority-based evaluation (explicit DENY always wins)
- Time-bounded policies (`valid_from`, `valid_until`)
- Call-count limits per policy
- Risk level scoring (0–100) per policy
- Immutable policy audit log (`PolicyAuditLog`) — every decision recorded
- Default policy management command (`default_policies`)
- Human-in-the-Loop approval queue (`PendingAction` with LangGraph state snapshot)

**Still Needed:**
- Full state resumption after human approval (state snapshot replay incomplete)
- Compliance templates (HIPAA, SOX, PCI-DSS)
- Sensitive data tagging / DLP controls
- Time-of-day conditional restrictions (e.g. no external API calls after 6 PM)

---

### Pillar 3: Agent Orchestration Layer
**Implemented:**
- LangGraph-powered execution engine (ReAct, PLAN_EXECUTE, MULTI_AGENT, CUSTOM graph types)
- Supervisor routes to worker sub-agents (`AgentCapability.sub_agents`)
- Multi-LLM support: Gemini, Claude, OpenAI, Mistral, Llama, Custom
- API key encryption (Fernet) for LLM configs
- Long-running task tracking with DAG dependency model (`WorkflowTask.depends_on`)
- Agent version field (`Agent.version`)
- Agent swarm 5-phase workflow: QUESTIONNAIRE → PLANNER → EXECUTE → DEBUG → SHIP
- Self-healing strategies in swarm: RETRY, REASSIGN, SIMPLIFY, FALLBACK, ESCALATE
- Engine-agnostic execution: Claude CLI, Gemini CLI, or custom

**Still Needed:**
- DAG scheduler enforcing task execution order by dependency
- Automatic retry/fallback at the backend level
- Dynamic agent spawning
- Agent lifecycle management (deploy, scale, rollback) beyond status field
- Workflow topology visualization UI

---

### Pillar 4: Observability & Audit
**Implemented:**
- Full execution trace logging (`TraceStep` — node name, input, output, duration, risk score, loop detection)
- Conversation + message history with full token accounting
- Tool call capture (tool_calls, tool_call_id, tool_name per message)
- Prometheus metrics endpoint (`/metrics`) via django-prometheus
- OpenTelemetry + OTLP export support (packages installed)
- Policy audit log (every policy decision, immutable)
- RAG query log (query, retrieved chunks, relevance scores, latency)
- Agent request log (every HTTP call with response status and duration)
- Swarm execution context (`SwarmExecutionContext`) — cross-system traceability

**Still Needed:**
- Real-time monitoring dashboard UI
- Grafana dashboards / alerting
- Streaming responses
- Distributed trace visualization
- Hallucination risk scoring (phase 2)

---

### Pillar 5: Usage Metering & Billing
**Implemented:**
- Per-execution token tracking (input + output) on every `Conversation`
- Cost calculation from LLMConfig rates (`cost_per_1k_tokens_input/output`)
- `UsageRecord` — granular agent usage with cost in USD
- `DepartmentCostCenter` — organizational chargeback grouping
- `AgentBudget` — monthly limits with alert threshold percentage (default 80%)
- Swarm usage reporting via bridge API (`POST /api/swarm/usage/report/`)

**Still Needed:**
- Budget enforcement (hard blocks when limit exceeded — currently tracking only)
- Automated budget reset (monthly)
- Payment integration (Stripe or enterprise ERP)
- Invoice generation
- Usage dashboards and cost attribution reports

---

### Pillar 6 (New): Autonomous Business Operations
**Vision (not yet built):**
This is the differentiating layer that separates AOS from pure governance infrastructure.

Using the 245-agent swarm as the execution engine, governed by AOS policies, the platform should be able to run entire business functions autonomously:

- **Product & Engineering** — sprint planning, code generation, QA, deployment
- **Marketing** — content creation, SEO, campaign management, social scheduling
- **Sales** — lead generation, outreach, discovery, proposal, pipeline management
- **Customer Support** — ticket routing, escalation, resolution
- **Finance** — invoicing, expense tracking, financial reporting
- **HR / Operations** — hiring workflows, onboarding, performance tracking
- **Strategy** — market research, competitive analysis, investor reporting

Each function would be a registered agent team in AOS, governed by department-level policies, with full usage metering and cost attribution.

---

## 6. Technical Architecture (Current State)

### System Overview

```
AOS = Django Backend (Control Plane) + Agent Swarm (Execution Engine)
```

Neither is complete without the other:
- Django backend = trust infrastructure (identity, governance, billing, observability)
- Agent Swarm = autonomous execution (245 agents, 148 skills, 69 commands, self-healing)

### Backend Apps (Django 5.2 / Python 3.12)

| App | Purpose | Status |
|---|---|---|
| `agent_registry` | Agent identity, RBAC, roles, department assignment | ✅ Ready |
| `agent_gateway` | JWT auth, request logging, gRPC stub | ✅ Ready (gRPC not wired) |
| `policy_engine` | Declarative policy evaluation, audit log, HITL queue | ✅ Ready |
| `agent_intelligence` | LangGraph execution, LLM configs, traces, HITL | ✅ Ready |
| `knowledge_base` | RAG, ChromaDB vector store, document chunking | ✅ Ready |
| `billing` | Usage metering, cost attribution, department chargeback | ✅ Ready |
| `swarm_bridge` | AOS ↔ Agent Swarm HTTP integration contract | ✅ Ready |

### Agent Swarm (Execution Engine)

| Component | Description |
|---|---|
| `orchestrator.py` | 5-phase workflow dispatcher |
| `core/aos_client.py` | HTTP client → AOS bridge (policy check, usage report, trace emit) |
| `core/self_healer.py` | 5-strategy auto-recovery (RETRY, REASSIGN, SIMPLIFY, FALLBACK, ESCALATE) |
| `core/workspace.py` | Isolated per-project workspaces |
| `core/command_executor.py` | Safety-classified shell execution |
| `engines/` | LLM adapter layer (Claude, Gemini, generic) |
| `agents/` | 245 specialized agent definitions (.md) across 20 categories |
| `skills/` | 148 reusable knowledge modules |
| `commands/` | 69 executable workflow templates |
| `swarm.config.json` | Agent registry config (v2.2) |

### Agent Categories (Swarm)
academic, core, creative, design, ecc, engineering, game-development, gsd, integrations, management, marketing, paid-media, product, project-management, sales, spatial-computing, specialized, strategy, support, testing

### Tech Stack
- **Backend:** Django 5.2, Django REST Framework, LangGraph 1.0, LangChain 1.2
- **LLMs:** Gemini (Google), Claude (Anthropic), OpenAI GPT, Mistral, Llama
- **Vector DB:** ChromaDB 1.5 (local), Gemini Embedding 001
- **Auth:** JWT (djangorestframework-simplejwt), agent identity keys
- **Async:** Celery + Redis (optional), uvicorn ASGI
- **Observability:** Prometheus, OpenTelemetry + OTLP export
- **Encryption:** Fernet (cryptography) for LLM API keys
- **gRPC:** grpcio + proto stubs (agent_service.proto — not yet wired)
- **Deployment:** Dockerfile + docker-compose, SQLite (dev) / PostgreSQL (prod)

### Swarm Bridge Data Flow (Every Execution)
```
orchestrator.py dispatch_agent("sales-account-strategist", task)
    │
    ├─► aos_client.policy_check(execution_id, agent_name, task)
    │       └─► POST /api/swarm/policy/check/
    │               └─► PolicyEvaluator → allow | deny | escalate
    │
    ├─► [if allow] engine.run(agent_definition, task)
    │       └─► claude --task "..." --system agent.md
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

## 7. Functional Requirements — MVP vs. Current State

### Phase 1 Must-Haves (MVP)

| Requirement | Status |
|---|---|
| Agent identity registry | ✅ Done |
| RBAC system for agents | ✅ Partial (no object-level, no env isolation) |
| Execution logging & trace visualization | ✅ Logging done; UI not built |
| Policy enforcement (basic rule engine) | ✅ Done |
| Multi-agent orchestration | ✅ Partial (supervisor routing, no DAG scheduler) |
| Runtime usage tracking | ✅ Done |
| Knowledge base / RAG | ✅ Done |
| Swarm bridge integration | ✅ Done |
| Human-in-the-Loop approval flow | ✅ Partial (queue exists, state replay incomplete) |

### Phase 2 Nice-to-Haves

| Requirement | Status |
|---|---|
| Compliance templates (HIPAA, SOX, PCI) | ❌ Not started |
| On-prem deployment | 🟡 Docker Compose ready; Helm charts missing |
| SOC2 readiness toolkit | ❌ Not started |
| Anomaly detection | ❌ Not started |
| Plugin ecosystem | ❌ Not started |
| SSO (SAML/OAuth) | ❌ Not started |
| Budget enforcement (hard blocks) | ❌ Tracking only |
| Streaming responses | ❌ Not started |
| Grafana dashboards | ❌ Not started |
| Autonomous business operations | ❌ Not started |

---

## 8. Security & Compliance Requirements

**Implemented:**
- End-to-end JWT authentication with session revocation
- LLM API key encryption (Fernet)
- Immutable policy audit log (every decision stored)
- Role separation: admin, platform, agent owner
- IP address and user-agent tracking on every request

**Not Yet Implemented:**
- Enterprise SSO (SAML/OAuth)
- Sensitive data / DLP controls
- SOC2 audit readiness
- Compliance policy templates

**Principle:** Security is not a feature. It is the product.

---

## 9. Non-Goals (MVP)

- No model training
- No LLM hosting
- No application-layer agent builder (build on top of AOS, not inside it)
- No vertical-specific workflow design
- No UI/frontend (API-first for now)

AOS is infrastructure, not an app builder.

---

## 10. Competitive Positioning

| Category | Competitor | Weakness | AOS Advantage |
|---|---|---|---|
| Agent Framework | LangGraph | Dev tool only | Governance + identity + billing |
| Observability | Datadog | Not agent-aware | Agent-native traces + policy audit |
| Workflow | ServiceNow | No autonomous systems | Full autonomous multi-agent orchestration |
| Infra | Kubernetes | Container-focused | Agent-aware lifecycle and RBAC |
| Agent Swarms | AutoGen, CrewAI | No governance layer | Policy-first execution with full auditability |

AOS is the only platform combining:
- Agent-native cryptographic identity
- Policy-first governance with HITL escalation
- Multi-LLM orchestration (Claude, Gemini, OpenAI, Mistral, Llama)
- 245-agent execution swarm
- Enterprise observability with trace-level auditability
- Token-level cost attribution and department chargeback

---

## 11. Pricing Model

**Tier 1 — Usage-Based**
- Per agent runtime hour
- Per workflow execution
- Per 1K tokens consumed (inherits from LLM pricing with markup)

**Tier 2 — Enterprise License**
- Advanced policy packs
- Compliance modules (HIPAA, SOX, PCI)
- On-prem deployment
- Dedicated SLA

**Tier 3 — Autonomous Business Engine (Future)**
- Per active business function running autonomously
- Revenue share on agent-generated outcomes
- White-label for agencies

**Long-term:** Marketplace revenue share for agent plugins and swarm templates.

---

## 12. Success Metrics (First 12 Months)

- 5 enterprise pilot deployments
- 100+ agents managed per pilot
- <50ms policy evaluation latency
- 99.9% uptime
- Zero critical security incidents
- Expansion into 2+ departments per customer
- 1 autonomous business function running end-to-end on AOS with measurable revenue output

---

## 13. Risks

- Sales cycle length (enterprise procurement is slow)
- Enterprise trust barrier (new category, requires proof)
- Rapid commoditization (big cloud providers entering market)
- Swarm agent quality variance (245 agents, varying reliability)
- State management complexity (LangGraph state snapshot replay for HITL is hard)

**Mitigation:**
- Focus on compliance-heavy industries first
- Deep enterprise integrations
- Framework-agnostic swarm bridge
- Autonomous startup engine as a viral distribution wedge for enterprise upsell

---

## 14. Execution Roadmap (Updated)

### Months 1–2 (Foundation) — ~55% Complete
- ✅ Core agent identity system
- ✅ Policy engine (rule enforcement + audit log)
- ✅ Agent registry API
- ✅ LangGraph execution engine
- ✅ Knowledge base / RAG
- ✅ Agent Swarm merged (245 agents, 5-phase workflow, self-healing)
- ✅ Swarm bridge (policy check + usage report + trace emit)
- 🔲 Minimal UI dashboard

### Months 3–4 (Observability & Orchestration)
- 🔲 Complete HITL state resumption after approval
- 🔲 DAG-based workflow scheduler
- 🔲 Workflow topology visualization
- 🔲 Real-time monitoring dashboard
- 🔲 Budget enforcement (hard blocks)
- 🔲 Streaming responses

### Months 5–6 (Enterprise Readiness)
- 🔲 RBAC hardening (object-level, environment isolation)
- 🔲 SSO / SAML / OAuth integration
- 🔲 Compliance templates (HIPAA, SOX, PCI)
- 🔲 Security audit
- 🔲 Helm charts for Kubernetes deployment
- 🔲 First enterprise pilot

### Months 7–9 (Autonomous Business Engine — Phase 1)
- 🔲 Define canonical agent teams per business function (sales, marketing, support, finance)
- 🔲 Connect swarm agents to AOS policies per business function
- 🔲 Revenue-generating workflow templates (e.g. outbound sales agent loop)
- 🔲 Autonomous startup bootstrap flow (describe startup → AOS spawns full agent team)

### Months 10–12 (Scale & Monetize)
- 🔲 Marketplace for agent teams and swarm templates
- 🔲 Payment integration (Stripe / ERP)
- 🔲 Anomaly detection and hallucination risk scoring
- 🔲 Plugin ecosystem
- 🔲 Paid design partner secured

---

## 15. Strategic Positioning

This is not a startup for small teams, solo founders, or lightweight SaaS.

**This is:**
- Deep infrastructure
- Enterprise trust play
- Long sales cycle
- Massive upside

**AND simultaneously:**
- A viral distribution wedge through the autonomous startup engine
- A platform that can generate revenue for its users (founders) and therefore for itself
- The first AI platform where the product itself builds companies

If successful, AOS becomes:
- Standard governance layer for enterprise AI agents
- The operating system for autonomous businesses
- Acquisition target for cloud providers (AWS, GCP, Azure)
- Or an independent infrastructure giant

---

## 16. Current Build State Summary

| Module | Implementation |
|---|---|
| Django Backend | Python 3.12, Django 5.2, DRF, JWT auth, SQLite (dev) / PostgreSQL (prod) |
| Agent Registry | UUID identity keys, RBAC roles, department assignment, swarm source tracking |
| Agent Gateway | JWT sessions with revocation, full request audit log, gRPC stub (not wired) |
| Policy Engine | Declarative rules, 10 condition operators, 4 effects, time bounds, HITL queue |
| Agent Intelligence | LangGraph, 4 graph types, 6 LLM providers, encrypted API keys, traces, HITL |
| Knowledge Base | ChromaDB, Gemini embeddings, document chunking, RAG query log |
| Billing | Token usage records, LLM cost rates, department chargeback, budget alerts |
| Swarm Bridge | HTTP integration contract — policy check, usage report, trace emit, KB query |
| Agent Swarm | 245 agents, 148 skills, 69 commands, 5-phase workflow, self-healing, multi-LLM |
| Deployment | Dockerfile, docker-compose, start.sh unified launcher, Prometheus metrics |
