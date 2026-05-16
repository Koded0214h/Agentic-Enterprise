# Getting Started with AOS

Welcome. AOS deploys autonomous AI agent swarms that run your startup's operations — product, engineering, marketing, sales — with policy guardrails and human-in-the-loop approval.

This guide takes you from signup to your first successful agent run in **about 10 minutes**.

---

## 1. Sign up

Open [agentic-enterprise-smoky.vercel.app](https://agentic-enterprise-smoky.vercel.app) and click **Get started**.

You can either:
- Create an account with email + password, or
- Click **Continue with Google** (one-tap, no password)

If you have a beta invite code, paste it on the signup form.

---

## 2. Onboarding — set up your workspace (5 min)

After signup, you'll be walked through five short steps:

1. **Industry** — pick the closest match (SaaS, e-commerce, content, services, etc). AOS uses this to choose default agent profiles.
2. **Functions** — pick the departments you want agents for (Engineering, Product, Marketing, Sales, Ops, Support).
3. **API keys** — add at least one LLM provider key (Anthropic, OpenAI, Gemini, Mistral, or Ollama for local). Keys are encrypted at rest and never logged. *Optional if you're testing on AOS-managed credits.*
4. **Blueprint** — choose a starting agent team. The most common starting points:
   - **SaaS Starter** (12 agents) — product + growth + revenue
   - **Growth Studio** (14 agents) — SEO + ads + content + conversion
   - **E-commerce Engine** (18 agents) — catalog + fulfillment + support
   - You can mix and add more agents later.
5. **Review** — confirm and click **Launch**.

---

## 3. Your first agent run

From the dashboard:

1. Click **Agents** in the sidebar
2. Pick any agent (e.g. `engineering-backend-architect` or `marketing-content-strategist`)
3. Click **Run**
4. Type a task in plain English. Examples:
   - *"Review the auth middleware in `apps/agent_gateway/views.py` and flag security issues"*
   - *"Write a launch announcement for our new pricing page"*
   - *"Generate a PRD for an AI-powered invoice automation tool"*
5. Hit Enter. Watch the agent stream its progress live.

If the agent does something high-stakes (deploying code, sending external messages, exceeding your cost threshold), it pauses for **your approval** in the Approvals inbox. Review and approve/reject from there.

---

## 4. Watch what's happening — Observe

The **Observe** page is your live cockpit. It shows:
- Every agent currently running, with which tools they're calling
- Token usage and cost charts (last 30 days)
- A real-time event feed you can subscribe to for any execution
- Queue depth: critical / standard / batch

Click any execution to open its event stream — you can see every LLM call, every tool invocation, and every policy decision.

---

## 5. Set your guardrails — Settings → Security & HITL

By default, AOS is in **Standard HITL mode**: it auto-approves cheap, reversible actions and pauses for your approval on anything risky.

To tighten or loosen:
- **Strict** — every external action pauses for approval
- **Standard** — high-cost, deployment, and external-write actions pause (recommended)
- **Lenient** — log everything but never block
- **Off** — fully autonomous (not recommended until you trust your workflows)

Set a monthly token budget for each agent in **Finance → Budgets** so a runaway loop can't burn through your bill.

---

## 6. Try a multi-agent workflow

In **Workflow Templates**, pick "Launch SaaS MVP" or "Generate Startup PRD". These chain multiple agents together — planner → architect → engineer → reviewer — using the DAG orchestrator. You'll see the full graph executing in real time.

---

## Common first-day questions

- **"It says my agent needs a tool I haven't enabled."** — Open Settings → Tools, or the agent's detail page, and grant the permission.
- **"My agent is stuck on 'Pending approval'."** — Go to **Approvals** and decide.
- **"It used a lot of tokens."** — Check **Finance → Attribution** for the breakdown. Tighten the budget for that agent.
- **"How do I invite a teammate?"** — Settings → Workspace → Invite member.
- **"Can I run agents from Slack/Discord?"** — Yes, see [`docs/integrations-and-keys.md`](./integrations-and-keys.md) for setup.

---

## Next steps

- Read [`hitl.md`](./hitl.md) to understand the approval system in depth
- Read [`agents.md`](./agents.md) to see the full agent catalog
- Read [`billing.md`](./billing.md) to set up budgets
- Read [`governance.md`](./governance.md) to write workspace-wide policies
- Read [`troubleshooting.md`](./troubleshooting.md) if something looks wrong
