#!/usr/bin/env python3
"""
Telegram Bot — Autonomous Enterprise Assistant

A production-ready Telegram bot that routes incoming messages to the most
appropriate swarm agent, maintains per-user conversation history, and lets
the owner control the swarm directly from Telegram.

Usage:
  python bots/telegram_bot.py

Required env vars:
  TELEGRAM_BOT_TOKEN      — from @BotFather
  OWNER_TELEGRAM_ID       — your Telegram numeric user ID (bot only responds to this + allowed users)
  ANTHROPIC_API_KEY       — or whichever LLM backend you use

Optional:
  ALLOWED_USER_IDS        — comma-separated extra Telegram user IDs that can use the bot
  BOT_WEBHOOK_URL         — set this to enable webhook mode instead of long-polling
  BOT_WEBHOOK_SECRET      — secret token for webhook verification
  TELEGRAM_BOT_MODE       — "polling" (default) or "webhook"
  AOS_BASE_URL + AOS_TOKEN — connect to AOS control plane for policy checks
"""
from __future__ import annotations

import json
import logging
import os
import sys
import time
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from tools.messaging.telegram import (
    send_message, send_typing, get_updates, set_webhook,
    send_inline_keyboard, answer_callback, parse_update,
)
from core import aos_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("telegram_bot")

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

OWNER_ID = int(os.environ.get("OWNER_TELEGRAM_ID", "0"))
ALLOWED_IDS: set[int] = {OWNER_ID}
for _uid in os.environ.get("ALLOWED_USER_IDS", "").split(","):
    if _uid.strip().isdigit():
        ALLOWED_IDS.add(int(_uid.strip()))

# Per-chat conversation state: {chat_id: {"history": [...], "agent": str, "ctx": str}}
_SESSIONS: dict[int, dict] = {}


# ─────────────────────────────────────────────────────────────────────────────
# Agent routing — simple keyword-based triage, extend as needed
# ─────────────────────────────────────────────────────────────────────────────

_AGENT_KEYWORDS: list[tuple[list[str], str]] = [
    (["market", "campaign", "social", "post", "brand", "ads", "instagram", "twitter", "linkedin"],
     "marketing-social-media-strategist"),
    (["customer", "support", "complaint", "help", "issue", "ticket", "refund"],
     "support-support-responder"),
    (["sales", "deal", "proposal", "prospect", "revenue", "crm"],
     "sales-account-strategist"),
    (["code", "bug", "pr", "pull request", "github", "deploy", "ci", "test"],
     "engineering-full-stack-developer"),
    (["report", "analytics", "data", "metric", "dashboard", "kpi"],
     "support-analytics-reporter"),
    (["legal", "contract", "compliance", "gdpr", "policy"],
     "support-legal-compliance-checker"),
    (["finance", "budget", "cost", "invoice", "expense", "billing"],
     "support-finance-tracker"),
]

_DEFAULT_AGENT = "product-manager"


def _pick_agent(text: str) -> str:
    low = text.lower()
    for keywords, agent in _AGENT_KEYWORDS:
        if any(kw in low for kw in keywords):
            return agent
    return _DEFAULT_AGENT


# ─────────────────────────────────────────────────────────────────────────────
# Swarm execution — calls the AOS policy gate then dispatches to the agent
# ─────────────────────────────────────────────────────────────────────────────

def _run_agent(chat_id: int, text: str) -> str:
    session = _SESSIONS.setdefault(chat_id, {"history": [], "agent": None})
    agent = session["agent"] or _pick_agent(text)
    session["agent"] = agent

    execution_id = aos_client.new_execution_id()
    policy = aos_client.policy_check(
        execution_id=execution_id,
        agent_name=agent,
        task=text,
        engine="claude",
        workflow_phase="execute",
    )
    if policy.get("decision") not in ("allow", "audit"):
        reason = policy.get("reason", "Policy denied")
        return f"⚠️ I can't process that right now: {reason}"

    # Build conversation history for the LLM call
    history = session["history"][-10:]  # keep last 10 turns
    messages = history + [{"role": "user", "content": text}]

    # Call the LLM via the agent's system prompt
    agent_prompt = _load_agent_prompt(agent)
    reply = _llm_call(agent_prompt, messages)

    session["history"].append({"role": "user", "content": text})
    session["history"].append({"role": "assistant", "content": reply})

    aos_client.usage_report(
        execution_id=execution_id,
        agent_name=agent,
        engine="claude",
        tokens_input=len(text.split()),
        tokens_output=len(reply.split()),
        cost_usd=0.001,
        success=True,
    )
    return reply


