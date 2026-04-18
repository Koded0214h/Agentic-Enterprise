# Agent Catalogue

AOS ships with 245 specialized agents across 20 categories, imported from `agent-swarm/swarm.config.json`. Every agent is a `.md` file in `agent-swarm/agents/` that defines the agent's identity, capabilities, behavior, and constraints.

---

## Viewing Agents

```bash
# List all registered agents via API
curl -s http://localhost:8000/api/registry/agents/?source=SWARM \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Filter by category (stored in metadata.source_category)
curl -s "http://localhost:8000/api/registry/agents/?source=SWARM" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
agents = json.load(sys.stdin)
for a in agents:
    cat = a['metadata'].get('source_category','')
    if cat == 'sales':
        print(a['name'])
"
```

---

## Agent Categories

### Core Orchestrators (3 agents)
Workflow management agents used internally by `orchestrator.py`.

| Agent | Purpose |
|---|---|
| `questionnaire` | Clarifies requirements before execution begins |
| `planner` | Decomposes the goal into a structured task plan |
| `debugger` | Detects and diagnoses failures during the debug phase |

---

### Engineering (31 agents)
Full-stack software development and DevOps.

| Agent | Purpose |
|---|---|
| `engineering-backend-architect` | System design, API design, microservices |
| `engineering-frontend-developer` | React, Vue, TypeScript, UI implementation |
| `engineering-devops-automator` | CI/CD, Docker, Kubernetes, infrastructure |
| `engineering-security-engineer` | Vulnerability assessment, secure coding |
| `engineering-sre` | Reliability, SLOs, incident response |
| `engineering-code-reviewer` | Code quality, style, complexity analysis |
| `engineering-python-expert` | Python best practices, optimization |
| `engineering-go-specialist` | Go patterns, concurrency, performance |
| `engineering-kotlin-expert` | Android, Kotlin coroutines, multiplatform |
| `engineering-cpp-build-expert` | C++ build systems, CMake, Bazel |
| `engineering-react-specialist` | React component architecture, performance |
| `engineering-database-specialist` | Schema design, query optimization |
| `engineering-microservices-architect` | Service mesh, event-driven design |
| + 18 more | Language experts, framework specialists |

---

### Marketing (29 agents)

| Agent | Purpose |
|---|---|
| `marketing-seo-specialist` | Keyword research, on-page optimization, technical SEO |
| `marketing-content-writer` | Blog posts, whitepapers, thought leadership |
| `marketing-podcast-strategist` | Episode planning, guest outreach, distribution |
| `marketing-carousel-growth-engine` | LinkedIn/Instagram carousel strategy |
| `marketing-email-strategist` | Drip campaigns, segmentation, A/B testing |
| `marketing-douyin-strategist` | TikTok China (Douyin) content and growth |
| `marketing-wechat-strategist` | WeChat Official Account, Mini Programs |
| `marketing-kuaishou-strategist` | Kuaishou (short video) platform strategy |
| `marketing-china-market-specialist` | China go-to-market, localization |
| `marketing-cultural-intelligence` | Cross-cultural content adaptation |
| `marketing-instagram-strategist` | Reels, Stories, influencer strategy |
| `marketing-growth-hacker` | Viral loops, referral programs, PLG |
| + 17 more | Platform-specific and performance marketing |

---

### Paid Media (7 agents)

| Agent | Purpose |
|---|---|
| `paid-media-ppc-strategist` | Google Ads, Bing, search campaign management |
| `paid-media-programmatic-buyer` | DSP strategy, audience targeting, CPM optimization |
| `paid-media-paid-social-strategist` | Facebook, LinkedIn, Twitter paid campaigns |
| `paid-media-search-query-analyst` | Search term analysis, negative keyword mining |
| `paid-media-tracking-specialist` | Pixel setup, GTM, attribution modeling |
| `paid-media-creative-strategist` | Ad creative briefs, copy frameworks |
| `paid-media-auditor` | Account audits, waste identification |

---

### Sales (8 agents)

| Agent | Purpose |
|---|---|
| `sales-account-strategist` | Land-and-expand, whitespace mapping, QBR planning |
| `sales-outbound-strategist` | Cold outreach sequences, ICP targeting |
| `sales-discovery-coach` | Discovery call frameworks, qualification criteria |
| `sales-deal-strategist` | Late-stage deal navigation, objection handling |
| `sales-engineer` | Technical proof-of-concept, demo preparation |
| `sales-pipeline-analyst` | Pipeline health, forecast accuracy, deal scoring |
| `sales-proposal-strategist` | RFP responses, executive summaries, pricing |
| `sales-coach` | Rep coaching, call recordings analysis |

---

### Product (5 agents)

| Agent | Purpose |
|---|---|
| `product-manager` | Roadmap prioritization, PRD writing |
| `product-sprint-prioritizer` | Backlog grooming, story points, sprint planning |
| `product-trend-researcher` | Market trends, competitive intelligence |
| `product-feedback-synthesizer` | User feedback analysis, NPS interpretation |
| `product-behavioral-nudge-engineer` | UX behavior design, conversion optimization |

---

### Strategy (16 agents)

| Agent | Purpose |
|---|---|
| `strategy-business-strategist` | Market positioning, competitive analysis |
| `strategy-market-researcher` | TAM/SAM/SOM, industry analysis |
| `strategy-management-consultant` | Frameworks: BCG, McKinsey, Porter's Five Forces |
| `strategy-financial-modeler` | Revenue projections, scenario modeling |
| + 12 more | M&A, international expansion, go-to-market |

---

### Specialized Domain Experts (28 agents)

