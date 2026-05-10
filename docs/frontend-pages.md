# AOS Frontend — Page List

---

## User Flows

### Flow 1 — Discovery to First Running Agent (New User)

```
Landing Page (/)
│
│  User reads the pitch. Clicks "Start Building" or "Book a Demo"
│
├── /signup
│    Enter email + password, or continue with Google / GitHub
│
├── /onboarding  [Step 1 of 5]
│    "What are you building?"
│    → Options: SaaS startup / Agency / Internal AI team / Enterprise pilot
│
│   [Step 2 of 5]
│    "Which functions do you want to automate first?"
│    → Checkboxes: Sales / Marketing / Engineering / Support / Finance / All
│
│   [Step 3 of 5]
│    "Which AI providers do you have access to?"
│    → Paste API keys: Anthropic / OpenAI / Gemini / Mistral
│    → "Don't have one? Use our managed key (usage billed)"
│
│   [Step 4 of 5]
│    "Pick a starting blueprint or start from scratch"
│    → Blueprint cards: Outbound Sales Machine / Content Engine /
│      Developer Workforce / Customer Support / SaaS Launch (all-in-one)
│    → Or: "I'll configure manually"
│
│   [Step 5 of 5]
│    Review: N agents will be created, X policies applied, estimated $Y/day
│    → [Launch →]
│
└── /app  (Command Center)
     First load: onboarding checklist visible in sidebar
     Agents are booting — status dots pulse yellow (PAUSED → RUNNING)
```

---

### Flow 2 — Running a Blueprint End-to-End

```
/app/blueprints
│
│  User browses blueprint gallery.
│  Each card shows: name, agent count, use case, avg cost/day
│
└── /app/blueprints/:id  (e.g. "Outbound Sales Machine")
     │
     │  Description, which agents are included, what it produces
     │  Estimated daily token cost, example output shown
     │
     └── /app/blueprints/:id/deploy  [Wizard — 3 questions]
          │
          │  Q1: "What is your product / service?" (free text)
          │  Q2: "Who is your target customer?" (free text)
          │  Q3: "What's your monthly budget for this?" (slider $0–$500)
          │
          │  [Deploy Blueprint →]
          │
          ├── System creates agents in the background
          │   Agents registered → policies assigned → capabilities configured
          │
          └── Redirect → /app/workflows/:id/run
               Live DAG canvas appears. Nodes start lighting up:
               PENDING (grey) → IN_PROGRESS (blue pulse) → COMPLETED (green)
```

---

### Flow 3 — Watching It Run (Live Execution)

```
/app/workflows/:id/run
│
│  DAG canvas with live node status
│  Right panel: streaming output from the active agent
│  Bottom bar: tokens used (ticking), cost (ticking), time elapsed
│  Each completed node shows a one-line result summary on hover
│
│  User clicks a node → slides open TraceViewer
│  TraceViewer Tier 1 (Summary): "Sales Agent found 12 prospects matching criteria"
│  TraceViewer Tier 2 (Decision): "Policy 'Global Allow' matched. Effect: ALLOW"
│  TraceViewer Tier 3 (Raw): full JSON input/output from the LangGraph node
│
└── On completion → banner: "Workflow completed in 4m 12s — $0.38 used"
     Links: [View Results] [Run Again] [See Full Trace]

Parallel: /app/observe/live  (always accessible from topbar icon)
│
│  Table of every currently running agent:
│  Agent name | Current node | Iteration | Tokens | Cost | Elapsed | [Pause]
│  Updates every 5 seconds
│
└── Click any row → /app/agents/:id/execute (live conversation thread)
```

---

### Flow 4 — Human Approval Interrupts the Run

```
Mid-execution: an agent hits a high-risk action
(e.g. "Finance Agent wants to send a $1,200 wire transfer")

Policy engine returns ESCALATE → agent is paused → PendingAction created

─────────────────────────────────────────────────────────────

User sees:
  • Topbar bell icon lights up red with count
  • /app/workflows/:id/run — affected node turns orange, shows "Waiting for approval"
  • Toast notification: "⚠ Finance Agent needs your approval — $1,200 transfer"

─────────────────────────────────────────────────────────────

User clicks notification →

/app/approvals/:id
│
│  Top: Risk Score badge (e.g. 88 / 100 — red)
│  Action description: "Wire transfer of $1,200 to vendor ABC via tool:payment"
│  Agent: Finance Agent (prod environment)
│  Policy triggered: "SOX - Escalate Agent-Initiated Financial Transactions"
│  Conversation history: what the agent was doing before it hit this
│  State snapshot: the exact JSON the agent will resume from if approved
│
│  [Approve]  [Deny]  [View Full Trace]
│
├── If APPROVED:
│   Agent resumes from exact checkpoint → workflow node turns blue again → completes
│   Activity feed: "Finance Agent approved by you — wire transfer executed"
│
└── If DENIED:
    Agent status → FAILED → downstream nodes → BLOCKED
    Activity feed: "Finance Agent denied by you — workflow stopped"
    User can re-run from that node after fixing the config
```