def _load_agent_prompt(agent_name: str) -> str:
    """Load the agent's .md system prompt from the agents/ directory."""
    config_path = _root / "swarm.config.json"
    try:
        cfg = json.loads(config_path.read_text())
        agent_entry = cfg.get("agents", {}).get(agent_name, {})
        file_rel = agent_entry.get("file", "")
        if file_rel:
            md_path = _root / "agents" / file_rel
            if md_path.exists():
                return md_path.read_text(encoding="utf-8")
    except Exception:
        pass
    return f"You are {agent_name}, a specialist enterprise AI agent. Be helpful, concise, and professional."


def _llm_call(system_prompt: str, messages: list[dict]) -> str:
    """Call the Anthropic Claude API directly."""
    import urllib.request
    import urllib.error

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return "❌ ANTHROPIC_API_KEY not configured."

    payload = {
        "model": os.environ.get("BOT_MODEL", "claude-sonnet-4-6"),
        "max_tokens": 1024,
        "system": system_prompt[:8000],
        "messages": messages[-20:],
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=data,
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            return result["content"][0]["text"]
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="replace")[:300]
        log.error("Anthropic API error %s: %s", exc.code, body)
        return "⚠️ I ran into an error. Please try again."
    except Exception as exc:
        log.error("LLM call failed: %s", exc)
        return "⚠️ Something went wrong. Please try again."


# ─────────────────────────────────────────────────────────────────────────────
# Command handlers
# ─────────────────────────────────────────────────────────────────────────────

def _cmd_start(chat_id: int, username: str) -> None:
    _SESSIONS.pop(chat_id, None)  # fresh session
    send_message(chat_id, (
        f"👋 Hello <b>{username or 'there'}</b>!\n\n"
        "I'm your autonomous enterprise AI assistant. I can help with:\n\n"
        "• 📣 <b>Marketing</b> — campaigns, social posts, content strategy\n"
        "• 🎧 <b>Customer Support</b> — respond to customers, triage tickets\n"
        "• 📊 <b>Analytics</b> — reports, KPIs, dashboards\n"
        "• 💼 <b>Sales</b> — proposals, outreach, CRM updates\n"
        "• 💻 <b>Engineering</b> — code review, PRs, deployments\n"
        "• ⚖️ <b>Legal</b> — compliance checks, contract review\n\n"
        "Just tell me what you need. I'll route you to the right specialist.\n\n"
        "Commands: /start /agent /reset /status /help"
    ))


def _cmd_agent(chat_id: int, args: str) -> None:
    """Let user manually pick an agent."""
    if args.strip():
        agent = args.strip()
        _SESSIONS.setdefault(chat_id, {"history": [], "agent": None})["agent"] = agent
        send_message(chat_id, f"✅ Switched to agent: <code>{agent}</code>")
    else:
        send_inline_keyboard(chat_id, "Choose a specialist agent:", [[
            {"text": "📣 Marketing", "callback_data": "agent:marketing-social-media-strategist"},
            {"text": "🎧 Support", "callback_data": "agent:support-support-responder"},
        ], [
            {"text": "💼 Sales", "callback_data": "agent:sales-account-strategist"},
            {"text": "💻 Engineering", "callback_data": "agent:engineering-full-stack-developer"},
        ], [
            {"text": "📊 Analytics", "callback_data": "agent:support-analytics-reporter"},
            {"text": "⚖️ Legal", "callback_data": "agent:support-legal-compliance-checker"},
        ]])


def _cmd_reset(chat_id: int) -> None:
    _SESSIONS.pop(chat_id, None)
    send_message(chat_id, "🔄 Conversation reset. What can I help you with?")


def _cmd_status(chat_id: int) -> None:
    session = _SESSIONS.get(chat_id, {})
    agent = session.get("agent") or _DEFAULT_AGENT
    turns = len(session.get("history", [])) // 2
    send_message(chat_id, (
        f"📍 <b>Status</b>\n"
        f"Active agent: <code>{agent}</code>\n"
        f"Conversation turns: {turns}\n"
        f"AOS connected: {'✅' if aos_client.ENABLED else '❌'}"
    ))