| Agent | Purpose |
|---|---|
| `specialized-accounts-payable` | Multi-rail payments (ACH, wire, crypto, stablecoins), vendor management |
| `specialized-corporate-billing-ops` | Customer billing, invoice lifecycle, dunning |
| `specialized-budget-analyst` | Budget vs. actuals, variance analysis |
| `specialized-compliance-auditor` | Policy compliance, risk registers, gap analysis |
| `specialized-healthcare-marketing` | HIPAA-aware marketing, patient engagement |
| `specialized-blockchain-security` | Smart contract auditing, Web3 security |
| `specialized-customs-trade` | Import/export compliance, tariff classification |
| `specialized-government-presales` | Government procurement, RFP strategy |
| `specialized-recruitment-specialist` | JD writing, sourcing strategy, interviewing |
| `specialized-lsp-index-engineer` | Language Server Protocol, IDE tooling |
| `specialized-mcp-builder` | Model Context Protocol server development |
| + 17 more | Vertical specialists across healthcare, finance, legal, and tech |

---

### GSD — Getting Stuff Done (18 agents)
Practical execution agents used for research, planning, and delivery.

| Agent | Purpose |
|---|---|
| `gsd-planner` | Task decomposition and sequencing |
| `gsd-executor` | Step-by-step task execution |
| `gsd-researcher` | Deep research and synthesis |
| `gsd-verifier` | Output quality verification |
| `gsd-debugger` | Root cause analysis |
| `gsd-codebase-mapper` | Repository structure analysis |
| `gsd-ui-researcher` | UI/UX pattern research |
| + 11 more | Assumption analysis, profiling, checkpointing |

---

### Testing & QA (8 agents)

| Agent | Purpose |
|---|---|
| `testing-browser-qa` | Playwright/Puppeteer browser automation |
| `testing-api-tester` | REST/GraphQL contract testing |
| `testing-performance-tester` | Load testing, benchmarking |
| `testing-regression-tester` | Regression suite management |
| `testing-e2e-runner` | End-to-end test orchestration |
| `testing-reality-checker` | Sanity checks, smoke testing |
| + 2 more | Security testing, coverage analysis |

---

### Design (8 agents)

| Agent | Purpose |
|---|---|
| `design-ux-architect` | Information architecture, user flows |
| `design-ui-designer` | Visual design systems, component libraries |
| `design-brand-guardian` | Brand consistency, style guide enforcement |
| `design-visual-storyteller` | Data visualization, infographics |
| `design-image-prompt-engineer` | Midjourney/DALL-E prompt crafting |
| + 3 more | Motion design, presentation design |

---

### Project Management (6 agents)

| Agent | Purpose |
|---|---|
| `project-manager-senior` | Project planning, stakeholder management |
| `project-management-scrum-master` | Sprint ceremonies, velocity tracking |
| `project-management-studio-operations` | Resource allocation, capacity planning |
| `project-management-jira-workflow-steward` | Jira configuration, workflow automation |
| + 2 more | Risk management, retrospectives |

---

### Game Development (20 agents)

| Agent | Purpose |
|---|---|
| `game-unity-expert` | Unity C# development, performance optimization |
| `game-unreal-developer` | Unreal Engine Blueprints and C++ |
| `game-mechanics-designer` | Gameplay loop design, balancing |
| `game-performance-optimizer` | GPU profiling, draw call optimization |
| `game-3d-artist-director` | 3D asset pipelines, LOD strategies |
| `game-audio-director` | Sound design, adaptive audio systems |
| + 14 more | Narrative design, multiplayer, monetization |

---

### Spatial Computing (6 agents)
VR/AR/XR development.

| Agent | Purpose |
|---|---|
| `spatial-xr-architect` | XR system design, device compatibility |
| `spatial-visionos-developer` | Apple Vision Pro development |
| `spatial-interaction-designer` | 3D UI, hand tracking, gesture design |
| + 3 more | Performance, accessibility, passthrough |

---

### Academic (5 agents)

| Agent | Purpose |
|---|---|
| `academic-researcher` | Literature review, citation management |
| `academic-thesis-writer` | Structure, argumentation, academic style |
| `academic-peer-reviewer` | Paper review, methodology critique |
| + 2 more | Grant writing, conference abstracts |

---

### Support (6 agents)

| Agent | Purpose |
|---|---|
| `support-tier1-agent` | First-line customer support, FAQ handling |
| `support-escalation-manager` | Complex issue triage, escalation routing |
| `support-troubleshooter` | Technical debugging with customers |
| + 3 more | Onboarding, success management |

---

### Creative (2 agents)

| Agent | Purpose |
|---|---|
| `creative-writer` | Long-form narrative, storytelling, scripts |
| `creative-motion-graphics` | Motion design direction, storyboarding |

---

### Integrations (13 agents)
Agents specialized for specific tools and platforms.

| Agent | Purpose |
|---|---|
| `integration-claude-code` | Anthropic Claude Code CLI expert |
| `integration-cursor` | Cursor IDE workflows |
| `integration-github-copilot` | Copilot optimization |
| `integration-aider` | Aider git-aware coding |
| `integration-windsurf` | Windsurf IDE workflows |
| `integration-gemini-cli` | Google Gemini CLI expert |
| + 7 more | Other AI tool integrations |

---

## Agent File Format

Each agent is a Markdown file with optional YAML frontmatter:

```markdown
---
name: Sales Account Strategist
description: Enterprise account expansion specialist
vibe: Strategic, data-driven, relationship-focused
---

# Sales Account Strategist

You are an expert enterprise sales strategist...

## Core Capabilities
- Stakeholder mapping and whitespace analysis
- QBR design and executive business reviews
- Expansion play identification

## Your Approach
1. Analyze the current account footprint
2. Identify untapped departments or use cases
...
```

To add a custom agent, create a `.md` file in `agent-swarm/agents/<category>/` and run `python manage.py sync_swarm_agents`.