---

### Flow 5 — Reading What Happened (Logs + Observability)

```
/app/observe  (Activity Feed — default post-run view)
│
│  Reverse-chronological feed. Each line is one agent action.
│  Color coded by risk: green / yellow / red
│
│  Example lines:
│  ✅ Sales Agent   found 18 prospects matching "B2B SaaS, 50-200 employees"   2m ago  ▸
│  ✅ Outreach Agent sent 12 personalised emails via Gmail tool                 4m ago  ▸
│  ⚠  Finance Agent  was escalated — wire transfer awaiting approval           6m ago  ▸
│  ❌ Support Agent  failed — LLM timeout after 3 retries. Self-healer: RETRY  8m ago  ▸
│
│  Click any line → expands inline:
│   Tier 1 (Summary): already shown
│   Tier 2 (Decision): which policy evaluated, effect applied, 38ms eval time
│   Tier 3 (Raw): full TraceStep JSON — input_data, output_data, duration_ms
│
│  Filters: [All Agents ▾] [All Risk Levels ▾] [Last 1h ▾]
│
├── /app/observe/traces
│    Search raw TraceStep records
│    Filter: agent, node_name, risk_score range, is_loop=true, time range
│    Timeline view for a single conversation — node by node execution
│
├── /app/observe/anomalies
│    Flagged behaviors: loops detected, max_iterations hit, repeated tool calls
│    Group by agent. Trend: anomaly rate this week vs last week
│
└── /app/observe/circuit-breakers
     System Health Score: large number (0-100)
     Each breaker: metric | current value | threshold | status
     If any breaker is OPEN: red banner at top of every app page
     [Reset] button per breaker — requires confirmation
```

---

### Flow 6 — Checking Spend and ROI

```
After workflow completes, user wants to know if it was worth it →

/app/finance
│
│  Today's spend: $2.14
│  MTD: $34.72 / $100.00 budget (34%)  [progress bar with alert threshold at 80%]
│  Top spenders: Sales Agent ($1.20) / Outreach Agent ($0.58) / Finance Agent ($0.36)
│
└── /app/finance/roi
     "What it cost": $34.72 in tokens + $49/mo AOS plan
     "What it did": 847 tasks automated, 220 emails sent, 3 workflows completed
     "What it saved": 847 tasks × 12 min avg × $60/hr = $10,164 in labor
     Net ROI: 14,300%
     [Edit baseline assumptions] → adjusts the math
```

---

### Flow 7 — Something Goes Wrong (Circuit Breaker + Recovery)

```
Agent starts looping. Token spend spikes.
Circuit breaker threshold hit: $50 in 10 minutes.

─────────────────────────────────────────────────────────────

System:
  All agents → status PAUSED
  Red banner appears on every app page: "⛔ Circuit breaker tripped — all agents paused"
  Notification sent (Slack / email based on settings)

─────────────────────────────────────────────────────────────

User navigates to →

/app/observe/circuit-breakers
│
│  "Token Burn Rate" breaker card — OPEN (red)
│  Metric: $50.00 spent in last 10 min (threshold: $50.00)
│  Triggered: 3 minutes ago
│  History: this breaker has tripped 2 times this month
│
│  [View anomaly that caused this] → /app/observe/anomalies
│   Shows: "Sales Agent called tool:email 87 times in 4 minutes (loop)"
│
│  User fixes the policy (adds rate limit condition to tool:email policy)
│  → [Save Policy]
│
│  Back to circuit breakers → [Reset breaker]  → confirm
│
└── Agents resume. Activity feed: "Circuit breaker reset by you. Agents resuming."
```

---

### Flow 8 — Managing Agent Trust (Prod Deployment)

```
User wants to promote an agent from dev → prod →

/app/iam/environments
│
│  Three columns: DEV / STAGING / PROD
│  Agent cards in each column with drag-to-promote (or button)
│  Promoting to PROD shows warning: "Prod agents default-deny all trust.
│  You must create explicit trust policies."
│
└── /app/iam/trust  (Trust Matrix)
     Grid: rows = source agents, columns = target agents
     Cells: green check / red X / grey dash
     Click grey cell (Sales Agent → Finance Agent) →
       Modal: "Allow Sales Agent to call Finance Agent?"
       Reason field. Expiry date (optional). [Save]
     Cell turns green.
     Sales Agent can now call Finance Agent in prod.
```

---

## Pages

---

## Public / Marketing

| Route | Page |
|---|---|
| `/` | Landing Page |
| `/pricing` | Pricing |
| `/about` | About |
| `/blog` | Blog Index |
| `/blog/:slug` | Blog Post |
| `/changelog` | Changelog |
| `/docs` | Public Docs |
| `/security` | Security & Compliance Page |
| `/enterprise` | Enterprise Contact / Demo Request |

