#!/usr/bin/env python3
"""
WhatsApp Business Cloud API Bot — Autonomous Enterprise Assistant

Handles incoming WhatsApp messages, routes them to the appropriate swarm agent,
and replies on the same conversation thread.

Deploy on any HTTPS server (Railway, Render, Fly.io, etc.).
Meta requires a public HTTPS URL for the webhook.

Usage:
  python bots/whatsapp_bot.py

Required env vars:
  WHATSAPP_TOKEN         — Meta permanent/system-user token
  WHATSAPP_PHONE_ID      — Phone Number ID from Meta Business dashboard
  WHATSAPP_VERIFY_TOKEN  — Arbitrary string you set when registering the webhook
  ANTHROPIC_API_KEY      — for LLM calls
  OWNER_WHATSAPP_NUMBER  — your WhatsApp number in E.164 (e.g. +2348012345678)

Optional:
  ALLOWED_WA_NUMBERS     — comma-separated extra numbers allowed to chat
  BOT_WEBHOOK_PORT       — port to listen on, default 8080
  AOS_BASE_URL + AOS_TOKEN
"""
from __future__ import annotations

import json
import logging
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from tools.messaging.whatsapp import send_text, mark_read, parse_inbound, verify_webhook
from core import aos_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("whatsapp_bot")

OWNER_NUMBER = os.environ.get("OWNER_WHATSAPP_NUMBER", "")
ALLOWED_NUMBERS: set[str] = set()
if OWNER_NUMBER:
    ALLOWED_NUMBERS.add(OWNER_NUMBER.replace("+", "").replace(" ", ""))
for _n in os.environ.get("ALLOWED_WA_NUMBERS", "").split(","):
    if _n.strip():
        ALLOWED_NUMBERS.add(_n.strip().replace("+", "").replace(" ", ""))

# Per-number session: {number: {"history": [...], "agent": str}}
_SESSIONS: dict[str, dict] = {}


# ─────────────────────────────────────────────────────────────────────────────
# Agent routing (same logic as Telegram bot)
# ─────────────────────────────────────────────────────────────────────────────

_AGENT_KEYWORDS: list[tuple[list[str], str]] = [
    (["market", "campaign", "social", "post", "brand", "ads"],
     "marketing-social-media-strategist"),
    (["customer", "support", "complaint", "issue", "ticket", "refund", "help"],
     "support-support-responder"),
    (["sales", "deal", "proposal", "prospect", "revenue"],
     "sales-account-strategist"),
    (["code", "bug", "pr", "github", "deploy", "test"],
     "engineering-full-stack-developer"),
    (["report", "analytics", "data", "metric", "kpi"],
     "support-analytics-reporter"),
    (["legal", "contract", "compliance"],
     "support-legal-compliance-checker"),
    (["finance", "budget", "cost", "invoice", "expense"],
     "support-finance-tracker"),
]

_DEFAULT_AGENT = "product-manager"


def _pick_agent(text: str) -> str:
    low = text.lower()
    for keywords, agent in _AGENT_KEYWORDS:
        if any(kw in low for kw in keywords):
            return agent
    return _DEFAULT_AGENT


def _load_agent_prompt(agent_name: str) -> str:
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
    return f"You are {agent_name}, a specialist enterprise AI agent. Reply in a WhatsApp-friendly format (short, clear, no markdown)."


def _llm_call(system_prompt: str, messages: list[dict]) -> str:
    import urllib.request, urllib.error
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return "❌ ANTHROPIC_API_KEY not configured on this server."
    payload = {
        "model": os.environ.get("BOT_MODEL", "claude-sonnet-4-6"),
        "max_tokens": 512,
        "system": system_prompt[:6000] + "\n\nIMPORTANT: Reply in plain text suitable for WhatsApp. Keep responses concise.",
        "messages": messages[-16:],
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
            return json.loads(resp.read())["content"][0]["text"]
    except Exception as exc:
        log.error("LLM call failed: %s", exc)
        return "Sorry, I ran into an error. Please try again."


def _handle_message(from_number: str, text: str, message_id: str, name: str) -> None:
    mark_read(message_id)

    from_clean = from_number.replace("+", "").replace(" ", "")
    if ALLOWED_NUMBERS and from_clean not in ALLOWED_NUMBERS:
        send_text(from_number, "Sorry, you're not authorised to use this service.")
        return

    text = text.strip()
    session = _SESSIONS.setdefault(from_number, {"history": [], "agent": None})

    # Command handling
    lower = text.lower()
    if lower in ("/start", "hi", "hello", "hey"):
        session["history"].clear()
        session["agent"] = None
        greeting = (
            f"👋 Hello {name or 'there'}!\n\n"
            "I'm your enterprise AI assistant. I can help with marketing, "
            "sales, support, analytics, legal, engineering, and more.\n\n"
            "Just tell me what you need!"
        )
        send_text(from_number, greeting)
        return

    if lower == "/reset":
        session["history"].clear()
        session["agent"] = None
        send_text(from_number, "🔄 Conversation reset!")
        return

    if lower.startswith("/agent "):
        agent_name = text[7:].strip()
        session["agent"] = agent_name
        send_text(from_number, f"✅ Switched to agent: {agent_name}")
        return

    agent = session["agent"] or _pick_agent(text)
    session["agent"] = agent

    execution_id = aos_client.new_execution_id()
    policy = aos_client.policy_check(
        execution_id=execution_id,
        agent_name=agent,
        task=text,
        engine="claude",
    )
    if policy.get("decision") not in ("allow", "audit"):
        send_text(from_number, f"⚠️ {policy.get('reason', 'Request blocked by policy.')}")
        return

    system_prompt = _load_agent_prompt(agent)
    messages = session["history"][-14:] + [{"role": "user", "content": text}]
    reply = _llm_call(system_prompt, messages)

    session["history"].append({"role": "user", "content": text})
    session["history"].append({"role": "assistant", "content": reply})

    aos_client.usage_report(
        execution_id=execution_id,
        agent_name=agent,
        engine="claude",
        tokens_input=len(text.split()),
        tokens_output=len(reply.split()),
        cost_usd=0.0005,
        success=True,
    )
    send_text(from_number, reply)


# ─────────────────────────────────────────────────────────────────────────────
# HTTP server
# ─────────────────────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        """Meta webhook verification handshake."""
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        mode = params.get("hub.mode", [""])[0]
        token = params.get("hub.verify_token", [""])[0]
        challenge = params.get("hub.challenge", [""])[0]
        result = verify_webhook(mode, token, challenge)
        if result:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(result.encode())
        else:
            self.send_response(403)
            self.end_headers()

    def do_POST(self):
        """Receive inbound messages from Meta."""
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok")

        try:
            payload = json.loads(body)
            for msg in parse_inbound(payload):
                if msg["type"] == "text" and msg["text"]:
                    _handle_message(
                        from_number=msg["from"],
                        text=msg["text"],
                        message_id=msg["message_id"],
                        name=msg.get("name", ""),
                    )
        except Exception:
            log.exception("WhatsApp webhook error")

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    port = int(os.environ.get("BOT_WEBHOOK_PORT", "8080"))
    log.info("WhatsApp bot webhook server on port %s", port)
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()
