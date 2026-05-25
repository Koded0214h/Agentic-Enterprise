# AOS Swarm — V1 Beta Master Checklist

## Notion-Style Product & Feature Checklist

### Goal: Ship a usable beta for real-world founder testing

---

# 0. CORE BETA GOAL

## The V1 promise

> A founder can describe a startup or operational task, and AOS Swarm coordinates product, engineering, marketing, and sales operations through autonomous agents with governance, observability, and HITL controls.

---

# 1. FOUNDATIONAL INFRASTRUCTURE

## Core Platform

* [x] Production backend deployment
* [x] Production frontend deployment
* [x] Environment variable management
* [x] Production database setup
* [x] Redis deployment
* [x] HTTPS + SSL
* [ ] Domain setup (aos-swarm.com) — `agentic-enterprise-smoky.vercel.app` is live, custom domain pending
* [x] Error logging
* [x] Health checks
* [x] Background worker monitoring
* [x] CI/CD pipeline
* [ ] Staging environment
* [x] Production environment
* [ ] API versioning
* [ ] Backup strategy
* [ ] Disaster recovery basics

---

# 2. AUTHENTICATION & USER MANAGEMENT

## Authentication

* [x] User signup
* [x] User login
* [x] JWT authentication
* [x] Password reset
* [x] Session management
* [x] Session revocation
* [x] Email verification
* [x] Secure logout
* [x] Refresh token flow
* [x] Sign in with Google
* [x] Sign in with GitHub

## User Accounts

* [x] User profile page
* [x] Workspace creation
* [x] Team invitations
* [x] Workspace switching
* [x] Basic RBAC
* [x] User onboarding flow
* [x] User settings page
* [x] LLM provider configuration
* [x] API key management
* [x] Secure encrypted key storage

---

# 3. LANDING PAGE & MARKETING SITE

## Website

* [x] Landing page
* [x] Hero section
* [x] Product demo section
* [x] Features section
* [x] Pricing section
* [x] FAQ section
* [x] Waitlist form
* [x] Contact form
* [x] Docs link
* [x] Terms of service
* [x] Privacy policy
* [x] Beta signup CTA
* [x] Founder story section
* [ ] Blog system
* [ ] SEO setup
* [x] Analytics integration

---

# 4. USER ONBOARDING EXPERIENCE

## Initial Setup Flow

* [x] Welcome flow
* [x] Workspace setup wizard
* [x] Startup type selection
* [x] Team type selection
* [x] Primary goals selection
* [x] Agent preferences
* [x] Provider setup wizard
* [x] Budget configuration
* [x] Token usage explanation
* [x] HITL preference setup
* [x] First workflow walkthrough

## Demo Experience

* [x] Example startup workflow
* [x] Demo task templates
* [x] Sample outputs
* [x] Interactive tutorial
* [x] Guided first task

---

# 5. AGENT SYSTEM CORE

## Agent Runtime

* [x] NativeAgentWorker
* [x] Queue consumption
* [x] Direct LLM execution
* [x] Streaming responses
* [x] Agent memory loading
* [x] Agent memory saving
* [x] Task retry logic
* [x] Agent reassignment logic
* [x] Failure recovery
* [x] Timeout handling
* [x] Cancellation support
* [x] Parallel execution
* [x] Agent status tracking

## Agent Registry

* [x] Agent registration
* [x] Agent metadata
* [x] Agent capabilities
* [x] Agent permissions
* [x] Agent categories
* [x] Agent search
* [x] Agent filtering
* [x] Agent detail page

## Agent Coordination

* [x] Planner agent
* [x] Task graph creation
* [x] Subtask delegation
* [x] Workflow orchestration
* [x] Multi-agent communication
* [x] Workflow completion logic
* [x] Agent dependency handling

---

# 6. AOS COUNCIL SYSTEM

## Council Architecture

* [x] Council coordinator
* [x] Architecture review agent
* [x] Security review agent
* [x] Cost analysis agent
* [x] Product review agent
* [x] Deployment review agent
* [x] Governance review agent
* [x] Conflict resolution logic

## Council Features

* [x] Multi-agent review flow
* [x] Approval voting system
* [x] Risk scoring
* [x] Recommendation summaries
* [x] Escalation handling
* [x] Human override support

