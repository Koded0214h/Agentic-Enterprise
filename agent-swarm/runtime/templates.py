"""
AOS Workflow Templates — canned multi-agent DAGs the user can launch in one click.

Each template returns a TaskGraph built from the user's idea. The frontend
posts the idea to /api/swarm/workflows/templates/<id>/launch/ and that endpoint
materialises the graph and starts execution.
"""
from __future__ import annotations

from .orchestration import TaskGraph, TaskNode


# ---------------------------------------------------------------------------
# Launch SaaS MVP in 72 hours — 5 coordinated agents
# ---------------------------------------------------------------------------

def launch_saas_mvp(idea: str, *, permissions: list[str] | None = None) -> TaskGraph:
    """
    A 5-agent DAG that takes a one-line SaaS idea and produces:
      1. Planner          — decomposes the idea, names features, picks stack
      2. Backend architect — designs Django models, endpoints, jobs
      3. Frontend architect — designs React routes, components, state model
      4. DevOps           — deploy plan: Dockerfile, Render/Vercel config, CI
      5. Launch marketer   — landing copy, pricing tiers, launch tweet

    Topology:

        ┌───────────┐
        │  Planner  │  (root — runs first)
        └─────┬─────┘
              │
        ┌─────┼──────┐──────────────┐
        ▼     ▼      ▼              ▼
      Backend Frontend DevOps    Marketing
       (architect) (architect)  (each consumes planner output in parallel)

    All four downstream agents run in parallel after the planner finishes,
    each receiving the planner's output as upstream context.
    """
    perms = permissions or [
        "file.read", "file.write", "shell.run",
        "github.read", "github.write",
    ]

    g = TaskGraph()

    g.add(TaskNode(
        id="plan",
        agent_name="planner",
        agent_category="strategy",
        task=(
            f"You are kicking off a 72-hour SaaS MVP build for this idea:\n\n"
            f"  '{idea}'\n\n"
            "Produce a tight execution plan with these sections, in order:\n"
            "  1. PROBLEM — what user pain is this solving (3 sentences max)\n"
            "  2. CORE LOOP — the single repeating user action this product enables\n"
            "  3. MVP SCOPE — the 5 features that MUST ship in 72h, no more\n"
            "  4. OUT OF SCOPE — features explicitly cut for v0 (so downstream agents don't build them)\n"
            "  5. TECH STACK — backend, frontend, DB, deploy target (be opinionated, pick fast defaults)\n"
            "  6. DATA MODEL — list of entities and their key fields\n"
            "  7. ROUTES — list of API endpoints + frontend routes\n"
            "  8. SUCCESS METRIC — one number that proves the MVP works\n\n"
            "Be specific and decisive. Downstream agents will execute against this plan verbatim."
        ),
        permissions=perms,
        timeout_seconds=300,
    ))

    g.add(TaskNode(
        id="backend",
        agent_name="engineering-backend-architect",
        agent_category="engineering",
        task=(
            f"Building the backend for this SaaS MVP: '{idea}'\n\n"
            "Use the planner's output above (DATA MODEL + ROUTES sections).\n\n"
            "Produce:\n"
            "  - The full Django app layout (apps, models, serializers, views, urls)\n"
            "  - Model definitions as Python code blocks\n"
            "  - API endpoint signatures with example request/response\n"
            "  - Authentication approach (JWT via simplejwt is fine)\n"
            "  - Background jobs needed (Celery tasks)\n"
            "  - The `requirements.txt` lines you need\n\n"
            "Match the data model the planner specified. Don't invent new entities."
        ),
        depends_on=["plan"],
        permissions=perms,
        timeout_seconds=600,
    ))

    g.add(TaskNode(
        id="frontend",
        agent_name="engineering-frontend-developer",
        agent_category="engineering",
        task=(
            f"Building the React frontend for this SaaS MVP: '{idea}'\n\n"
            "Use the planner's output above (ROUTES + CORE LOOP sections).\n\n"
            "Produce:\n"
            "  - Top-level route structure (use react-router)\n"
            "  - Component tree for each route, naming files\n"
            "  - State management approach (Context vs. Zustand vs. server state)\n"
            "  - The 3 most important pages described in detail (hero/landing, signup, the core-loop page)\n"
            "  - One representative React component as a code block\n"
            "  - Required npm dependencies\n\n"
            "Match the API endpoints the backend agent specified. Don't drift from the plan."
        ),
        depends_on=["plan"],
        permissions=perms,
        timeout_seconds=600,
    ))

    g.add(TaskNode(
        id="devops",
        agent_name="devops",
        agent_category="engineering",
        task=(
            f"Producing the deployment plan for this SaaS MVP: '{idea}'\n\n"
            "Use the planner's output (TECH STACK section) and the backend/frontend "
            "decisions above.\n\n"
            "Produce:\n"
            "  - A Dockerfile for the backend (multi-stage, slim)\n"
            "  - A docker-compose.yml for local dev (backend + postgres + redis)\n"
            "  - Deploy plan: backend → Render, frontend → Vercel\n"
            "  - The Render render.yaml or build/start commands\n"
            "  - Vercel build settings (build command, output dir, env vars)\n"
            "  - A minimal GitHub Actions workflow that runs tests + builds on PR\n"
            "  - The env vars the operator must set on each platform\n\n"
            "Optimise for 'works in production by hour 48 of the 72'."
        ),
        depends_on=["plan"],
        permissions=perms,
        timeout_seconds=600,
    ))

    g.add(TaskNode(
        id="marketing",
        agent_name="marketing-content-creator",
        agent_category="marketing",
        task=(
            f"Producing launch marketing for this SaaS MVP: '{idea}'\n\n"
            "Use the planner's PROBLEM and CORE LOOP as the foundation.\n\n"
            "Produce:\n"
            "  - Landing page hero (headline, subhead, primary CTA, 3 trust badges)\n"
            "  - 3 feature blocks with short benefit-oriented copy (50 words each)\n"
            "  - Pricing tiers (3 tiers — name, price, what's included)\n"
            "  - A launch tweet (240 chars) for posting to X\n"
            "  - A Product Hunt launch description (260 chars)\n"
            "  - 5 social proof / FAQ items to add below pricing\n\n"
            "Write in active voice. No hype words ('revolutionary', 'next-gen', 'AI-powered'). "
            "Be specific about who this is for and what changes for them once they use it."
        ),
        depends_on=["plan"],
        permissions=perms,
        timeout_seconds=600,
    ))

    return g


# Registry — keep templates discoverable by id
TEMPLATES = {
    "saas-mvp-72h": {
        "name": "Launch SaaS MVP in 72 hours",
        "description": "5 coordinated agents — planner → backend, frontend, devops, marketing in parallel.",
        "agents": 5,
        "estimated_minutes": 8,
        "build": launch_saas_mvp,
    },
}


def get_template(template_id: str):
    return TEMPLATES.get(template_id)
