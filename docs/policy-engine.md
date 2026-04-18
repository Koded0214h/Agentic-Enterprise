# Policy Engine

The policy engine is the governance core of AOS. Every agent action — whether originating from a native LangGraph execution or a swarm dispatch — is evaluated against the policy set before it runs.

---

## Concepts

### Policy
A policy is a rule that defines what an agent **may** or **may not** do with a given resource.

| Field | Type | Description |
|---|---|---|
| `name` | string | Human-readable label |
| `resources` | string[] | Resource patterns this policy applies to |
| `effect` | enum | What happens when the policy matches |
| `priority` | int | Higher priority policies are evaluated first |
| `risk_level` | int (0–100) | Risk score stored on the audit log entry |
| `conditions` | Condition[] | Optional conditions that must ALL be true |
| `is_active` | bool | Whether this policy is currently enforced |
| `valid_from` | datetime | Optional activation date |
| `valid_until` | datetime | Optional expiry date |
| `max_calls` | int | Optional usage cap (null = unlimited) |

---

### Effects

| Effect | What happens |
|---|---|
| `ALLOW` | Agent is permitted to proceed |
| `DENY` | Agent is blocked immediately. An explicit DENY always wins, regardless of other policies. |
| `AUDIT` | Agent proceeds, but the action is logged at elevated priority |
| `ESCALATE` | Agent is paused. A `PendingAction` record is created for human review. The swarm can poll `GET /api/swarm/executions/{id}/` until a decision is made. |

---

### Conditions

Conditions narrow a policy to specific contexts. A policy with no conditions matches all requests to its resources.

| Field | Description |
|---|---|
| `field` | Dot-notation path into the request context (e.g., `context.environment`) |
| `operator` | Comparison operator |
| `value` | The value to compare against |

All conditions on a policy must be true for the policy to apply (logical AND).

**Operators:**

| Operator | Example |
|---|---|
| `eq` | `field: "environment"`, `value: "prod"` |
| `neq` | `field: "engine"`, `value: "gemini"` |
| `gt` | `field: "hour"`, `value: "18"` |
| `lt` | `field: "risk_score"`, `value: "50"` |
| `contains` | `field: "task"`, `value: "delete"` |
| `not_contains` | `field: "task"`, `value: "DROP TABLE"` |
| `in` | `field: "environment"`, `value: ["staging", "prod"]` |
| `not_in` | `field: "agent_category"`, `value: ["game-development"]` |
| `between` | `field: "cost_usd"`, `value: [0.01, 1.00]` |
| `regex` | `field: "task"`, `value: "^(delete|drop|truncate)"` |

---

### Resource Patterns

Resources support three matching modes:

| Pattern | Matches |
|---|---|
| `swarm:execute` | Exact match |
| `tool:*` | Wildcard — matches any tool resource |
| `swarm:execute:sales-*` | Prefix wildcard |
| `agent:[a-z]+-agent` | Regex (any pattern with `*`, `?`, or `[`) |

---

### Policy Scope

A policy applies to an agent if **any** of the following is true:
- The policy explicitly names the agent in its `agents` M2M list
- The policy names one of the agent's roles in its `roles` M2M list
- The policy has **no** agents and **no** roles assigned (global policy — applies to everyone)

---

### Evaluation Order

1. Retrieve all applicable policies for the agent, sorted by `priority` descending
2. For each policy, check resource pattern match
3. If matched, evaluate all conditions
4. Apply the effect of the first matching policy
5. If effect is `DENY`, stop immediately and return deny
6. If no policy matches, the default is `DENY` with reason "No applicable policy found"

> This is **default-deny**. Without at least one matching ALLOW policy, all requests are blocked.

---

## Default Policies

`python manage.py default_policies` seeds four global ALLOW policies:

| Policy | Resources |
|---|---|
| Global Allow - Swarm Dispatch | `swarm:execute`, `swarm:execute:*` |
| Global Allow - Agent Execution | `agent:execute` |
| Global Allow - Tool Access | `tool:*` |
| Global Allow - Workflow Execution | `workflow:execute`, `workflow:create` |

These are permissive defaults for development. In production, run `--env production` to skip these and create explicit ALLOW policies for each agent/role instead.

---

## Policy Examples

