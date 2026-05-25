# Project Model

The product should treat a **project** as the primary unit of operation.

A project is not just a folder.
A project is a startup.

## Definition

Each project should contain:

- identity
- owner and collaborators
- startup thesis
- goals and milestones
- products and offers
- tasks and workflows
- budgets and spend limits
- sales pipeline
- support queue
- marketing calendar
- operational policies
- activity log
- artifacts and outputs

## Why this matters

Today, AOS has many capabilities but they are spread across:

- workspace settings
- agent runs
- swarm executions
- billing
- observability
- the new ops layer

That is enough for orchestration.
It is not yet enough for a user to say:

> "This is my startup. Run it."

The project needs to become the place where the system keeps the truth.

## Recommended product shape

### 1. Project

The top-level tenant object.

Fields:

- name
- slug
- owner
- status
- description
- vision
- target market
- stage
- operating mode
- budget
- created_at

### 2. Startup workspace

Each project gets a working space for:

- code
- documents
- memory
- generated assets
- logs
- artifacts

### 3. Operating domains

Inside the project, AOS should manage these domains:

- product engineering
- marketing
- sales
- support
- finance
- operations

### 4. Policies and gates

Each project should define:

- what agents may do without approval
- what requires human review
- what requires budget checks
- what may publish externally

## User story

1. User creates a project.
2. User describes the startup and goal.
3. AOS generates the operating setup for that project.
4. AOS assigns agents and tools.
5. AOS runs workflows inside the project boundary.
6. AOS logs every action back to that project.

## Current gap

The current codebase does **not** yet expose a first-class `Project` model and project dashboard that unify all operations under one startup entity.

The repo has pieces of the behavior, but not the object model.

## Linked docs

- [My Docs index](./index.md)
- [Autonomy Gaps](./autonomy-gaps.md)
- [Implementation Plan](./implementation-plan.md)
