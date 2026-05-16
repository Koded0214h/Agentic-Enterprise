# AOS — Integrations & API Keys Setup Guide

This is the single canonical reference for **every external service AOS can talk to**, what it does, and exactly where to obtain the credentials. Each section is independent — wire up only what you need. If you skip a service, the code path becomes a no-op (the app still runs).

Set every key as an environment variable on your hosting platform (Render dashboard for the backend, Vercel project settings for the frontend). See `backend/.env.example` and `frontend/.env.example` for the canonical variable names.

---

## 1. Email — verification, password reset, invites, approval alerts

AOS tries email providers in this priority order: **Resend → Postmark → SendGrid → SMTP → console fallback.** Configure whichever you prefer; the rest of the codebase doesn't care.

### Resend (recommended)
- **Why:** Best developer experience, free 100 emails/day, 3,000/month, no credit card.
- **Where:** https://resend.com → Sign up → API Keys → "Create API Key" → copy.
- **Env var:** `RESEND_API_KEY=re_xxxxxxxxxxxx`
- **Sender setup:** Add your domain in Domains → verify the DNS records Resend gives you. Until verified, you can only send from `onboarding@resend.dev`.

### Postmark
- **Where:** https://account.postmarkapp.com → Servers → create one → API Tokens → "Server API Token".
- **Env var:** `POSTMARK_SERVER_TOKEN=xxxxxxxx`

### SendGrid
- **Where:** https://app.sendgrid.com → Settings → API Keys → "Create API Key" → Full Access.
- **Env var:** `SENDGRID_API_KEY=SG.xxxxxxxx`

### Generic SMTP (Gmail, Mailgun, AWS SES, anywhere)
- **Env vars:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your real password.

