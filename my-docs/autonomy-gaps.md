# Autonomy Gaps

This is the blunt list of what is still missing before AOS can honestly claim that it runs a startup autonomously.

## Already working

- swarm runs can start and persist
- marketing/social posting exists through Upload-Post
- sales/support ops objects exist
- queue fallback exists for missing vendor creds
- billing and usage are visible
- scheduled jobs retry
- the frontend exposes operator surfaces

## What is still missing

### 1. First-class project tenancy

Users need to create a project and operate everything inside it.

Missing:

- `Project` model
- project-scoped workflows
- project-scoped budgets
- project-scoped permissions
- project-scoped memory
- project dashboard

### 2. Product engineering autonomy

AOS still needs to reliably go from goal to shipped code.

Missing:

- project brief intake
- roadmap generation
- backlog planning
- task decomposition into code changes
- automatic test execution and repair
- release verification
- rollback-aware shipping flow

### 3. Marketing autonomy

The platform can generate content and post some content, but it still needs a full growth loop.

Missing:

- campaign planning
- audience/ICP management
- content calendar
- scheduled publishing with durable state
- performance tracking by campaign
- feedback loop from results to next actions

### 4. Sales autonomy

The ops loop exists, but it still needs live production validation and stronger automation.

Missing:

- live CRM sync with real credentials
- lead scoring and routing
- outreach sequencing
- reply classification
- meeting booking follow-up
- opportunity progression automation
- closed-loop revenue attribution

### 5. Support autonomy

The support pipeline exists, but it is not yet a full customer success system.

Missing:

- real ticketing round trips with vendor validation
- classification and prioritization
- response drafting plus approval policies
- SLA tracking
- escalation to humans
- customer health / churn risk tracking

### 6. Finance autonomy

Current finance features are useful, but not enough for full operational control.

Missing:

- real invoice lifecycle integration
- collections and overdue follow-up automation
- cashflow forecasting
- budget enforcement per project
- revenue vs spend reporting
- payment exception handling

### 7. True decision loop

AOS still needs a reliable loop that can:

- observe
- decide
- act
- verify
- recover
- explain

Missing:

- durable action ledger across all domains
- policy-aware execution planner
- cross-domain memory of decisions
- automatic exception handling
- rollback and rollback verification

### 8. Trust and safety

Autonomy is only real if guardrails are enforced.

Missing:

- project-level permission policies
- publish gates
- spend gates
- destructive action controls
- audit replay for every external side effect
- sandbox vs prod separation per project

## What blocks the “runs a company by itself” claim

The system cannot yet prove all of these at once:

- a user creates a startup project
- AOS plans the work
- AOS ships product work
- AOS markets the product
- AOS sells the product
- AOS supports customers
- AOS tracks revenue and spend
- AOS recovers from failures without manual glue
- AOS keeps durable history of every action

Until that loop exists, the claim should be:

> AOS is an advanced autonomous ops and orchestration platform with real company-running components, not a fully autonomous company OS.

## Linked docs

- [My Docs index](./index.md)
- [Project Model](./project-model.md)
- [Implementation Plan](./implementation-plan.md)
