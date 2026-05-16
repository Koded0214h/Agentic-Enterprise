# Human-in-the-Loop (HITL)

HITL is AOS's safety layer between autonomous agents and the real world. When an agent proposes something risky — sending an external message, deploying code, exceeding a cost threshold, deleting data — execution **pauses** and the action is queued for your approval.

This is what lets you delegate work to AI agents without losing control.

---

## The HITL levels

Configurable per user in **Settings → Security & HITL**:

| Level    | Behaviour                                                  | Use when                                |
|----------|------------------------------------------------------------|-----------------------------------------|
| Strict   | Every external action pauses for approval                  | First few days; high-trust workflows    |
| Standard | High-cost, deployment, external publishing pause           | Default — recommended                   |
| Lenient  | Log everything, block nothing                              | After you trust the workflows           |
| Off      | Fully autonomous; only policy denials still block          | Power users; not recommended initially  |

Plus a **cost threshold** — any single action whose estimated cost exceeds this dollar value triggers HITL regardless of level. Default: $10.

---

## What triggers approval automatically (in Standard mode)

- Deployment to production environments
- Sending email / Slack / Discord / Telegram / WhatsApp messages externally
- Calling APIs that move money
- Destructive actions: file deletes, repo deletes, database drops, branch deletes
- Tool calls that exceed the cost threshold
- Any action where a workspace policy has `effect=ESCALATE`
- Multi-agent council reviews where the verdict is `CONDITIONAL_APPROVE` or `DENY`

---

## Approving and rejecting

The **Approvals** page in the sidebar is your inbox. Each pending action shows:

- The agent proposing it
- The action description
- Risk level (low / medium / high / critical)
- Estimated cost
- The full context: input message, tool call, parameters

Three options:

- **Approve** — the agent resumes execution with the action permitted
- **Reject** — the agent receives a rejection and either retries with a different approach or terminates
- **Pause** — keep the action open, ask the agent to clarify

Every decision is logged with your user ID, timestamp, and the action ID. The audit trail is immutable.

---

## How resumption works

When you approve, AOS reconstructs the agent's state from a snapshot taken at the time of escalation (including the full message history), then resumes execution. The agent gets your decision as a new user message in its conversation, and continues from where it paused. There's no replay or state divergence.

If you take longer than the agent's idle timeout (default 4 hours), the agent enters `IDLE` status and is parked. You can still approve/reject; the agent will resume on your next decision.

---

## Council reviews (multi-agent approval)

For especially high-stakes actions you can route through the **AOS Council** — six specialised review agents (architecture, security, cost, product, deployment, governance) that score the proposed action 0–100 and vote. If aggregate score ≥ 80 and no DENY votes, the action auto-approves. Otherwise it lands in your inbox with the full council opinion attached so you have context before deciding.

Trigger council reviews by setting `requires_council=true` on a policy or by calling `POST /api/swarm/council/review/` from a workflow.

---

## Notification channels

You can be notified of pending approvals by:

- **In-app** — the bell icon in the top bar lights up with a count
- **Email** — once SMTP is configured (see [`integrations-and-keys.md`](./integrations-and-keys.md))
- **Discord** — webhook pings to your team channel
- **Slack** — install the AOS Slack app (see same doc)

Configure per-channel in Settings → Notifications.

---

## Programmatic API

For workflow automation, you can manage approvals through the API:

```http
GET    /api/intelligence/pending-actions/
POST   /api/intelligence/pending-actions/<id>/approve/
POST   /api/intelligence/pending-actions/<id>/reject/
GET    /api/intelligence/pending-actions/<id>/   # full context
```

See [`api-reference.md`](./api-reference.md) for the full schema.
