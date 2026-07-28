# AOS Swarm — Repository Audit Report

**Date:** 2026-07-09
**Branch:** `main`
**Scope:** Whole repo — `backend/`, `frontend/`, `agent-swarm/`

---

## 1. Overview

| Component | Stack | Size | Notes |
|---|---|---|---|
| `backend/` | Django 5.2 + DRF + Celery + Chroma | ~21.3k Py LOC, 12 apps | Governance / SaaS core |
| `frontend/` | React 19 + Vite 8 + react-router 7 | 52 source files | Web app |
| `agent-swarm/` | TS / React-Ink CLI + Python runtime | 271 agent defs, 3,300+ TS/JS files | Vendored fork: `@anas.abubakar/swarm` v0.0.4 |

Backend apps are cleanly separated: `agent_gateway`, `agent_intelligence`, `agent_registry`,
`billing`, `knowledge_base`, `marketing`, `notifications`, `ops`, `ops_core`, `policy_engine`,
`projects`, `swarm_bridge`. CI exists and is real. Solid foundation.

---

## 2. Findings by severity

### High

**H1 — `node_modules/` committed to git (5,912 files).** *(fixed 2026-07-09)*
`.gitignore` had no `node_modules` rule, so `agent-swarm/node_modules` was tracked — the primary
reason the repo reached **2.1 GB**. History also contained dependency tarballs and vendored files.
*Resolution:* added `node_modules/` to `.gitignore` and `git rm -r --cached agent-swarm/node_modules`.
Consider a history rewrite (BFG / `git filter-repo`) if clone size still matters.

**H2 — `DEBUG` and `SECRET_KEY` fail *open* in production.** *(open)*
`backend/backend/settings.py:16` → `DEBUG = os.environ.get("DEBUG", "1") == "1"` defaults to **on**.
`settings.py:11` provides a hardcoded `django-insecure-…` `SECRET_KEY` fallback, which is also the
JWT `SIGNING_KEY` (`settings.py:203`) — so an unset env var means debug-exposed *and* forgeable tokens.
*Fix:* default `DEBUG` to `False`; raise `ImproperlyConfigured` when `SECRET_KEY` is unset and `DEBUG` is False.

**H3 — `CORS_ALLOW_ALL_ORIGINS = True` (`settings.py:229`).** *(open)*
Wide-open CORS. The five most recent commits are all CORS firefighting at the nginx layer — a symptom
of fighting this at the proxy instead of an allowlist at the app.
*Fix:* replace with `CORS_ALLOWED_ORIGINS` from env; remove the nginx CORS workarounds once the app owns it.

### Medium

**M1 — Compiled output committed alongside source.** *(open)*
`agent-swarm/src` tracks **1,920 `.js`** next to **1,359 `.ts`/`.tsx`**. Source and build artifacts
drift; reviews are noisy. *Fix:* gitignore compiled JS, build in CI.

**M2 — God files.** *(open)*
`src/screens/REPL.tsx` = **5,005 lines / 895 KB**, `src/main.tsx` = 4,685 lines / 803 KB,
`PromptInput.tsx` = 2,338 lines. Un-reviewable; inherited from the vendored CLI but now yours.

**M3 — Swarm essentially untested in CI.** *(open)*
CI runs backend tests (Postgres + Redis) but the 3,300-file TS swarm gets only `python test_runtime.py`
smoke, and the frontend job is **build-only, no tests**. 58 test files total across the repo.

**M4 — Vendored fork with unclear provenance.** *(open)*
`agent-swarm` is `@anas.abubakar/swarm`, a Claude-Code-style Ink/REPL CLI embedded wholesale. No
upstream-tracking or security-patch path defined. Decide: fork-and-own vs. depend-as-package.

**M5 — Repo root was a junk drawer.** *(partially fixed 2026-07-09)*
Removed stray tracked files (`Untitled`, `txt`, `A tool that helps freelance designers se`) and stale
root duplicates of `data_store.py` / `invoice_manager.py` / `mrr_calculator.py` (canonical copies live
in `backend/`; removed versions recoverable from git history). The private key `id_ed25519` remains on
disk but is untracked and gitignored — **relocate it out of the repo tree manually**.

### Low / Positives

- DRF global default is `IsAuthenticated`; `AllowAny` appears only on login/register/logout — correct.
- Every `swarm_bridge` endpoint is `IsAuthenticated` — backend↔swarm trust boundary consistently enforced.
- Auth endpoints have `AuthRateThrottle`; identity keys use `secrets.token_urlsafe(32)`.
- **No hardcoded API keys** in first-party code; all via `os.getenv`. `k8s/secrets.yaml` is a placeholder template.
- Security headers present (XSS filter, nosniff, opt-in HSTS/SSL redirect). Sentry wired conditionally.
- Minor: JWT stored in `localStorage` (`frontend/src/api/client.js`) — XSS-exfiltratable; acceptable, worth noting.

---

## 3. Recommended order of operations

1. ~~**H1** — un-track `node_modules` + gitignore.~~ ✅ done
2. **H2 / H3** — flip DEBUG / SECRET_KEY / CORS to fail-closed (small diff, real risk reduction).
3. ~~**M5** — remove stray files.~~ ✅ done (still relocate the private key manually).
4. **M1** — stop committing compiled JS.
5. **M3** — add a frontend test job + real swarm test coverage.
6. **M2 / M4** — plan god-file decomposition and a decision on the vendored swarm.
