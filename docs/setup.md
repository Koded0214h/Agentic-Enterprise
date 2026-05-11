# Setup & Installation

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11+ | 3.12 recommended |
| Node.js | 18+ | For Agent Swarm CLI |
| npm | 9+ | |
| Git | Any | |
| curl | Any | Used by `start.sh` |

**Optional but recommended for production:**
- Docker + Docker Compose
- PostgreSQL 15+
- Redis 7+

---

## 1. Clone the Repository

```bash
git clone <repository-url> Agentic-Enterprise
cd Agentic-Enterprise
```

---

## 2. Backend Setup

### 2a. Automated bootstrap (recommended)

From the repository root:

```bash
chmod +x backend/bootstrap-venv.sh   # once, if needed
./backend/bootstrap-venv.sh
```

This creates `backend/.venv`, installs **CPU-only** PyTorch (`torch==2.6.0` from [download.pytorch.org/whl/cpu](https://download.pytorch.org/whl/cpu)) to avoid multi‑gigabyte CUDA wheels on laptops or disk‑constrained machines, then installs `requirements.txt`.

For NVIDIA CUDA builds from PyPI instead:

```bash
TORCH_FLAVOR=cuda ./backend/bootstrap-venv.sh
```

### 2b. Manual venv (alternative)

```bash
cd backend
python3 -m venv .venv
```

Install PyTorch **before** the rest so `sentence-transformers` does not pull the default CUDA stack:

```bash
# CPU (~recommended for dev / Python 3.13 / limited disk)
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install torch==2.6.0 --index-url https://download.pytorch.org/whl/cpu
.venv/bin/python -m pip install -r requirements.txt
```

CUDA (large download; requires enough disk space):

```bash
.venv/bin/python -m pip install torch==2.6.0
.venv/bin/python -m pip install -r requirements.txt
```

Always use `.venv/bin/python -m pip` (or `source .venv/bin/activate` first) so dependencies do not install into Conda/base Python.

### 2c. Configure Environment Variables

Create `backend/.env`:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...        # Anthropic Claude API key
GEMINI_API_KEY=AIza...              # Google Gemini API key

# Optional — defaults work for local dev
SECRET_KEY=your-django-secret-key  # Change in production!
DEBUG=True
DATABASE_URL=                       # Leave empty to use SQLite
REDIS_URL=redis://localhost:6379/0  # Only needed for Celery tasks
```

> The root-level `.env` file already contains `GEMINI_API_KEY` and a placeholder for `ANTHROPIC_API_KEY`. Copy or symlink it into `backend/` if you prefer a single file.

### 2d. Run Database Migrations

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
```

### 2e. Create Admin User

```bash
python manage.py createsuperuser
```

Or use the default created by `start.sh`: **username:** `admin` / **password:** `admin1234`

### 2f. Seed Default Policies

```bash
python manage.py default_policies
```

This creates four global allow policies (agent execution, tool access, workflow execution, swarm dispatch) that let any registered agent operate. You can override these with targeted DENY policies after initial setup.

### 2g. Sync Swarm Agents

```bash
python manage.py sync_swarm_agents
```

This reads `agent-swarm/swarm.config.json` and creates `Agent` + `SwarmAgentManifest` records for all 245 swarm agents. It is safe to re-run — fully idempotent.

Options:

```bash
# Dry run (no DB writes)
python manage.py sync_swarm_agents --dry-run

# Only sync a specific category
python manage.py sync_swarm_agents --category sales

# Use a custom swarm root path
python manage.py sync_swarm_agents --swarm-root /path/to/agent-swarm
```

---

## 3. Agent Swarm Setup

### 3a. Install Node Dependencies

```bash
cd agent-swarm
npm install
```

### 3b. Configure AOS Connection

The `start.sh` script writes `agent-swarm/.env` automatically. To configure manually:

```bash
cp agent-swarm/.env.example agent-swarm/.env
```

Edit `agent-swarm/.env`:

```bash
# URL of the running AOS Django backend (no trailing slash)
AOS_BASE_URL=http://localhost:8000

# JWT access token — obtain from POST /api/token/
AOS_TOKEN=eyJhbGci...

# Execution environment for policy evaluation
AOS_ENV=dev   # dev | staging | prod
```

**How to get a JWT token manually:**

```bash
curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access'])"
```

> If `AOS_BASE_URL` or `AOS_TOKEN` are not set, the swarm runs in **offline mode** — all AOS calls become silent no-ops and the swarm operates without governance. This is useful for isolated testing but should never be used in production.

---

## 4. One-Command Start (Recommended)

```bash
cd Agentic-Enterprise
./start.sh
```

`start.sh` automates all of the above:

1. Kills any existing process on port 8000
2. Runs `migrate` (idempotent)
3. Runs `default_policies` (idempotent)
4. Runs `sync_swarm_agents` (idempotent)
5. Starts Django in the background
6. Waits for the server to be healthy
7. Obtains a fresh JWT token
8. Writes `agent-swarm/.env`
9. Runs a smoke test against the swarm bridge

```bash
./start.sh --stop    # Kill all managed processes
./start.sh --status  # Show running process PIDs
```

---

## 5. Verify the Installation

```bash
# Backend health
curl http://localhost:8000/api/schema/

# Swagger UI
open http://localhost:8000/api/docs/swagger/

# Admin panel
open http://localhost:8000/admin/

# Prometheus metrics
curl http://localhost:8000/metrics | head -20

# Swarm bridge smoke test
TOKEN=$(grep AOS_TOKEN agent-swarm/.env | cut -d= -f2)
curl -s -X POST http://localhost:8000/api/swarm/policy/check/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"execution_id":"test-123","agent_name":"sales-account-strategist","task":"test","engine":"claude","environment":"dev"}'
```

Expected response:
```json
{
  "decision": "allow",
  "reason": "Policy 'Global Allow - Swarm Dispatch' applied with effect ALLOW",
  "policy_id": "...",
  "execution_id": "test-123"
}
```

---

## 6. Docker Setup (Alternative)

```bash
cd backend
docker-compose up --build
```

The `docker-compose.yml` starts:
- Django backend on port 8000
- PostgreSQL on port 5432
- Redis on port 6379

Set `DATABASE_URL=postgresql://postgres:postgres@db:5432/aos` in your `.env` when using Docker.

---

## 7. Production Checklist

Before deploying to production, complete the following:

- [ ] Change `SECRET_KEY` to a cryptographically random value
- [ ] Set `DEBUG=False`
- [ ] Set `ALLOWED_HOSTS` to your domain(s)
- [ ] Use PostgreSQL instead of SQLite (`DATABASE_URL`)
- [ ] Use Redis for Celery (`REDIS_URL`)
- [ ] Run `python manage.py collectstatic`
- [ ] Use a reverse proxy (nginx/Caddy) with TLS
- [ ] Change admin password from `admin1234`
- [ ] Run `python manage.py default_policies --env production` (skips permissive defaults — you must create explicit ALLOW policies instead)
- [ ] Set `AOS_ENV=prod` in `agent-swarm/.env`
- [ ] Store secrets in a secrets manager (Vault, AWS Secrets Manager) rather than `.env` files
- [ ] Enable Celery workers for async task processing

See [Security](./security.md) for the full threat model and hardening guide.