---

# 7. HUMAN-IN-THE-LOOP (HITL)

## HITL Engine

* [x] Approval queue
* [x] Reject flow
* [x] Approve flow
* [x] Pause execution
* [x] Resume execution
* [x] Approval notifications
* [x] Approval history
* [x] Escalation workflows
* [x] Manual intervention tools

## Approval Triggers

* [x] High-cost actions
* [x] Deployment approvals
* [x] External publishing approvals
* [x] Sensitive tool execution
* [x] Destructive actions
* [x] Credential access requests

---

# 8. POLICY ENGINE & GOVERNANCE

## Policy Engine

* [x] Policy creation
* [x] Policy editing
* [x] Policy deletion
* [x] Policy assignment
* [x] Policy simulation
* [ ] Policy testing
* [x] Policy audit logs

## Governance

* [x] ALLOW rules
* [x] DENY rules
* [x] AUDIT rules
* [x] ESCALATE rules
* [x] Runtime enforcement
* [x] Tool-level permissions
* [x] Workspace isolation
* [x] Agent identity system
* [x] Cryptographic UUIDs

---

# 9. TOOL EXECUTION SYSTEM

## Tool Registry

* [x] Tool registration
* [x] Tool schemas
* [x] Tool permissions
* [x] Tool validation
* [x] Tool logging
* [x] Tool retries
* [x] Tool timeouts
* [x] Tool analytics

## MCP Integrations

### GitHub

* [x] Repo access
* [x] PR creation
* [x] Commit generation
* [x] Issue management
* [x] Branch creation

### Messaging

* [x] Slack integration
* [x] Telegram integration
* [x] WhatsApp integration
* [x] Discord integration

### Marketing

* [x] Social media posting
* [x] Content scheduling
* [ ] Analytics collection

### Productivity

* [x] Calendar integration
* [x] Task scheduling
* [x] Reminder system

---

# 10. MODEL ABSTRACTION LAYER

## Providers

* [x] OpenAI support
* [x] Anthropic support
* [x] Gemini support
* [x] Mistral support
* [x] Ollama support
* [ ] Custom provider support

## Routing

* [x] Model routing logic
* [x] Fallback models
* [ ] Cost-aware routing
* [ ] Latency-aware routing
* [x] Provider failover
* [ ] Budget-aware selection

---

# 11. MEMORY SYSTEM

## Vector Memory

* [x] ChromaDB integration
* [x] Embedding generation
* [x] Retrieval system
* [x] Context injection
* [x] Memory compression
* [ ] Long-term memory
* [ ] Workspace memory
* [x] Agent-specific memory

## Memory UX

* [x] Memory viewer
* [x] Memory search
* [x] Memory deletion
* [x] Memory tagging
* [x] Retrieval logs

---

# 12. OBSERVABILITY & MONITORING

## Event System

* [x] Typed events
* [x] Event streaming
* [x] WebSocket updates
* [x] Event persistence
* [x] Event replay

## Monitoring Dashboard

* [x] Live execution feed
* [x] Agent activity feed
* [x] Workflow visualisation
* [x] Token usage charts
* [x] Cost charts
* [x] Failure analytics
* [x] Retry analytics
* [x] Queue monitoring
* [x] Runtime metrics
* [x] Template execution replay — TraceStep persistence + replay endpoint reshaped to Observe event schema (2026-05-16)

## Logging

* [x] Structured logs
* [x] Error logs
* [x] Audit logs
* [x] API request logs
* [x] Security logs

---

# 13. BILLING & TOKEN MANAGEMENT

## Usage Tracking

* [x] Token counting
* [x] Provider cost tracking
* [x] Per-agent costs
* [x] Per-workflow costs
* [x] Per-workspace costs

## Limits

* [x] Hard token limits
* [x] Soft token warnings
* [x] Budget ceilings
* [x] Usage alerts
* [x] Beta tester quotas
* [x] Abuse prevention

## Billing UI

* [x] Usage dashboard
* [x] Cost breakdowns
* [ ] Billing history
* [x] Plan limits display
* [x] Token analytics

---

# 14. PRODUCT OPERATIONS AGENTS

