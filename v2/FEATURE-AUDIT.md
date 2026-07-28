# AOS — Surgical Feature Audit

**Date:** 2026-07-09 · **Branch:** `main` · **Method:** codebase grep + static inspection + empirical test run

> **Headline finding, up front:** the impression that *"most of the stuff isn't working"* is
> **not** borne out by the code. The backend is real, migrated, and tested — a sampled run of
> **121 tests across 4 apps passed 100%**, including live ChromaDB vector-store integration.
> `manage.py check` is clean. There is exactly **1 TODO** in non-test backend code.
>
> What's actually true is narrower and more fixable: **end-to-end flows (swarm + live LLM +
> external APIs) are unverified**, the **deployed instance has been fragile** (the last ~15 commits
> are all nginx/CORS/deploy firefighting, not logic bugs), and the **surface area has outgrown the
> verification**. The problem is integration confidence and ops, not empty scaffolding.

---

## 1. System shape

| Layer | Stack | Substance |
|---|---|---|
| **Backend** | Django 5.2 + DRF + Celery + ChromaDB | 12 apps · ~21.3k LOC · 365 test methods · all apps migrated |
| **Frontend** | React 19 + Vite 8 + router 7 | 45 routed pages · hits ~80 real endpoints · JWT + Google/GitHub SSO |
| **Swarm** | Vendored `@anas.abubakar/swarm` fork (TS/Ink + Py runtime) | 271 agent defs · native runtime (orchestration/events/providers/council/recovery/sandbox) |
| **Infra** | docker-compose.prod | backend + celery worker + celery-beat + redis + nginx — full topology |

---

## 2. Feature inventory (surgical)

Completeness = how built-out the code is. Works? = confidence it runs end-to-end **today**.
Legend: 🟢 solid · 🟡 built but unverified/partial · 🔴 thin/broken.

| # | Feature (app) | What it does | Endpoints | Complete | Works? | Long-term value |
|---|---|---|---|---|---|---|
| 1 | **Auth & Gateway** (`agent_gateway`) | Login/register/logout, JWT, Google+GitHub SSO, user profile, workspaces, password reset, per-user LLM configs, agent auth | 23 · 13 models | 🟢 90% | 🟢 | **Core.** Table stakes; keep. |
| 2 | **Agent Registry** (`agent_registry`) | Catalog of agents, capabilities, tools, trust levels | router · 3 models | 🟢 80% | 🟢 | **High** — the "who can do what" spine. |
| 3 | **Policy Engine** (`policy_engine`) | Policies, conditions, effects, audit logs; `PolicyEvaluator` gates swarm actions | router · 4 models | 🟢 85% | 🟢 | **Highest differentiator.** Governance is the moat. 559 test LOC. |
| 4 | **Agent Intelligence** (`agent_intelligence`) | Conversations, tasks, pending-actions/approvals, escalations, failure/retry analytics, workflow-graph, provider pricing, prompt-injection guard | 10 · 8 models | 🟢 85% | 🟡 | **High** — observability + human-in-loop. Analytics need live data to prove out. |
| 5 | **Knowledge Base** (`knowledge_base`) | RAG: collections, documents, chunking, tags, query logs — **real ChromaDB** vector store | router · 5 models | 🟢 85% | 🟢 | **High** — memory/context layer. Tests exercise real embeddings. |
| 6 | **Projects** (`projects`) | Projects, goals, members, activities, artifacts, timeline, readiness, runs | router · 5 models | 🟢 85% | 🟢 | **High** — the unit of work users organize around. 678 view LOC. |
| 7 | **Billing / Cost Gov** (`billing`) | Budgets, departments, usage history, overview, spend alerts | router · 3 models | 🟡 70% | 🟡 | **High** for enterprise. ⚠️ frontend calls `/billing/alerts/` which has **no backend route** (see G1). |
| 8 | **Swarm Bridge** (`swarm_bridge`) | The integration hub: run/stream/poll/cancel executions, policy check, usage report, traces, KB query, agent register, workflow templates, council review. Runs a **plan→execute→ship task graph** on the native runtime in a background thread | 20 · 2 models | 🟡 75% | 🟡 | **Critical & riskiest.** Real code, but execution depends on live LLM keys + runtime reliability; not covered by unit tests. This is where "it doesn't work" actually lives. |
| 9 | **Ops / CRM** (`ops`) | Leads, opportunities, tickets, accounts, touchpoints, processing queue, external **connectors** (real `requests` calls), convert/sync/resolve | router · 6 models | 🟡 70% | 🟡 | **Medium-high.** Connectors make real outbound calls — need real credentials + partner endpoints to actually work. |
| 10 | **Ops Core** (`ops_core`) | Queue processor + project-scoped objects; Celery-backed | router · 6 models | 🟢 80% | 🟡 | **Medium.** Huge test surface (1,661 test LOC) but depends on a running worker. |
| 11 | **Marketing** (`marketing`) | Campaigns, content calendar, publish/retry, analytics ingest, metrics — real UploadPost API calls | router · 3 models | 🟡 65% | 🟡 | **Medium.** Value depends entirely on the external social API being configured. |
| 12 | **Notifications** (`notifications`) | Notification list/bell | router · 1 model · **40 view LOC · 0 tests** | 🔴 40% | 🟡 | **Medium.** Thinnest module — real but barely built, no tests. |
| 13 | **Swarm Runtime** (`agent-swarm`) | 271 agents, native orchestration/council/recovery/sandbox, Ink CLI | — | 🟡 varies | 🟡 | **Strategic core** but **unowned** — it's a vendored fork (see G3). |

