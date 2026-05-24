# AOS 3-SWE Execution Plan

This document splits the next build into 3 parallel software-engineering tracks.

## Goal

Turn AOS into a project-based startup operating system where a user can:

- create a project
- treat that project as a startup
- run product, marketing, sales, support, and finance workflows inside it
- see durable state, queue status, and external connector health

## Team

- Koded: Backend platform and project model
- Anas & Fazazi: Ops/connector integrations and durable business workflows
- Abideen: Frontend dashboard and operator experience

## Status

The Koded lane is now implemented in-repo:

- project boundary and membership model
- project-scoped billing, policy, swarm, intelligence, and ops records
- project dashboard and command-center routing
- project-aware policy evaluation and audit logging
- project budgets, goals, activities, and artifacts

## Working rules

- Every feature gets a 2-day deadline.
- Each feature must ship with tests or verifiable build output.
- No feature is “done” until it has a clear data model, API surface, and visible user-facing output if applicable.
- When a feature depends on another feature, the dependency must be called out explicitly.

## Sprint 1: Foundation

### Koded: Project foundation

Feature: `Project` model and project-scoped API

- Deadline: Day 2
- Build:
  - `Project` model
  - project create/list/detail/update/archive endpoints
  - project ownership and membership
  - project-scoped budgets and policy references
  - project activity log seed
- Done when:
  - a user can create a project
  - projects are persisted
  - API responses include project metadata and ownership

Feature: project-scoped workspace links

- Deadline: Day 4
- Build:
  - link projects to workflow runs
  - link projects to artifacts/files
  - link projects to swarm executions
  - link projects to finance/usage summaries
- Done when:
  - a project can be selected as the operating boundary for new work

### Anas: Ops core

Feature: sales/support ops objects under project ownership

- Deadline: Day 2
- Build:
  - project-owned `Account`
  - project-owned `Lead`
  - project-owned `Opportunity`
  - project-owned `Ticket`
  - project-owned `Touchpoint`
  - project-owned `QueueItem`
- Done when:
  - all ops records are tied to a project
  - nothing lands in a global bucket by default

Feature: queue processor and fallback bridge

- Deadline: Day 4
- Build:
  - queue processor for pending work
  - retry state
  - webhook/email fallback dispatch
  - sync status persistence
- Done when:
  - lead/ticket creation can sync or fail over cleanly
  - queue state is durable and visible

### Abideen: Frontend shell

Feature: project dashboard shell

- Deadline: Day 2
- Build:
  - project list page
  - project detail page
  - create project modal/form
  - project navigation entry in the shell
- Done when:
  - a user can create and open a project from the UI

Feature: ops dashboard for project context

- Deadline: Day 4
- Build:
  - project-specific ops view
  - sales/support counters
  - connector health display
  - queue health display
- Done when:
  - the dashboard clearly shows what is running inside the selected project

## Sprint 2: Autonomy loop

### Koded: Product execution loop

Feature: startup goal intake

- Deadline: Day 6
- Build:
  - project goal model
  - goal intake form
  - goal status tracking
  - goal to workflow linkage
- Done when:
  - a user can define a startup objective inside a project

Feature: workflow orchestration by project

- Deadline: Day 8
- Build:
  - project-scoped workflow launch
  - workflow run history
  - trace linking to project
  - execution replay hook
- Done when:
  - workflows are attributable to a project and can be replayed

### Anas: Sales/support round trip

Feature: live CRM adapter validation

- Deadline: Day 6
- Build:
  - HubSpot adapter tests
  - Salesforce adapter tests
  - external ID persistence
  - sync failure handling
- Done when:
  - CRM sync can be proven with mocks and configuration

Feature: live support adapter validation

- Deadline: Day 8
- Build:
  - Zendesk adapter tests
  - Intercom adapter tests
  - reply flow
  - escalation flow
- Done when:
  - support records can round-trip and update state correctly

### Abideen: Autonomy UX

Feature: project activity timeline

- Deadline: Day 6
- Build:
  - timeline of runs
  - timeline of queue events
  - timeline of sales/support actions
  - timeline of approvals
- Done when:
  - operators can see what the system did without opening logs

Feature: autonomy readiness panel

- Deadline: Day 8
- Build:
  - readiness score
  - missing-capability flags
  - risky-action warnings
  - project health summary
- Done when:
  - the UI tells the truth about how autonomous the project really is

## Sprint 3: Company loops

### Koded: Finance and policy

Feature: project budgets and spend enforcement

- Deadline: Day 10
- Build:
  - project budget model
  - budget alerts
  - budget limit enforcement
  - spend summary by project
- Done when:
  - every major project action can be budget-checked

Feature: project policy gates

- Deadline: Day 12
- Build:
  - publish approval rules
  - destructive action rules
  - vendor access rules
  - external side-effect audit logs
- Done when:
  - autonomy is gated, not implied

### Anas: Marketing loop

Feature: campaign planning and publishing

- Deadline: Day 10
- Build:
  - campaign objects
  - content calendar
  - Upload-Post publishing integration
  - analytics ingestion
- Done when:
  - a project can schedule and publish marketing output end to end

Feature: campaign measurement feedback

- Deadline: Day 12
- Build:
  - performance summary
  - engagement tracking
  - next-action suggestions
  - failed-post retry handling
- Done when:
  - marketing actions feed back into planning

### Abideen: Company command center

Feature: unified project command center

- Deadline: Day 10
- Build:
  - project overview header
  - workstreams panel
  - queue panel
  - budget panel
  - connector panel
- Done when:
  - one page shows the whole startup state

Feature: autonomy controls

- Deadline: Day 12
- Build:
  - pause/resume project automation
  - manual intervention buttons
  - approval inbox by project
  - error recovery actions
- Done when:
  - a human can safely steer the project without breaking state

## Hard blockers to full autonomy

These are the items that still prevent AOS from honestly claiming it runs a company by itself:

1. First-class project tenancy across all modules
2. Durable action ledger for every external side effect
3. Real production-tested CRM and support connectors
4. Product execution loop from goal to shipped artifact
5. Marketing loop from campaign to measurement to adjustment
6. Finance loop with real collections and budget enforcement
7. Policy and approval gates per project
8. Full audit replay and rollback for external actions
9. A single startup command center that shows truth, not guesses

## Definition of done for the whole system

AOS is at the vision line when:

- a user creates a project
- the project behaves like a startup
- AOS plans and executes work inside that project
- AOS can sell, support, market, and measure outcomes
- AOS enforces budgets and policies
- AOS can recover from failures
- AOS keeps durable history of everything it did