### Allow a specific agent to run only during business hours
```json
{
  "name": "Finance Agent - Business Hours Only",
  "resources": ["swarm:execute:finance-*", "agent:execute"],
  "effect": "DENY",
  "priority": 20,
  "is_active": true,
  "conditions": [
    {"field": "context.hour", "operator": "gt", "value": "18"}
  ]
}
```

### Block all agents from using external API tools in production
```json
{
  "name": "No External APIs in Production",
  "resources": ["tool:external-api", "tool:web-fetch", "tool:web-search"],
  "effect": "DENY",
  "priority": 100,
  "risk_level": 90,
  "is_active": true,
  "conditions": [
    {"field": "context.environment", "operator": "eq", "value": "prod"}
  ]
}
```

### Require human approval before any database write
```json
{
  "name": "Escalate Database Writes",
  "resources": ["tool:database"],
  "effect": "ESCALATE",
  "priority": 50,
  "risk_level": 70,
  "is_active": true,
  "conditions": [
    {"field": "context.action", "operator": "in", "value": ["write", "delete", "update"]}
  ]
}
```

### Cap an agent's monthly call budget (via max_calls)
```json
{
  "name": "Marketing Agent Call Cap",
  "resources": ["swarm:execute:marketing-*"],
  "effect": "DENY",
  "priority": 30,
  "max_calls": 1000,
  "is_active": true
}
```

### Audit all activity by executive agents without blocking
```json
{
  "name": "Audit Executive Agents",
  "resources": ["*"],
  "effect": "AUDIT",
  "priority": 0,
  "risk_level": 20,
  "is_active": true
}
```

---

## Audit Logs

Every policy evaluation — whether ALLOW, DENY, AUDIT, or ESCALATE — creates an immutable `PolicyAuditLog` record:

```json
{
  "id": "uuid",
  "agent": "uuid",
  "policy": "uuid",
  "resource": "swarm:execute",
  "action": "dispatch:sales-account-strategist",
  "decision": "ALLOW",
  "reason": "Policy 'Global Allow - Swarm Dispatch' applied",
  "risk_level": 0,
  "execution_time_ms": 4,
  "request_data": {
    "execution_id": "...",
    "task": "Research enterprise prospects...",
    "engine": "claude"
  },
  "ip_address": "127.0.0.1",
  "created_at": "2025-04-18T10:01:23Z"
}
```

Audit logs are append-only and are never modified or deleted by the system. They are the authoritative record for compliance reporting.

---

## ESCALATE Flow

When a policy has effect `ESCALATE`:

1. AOS creates a `PendingAction` linked to the execution context
2. The swarm bridge returns `{"decision": "escalate", "pending_action_id": "uuid"}`
3. The swarm can poll `GET /api/swarm/executions/{id}/` to check for a resolution
4. A human reviews the pending action at `GET /api/intelligence/pending-actions/`
5. The human approves or denies via `POST /api/intelligence/pending-actions/{id}/approve/`
6. The swarm resumes or aborts based on the decision

---

## Compliance Templates

The following policy templates map to common regulatory frameworks. Apply them to create a baseline compliance posture.

### HIPAA (Healthcare)
```json
[
  {
    "name": "HIPAA - No PHI in External Tools",
    "resources": ["tool:web-fetch", "tool:external-api"],
    "effect": "DENY",
    "priority": 200,
    "conditions": [{"field": "context.contains_phi", "operator": "eq", "value": "true"}]
  },
  {
    "name": "HIPAA - Audit All Patient Data Access",
    "resources": ["tool:database", "knowledge:query"],
    "effect": "AUDIT",
    "priority": 100
  }
]
```

### SOX (Financial)
```json
[
  {
    "name": "SOX - Escalate Financial Report Modifications",
    "resources": ["tool:finance-api", "agent:execute"],
    "effect": "ESCALATE",
    "priority": 150,
    "conditions": [{"field": "context.action", "operator": "in", "value": ["modify", "delete", "override"]}]
  }
]
```

### PCI-DSS (Payment)
```json
[
  {
    "name": "PCI - Block Card Data in Logs",
    "resources": ["tool:*", "agent:execute"],
    "effect": "DENY",
    "priority": 999,
    "conditions": [{"field": "context.contains_pci_data", "operator": "eq", "value": "true"}]
  }
]
```

> These are starter templates. Your compliance team should review and adapt them to your specific environment.
