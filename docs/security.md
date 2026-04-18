# Security

## Threat Model

AOS manages AI agents that can autonomously call tools, query databases, interact with external APIs, and process sensitive data. The threat model considers:

| Threat | Mitigation |
|---|---|
| Rogue agent accessing unauthorized resources | Policy engine blocks via DENY rules |
| Agent budget exhaustion / cost bomb | `AgentBudget` hard limit blocks before policy evaluation |
| Compromised API key exfiltration | API keys encrypted at rest with Fernet symmetric encryption |
| Unauthorized swarm dispatch | JWT authentication required on all bridge endpoints |
| Audit log tampering | `PolicyAuditLog` is append-only, never modified by system |
| Agent impersonation | Unique `identity_key` per agent, JWT sessions with revocation |
| Sensitive data leakage via tools | Policy conditions can match on `context.contains_pii` fields (requires caller to set) |
| Unbounded LLM loops | `max_iterations` field on `AgentCapability`; LangGraph iteration limits |

---

## Authentication

### Platform Users (humans)
Standard Django authentication + JWT via `djangorestframework-simplejwt`.

```
POST /api/token/       → access token (5 min TTL) + refresh token (1 day TTL)
POST /api/token/refresh/ → new access token
```

### Agents (programmatic)
Agents authenticate with their `identity_key` via the `AgentAuthentication` class in `agent_gateway/authentication.py`.

The `AgentAuthentication` backend supports:
- **JWT tokens** — Standard Bearer tokens in the `Authorization` header
- **Identity keys** — Direct `identity_key` values passed as `X-Agent-Identity` header

Sessions are tracked in `AgentSession` with IP address, user agent, and expiry. Sessions can be revoked individually.

---

## API Key Encryption

All LLM provider API keys are encrypted at rest using **Fernet** (AES-128 CBC + HMAC-SHA256).

```python
# Stored in LLMConfig.api_key
# Encryption happens automatically on save():
def save(self, *args, **kwargs):
    if self.api_key and not self.api_key.startswith('gAAAA'):
        self.api_key = SecurityManager.encrypt(self.api_key)
    super().save(*args, **kwargs)
```

The encryption key is derived from `settings.SECRET_KEY`. **Changing `SECRET_KEY` in production will make all existing encrypted keys unreadable.**

In production, store the `SECRET_KEY` in a secrets manager (AWS Secrets Manager, HashiCorp Vault) and inject it via environment variable. Do not commit it to source control.

---

## RBAC (Role-Based Access Control)

Agents are assigned one or more `Role` objects. Each role has a `permissions` JSON list.

```json
{
  "name": "finance-analyst",
  "permissions": ["billing:read", "knowledge:query", "reports:read"]
}
```

The policy engine uses roles when evaluating which policies apply to an agent:
- Policies assigned to a role apply to all agents with that role
- Policies assigned to a specific agent only apply to that agent
- Global policies (no agent or role assignment) apply to everyone

---

## Command Safety (Swarm Side)

`agent-swarm/core/command_executor.py` classifies shell commands before executing them:

| Level | Examples | Behavior |
|---|---|---|
| `SAFE` | `ls`, `cat`, `git status`, `npm list` | Auto-approved, no logging |
| `MODERATE` | `npm install`, `git commit`, `pip install` | Logged, auto-approved |
| `DANGEROUS` | `rm`, `git push`, deployment commands | Requires explicit approval |
| `BLOCKED` | `rm -rf /`, `shutdown`, `format` | Never executed |

This prevents accidental or malicious destructive operations during autonomous agent runs.

---

## Swarm Bridge Security

### Authentication
All five bridge endpoints require a valid JWT Bearer token. The token is obtained via `POST /api/token/` and written to `agent-swarm/.env` by `start.sh`.

### Token Rotation
JWT access tokens expire (default: 5 minutes via `SIMPLE_JWT.ACCESS_TOKEN_LIFETIME`). `start.sh` issues a fresh token on every startup. For long-running swarm sessions, implement token refresh using the refresh token.

### Fail-Open vs. Fail-Closed
By default, if AOS is unreachable the swarm **fails open** (proceeds without governance). This prevents AOS outages from blocking all agent work.

**Change to fail-closed** for production:
```python
# agent-swarm/core/aos_client.py
def policy_check(...):
    if not ENABLED:
        return {"decision": "deny", "reason": "AOS not configured"}
    ...
    except Exception:
        return {"decision": "deny", "reason": "AOS unreachable — fail-closed"}
```

---

## Critical Cautions

### Django SECRET_KEY
The default `SECRET_KEY` in `backend/backend/settings.py` is **insecure and public**:
```python
SECRET_KEY = 'django-insecure-vbo=9r$&_9d_&4da=j%mq2w%rv0!ldfw*-ym+3+0ah6=yso@&5'
```

**You must change this before any non-local deployment.** Generate a secure key:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Admin Password
The default admin password is `admin1234`. Change it immediately after setup:
```bash
python manage.py changepassword admin
```

### SQLite in Production
The default database is SQLite (`backend/db.sqlite3`). SQLite is not suitable for production:
- No concurrent write support
- No network access (can't scale horizontally)
- File permissions are the only access control

Switch to PostgreSQL via `DATABASE_URL` before going to production.

### DEBUG=True
`settings.py` has `DEBUG=True` by default. Debug mode:
- Exposes full stack traces in HTTP responses
- Disables security headers
- Should **never** be enabled in production

### Plaintext Anthropic Key
The root `.env` file contains `ANTHROPIC_API_KEY=your_key_here`. Replace the placeholder with your actual key. Never commit a real API key to version control — add `.env` to `.gitignore`.

### JWT Token in agent-swarm/.env
`start.sh` writes a JWT token to `agent-swarm/.env`. This file should not be committed to source control. Ensure `.env` is in `.gitignore`:
```
agent-swarm/.env
backend/.env
.env
```

### No Rate Limiting on API
There is no global rate limiting on the AOS API. In production, add rate limiting at the nginx/Caddy level or use `djangorestframework` throttling.

### No HTTPS
Development runs on plain HTTP. In production, all traffic must be TLS-encrypted. Use a reverse proxy (nginx, Caddy) to terminate TLS.

---

## Production Hardening Checklist

- [ ] Rotate `SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Set `ALLOWED_HOSTS` to your domain only
- [ ] Use PostgreSQL with strong credentials
- [ ] Enable HTTPS (TLS 1.2+) via reverse proxy
- [ ] Change admin password
- [ ] Store all secrets in a secrets manager
- [ ] Add `.env` files to `.gitignore`
- [ ] Set `SIMPLE_JWT.ACCESS_TOKEN_LIFETIME` to a short interval (e.g., 5 minutes)
- [ ] Change swarm bridge to fail-closed
- [ ] Add nginx rate limiting
- [ ] Enable Django's `SECURE_*` headers (`SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, etc.)
- [ ] Run `python manage.py check --deploy` and fix all warnings
- [ ] Implement periodic `AgentBudget` reset (monthly cron)
- [ ] Review and tighten default policies for production environment
- [ ] Set `AOS_ENV=prod` in swarm `.env`