---

## Auth

| Route | Page |
|---|---|
| `/login` | Login (email/password + Google + GitHub SSO) |
| `/signup` | Sign Up |
| `/forgot-password` | Forgot Password |
| `/reset-password` | Reset Password |
| `/invite/:token` | Accept Team Invite |
| `/onboarding` | Onboarding Wizard (org setup → blueprint picker → deploy) |

---

## App — Home

| Route | Page |
|---|---|
| `/app` | Command Center (system health, activity feed, pending approvals, spend today) |

---

## App — Blueprints

| Route | Page |
|---|---|
| `/app/blueprints` | Blueprint Gallery |
| `/app/blueprints/:id` | Blueprint Detail |
| `/app/blueprints/:id/deploy` | Blueprint Deploy Wizard |
| `/app/blueprints/custom` | My Saved Blueprints |

---

## App — Agents

| Route | Page |
|---|---|
| `/app/agents` | Agent List |
| `/app/agents/new` | Create Agent |
| `/app/agents/:id` | Agent Detail (tabs: Identity / Capability / Policies / Activity / Budget) |
| `/app/agents/:id/edit` | Edit Agent |
| `/app/agents/:id/execute` | Execute Agent (chat + streaming response) |
| `/app/agents/swarm` | Swarm Agent Browser (all 245, filterable by category) |

---

## App — Workflows

| Route | Page |
|---|---|
| `/app/workflows` | Workflow List |
| `/app/workflows/new` | Workflow Builder (visual DAG canvas) |
| `/app/workflows/:id` | Workflow Detail |
| `/app/workflows/:id/run` | Live Workflow Execution View |
| `/app/workflows/:id/history` | Run History |

---

## App — Policies

| Route | Page |
|---|---|
| `/app/policies` | Policy List |
| `/app/policies/new` | Create Policy |
| `/app/policies/:id` | Policy Detail / Editor |
| `/app/policies/compliance` | Compliance Template Gallery (HIPAA / SOX / PCI-DSS) |
| `/app/policies/simulate` | Policy Simulator |
| `/app/policies/audit` | Policy Audit Log |

---

## App — Approvals

| Route | Page |
|---|---|
| `/app/approvals` | Approval Inbox (risk-sorted HITL queue) |
| `/app/approvals/:id` | Approval Detail |
| `/app/approvals/settings` | Notification Threshold Settings |
| `/app/approvals/history` | Approval History |

---

## App — Knowledge Base

| Route | Page |
|---|---|
| `/app/knowledge` | Collection List |
| `/app/knowledge/new` | Create Collection |
| `/app/knowledge/:id` | Collection Detail (tabs: Documents / Access / Query / Log) |
| `/app/knowledge/:id/upload` | Document Upload |

---

## App — Observe

| Route | Page |
|---|---|
| `/app/observe` | Activity Feed (narrative transparency, not raw logs) |
| `/app/observe/live` | Live Monitor (currently executing agents) |
| `/app/observe/traces` | Trace Explorer |
| `/app/observe/anomalies` | Anomaly Log |
| `/app/observe/circuit-breakers` | Circuit Breakers + System Health Score |

---

## App — Finance

| Route | Page |
|---|---|
| `/app/finance` | Spend Overview |
| `/app/finance/budgets` | Budget Manager |
| `/app/finance/attribution` | Cost Attribution (by dept / agent / LLM) |
| `/app/finance/roi` | ROI Dashboard (hours saved vs token cost) |
| `/app/finance/usage` | Raw Usage Records |

---

## App — IAM

| Route | Page |
|---|---|
| `/app/iam/trust` | Agent Trust Matrix |
| `/app/iam/roles` | Role Manager |
| `/app/iam/members` | Team Members |
| `/app/iam/environments` | Environment Config (dev / staging / prod) |
| `/app/iam/sso` | SSO Configuration |
| `/app/iam/api-keys` | API Keys |

---

## App — Swarm

| Route | Page |
|---|---|
| `/app/swarm` | Swarm Dashboard |
| `/app/swarm/executions` | Execution History |
| `/app/swarm/executions/:id` | Execution Detail (5-phase timeline) |
| `/app/swarm/healing` | Self-Healer Log |

---

## App — Settings

| Route | Page |
|---|---|
| `/app/settings` | Org Settings |
| `/app/settings/integrations` | Integrations (Slack, PagerDuty, webhooks) |
| `/app/settings/notifications` | Notification Preferences |
| `/app/settings/plugins` | Plugin SDK / Custom Agents |
| `/app/settings/billing` | Subscription & Billing (AOS plan) |

---

## Error / System

| Route | Page |
|---|---|
| `/404` | Not Found |
| `/500` | Server Error |
| `/maintenance` | Maintenance Mode |