**Frontend (45 pages)** mirrors the backend cleanly: Overview, Projects (+timeline/readiness/settings), Blueprints (+deploy wizard), Workflows/Templates, SwarmRun (live terminal stream), Approvals inbox, Agents, Observe, Finance, Ops, Marketing, IAM, Memory viewer, Settings. It is **not** a mock UI — it calls ~80 distinct real endpoints with JWT auth. This is a genuinely large, wired frontend.

---

## 3. Why it *feels* like nothing works (reconciled with evidence)

1. **Deploy fragility, not code fragility.** The last ~15 commits are 100% nginx/CORS/DNS/deploy
   fixes. A flaky *deployed* instance (CORS blocking the SPA, upstream DNS, duplicate headers)
   makes the whole product look dead even when the logic is fine. **This is an ops problem.**
2. **Empty states.** Pages render but show nothing because no data has been seeded and no flows
   triggered on the live instance → reads as "broken."
3. **The one genuinely unproven path is swarm execution** (#8/#13): it needs live LLM API keys, a
   reachable runtime, and a running Celery worker all at once. When any is missing, the marquee
   feature — "watch agents build something" — fails, and that's the feature users judge everything by.
4. **Surface > verification.** 12 apps × ~80 endpoints × 45 pages is more than the 365 unit tests
   and zero end-to-end tests can keep continuously green.

---

## 4. Concrete gaps found (fix list)

| ID | Severity | Gap |
|---|---|---|
| **G1** | 🟡 | Frontend calls `/billing/alerts/` — **no matching backend route**. Either add it or remove the call. |
| **G2** | 🔴 | **Zero end-to-end tests.** The swarm plan→execute→ship path — the product's whole point — has no automated coverage. One integration test with a mocked LLM provider would catch most "it doesn't work" reports. |
| **G3** | 🟡 | `agent-swarm` is a vendored fork (`@anas.abubakar/swarm`) with no upstream-tracking, patch path, or ownership decision. It's your strategic core but you don't "own" it. |
| **G4** | 🟡 | `notifications` app is a 40-LOC stub with 0 tests. |
| **G5** | 🟡 | Swarm execution has **no health/preflight check** — nothing verifies LLM keys + runtime + worker are live before a run, so failures surface as opaque terminal errors. |
| **G6** | 🟢 | God files & committed compiled JS (from AUDIT.md M1/M2) slow every change to the swarm. |
| **G7** | 🟡 | Marketing/Ops connectors make real external calls but there's no "not configured" graceful path visible — they need credentials to do anything, and likely fail silently without them. |

---

## 5. Verdict

**Completeness: ~65–70% of a real product, higher than it feels.** The governance + identity +
knowledge + projects core (features 1–6) is **solid and shippable**. The execution + integration
edge (7–13) is **built but unproven end-to-end** — that gap, plus deploy flakiness, is the entire
source of the "nothing works" impression.

**Long-term value ranking** (what to protect and invest in):
1. **Policy Engine (#3)** — the actual differentiator; governance is the moat.
2. **Swarm Bridge + Runtime (#8/#13)** — the reason the product exists; also the riskiest. Make this *provably* work before anything else.
3. **Knowledge Base (#5)** + **Agent Intelligence (#4)** — the memory + observability that make agents trustworthy.
4. **Projects / Registry / Auth (#1/#2/#6)** — necessary spine, already solid.
5. **Ops / Marketing / Billing / Notifications** — real but credential-and-config-gated; monetizable later, not the thing to prove first.

**The single highest-leverage move:** add **one green end-to-end swarm test** (mocked LLM) + a
**preflight health check** (G2 + G5). That converts "we think it works" into "we can prove it,"
and it directly attacks the perception that the project is broken.

---

*Companion doc: [`docs/AUDIT.md`](../docs/AUDIT.md) — repo-hygiene & security audit.*
