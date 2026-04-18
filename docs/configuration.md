# Configuration Reference

## Backend Environment Variables (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes (for Claude) | — | Anthropic API key for Claude models |
| `GEMINI_API_KEY` | Yes (for Gemini) | — | Google Gemini API key |
| `OPENAI_API_KEY` | No | — | OpenAI API key (optional) |
| `SECRET_KEY` | Yes (prod) | insecure default | Django secret key — change in production |
| `DEBUG` | No | `True` | Set to `False` in production |
| `ALLOWED_HOSTS` | No | `[]` | Comma-separated list of allowed hosts |
| `DATABASE_URL` | No | SQLite | PostgreSQL URL: `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | No | — | Redis URL for Celery: `redis://localhost:6379/0` |
| `VECTOR_STORE_PATH` | No | `./chroma_db` | Path for ChromaDB persistent storage |

---

## Swarm Environment Variables (`agent-swarm/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `AOS_BASE_URL` | No | — | AOS backend URL. Leave empty for offline mode |
| `AOS_TOKEN` | No | — | JWT access token for AOS authentication |
| `AOS_ENV` | No | `dev` | Environment reported to AOS: `dev`, `staging`, `prod` |

---

## Django Settings (`backend/backend/settings.py`)

### JWT Token Lifetimes
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

### Installed Apps (all required)
```python
INSTALLED_APPS = [
    'apps.agent_registry',
    'apps.agent_gateway',
    'apps.policy_engine',
    'apps.agent_intelligence',
    'apps.knowledge_base',
    'apps.billing',
    'apps.swarm_bridge',
    ...
]
```

### Database
```python
# SQLite (default for development)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# PostgreSQL (production) — set DATABASE_URL env var
# dj_database_url.parse(os.environ.get('DATABASE_URL'))
```

---

## swarm.config.json (Agent Swarm)

Located at `agent-swarm/swarm.config.json`. Defines all agent registrations.

```json
{
  "version": "2.2",
  "name": "agent-swarm",
  "default_engine": "claude",
  "workflow": {
    "phases": ["questionnaire", "planner", "execute", "debug", "ship"],
    "scout_enabled": true
  },
  "agents": {
    "sales-account-strategist": {
      "file": "sales/sales-account-strategist.md",
      "engine": null,
      "source": "sales"
    }
  }
}
```

| Field | Description |
|---|---|
| `version` | Config schema version (used by sync command) |
| `default_engine` | LLM engine used when agent has no override (`claude` \| `gemini` \| `generic`) |
| `workflow.phases` | Ordered list of phases for `orchestrator.py` |
| `agents.<name>.file` | Path to the agent `.md` file relative to `agents/` |
| `agents.<name>.engine` | Override default engine for this agent (`null` = use default) |
| `agents.<name>.source` | Category string (used for filtering and sync) |

---

## LLM Provider Configuration

LLM configurations are stored in the `LLMConfig` database model, not in flat files. Manage them via:
- API: `POST /api/intelligence/llm-configs/`
- Admin panel: `http://localhost:8000/admin/agent_intelligence/llmconfig/`

**Reference costs (as of 2025):**

| Provider | Model | Input ($/1k tokens) | Output ($/1k tokens) |
|---|---|---|---|
| Anthropic | claude-sonnet-4-6 | $0.003 | $0.015 |
| Anthropic | claude-haiku-4-5 | $0.00025 | $0.00125 |
| Google | gemini-2.5-flash | $0.000075 | $0.0003 |
| OpenAI | gpt-4o | $0.0025 | $0.010 |

---

## Agent Capability Options

| Field | Options | Default |
|---|---|---|
| `graph_type` | `REACT`, `PLAN_EXECUTE`, `MULTI_AGENT`, `CUSTOM` | `REACT` |
| `memory_type` | `BUFFER`, `BUFFER_WINDOW`, `SUMMARY`, `VECTOR`, `NONE` | `BUFFER` |
| `max_iterations` | Integer | `10` |
| `timeout_seconds` | Integer | `120` |
| `rag_enabled` | Boolean | `false` |
| `rag_top_k` | Integer | `5` |

---

## Celery Configuration (Optional)

For async task processing (document embedding, background agent execution):

```python
# backend/backend/settings.py
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
```

Start a Celery worker:
```bash
cd backend
source .venv/bin/activate
celery -A backend worker -l info
```

---

## File Paths Reference

| Path | Purpose |
|---|---|
| `backend/db.sqlite3` | SQLite database (development) |
| `backend/chroma_db/` | ChromaDB vector store |
| `backend/media/` | Uploaded knowledge base documents |
| `backend/.logs/` | Application logs (created by `start.sh`) |
| `backend/.aos.pid` | PID file for managed processes |
| `agent-swarm/.env` | AOS connection config (auto-written by `start.sh`) |
| `agent-swarm/.env.example` | Template for manual config |
| `agent-swarm/swarm.config.json` | Agent registry |
| `agent-swarm/memory/` | Swarm execution outputs and transcripts |
| `agent-swarm/agents/` | Agent `.md` definition files |
| `agent-swarm/skills/` | Reusable skill knowledge modules |
| `agent-swarm/commands/` | Workflow command templates |
| `agent-swarm/rules/` | Language-specific coding standards |