### Common: From address
- **Env var:** `EMAIL_FROM=no-reply@yourdomain.com` (must be on a domain you've verified with your provider)

---

## 2. Error tracking + frontend session replay — Sentry

- **Why:** Catches and groups every backend exception and every frontend error, with stack traces, request context, and (optional) session replay video of what the user was doing.
- **Where:**
  1. Sign up at https://sentry.io
  2. Create two projects: one **Django** project, one **React** project.
  3. For each, open Settings → Client Keys (DSN) → copy the DSN.
- **Env vars:**
  - Backend: `SENTRY_DSN=https://xxxxx@oXXX.ingest.sentry.io/XXX`
  - Frontend: `VITE_SENTRY_DSN=https://yyyyy@oYYY.ingest.sentry.io/YYY`
  - Optional: `SENTRY_TRACES_SAMPLE_RATE=0.1`, `VITE_SENTRY_ENVIRONMENT=production`

---

## 3. Product analytics — PostHog (recommended) or Mixpanel

Used for: user retention, workflow completion, token burn analytics, feature usage, funnel analysis.

### PostHog (recommended — has session replay built in)
- **Where:** https://app.posthog.com → Sign up → Project Settings → Project API Key.
- **Env vars:**
  - Frontend: `VITE_POSTHOG_KEY=phc_xxxxxxxx`
  - Frontend (if self-hosted): `VITE_POSTHOG_HOST=https://posthog.yourdomain.com`
  - Backend (for server-side events): `POSTHOG_API_KEY=phc_xxxxxxxx`
- AOS automatically tracks: `user_signed_up`, `workflow_started`, `agent_executed`, `hitl_approved`, `feedback_submitted`.

### Mixpanel (alternative)
- **Where:** https://mixpanel.com → Project Settings → Access Token.
- **Env vars:** `VITE_MIXPANEL_TOKEN` (frontend), `MIXPANEL_TOKEN` (backend)

---

## 4. Sign in with Google

- **Why:** One-click signup with no password.
- **Where:** https://console.cloud.google.com/apis/credentials
  1. Create a project (or pick one).
  2. APIs & Services → Credentials → Create Credentials → OAuth client ID.
  3. Application type: **Web application**.
  4. Authorized JavaScript origins: add your frontend URL exactly, e.g. `https://agentic-enterprise-smoky.vercel.app` and `http://localhost:5173` for dev.
  5. Authorized redirect URIs: same URLs.
  6. Copy the Client ID and Secret.
- **Env vars:**
  - Frontend: `VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com`
  - Backend: `GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com`, `GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx`
- **OAuth consent screen:** Configure once — App name "AOS", scopes `email`, `profile`, `openid`. While in "Testing" mode you must add each tester's email to the allowlist.

---

## 5. Sign in with GitHub

- **Where:** https://github.com/settings/developers → New OAuth App.
  - Homepage URL: your frontend URL.
  - Authorization callback URL: `<frontend_url>/auth/github/callback`.
- **Env vars:** `VITE_GITHUB_CLIENT_ID`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

---

## 6. Admin notifications — Discord webhook

- **Why:** Real-time pings for new signups, beta feedback, critical errors.
- **Where:**
  1. In your Discord server → Server Settings → Integrations → Webhooks → New Webhook.
  2. Pick a channel like `#aos-alerts`. Copy the Webhook URL.
- **Env var:** `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...`

---

## 7. MCP integrations — tools agents can call

### GitHub (PRs, commits, issues, branches)
- **Where:** https://github.com/settings/tokens → "Generate new token (classic)" → scopes: `repo`, `workflow`. (Fine-grained tokens also work.)
- **Env var:** `GITHUB_TOKEN=ghp_xxxxxxxx`

### Slack
- **Where:** https://api.slack.com/apps → Create New App → "From scratch" → workspace.
  - OAuth & Permissions → Bot Token Scopes: `chat:write`, `channels:read`, `users:read`.
  - Install to workspace → copy Bot User OAuth Token.
- **Env var:** `SLACK_BOT_TOKEN=xoxb-xxxxxxxx`

### Telegram
- **Where:** Open Telegram → search `@BotFather` → `/newbot` → follow prompts.
- **Env var:** `TELEGRAM_BOT_TOKEN=xxxxxxxx:yyyyyy`

### WhatsApp (Cloud API via Meta)
- **Where:** https://developers.facebook.com/apps → Create App → "Business" type → add the WhatsApp product.
  - Get Phone Number ID and Permanent Access Token.
- **Env vars:** `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`

### Discord bot (for two-way agent control, separate from the webhook above)
- **Where:** https://discord.com/developers/applications → New Application → Bot → "Reset Token" → copy.
- **Env var:** `DISCORD_BOT_TOKEN=xxxxxxxx`
- Invite link: `https://discord.com/oauth2/authorize?client_id=<APP_ID>&permissions=2147485696&scope=bot`

### Google Calendar (separate OAuth client from sign-in)
- **Where:** Same Google Cloud project as sign-in:
  1. APIs & Services → Library → enable "Google Calendar API".
  2. Credentials → Create OAuth Client (Web application) — *or reuse the sign-in client if scopes overlap*.
  3. Add scope `https://www.googleapis.com/auth/calendar` on the consent screen.
- **Env vars:** `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`

### Microsoft Graph (Outlook calendar / Teams)
- **Where:** https://entra.microsoft.com → App registrations → New registration.
  - Redirect URI: `<backend>/auth/microsoft/callback`.
  - API permissions → add `Calendars.ReadWrite`, `User.Read`, `Mail.Send`.
  - Certificates & secrets → New client secret → copy.
- **Env vars:** `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`

### Twitter / X (marketing analytics, posting)
- **Where:** https://developer.twitter.com/en/portal/dashboard → Projects & Apps → create app → Keys and tokens → Bearer Token.
- **Env var:** `TWITTER_BEARER_TOKEN=xxxxxxxx`

### LinkedIn (marketing posting + analytics)
- **Where:** https://www.linkedin.com/developers/apps → Create app → Auth → request `w_member_social` + `r_organization_social` products.
- **Env vars:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

### Meta / Facebook Ads
- **Where:** https://developers.facebook.com/apps → Create app → "Business" → add Marketing API product → generate System User token in Business Manager.
- **Env vars:** `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`

---

## 8. Vector store — Chroma (default) or Pinecone

### Chroma (default, no setup)
Runs locally; data goes into `agent-swarm/memory/chroma/`. Nothing to configure.

### Pinecone (production drop-in)
- **Where:** https://app.pinecone.io → API keys → copy.
- **Env vars:** `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`

---

## 9. SEO + Search Console

Once your real domain is live (you mentioned `aos-swarm.com` is coming):
1. https://search.google.com/search-console → Add Property → choose Domain.
2. Verify with the DNS TXT record they give you (add it at your registrar).
3. Submit `https://aos-swarm.com/sitemap.xml` (we'll generate it once routes stabilise).
4. Repeat for https://www.bing.com/webmasters.

---

## 10. Where each variable goes

| Where you set it          | Affects                                        |
|---------------------------|-----------------------------------------------|
| Render → backend service → Environment | All backend `*_KEY`, `DATABASE_URL`, `REDIS_URL`, `SENTRY_DSN`, OAuth, MCP tokens, email transport |
| Vercel → project → Settings → Environment Variables | All frontend `VITE_*` vars (Google client ID, Sentry DSN, PostHog key, API URL) |
| Local dev (`backend/.env`) | Anything you want active locally — copy the relevant lines from `backend/.env.example` |
| Local dev (`frontend/.env`) | Same, but `VITE_*` only — copy from `frontend/.env.example` |

After changing env vars on Render or Vercel, **redeploy** — env changes don't take effect on running instances.

---

## Quick prioritised checklist

For a real beta launch, fill these first (everything else can wait):

1. `RESEND_API_KEY` — without it, email verification + password reset just print to logs
2. `SENTRY_DSN` + `VITE_SENTRY_DSN` — you'll regret not having this the first time something breaks in prod
3. `VITE_POSTHOG_KEY` + `POSTHOG_API_KEY` — so you can see how testers actually use the app
4. `VITE_GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_ID` — friction-free signup
5. `DISCORD_WEBHOOK_URL` — get pinged when someone signs up
6. At least one LLM key: `ANTHROPIC_API_KEY` *or* `OPENAI_API_KEY` *or* `GEMINI_API_KEY`
7. `GITHUB_TOKEN` — only one MCP integration you almost certainly want for engineering workflows

That covers ~80% of the value. The rest you can wire up as testers ask for specific integrations.