## Product Team

* [x] PRD generator
* [x] Roadmap planner
* [x] User story generator
* [x] Feature prioritisation
* [x] Competitor analysis
* [x] Market research workflows
* [x] Startup validation workflows
* [x] Requirement clarification flows

---

# 15. ENGINEERING OPERATIONS AGENTS

## Engineering Team

* [x] Backend engineering agent
* [x] Frontend engineering agent
* [x] DevOps agent
* [x] QA agent
* [x] Architecture agent
* [x] Deployment agent
* [x] Documentation agent

## Software Workflows

* [x] Code generation
* [x] Project scaffolding
* [x] Database schema generation
* [x] API generation
* [x] Frontend generation
* [x] Unit test generation
* [x] Integration test generation
* [x] CI/CD setup
* [x] Deployment workflows
* [x] Bug fixing workflows
* [x] Refactor workflows

---

# 16. MARKETING OPERATIONS AGENTS

## Marketing Team

* [x] SEO agent
* [x] Content writer agent
* [x] Social media agent
* [x] Email marketing agent
* [x] Brand strategy agent
* [x] Ad strategy agent

## Marketing Workflows

* [x] Landing page copy generation
* [x] Blog generation
* [x] Content calendars
* [x] Social media scheduling
* [x] Campaign planning
* [x] Analytics reporting
* [x] Audience research
* [x] Startup launch campaigns

---

# 17. SALES OPERATIONS AGENTS

## Sales Team

* [x] Lead generation agent
* [x] Outreach agent
* [x] CRM agent
* [x] Proposal generator
* [x] Sales research agent

## Sales Workflows

* [x] Cold outreach generation
* [x] Lead qualification
* [x] Prospect research
* [x] CRM updates
* [x] Follow-up scheduling
* [x] Proposal generation

---

# 18. DASHBOARD EXPERIENCE

## Main Dashboard

* [x] Workspace overview
* [x] Active workflows
* [x] Agent status
* [x] Usage metrics
* [x] Recent activity
* [x] Notifications
* [x] Approval requests
* [ ] Team activity

## Workflow UI

* [x] Workflow creation
* [x] Workflow progress tracking
* [x] Workflow logs
* [x] Workflow cancellation
* [x] Workflow replay — `SwarmExecutionContext.status` added + lifecycle wired through launch/cancel/SSE/replay paths (2026-05-16)
* [x] Workflow templates — saas-mvp-72h end-to-end fixed: status column, anchor agent resolution, trace persistence (2026-05-16)

---

# 19. AUTONOMOUS STARTUP WORKFLOWS

## Canonical Workflows

* [x] "Launch SaaS MVP"
* [x] "Generate Startup PRD"
* [x] "Create Marketing Campaign"
* [x] "Research Startup Idea"
* [ ] "Launch Landing Page"
* [x] "Generate Sales Outreach"
* [x] "Deploy Fullstack App"
* [ ] "Setup Analytics Stack"

## MVP Launch Workflow

* [ ] Idea intake
* [ ] Market research
* [x] PRD generation
* [ ] Architecture planning
* [x] Backend scaffolding
* [x] Frontend scaffolding
* [ ] Database setup
* [x] Testing generation
* [x] Deployment pipeline
* [x] Deployment execution
* [ ] Landing page generation
* [ ] Analytics setup
* [x] Marketing content generation
* [ ] Support workflow setup

---

# 20. SECURITY

## Core Security

* [x] Secure secrets management
* [x] API key encryption
* [x] Workspace isolation
* [x] Rate limiting
* [x] Request validation
* [x] Input sanitisation
* [x] Prompt injection protection
* [x] Tool permission enforcement

## Auditability

* [x] Immutable audit trails
* [x] Policy decision logs
* [x] Execution replay
* [x] Tool execution logs
* [x] Security event logs

---

# 21. BETA TESTING INFRASTRUCTURE

## Tester Management

* [x] Beta invite system
* [x] Waitlist management
* [x] Invite codes
* [ ] Tester onboarding
* [ ] Tester analytics
* [x] Feedback collection
* [ ] Usage tracking

## Feedback Loops

* [x] In-app feedback
* [x] Bug reporting
* [x] Feature request system
* [ ] Session replay tools
* [ ] User interviews

