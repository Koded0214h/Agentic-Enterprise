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
            "Use the planner's TECH STACK section AND the backend/frontend architect "
            "outputs above to produce a deployment plan that matches the actual stack chosen.\n\n"
            "Produce:\n"
            "  - A Dockerfile for the backend (multi-stage, slim)\n"
            "  - A docker-compose.yml for local dev (backend + postgres + redis)\n"
            "  - Deploy plan: backend → Render, frontend → Vercel\n"
            "  - The Render render.yaml or build/start commands\n"
            "  - Vercel build settings (build command, output dir, env vars)\n"
            "  - A minimal GitHub Actions workflow that runs tests + builds on PR\n"
            "  - The env vars the operator must set on each platform\n\n"
            "Match the framework the backend architect actually specified. "
            "Optimise for 'works in production by hour 48 of the 72'."
        ),
        depends_on=["plan", "backend", "frontend"],
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
        depends_on=["plan", "backend"],
        permissions=perms,
        timeout_seconds=600,
    ))

    return g


# ---------------------------------------------------------------------------
# Launch & Grow — full GTM + ongoing ops for any startup idea
# ---------------------------------------------------------------------------

def launch_and_grow(idea: str, *, permissions: list[str] | None = None) -> TaskGraph:
    """
    8-agent DAG that takes any startup idea and produces a complete
    go-to-market operation — content, social, sales, email, ads, and
    wires up recurring autonomous agent jobs so it keeps running.

    Topology:

        ┌─────────────────────┐
        │   GTM Strategist    │  (root — ICP, positioning, channels, 90-day plan)
        └──────────┬──────────┘
                   │
        ┌──────────┼──────────┬──────────────────┐
        ▼          ▼          ▼                   ▼
    Content    SEO Agent  Competitor         ICP Profile
    Calendar               Research           + Persona
        │          │          │                   │
        └──────────┴──────────┴───────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                     ▼
    Social Posts        Sales Outreach        Email Sequences
    (2-week calendar)   (5-email sequence)    (welcome + nurture)
        │                    │                     │
        └────────────────────┴─────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Paid Media     │  (ad creative briefs + targeting)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Ops Scheduler  │  (sets up all recurring agent jobs)
                    └─────────────────┘
    """
    perms = permissions or [
        "file.read", "file.write",
        "web.read", "web.browser",
        "social.read", "social.write",
        "messaging.write",
        "ads.read", "ads.write",
        "scheduler.read", "scheduler.write",
    ]

    g = TaskGraph()

    # ── 1. GTM Strategy (root) ──────────────────────────────────────────────
    g.add(TaskNode(
        id="strategy",
        agent_name="planner",
        agent_category="strategy",
        task=(
            f"You are the GTM strategist for a new startup:\n\n  '{idea}'\n\n"
            "Produce a tight go-to-market strategy document with these sections:\n\n"
            "  1. TARGET CUSTOMER — ICP in one sentence, then 3 bullet pains they have TODAY\n"
            "  2. POSITIONING — one-liner that completes: 'For [who], [product] is the [category] "
            "that [benefit], unlike [alternative].'\n"
            "  3. PRIMARY CHANNELS — rank the top 3 acquisition channels with WHY each fits this ICP\n"
            "  4. CONTENT PILLARS — 3 themes every piece of content should hit\n"
            "  5. COMPETITIVE LANDSCAPE — 3 direct competitors, their weakness, our edge\n"
            "  6. 90-DAY PLAN — weeks 1-4 (foundation), 5-8 (launch), 9-12 (scale) with one "
            "measurable goal per phase\n"
            "  7. NORTH STAR METRIC — the single number that proves this is working\n\n"
            "Be decisive and specific. Every downstream agent will execute against this."
        ),
        permissions=perms,
        timeout_seconds=180,
    ))

    # ── 2. Content calendar + SEO + competitor research (parallel) ──────────
    g.add(TaskNode(
        id="content_calendar",
        agent_name="marketing-content-creator",
        agent_category="marketing",
        task=(
            f"Building a 30-day content calendar for: '{idea}'\n\n"
            "Use the GTM strategy above (CONTENT PILLARS + PRIMARY CHANNELS + ICP).\n\n"
            "Produce:\n"
            "  - A 30-day editorial calendar as a markdown table: Day | Platform | Format | "
            "Topic | Hook (first line) | CTA\n"
            "  - 5 full-length LinkedIn posts (400-600 words each) on the highest-impact topics\n"
            "  - 10 tweet threads (7 tweets each) — one per week for the first 10 weeks\n"
            "  - 3 email newsletter issues (subject line + full body, ~500 words each)\n"
            "  - 2 long-form blog post outlines (title, H2s, key points per section)\n\n"
            "Write for the ICP the strategist defined. Use the content pillars. "
            "Make every hook specific and non-generic — no 'In today's world...' openers."
        ),
        depends_on=["strategy"],
        permissions=perms,
        timeout_seconds=600,
    ))

    g.add(TaskNode(
        id="seo",
        agent_name="marketing-seo-specialist",
        agent_category="marketing",
        task=(
            f"SEO strategy and content for: '{idea}'\n\n"
            "Use the GTM strategy above (TARGET CUSTOMER + CONTENT PILLARS).\n\n"
            "Produce:\n"
            "  - Primary keyword: the one term this startup must rank for (explain why)\n"
            "  - 20 long-tail keywords grouped into 4 clusters — include search intent for each\n"
            "  - 3 complete SEO blog posts: title, meta description, full body (800-1200 words), "
            "internal link suggestions, and a CTA at the end\n"
            "  - On-page SEO checklist for the landing page (title tag, H1, meta, schema)\n"
            "  - Link-building targets: 10 sites/publications where a backlink would be realistic\n\n"
            "Write posts that answer real search queries, not just stuff keywords in."
        ),
        depends_on=["strategy"],
        permissions=perms,
        timeout_seconds=600,
    ))

    g.add(TaskNode(
        id="competitor_intel",
        agent_name="product-trend-researcher",
        agent_category="strategy",
        task=(
            f"Competitive intelligence deep-dive for: '{idea}'\n\n"
            "Use the COMPETITIVE LANDSCAPE section from the GTM strategy above.\n\n"
            "For each of the 3 competitors:\n"
            "  - Pricing model and tiers (exact prices if findable)\n"
            "  - Top 3 customer complaints (from G2, Capterra, Twitter, Reddit)\n"
            "  - Messaging angles they own — and angles they're ignoring\n"
            "  - Estimated monthly traffic and top traffic sources\n\n"
            "Then produce:\n"
            "  - Battle card: one page per competitor for the sales team\n"
            "  - 3 positioning gaps we can exploit immediately\n"
            "  - Suggested counter-messaging for each competitor's strongest claim"
        ),
        depends_on=["strategy"],
        permissions=perms,
        timeout_seconds=300,
    ))

    # ── 3. Social posts + Sales outreach + Email sequences (parallel) ───────
    g.add(TaskNode(
        id="social_posts",
        agent_name="marketing-social-media-strategist",
        agent_category="marketing",
        task=(
            f"Social media execution pack for: '{idea}'\n\n"
            "Use the content calendar above AND the GTM strategy.\n\n"
            "Produce:\n"
            "  - 14-day posting schedule: exact post text for Twitter, LinkedIn, and Instagram "
            "(one per platform per day = 42 posts total)\n"
            "  - For Twitter: mix of threads, single tweets, reply-bait questions\n"
            "  - For LinkedIn: professional thought leadership, behind-the-scenes, customer POV\n"
            "  - For Instagram: visual concept description + caption + 10 hashtags per post\n"
            "  - 5 viral-hook templates specific to this product's ICP\n"
            "  - Community engagement script: 10 comments to leave on competitor posts/industry threads\n\n"
            "Then call scheduler.create_task to set up:\n"
            "  - Daily social post job: 'Post today's scheduled social content for [idea]' "
            "on agent marketing-social-media-strategist, schedule '0 9 * * *'\n"
            "  - Weekly engagement job: 'Engage with 10 industry posts and reply to all mentions' "
            "on agent marketing-twitter-engager, schedule '0 10 * * 1'"
        ),
        depends_on=["strategy", "content_calendar"],
        permissions=perms,
        timeout_seconds=600,
    ))

    g.add(TaskNode(
        id="sales_outreach",
        agent_name="sales-outbound-strategist",
        agent_category="sales",
        task=(
            f"Sales outreach system for: '{idea}'\n\n"
            "Use the ICP and positioning from the GTM strategy above.\n\n"
            "Produce:\n"
            "  - 5-touch cold email sequence (subject + body for each, 3-5 days apart):\n"
            "    Touch 1: Pattern interrupt — lead with their pain, not your product\n"
            "    Touch 2: Social proof / case study angle\n"
            "    Touch 3: Insight or data they'd find valuable\n"
            "    Touch 4: Direct ask with specific value prop\n"
            "    Touch 5: Breakup email (low-pressure, leave door open)\n"
            "  - LinkedIn outreach sequence (connection request + 2 follow-up messages)\n"
            "  - Lead qualification script: 5 questions to ask on a discovery call\n"
            "  - Objection handling guide: top 5 objections + response for each\n"
            "  - 10 ideal prospect titles + where to find them (subreddits, LinkedIn groups, etc.)\n\n"
            "Every email must sound human and specific — no 'I hope this finds you well'."
        ),
        depends_on=["strategy", "competitor_intel"],
        permissions=perms,
        timeout_seconds=600,
    ))

    g.add(TaskNode(
        id="email_sequences",
        agent_name="marketing-content-creator",
        agent_category="marketing",
        task=(
            f"Email marketing sequences for: '{idea}'\n\n"
            "Use ICP, positioning, and content pillars from the GTM strategy above.\n\n"
            "Produce:\n"
            "  - Welcome sequence (7 emails, one per day after signup):\n"
            "    Day 1: Welcome + what to expect\n"
            "    Day 2: Quick win — the one thing to do first\n"
            "    Day 3: Social proof — how others use it\n"
            "    Day 4: Feature spotlight — the thing they haven't tried yet\n"
            "    Day 5: Education — teaches something valuable without pitching\n"
            "    Day 6: Community / resource\n"
            "    Day 7: Upgrade / referral ask\n"
            "  - Nurture sequence (4 emails, bi-weekly) for users who haven't converted\n"
            "  - Win-back sequence (3 emails) for churned users\n"
            "  - Each email: subject line, preview text, full body, CTA\n\n"
            "Then call scheduler.create_task to set up:\n"
            "  - Weekly newsletter job: 'Write and send this week's newsletter for [idea] subscribers' "
            "on agent marketing-content-creator, schedule '0 8 * * 2'"
        ),
        depends_on=["strategy", "content_calendar"],
        permissions=perms,
        timeout_seconds=600,
    ))

    # ── 4. Paid media ────────────────────────────────────────────────────────
    g.add(TaskNode(
        id="paid_media",
        agent_name="paid-media-creative-strategist",
        agent_category="paid-media",
        task=(
            f"Paid media strategy and creative briefs for: '{idea}'\n\n"
            "Use the ICP, competitor intel, and positioning from above.\n\n"
            "Produce:\n"
            "  - Channel recommendation: which paid channels to start with and why "
            "(Meta, Google Search, LinkedIn Ads, Reddit Ads — rank them)\n"
            "  - Meta Ads: 3 campaign briefs (audience targeting, objective, budget range, "
            "3 ad variations per brief with headline + body + CTA)\n"
            "  - Google Search: 10 high-intent keywords + 3 responsive search ad sets\n"
            "  - Creative hook matrix: 5 angles × 3 formats (static image, carousel, video script)\n"
            "  - $1,000/month budget allocation across channels\n"
            "  - KPIs and what 'good' looks like for each channel at this stage\n\n"
            "Then call ads.create_campaign to create the first Meta campaign in PAUSED status "
            "with the top campaign brief (so it's ready to activate when the team is ready)."
        ),
        depends_on=["strategy", "competitor_intel", "social_posts"],
        permissions=perms,
        timeout_seconds=600,
    ))

    # ── 5. Ops scheduler (final node) ────────────────────────────────────────
    g.add(TaskNode(
        id="ops_scheduler",
        agent_name="marketing-growth-hacker",
        agent_category="marketing",
        task=(
            f"Setting up autonomous operations for: '{idea}'\n\n"
            "You have the full GTM strategy, content calendar, social posts, sales outreach, "
            "email sequences, and paid media plan from the agents above.\n\n"
            "Your job: wire up the recurring agent automation so everything runs without manual input.\n\n"
            "Call scheduler.create_task for each of these recurring jobs:\n\n"
            "  1. name='Daily content post', schedule='0 9 * * *', "
            "agent='marketing-social-media-strategist', "
            "task='Post today scheduled social content. Check the content calendar and post the "
            "appropriate content for today across Twitter, LinkedIn, Instagram.'\n\n"
            "  2. name='Weekly SEO blog post', schedule='0 8 * * 1', "
            "agent='marketing-seo-specialist', "
            "task='Write and publish one SEO-optimized blog post based on the keyword calendar. "
            "Focus on the highest-priority keyword this week.'\n\n"
            "  3. name='Daily sales outreach batch', schedule='0 7 * * 1-5', "
            "agent='sales-outbound-strategist', "
            "task='Send today outreach batch: 10 personalized cold emails and 5 LinkedIn connection "
            "requests to qualified prospects matching the ICP.'\n\n"
            "  4. name='Weekly performance report', schedule='0 9 * * 5', "
            "agent='marketing-growth-hacker', "
            "task='Pull analytics from all channels (social, email, ads), identify what worked "
            "and what did not this week, and send a summary report via messaging.send to Slack.'\n\n"
            "  5. name='Monthly competitor scan', schedule='0 10 1 * *', "
            "agent='product-trend-researcher', "
            "task='Run a full competitor monitoring pass: check competitors pricing pages, "
            "new features, social posts, and job listings. Report any significant changes.'\n\n"
            "After creating all jobs, call scheduler.list_tasks to confirm they were set up, "
            "then write a OPERATIONS RUNBOOK file to the workspace with:\n"
            "  - All scheduled jobs and what they do\n"
            "  - What API keys need to be set (TWITTER_API_KEY, SENDGRID_API_KEY, etc.)\n"
            "  - How to pause/resume any job\n"
            "  - The manual override commands\n"
            "  - First 7 days checklist: what to do before turning on automation"
        ),
        depends_on=["social_posts", "sales_outreach", "email_sequences", "paid_media"],
        permissions=perms,
        timeout_seconds=600,
    ))

    return g


# ---------------------------------------------------------------------------
# Registry — keep templates discoverable by id
# ---------------------------------------------------------------------------

TEMPLATES = {
    "saas-mvp-72h": {
        "name": "Launch SaaS MVP in 72 hours",
        "description": "5 coordinated agents — planner → backend, frontend, devops, marketing in parallel.",
        "agents": 5,
        "estimated_minutes": 8,
        "build": launch_saas_mvp,
    },
    "launch-and-grow": {
        "name": "Launch & Grow",
        "description": (
            "8-agent GTM engine — strategy → content calendar + SEO + competitor intel → "
            "social posts + sales outreach + email sequences → paid media → "
            "ops scheduler that wires up recurring autonomous agent jobs."
        ),
        "agents": 8,
        "estimated_minutes": 20,
        "build": launch_and_grow,
    },
}


def get_template(template_id: str):
    return TEMPLATES.get(template_id)
