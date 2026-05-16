# Troubleshooting

The most common issues people hit, with fixes.

---

## Auth & access

### "Invalid Google token" when signing in with Google
- Make sure your frontend origin is in the **Authorized JavaScript origins** list for your Google OAuth client.
- Make sure `VITE_GOOGLE_CLIENT_ID` (frontend) and `GOOGLE_CLIENT_ID` (backend) are exactly the same value.
- If your OAuth consent screen is in "Testing" mode, only emails on the testers list can sign in.

### "Email already exists" but I can't reset
- Use **Forgot password** on the login page. Check your spam folder.
- If email isn't configured yet, the reset token is **printed to the backend logs** — check Render dashboard → Logs.

### Session keeps logging me out
- Tokens expire after 1 hour. The frontend auto-refreshes via `/auth/token/refresh/`. If refresh is also failing, check that your `SECRET_KEY` hasn't changed between deploys — that invalidates all tokens.

---

## Agent runs

### Agent stuck on "Pending"
1. Check **Approvals** — it may be waiting on you.
2. Check **Observe → Queue Monitoring** — your worker may not be running.
3. Check Render logs for the worker service — Celery may have died.

### Agent fails with "No LLM API key configured"
- Settings → Providers — add at least one key.
- Or set `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` as a workspace-wide env var on Render.

### Agent fails with "Permission denied: tool X"
- Settings → Agent → Tools — enable the tool for that agent.
- Or, in a workspace policy, set `effect=ALLOW` for the resource.

### Agent burns through tokens
- Finance → Budgets — set a monthly cap.
- Settings → HITL — lower the cost threshold so expensive iterations pause for approval.
- Check the agent's system prompt — overly long prompts get re-sent each turn; consider compressing context.

### LLM call timeout (120s)
- Provider is slow or having an outage. The fallback chain (Anthropic → OpenAI → Gemini → Mistral) should kick in automatically. Check Observe to see which provider was used.

---

## Workflows / DAG

### Workflow has nodes stuck on "skipped"
This happens when an upstream node failed and cascade-cancelled its descendants. Look for the **first failed node** — fix that, then re-run.

### Workflow times out
Each node has a 600-second default timeout. Override on a per-node basis via the `timeout_seconds` field in the graph spec.

---

## Tools & MCP

### GitHub tool fails with 401
- `GITHUB_TOKEN` env var is missing or revoked.
- Token doesn't have `repo` scope (for private repos) or `workflow` scope (for Actions).

### Slack / Telegram / Discord tool says "no client configured"
- The bot token env var isn't set. See [`integrations-and-keys.md`](./integrations-and-keys.md).
- For Slack, the bot must be invited to the channel you're trying to post in.

### Tool call says "duplicate idempotency key"
This is intentional — destructive tools deduplicate by `(execution_id, tool_name, params hash)` so a Celery retry doesn't fire the same `delete_branch` twice. If you genuinely want to fire twice, change a parameter.

---

## Observability

### Live stream disconnects
- Check that your CDN / proxy isn't buffering SSE. AOS sets `X-Accel-Buffering: no` but some hosts ignore it.
- Vercel + Render: works out of the box. Cloudflare in front of either: enable WebSockets and disable the cache for `/api/swarm/executions/*/stream/`.

### Charts on Observe show empty
- No usage data yet — run an agent first.
- Or the billing service isn't recording usage. Check `apps.billing.services` logs for errors.

---

## Database & migrations

### `django.db.utils.IntegrityError: duplicate key value violates unique constraint`
Usually a stale migration. Reset locally:
```bash
python manage.py migrate <app> zero
python manage.py migrate
```
In production, never reset — instead, run a data-fix migration.

### "Reverse accessor clashes with..."
Two models with the same `related_name` for ForeignKeys to the same target. Find both, give them distinct `related_name=` values, run `makemigrations`.

---

## Frontend build

### Vercel build fails with "Cannot find module 'posthog-js'"
The lazy imports in `lib/analytics.js` only fire when the corresponding env var is set, but Vercel may still tree-shake them. If you keep hitting this, run `npm i posthog-js @sentry/react mixpanel-browser` and commit `package.json`.

### Dark theme looks broken on a specific page
Inspect — most likely a CSS variable (e.g. `--bg-2`) isn't defined. They live in `index.css` and `App.css`.

---

## Performance

### Pages feel slow on first load
- Vercel build the frontend with `npm run build` (Vite production mode) — not `npm start`.
- Check **Network** tab — large bundles? Code-split the rarely-used routes.

### Backend slow under load
- Check Render → Metrics. If CPU is pegged, scale the worker. If DB is the bottleneck, add an index for the slow query (`EXPLAIN ANALYZE` first).
- Enable Postgres connection pooling via `?conn_max_age=60` on `DATABASE_URL`.

---

## Still stuck?

- Read the relevant section of [`integrations-and-keys.md`](./integrations-and-keys.md) carefully.
- Open `/health/` on your backend — it should return `{"status": "healthy"}`. If not, the backend itself is degraded.
- Open a GitHub issue with the request ID from the error toast — every error logs one.