---

# 22. DOCUMENTATION

## User Docs

* [x] Getting started guide
* [x] Workflow tutorials
* [x] Agent documentation
* [x] Billing explanation
* [x] HITL explanation
* [x] Governance explanation
* [x] Troubleshooting docs

## Developer Docs

* [x] API docs
* [x] MCP integration docs
* [ ] SDK docs
* [ ] Webhook docs

---

# 23. ANALYTICS & LEARNING

## Product Analytics

* [ ] User retention tracking
* [ ] Workflow completion tracking
* [ ] Failure analysis
* [ ] Feature usage analytics
* [ ] Token burn analytics
* [ ] Most-used workflows

## Learning Systems

* [ ] Workflow optimisation
* [ ] Retry pattern analysis
* [ ] Agent performance scoring
* [ ] Prompt improvement tracking

---

# 24. V1 SUCCESS METRICS

## Product Success

* [ ] Users complete workflows successfully
* [ ] MVP deployment success rate acceptable
* [ ] Users return after first session
* [ ] Token burn remains manageable
* [x] HITL flows work reliably
* [x] Agent coordination stable
* [x] Error recovery functional

## Founder Success

* [ ] Founders launch projects faster
* [ ] Founders reduce operational burden
* [ ] Founders trust AOS workflows
* [ ] Users actively test startup operations

---

# 25. WHAT MUST EXIST BEFORE PUBLIC BETA

## Non-Negotiables

* [x] Authentication stable
* [x] Billing + token limits stable
* [x] Core workflows reliable
* [x] HITL working
* [x] Observability working
* [x] Logs + audit trails working
* [ ] Deployment workflows tested
* [x] Recovery systems functional
* [x] Error handling implemented
* [x] Security baseline completed
* [ ] Landing page live
* [x] Waitlist system active
* [x] Feedback collection active

---

# 26. WHAT CAN WAIT UNTIL AFTER BETA

## Post-Beta Features

* [ ] Marketplace
* [ ] Firecracker microVMs
* [ ] Advanced compliance packs
* [ ] Enterprise SSO
* [ ] Helm deployments
* [ ] Multi-region infra
* [ ] Advanced anomaly detection
* [ ] Revenue-sharing systems
* [ ] White-labeling
* [ ] Marketplace economy
* [ ] Autonomous startup revenue loops

---

# 27. FINAL REMINDER

V1 is NOT about perfection.

V1 is about proving:

> AOS Swarm creates undeniable operational leverage for founders.

---

# Session Log

## 2026-05-18 — Full codebase audit + checklist accuracy pass

Audited every backend app, all frontend pages, agent-swarm runtime, and infra config. Reconciled 12 checklist items that were incorrectly unchecked:

- **Background worker monitoring** — Flower monitoring confirmed in `agent-swarm/docker-compose.runtime.yml` (monitoring profile, port 5555)
- **Escalation handling** — `EscalationView` in agent_intelligence + PendingAction creation on ESCALATE effect in swarm_bridge
- **Tool analytics** — `ToolAnalyticsView` confirmed at `agent_intelligence/views.py:674`
- **Embedding generation** — Google Generative AI `text-embedding-004` wired into ChromaDB `PersistentClient`
- **Memory tagging** — `MemoryTagViewSet` confirmed in knowledge_base
- **Retrieval logs** — `QueryLogViewSet` confirmed in knowledge_base
- **Workflow visualisation** — `WorkflowGraphView` confirmed at `agent_intelligence/views.py:847`
- **Failure analytics** — `FailureAnalyticsView` + `TaskFailureAnalyticsView` confirmed
- **Retry analytics** — `RetryAnalyticsView` confirmed
- **Per-workflow costs** — `WorkflowCostSummaryView` confirmed in billing
- **Usage alerts** — `UsageAlertsView` confirmed in billing

**Bug fixed:** `ExecutionEventStreamView._stream_from_db` was filtering TraceSteps via `conversation__swarm_executions__id` — an invalid reverse relation (swarm_executions hangs off Agent, not Conversation). Fixed to `conversation__session_id=execution_id` to match how `SwarmTraceEventView` creates the Conversation anchor and how `ExecutionReplayView` queries correctly.

