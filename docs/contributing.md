# Contributing & Extending AOS

---

## Adding a New Swarm Agent

1. **Create the agent `.md` file** in the appropriate category folder:

```
agent-swarm/agents/<category>/<agent-name>.md
```

Example: `agent-swarm/agents/sales/sales-revenue-ops.md`

```markdown
---
name: Revenue Operations Specialist
description: Optimizes revenue processes across sales, marketing, and CS
vibe: Data-driven, systems thinker, cross-functional
---

# Revenue Operations Specialist

You are an expert Revenue Operations (RevOps) specialist...

## Core Capabilities
- CRM hygiene and process standardization
- Sales/marketing/CS alignment
- Revenue forecasting and attribution

## Your Approach
1. Audit the current revenue stack
2. Identify bottlenecks in the funnel
...
```

2. **Register in `swarm.config.json`:**

```json
{
  "agents": {
    "sales-revenue-ops": {
      "file": "sales/sales-revenue-ops.md",
      "engine": null,
      "source": "sales"
    }
  }
}
```

3. **Sync into AOS registry:**

```bash
cd backend
source .venv/bin/activate
python manage.py sync_swarm_agents --category sales
```

---

## Adding a New Skill

Skills are reusable knowledge modules injected into agent context.

Create `agent-swarm/skills/<category>/<skill-name>.md`:

```markdown
# Revenue Attribution Modeling

## Multi-Touch Attribution
Use this when assigning credit across the customer journey...

## First-Touch vs. Last-Touch
- First-touch: credits the first marketing touchpoint
- Last-touch: credits the interaction before conversion
...
```

Reference it in an agent's system prompt or in commands.

---

## Adding a New Command

Commands are workflow templates — multi-agent chains.

Create `agent-swarm/commands/<command-name>.md`:

```markdown
# /revenue-audit

Runs a comprehensive revenue operations audit.

## Steps
1. Dispatch `sales-pipeline-analyst` to assess pipeline health
2. Dispatch `sales-revenue-ops` to identify process gaps
3. Dispatch `strategy-financial-modeler` to project impact
4. Compile findings into an executive summary
```

---

## Adding a New Django API App

1. Create the app:
```bash
cd backend
source .venv/bin/activate
python manage.py startapp myfeature apps/myfeature
```

2. Add to `INSTALLED_APPS` in `settings.py`:
```python
INSTALLED_APPS = [
    ...
    'apps.myfeature',
]
```

3. Create `apps/myfeature/urls.py` and register in `backend/urls.py`:
```python
path('api/myfeature/', include('apps.myfeature.urls')),
```

4. Create and apply migrations:
```bash
python manage.py makemigrations myfeature
python manage.py migrate
```

---

## Adding a New Policy Effect

To add a new policy effect (e.g., `THROTTLE`):

1. Add to `PolicyEffect` in `apps/policy_engine/models.py`:
```python
class PolicyEffect(models.TextChoices):
    ...
    THROTTLE = "THROTTLE", _("Throttle")
```

2. Handle in `PolicyEvaluator.evaluate()`:
```python
if effect == PolicyEffect.THROTTLE:
    # Add rate limiting logic
    pass
```

3. Handle in `SwarmPolicyCheckView`:
```python
if effect == PolicyEffect.THROTTLE:
    decision = "throttle"
    # Return retry-after header
```

4. Handle in `core/aos_client.py`:
```python
if decision == "throttle":
    time.sleep(retry_after)
    return self.policy_check(...)  # retry
```

---

## Adding a New LLM Provider

1. Add to `LLMProvider` enum in `apps/agent_intelligence/models.py`:
```python
class LLMProvider(models.TextChoices):
    ...
    COHERE = "COHERE", "Cohere"
```

2. Add to `LLMManager.get_llm()` in `apps/agent_intelligence/utils/llm_manager.py`:
```python
elif config.provider == LLMProvider.COHERE:
    from langchain_cohere import ChatCohere
    return ChatCohere(
        model=config.model_name,
        cohere_api_key=config.decrypted_api_key,
    )
```

3. Add to `engines/adapter.py` in agent-swarm if you want swarm to use it directly.

---

## Adding a New Engine to Agent Swarm

In `agent-swarm/engines/adapter.py`:

```python
register_engine(
    name="my-engine",
    command_template="{engine} --system {system_file} --task {task}",
    system_flag="--system",
    task_position="--task",
    auto_flag="--auto",
)
```

Set it as default in `swarm.config.json`:
```json
{"default_engine": "my-engine"}
```

---

## Writing Tests

```bash
cd backend
source .venv/bin/activate

# Run all tests
python manage.py test

# Run a specific app's tests
python manage.py test apps.policy_engine

# Run with coverage
pytest --cov=apps --cov-report=html
open htmlcov/index.html
```

Tests live in `apps/<appname>/tests.py`. Use Django's `TestCase` for DB tests and DRF's `APITestCase` for endpoint tests.

---

## Code Style

- Python: follow PEP 8. No inline comments unless the WHY is non-obvious.
- Use Django's ORM — avoid raw SQL.
- All new models need `id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
- All new API views need `permission_classes = [IsAuthenticated]`.
- New management commands should be idempotent (safe to run multiple times).
- New swarm agents should have YAML frontmatter with at least `name` and `description`.