def _cmd_help(chat_id: int) -> None:
    send_message(chat_id, (
        "📖 <b>Commands</b>\n\n"
        "/start — Introduce yourself and reset\n"
        "/agent — Pick a specialist agent\n"
        "/agent &lt;name&gt; — Switch to a named agent directly\n"
        "/reset — Clear conversation history\n"
        "/status — Show current agent and session info\n"
        "/help — This message\n\n"
        "Or just type naturally — I'll figure out the right agent."
    ))


# ─────────────────────────────────────────────────────────────────────────────
# Update dispatcher
# ─────────────────────────────────────────────────────────────────────────────

def _handle_update(update: dict) -> None:
    parsed = parse_update(update)
    if not parsed:
        return

    chat_id = parsed["chat_id"]
    user_id = parsed["user_id"]
    username = parsed.get("username", "")

    if user_id not in ALLOWED_IDS:
        send_message(chat_id, "⛔ You are not authorised to use this bot.")
        return

    if parsed["type"] == "callback":
        answer_callback(parsed["callback_query_id"])
        data = parsed["text"]
        if data.startswith("agent:"):
            agent_name = data.split(":", 1)[1]
            _SESSIONS.setdefault(chat_id, {"history": [], "agent": None})["agent"] = agent_name
            send_message(chat_id, f"✅ Switched to <code>{agent_name}</code>. How can I help?")
        return

    text = parsed["text"].strip()
    if not text:
        return

    if text.startswith("/"):
        parts = text.split(None, 1)
        cmd = parts[0].lstrip("/").split("@")[0].lower()
        args = parts[1] if len(parts) > 1 else ""
        if cmd == "start":
            _cmd_start(chat_id, username)
        elif cmd == "agent":
            _cmd_agent(chat_id, args)
        elif cmd == "reset":
            _cmd_reset(chat_id)
        elif cmd == "status":
            _cmd_status(chat_id)
        elif cmd == "help":
            _cmd_help(chat_id)
        else:
            send_message(chat_id, f"Unknown command: /{cmd}. Try /help")
        return

    # Normal message — run through the swarm
    send_typing(chat_id)
    reply = _run_agent(chat_id, text)
    send_message(chat_id, reply)


# ─────────────────────────────────────────────────────────────────────────────
# Polling loop
# ─────────────────────────────────────────────────────────────────────────────

def run_polling() -> None:
    log.info("Starting Telegram bot in long-polling mode...")
    info = get_updates(timeout=0)  # flush any old updates
    offset = 0

    while True:
        result = get_updates(offset=offset, timeout=30)
        if not result.ok:
            log.warning("getUpdates error: %s", result.error)
            time.sleep(5)
            continue

        for update in (result.data or []):
            offset = update["update_id"] + 1
            try:
                _handle_update(update)
            except Exception:
                log.exception("Error handling update %s", update.get("update_id"))


# ─────────────────────────────────────────────────────────────────────────────
# Webhook server (simple, no extra deps)
# ─────────────────────────────────────────────────────────────────────────────

def run_webhook(host: str = "0.0.0.0", port: int = 8443) -> None:
    from http.server import BaseHTTPRequestHandler, HTTPServer

    secret = os.environ.get("BOT_WEBHOOK_SECRET", "")
    webhook_url = os.environ.get("BOT_WEBHOOK_URL", "")
    if webhook_url:
        set_webhook(webhook_url, secret_token=secret)
        log.info("Webhook registered: %s", webhook_url)

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if secret and self.headers.get("X-Telegram-Bot-Api-Secret-Token") != secret:
                self.send_response(403)
                self.end_headers()
                return
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                update = json.loads(body)
                _handle_update(update)
            except Exception:
                log.exception("Webhook handler error")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")

        def log_message(self, *args):
            pass  # suppress default HTTP logging

    log.info("Webhook server listening on %s:%s", host, port)
    HTTPServer((host, port), Handler).serve_forever()


if __name__ == "__main__":
    mode = os.environ.get("TELEGRAM_BOT_MODE", "polling").lower()
    if mode == "webhook":
        run_webhook()
    else:
        run_polling()