File: `backend/apps/swarm_bridge/views.py:1127`

## 2026-05-16 — Template launch + Observe trace pipeline

Symptom: `Failed: SwarmExecutionContext() got unexpected keyword arguments: 'status'` on template launch, then Observe replay returning 155 bytes (empty) even after status fix.

Root causes + fixes:

1. **Missing `status` column** — `SwarmExecutionContext` was being written to with `.status = "..."` in four places (create, cancel, complete, SSE-done check) but the model had no such field. Added `SwarmExecutionStatus` TextChoices (`pending`/`running`/`completed`/`failed`/`cancelled`/`denied`) + a `status` CharField with `(status, created_at)` index. Migration `0002_swarmexecutioncontext_status_and_more` applied. Normalized all writes to lowercase to match the SSE consumer that was already reading lowercase.
2. **Trace persistence failing on NOT NULL `conversation.agent_id`** — template runs have no `aos_agent`, so `Conversation.objects.get_or_create(defaults={"agent": None})` violated the FK constraint and zero TraceSteps were written. Added a 3-tier anchor-agent resolver in `WorkflowTemplateLaunchView`: SwarmAgentManifest lookup → user's first agent → get-or-create per-user "swarm-orchestrator" agent. Backfills `ctx.aos_agent` so Observe replay can resolve policy logs too.
3. **Replay event shape didn't match Observe's renderer** — replay was emitting `{node, input, output}` flat but Observe.jsx renders `EVENT_LABEL[ev.event_type]` with `ev.payload.{node, tokens_in, tokens_out, error}`. Reshaped replay to emit `{event_type: "agent.completed" | "agent.failed" | "trace.step" | "policy.checked" | "policy.denied", payload: {...}}` so labels and metadata render correctly.

Files: `backend/apps/swarm_bridge/models.py`, `backend/apps/swarm_bridge/migrations/0002_*.py`, `backend/apps/swarm_bridge/views.py`.

The beta should answer:

* Can founders complete meaningful startup workflows?
* Does AOS reduce operational burden?
* Are workflows reliable enough to trust?
* Do users come back?
* Will people pay for the leverage?

That is the real mission of V1.

---

# 28. WHAT I CAN'T CURRENTLY DO (AND WHY)

The 122 remaining unchecked items fall into five categories. Most are not "engineering left to do" — they're blocked on decisions, accounts, or running infrastructure that I don't have access to from inside this repo.

## A. Needs paid cloud accounts / DNS — can't be done from code alone

These require you to provision real infrastructure or buy a domain:

* Production backend / frontend deployment (need Render/Fly/Railway/AWS account)
* Production database setup (Postgres on a managed host)
* Redis deployment (Upstash, Redis Cloud, or managed Redis)
* HTTPS + SSL certificates (auto-issued once deployed behind a real domain)
* Domain setup `aos-swarm.com` (register the domain + point DNS)
* Background worker monitoring (needs Flower/Grafana on a running cluster)
* Staging environment
* Production environment
* Backup strategy (managed DB backups)
* Disaster recovery basics (runbook + tested failovers)
* "Landing page live" — code is ready, just needs to be deployed
* "Deployment workflows tested" — needs a real deploy target

**Unblock by:** picking a hosting stack (recommend Fly.io for backend, Vercel for frontend, Upstash for Redis) and giving me the keys, then I can write the deploy configs.

## B. Needs third-party API keys / external services

The code path exists but is dormant until you wire up an account:

* **Email verification, password reset emails, approval notifications, usage alerts** — need SMTP (SendGrid/Postmark/Resend)
* **Analytics integration / token burn analytics / user retention tracking / workflow completion tracking / feature usage analytics / failure analysis / most-used workflows** — need PostHog or Mixpanel project key
* **Session replay tools** — need LogRocket / Sentry Replay
* **SEO setup** — needs the deployed domain + Search Console verification
* **Blog system** — needs a CMS choice (Sanity / Contentlayer / hosted)
* **Discord integration** — needs Discord bot token + server invite
* **Calendar integration / Reminder system** — needs Google Calendar + Microsoft Graph OAuth client IDs
* **Analytics collection** (marketing) — needs Twitter/LinkedIn/Meta ad API keys
* **Contact form** — needs a destination (your email, or a form service)
* **Docs link** — needs to point at real docs

