# AOS — Bare-Minimum MVP for the Vision

**Mission:** take a user from *idea → a functional startup in minutes* — product engineering,
distribution, sales, marketing — **and** let them plug in an existing website/product so AOS
manages that too.

**Date:** 2026-07-09 · Companion to [`FEATURE-AUDIT.md`](./FEATURE-AUDIT.md)

---

## 0. Two decisions that shrink the problem

**D1 — You are NOT running LLMs on your server.** `runtime/providers.py` already calls Gemini &
Claude via their SDKs. Your server just makes API calls. No local inference to escape → **no
LangGraph/genai rewrite needed.** Standardize on **Gemini 2.5 Flash** (cheap/fast/1M ctx), keep
Claude as premium, delete Ollama.

**D2 — The SaaS uses only the 5k-line Python `runtime/` + `agents/*.md`.** The 513k-line
TypeScript CLI (`agent-swarm/src/`, 274 MB) is **never imported by the backend**. Cut it out of the
product. Own the small engine; park the CLI.

**Consequence:** the "add memory" goal is a *small* addition (Postgres run-state checkpoints +
your existing Chroma KB as long-term memory), not a framework migration.

---

## 1. The MVP in one sentence

> A user types an idea → agents build a real, **deployed** product they can see → with human
> approval gates → cheaply and reliably → and can then plug in their existing repo/site.

Everything that doesn't directly serve that sentence is **not** bare-minimum.

---

## 2. Tier 0 — The spine (must work end-to-end, or there is no product)

| # | Capability | Status today | What's missing for MVP |
|---|---|---|---|
| 1 | **Auth + Workspace** (`agent_gateway`) | 🟢 solid | Nothing — done. |
| 2 | **Project = the "startup" object** (`projects`) | 🟢 solid | Nothing major — done. |
| 3 | **Swarm execution engine** (Python `runtime` + `swarm_bridge`) | 🟡 real, unproven E2E | Reliability: default to Gemini Flash, **preflight check** (keys+worker live), **1 green E2E test**. This is #1 priority. |
| 4 | **Deliver the built product** | 🟡 partial | Agents write files to `/tmp/aos-workspace/{run}`. MVP must **push to a real GitHub repo + deploy to a live URL** (Vercel/Netlify/Fly). "Functional startup" = live, not a zip. **Likely the biggest build gap.** |
| 5 | **Approvals / human-in-the-loop** (`agent_intelligence` subset) | 🟢 built | Keep minimal — approve/reject a pending action. |
| 6 | **Cost metering** (`billing` subset) | 🟡 partial | Just a per-run token/$ meter + a hard cap so a run can't bankrupt you. Defer budgets/departments. |

If Tier 0 works reliably, you can demo the promise. Nothing below is required to prove the concept.

---

## 3. Tier 1 — Makes it a "startup," not just a code generator

The mission explicitly names distribution/marketing/sales, so one thin slice of each earns Tier 1.

| # | Capability | Status | MVP scope (thin) |
|---|---|---|---|
| 7 | **Distribution: ship it live** | part of #4 | The deploy step above doubles as distribution: a public URL + a landing page. |
| 8 | **Marketing** (`marketing`) | 🟡 built | Generate a landing page + **one** launch post. Defer full calendar/analytics. |
| 9 | **Light guardrails** (`policy_engine` subset) | 🟢 built | A few hard rules (spend cap, no destructive shell). Defer the full policy engine. |

---

## 4. Tier 1.5 — "Manage their existing product" (net-new, core to the vision)

This is **not built yet** and is essential to the second half of the mission.

| Capability | Status | MVP scope |
|---|---|---|
| **Bring-your-own repo/site** | 🔴 missing | Connect a GitHub repo (OAuth already exists for auth) so agents read/modify an **existing** codebase, open PRs, and redeploy. Start with GitHub-only. |

The `ops/connectors.py` pattern (real outbound API calls) is a foundation, but importing/operating on a user's live product is a distinct feature to build.

---

## 5. Tier 2 — Defer (real value, not bare-minimum)

These are mostly the **enterprise-governance** product, not the **startup-engine** MVP. Park them:

- Full **Sales/CRM** (`ops`), **Ops automation** (`ops_core`)
- Full **Marketing automation** (calendar, multi-channel, analytics ingest)
- **Knowledge Base / RAG** (`knowledge_base`) — *except* the small slice reused as agent memory
- Full **Billing** (budgets, departments, alerts) — `billing/alerts` endpoint is also currently missing (G1)
- **Notifications** (`notifications` — 40-LOC stub)
- **Analytics dashboards** (`agent_intelligence` — failures/retries/graph)
- Full **Policy Engine** (conditions, audit UI, IAM roles)

None of these block "idea → live product." Ship them once the spine converts users.

---

## 6. The build order (highest leverage first)

1. **Make the swarm run bulletproof** (Tier 0 #3): default Gemini Flash + preflight + one E2E test. *Directly kills the "nothing works" perception.*
2. **Close the delivery loop** (Tier 0 #4): repo push + one-click deploy to a live URL. *This is the "wow."*
3. **Per-run cost cap** (#6). *Protects you financially before you scale runs.*
4. **Landing page + launch post** (#8). *Now it's a "startup," not a codegen toy.*
5. **Bring-your-own GitHub repo** (#Tier 1.5). *Unlocks the "manage what they already have" half of the mission.*
6. **Delete/park the 513k-line TS CLI** and trim node_modules. *Cuts the repo from 2.1 GB and removes maintenance drag.*

Everything in Tier 2 waits until steps 1–5 have real users.

---

## 7. What to cut or park now (to move fast)

- ❌ The TypeScript Ink CLI (`agent-swarm/src`) — not used by the SaaS.
- ❌ Ollama/local provider — you call hosted APIs.
- 🅿️ Ops/CRM, full marketing, KB, full billing, notifications, analytics, full policy engine — Tier 2.
- 🅿️ Multi-provider sprawl (OpenAI/Mistral) — pick Gemini + Claude, delete the rest until needed.

**Net MVP surface: 6 Tier-0 capabilities + 3 thin Tier-1 slices + 1 net-new connector.**
That's roughly **4 of your 12 apps** carrying the product, with 2–3 more contributing thin slices —
down from trying to keep all 12 alive at once.
