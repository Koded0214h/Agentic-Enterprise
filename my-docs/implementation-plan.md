# Implementation Plan

This is the build order for turning AOS into a project-based startup operating system.

## Phase 1: Project foundation

Build the minimum project object and UI.

Add:

- `Project` model
- project create/edit/archive flows
- project dashboard
- project-scoped settings
- project-level budget and policy records
- project activity log

Why first:

- everything else needs a startup boundary
- project state becomes the canonical source of truth

## Phase 2: Project-scoped execution

Make every operational action happen inside a project.

Add:

- project-owned swarm runs
- project-owned marketing campaigns
- project-owned sales pipelines
- project-owned tickets
- project-owned finance records
- project-owned artifacts and files

## Phase 3: Company loops

Close the actual loops.

Add:

- product planning -> execution -> test -> ship
- marketing planning -> publish -> measure -> adjust
- sales lead -> outreach -> reply -> meeting -> deal
- support ticket -> classify -> answer -> escalate -> resolve
- finance invoice -> collect -> reconcile -> report

## Phase 4: Autonomy gates

Make the system safe enough to act with less supervision.

Add:

- policy engine checks per project
- spend limits
- publish approvals
- destructive action approvals
- vendor credential health checks
- retry and rollback policies

## Phase 5: Evidence and reporting

Make the platform prove what it did.

Add:

- action ledger
- project timeline
- external side-effect audit log
- company health summary
- autonomy readiness score

## Recommended build order

1. `Project` model and API
2. project dashboard
3. project-scoped workflow runs
4. project-scoped ops objects
5. durable action ledger
6. real CRM/ticketing round trips
7. autonomy gates
8. reporting and readiness scoring

## Acceptance criteria

A project is considered operational only when:

- it has an owner
- it has a budget
- it has policies
- it has startup goals
- it can launch workflows
- it can record sales/support activity
- it can schedule and retry tasks
- it can show what happened without guesswork

## Linked docs

- [My Docs index](./index.md)
- [Project Model](./project-model.md)
- [Autonomy Gaps](./autonomy-gaps.md)