**Unblock by:** giving me the API keys / service choices and I'll wire each one up.

## C. Needs design / UX decisions before I can code them

These are blocked on *how you want them to work*, not on capability:

* Workspace switching (top-bar dropdown? sidebar workspace list?)
* Welcome flow / Workspace setup wizard / First workflow walkthrough
* Budget configuration UI (slider? presets? per-agent breakdown?)
* Token usage explanation (educational modal? dashboard chip?)
* HITL preference setup (per-tool? per-cost-threshold? global?)
* Demo experience (sample outputs / interactive tutorial / guided first task)
* Agent detail page (deep agent profile — what does it show?)
* Team activity feed (what events? per-user filter?)
* Workflow visualisation (D3 DAG? mermaid? cytoscape?)
* Memory tagging UX / Retrieval logs UX
* Tester onboarding flow (separate from regular user onboarding?)

**Unblock by:** answering "what should this look and feel like" — then I can build it.

## D. Real engineering work still to do (no blockers, just unfinished)

These I could build now if given another session:

* **Section 5 — Agent Coordination:** Task graph creation, subtask delegation, multi-agent communication, agent dependency handling (the Council is built; what's missing is the orchestration DAG for non-council workflows)
* **Section 7 — HITL:** approval notifications, escalation workflows, manual intervention tools; deployment / external-publishing / sensitive-tool / destructive / credential-access approval triggers
* **Section 8 — Policy testing harness**
* **Section 10 — Cost-aware / latency-aware / budget-aware routing** (the fallback chain is built; cost-routing needs a pricing table)
* **Section 11 — Embedding generation, long-term memory consolidation, workspace memory partitioning, memory tagging, retrieval logs**
* **Section 12 — Workflow visualisation, failure analytics, retry analytics**
* **Section 13 — Per-workflow costs, billing history**
* **Section 9 — Tool analytics**
* **Section 6 — Council escalation handling**
* **Section 10 — Custom provider plugin interface**
* **Section 19 — "Launch Landing Page" + "Setup Analytics Stack" canonical workflows; idea intake, market research orchestration, architecture planning, database setup, landing page generation, analytics setup, support workflow setup** (need orchestrated multi-agent compositions, not new primitives)

**Unblock by:** prioritising and giving me a session to grind through them. No external dependencies.

## E. Cannot be checked off by code — requires real users + time

These are outcome metrics. They become true *after* the beta runs, not before:

* **Section 24 — V1 Success Metrics:** "Users complete workflows successfully", "MVP deployment success rate acceptable", "Users return after first session", "Token burn remains manageable", "Founders launch projects faster", "Founders reduce operational burden", "Founders trust AOS workflows", "Users actively test startup operations"
* **Section 21 — Tester onboarding / Tester analytics / Usage tracking / User interviews** — need real testers and a feedback cadence
* **Section 23 — Learning systems** (workflow optimisation, retry pattern analysis, agent performance scoring, prompt improvement tracking) — need run history before they have anything to learn from

**Unblock by:** ship the beta, get testers using it, then these light up.

## F. Documentation (just needs writing)

Section 22 is entirely "sit down and write":

* Getting started guide
* Workflow tutorials
* Agent documentation
* Billing / HITL / Governance explanations
* Troubleshooting docs
* API docs (could be auto-generated from DRF schema — quick win)
* MCP integration docs
* SDK docs
* Webhook docs

**Unblock by:** dedicate a session, or have a docs agent grind through it once the codebase stops moving.

---

## Quickest path to checking 25+ more items

If you want the fastest beta-launch progress:

1. Pick a hosting stack → I deploy it (unblocks ~12 infrastructure items)
2. Get a Resend/Postmark API key → I wire emails (unblocks ~5 items)
3. Get a PostHog project key → I wire analytics (unblocks ~8 analytics items)
4. Decide on workspace switching + welcome flow UX → I build them (~6 onboarding items)
5. Auto-generate API docs from DRF → 1 item, ~20 min

That's ~32 items unlockable in roughly half a day of decisions + a session of execution.
