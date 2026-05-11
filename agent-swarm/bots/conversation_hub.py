#!/usr/bin/env python3
"""
Conversation Hub

Unified routing layer that ties every messaging channel (WhatsApp, Telegram, Slack)
to the right swarm agent.  A single entry-point for all inbound messages.

Architecture
------------
  inbound message (any channel)
       │
       ▼
  ConversationHub.handle()
       │
       ├─ look up routing rule for (channel, user_id)
       │      → if explicit rule: use configured agent
       │      → else:  auto-triage via keyword heuristics
       │
       ├─ AOS policy gate
       │
       ├─ run agent (direct Anthropic API call or swarm agent)
       │
       └─ send reply back through originating channel

Routing rules are persisted to ~/.swarm/hub/routes.json so the owner can
configure them once and they survive restarts.

Usage
-----
  from bots.conversation_hub import ConversationHub
  hub = ConversationHub()

  # From a Telegram webhook handler:
  reply = hub.handle(channel="telegram", user_id="123456", text="check my ad spend")

  # From a WhatsApp webhook handler:
  reply = hub.handle(channel="whatsapp", user_id="+2348012345678", text="run weekly report")

  # Owner can set routing rules at runtime:
  hub.set_route(channel="telegram", user_id="123456", agent="marketing-social-media-strategist")
  hub.set_route(channel="whatsapp", user_id="+234*", agent="support-support-responder")  # wildcard
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

# ─────────────────────────────────────────────────────────────────────────────
# Storage
# ─────────────────────────────────────────────────────────────────────────────

_ROUTES_FILE = Path(os.environ.get("SWARM_HUB_ROUTES", Path.home() / ".swarm" / "hub" / "routes.json"))
_HISTORY_FILE = Path(os.environ.get("SWARM_HUB_HISTORY", Path.home() / ".swarm" / "hub" / "history.json"))
_MAX_HISTORY = 20  # messages per user to keep for context


def _ensure_dir(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)


def _load_json(p: Path, default: object) -> object:
    try:
        return json.loads(p.read_text())
    except Exception:
        return default


def _save_json(p: Path, data: object) -> None:
    _ensure_dir(p)
    p.write_text(json.dumps(data, indent=2))


# ─────────────────────────────────────────────────────────────────────────────
# Data types
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class RouteRule:
    """Maps a (channel, user_id_pattern) pair to a specific agent."""
    channel: str         # telegram | whatsapp | slack
    user_pattern: str    # exact id or glob-style prefix (e.g. "+234*")
    agent: str           # swarm agent name
    note: str = ""


@dataclass
class HubMessage:
    channel: str
    user_id: str
    text: str
    timestamp: float = field(default_factory=time.time)
    role: str = "user"   # user | assistant


@dataclass
class HubResult:
    ok: bool
    reply: str = ""
    agent_used: str = ""
    error: str = ""


# ─────────────────────────────────────────────────────────────────────────────
# Keyword-based agent triage (fallback when no routing rule exists)
# ─────────────────────────────────────────────────────────────────────────────

_TRIAGE: list[tuple[list[str], str]] = [
    # keywords → agent
    (["tweet", "twitter", "thread", "post on x", "x.com"], "marketing-twitter-engager"),
    (["linkedin", "article", "publish post"], "marketing-content-marketer"),
    (["instagram", "reel", "story", "ig"], "marketing-social-media-strategist"),
    (["ad ", "ads ", "campaign", "google ads", "meta ads", "facebook ads", "budget"], "marketing-paid-ads-optimizer"),
    (["email", "newsletter", "drip", "mailchimp"], "marketing-email-marketer"),
    (["seo", "keyword", "ranking", "backlink"], "marketing-seo-strategist"),
    (["support", "complaint", "refund", "ticket", "help me", "issue"], "support-support-responder"),
    (["analytics", "report", "metrics", "kpi", "dashboard"], "support-analytics-reporter"),
    (["invoice", "billing", "payment", "subscription", "finance", "expense"], "support-finance-tracker"),
    (["github", "pull request", "pr", "issue", "commit", "deploy", "release"], "github-automation-agent"),
    (["schedule", "cron", "automate", "every day", "every week", "remind"], "cron-scheduler-agent"),
    (["sales", "prospect", "outreach", "cold email", "lead"], "sales-outbound-strategist"),
    (["onboard", "hire", "hr", "employee", "contract"], "hr-onboarding-assistant"),
    (["legal", "contract", "agreement", "compliance"], "legal-contract-reviewer"),
]


def _triage_agent(text: str) -> str:
    lower = text.lower()
    for keywords, agent in _TRIAGE:
        if any(kw in lower for kw in keywords):
            return agent
    return "product-manager"  # catch-all generalist


# ─────────────────────────────────────────────────────────────────────────────
# LLM direct call (Anthropic Claude)
# ─────────────────────────────────────────────────────────────────────────────

_ANTHROPIC_API = "https://api.anthropic.com/v1/messages"
_DEFAULT_MODEL = os.environ.get("HUB_LLM_MODEL", "claude-haiku-4-5-20251001")


def _call_llm(system: str, messages: list[dict], max_tokens: int = 1024) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return "[LLM unavailable — ANTHROPIC_API_KEY not set]"

    body = json.dumps({
        "model": _DEFAULT_MODEL,
        "max_tokens": max_tokens,
        "system": system,
        "messages": messages,
    }).encode()

    req = urllib.request.Request(
        _ANTHROPIC_API,
        data=body,
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())["content"][0]["text"]
    except urllib.error.HTTPError as exc:
        return f"[LLM error {exc.code}: {exc.read().decode(errors='replace')[:200]}]"
    except Exception as exc:
        return f"[LLM error: {exc}]"


# ─────────────────────────────────────────────────────────────────────────────
# AOS Policy gate (lightweight — checks backend if configured)
# ─────────────────────────────────────────────────────────────────────────────

_AOS_BASE = os.environ.get("AOS_BASE_URL", "http://localhost:8000")


def _aos_allowed(agent: str, user_id: str, channel: str) -> tuple[bool, str]:
    """Returns (allowed, reason). Defaults to True if AOS backend is unreachable."""
    api_key = os.environ.get("SWARM_API_KEY", "")
    if not api_key:
        return True, "no AOS key configured"

    try:
        body = json.dumps({
            "agent": agent,
            "context": {"channel": channel, "user_id": user_id},
        }).encode()
        req = urllib.request.Request(
            f"{_AOS_BASE}/api/swarm/policy/evaluate/",
            data=body,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            result = json.loads(resp.read())
            allowed = result.get("allowed", True)
            reason = result.get("reason", "")
            return allowed, reason
    except Exception:
        return True, "AOS unreachable — defaulting to allow"


# ─────────────────────────────────────────────────────────────────────────────
# Conversation Hub
# ─────────────────────────────────────────────────────────────────────────────

class ConversationHub:
    """
    Central message router and conversation manager for all messaging channels.

    Typical usage inside a webhook handler:

        hub = ConversationHub()
        result = hub.handle(channel="telegram", user_id="123", text=user_text)
        if result.ok:
            send_reply(result.reply)
    """

    def __init__(self) -> None:
        self._routes: list[RouteRule] = []
        self._history: dict[str, list[dict]] = {}
        self._load_routes()
        self._load_history()

    # ── Persistence ──────────────────────────────────────────────────────────

    def _load_routes(self) -> None:
        raw = _load_json(_ROUTES_FILE, [])
        self._routes = [RouteRule(**r) for r in raw] if isinstance(raw, list) else []

    def _save_routes(self) -> None:
        _save_json(_ROUTES_FILE, [asdict(r) for r in self._routes])

    def _load_history(self) -> None:
        self._history = _load_json(_HISTORY_FILE, {})  # type: ignore[assignment]

    def _save_history(self) -> None:
        _save_json(_HISTORY_FILE, self._history)

    # ── Routing rules ────────────────────────────────────────────────────────

    def _key(self, channel: str, user_id: str) -> str:
        return f"{channel}:{user_id}"

    def _match_pattern(self, pattern: str, user_id: str) -> bool:
        if pattern.endswith("*"):
            return user_id.startswith(pattern[:-1])
        return pattern == user_id

    def _resolve_agent(self, channel: str, user_id: str, text: str) -> str:
        for rule in self._routes:
            if rule.channel == channel and self._match_pattern(rule.user_pattern, user_id):
                return rule.agent
        return _triage_agent(text)

    def set_route(self, channel: str, user_id: str, agent: str, note: str = "") -> None:
        """Pin a user to a specific agent. Use '*' suffix for wildcard matching."""
        for rule in self._routes:
            if rule.channel == channel and rule.user_pattern == user_id:
                rule.agent = agent
                rule.note = note
                self._save_routes()
                return
        self._routes.append(RouteRule(channel=channel, user_pattern=user_id, agent=agent, note=note))
        self._save_routes()

    def remove_route(self, channel: str, user_id: str) -> bool:
        before = len(self._routes)
        self._routes = [r for r in self._routes if not (r.channel == channel and r.user_pattern == user_id)]
        self._save_routes()
        return len(self._routes) < before

    def list_routes(self) -> list[dict]:
        return [asdict(r) for r in self._routes]

    # ── History ───────────────────────────────────────────────────────────────

    def _get_history(self, channel: str, user_id: str) -> list[dict]:
        return self._history.get(self._key(channel, user_id), [])

    def _append_history(self, channel: str, user_id: str, role: str, text: str) -> None:
        key = self._key(channel, user_id)
        hist = self._history.setdefault(key, [])
        hist.append({"role": role, "content": text})
        if len(hist) > _MAX_HISTORY * 2:
            self._history[key] = hist[-((_MAX_HISTORY * 2)):]
        self._save_history()

    def clear_history(self, channel: str, user_id: str) -> None:
        self._history.pop(self._key(channel, user_id), None)
        self._save_history()

    # ── Core handle ──────────────────────────────────────────────────────────

    def handle(
        self,
        channel: str,
        user_id: str,
        text: str,
        *,
        agent_override: Optional[str] = None,
        system_context: str = "",
    ) -> HubResult:
        """
        Process an inbound message and return a HubResult with the reply.

        Parameters
        ----------
        channel:         "telegram" | "whatsapp" | "slack"
        user_id:         Platform-specific user identifier
        text:            The raw inbound message text
        agent_override:  Skip routing and use this agent directly
        system_context:  Extra system prompt context (e.g. from a bot wrapper)
        """
        text = text.strip()
        if not text:
            return HubResult(ok=False, error="empty message")

        # Hub management commands (owner-only, prefixed with /)
        hub_cmd = self._try_hub_command(channel, user_id, text)
        if hub_cmd is not None:
            return hub_cmd

        # Resolve agent
        agent = agent_override or self._resolve_agent(channel, user_id, text)

        # AOS policy gate
        allowed, reason = _aos_allowed(agent, user_id, channel)
        if not allowed:
            return HubResult(ok=False, error=f"Blocked by policy: {reason}", agent_used=agent)

        # Build message history for context
        history = self._get_history(channel, user_id)
        self._append_history(channel, user_id, "user", text)

        # Build system prompt
        system = self._build_system_prompt(agent, channel, system_context)

        # Run LLM
        messages = history + [{"role": "user", "content": text}]
        reply = _call_llm(system, messages)

        self._append_history(channel, user_id, "assistant", reply)

        return HubResult(ok=True, reply=reply, agent_used=agent)

    # ── Hub commands ─────────────────────────────────────────────────────────

    _OWNER_IDS = set(filter(None, os.environ.get("HUB_OWNER_IDS", "").split(",")))

    def _try_hub_command(self, channel: str, user_id: str, text: str) -> Optional[HubResult]:
        """Handle /hub_* management commands. Returns None if not a hub command."""
        if not text.startswith("/hub"):
            return None

        parts = text.split()
        cmd = parts[0].lower()

        # Only the owner can use hub management commands
        if self._OWNER_IDS and user_id not in self._OWNER_IDS:
            return HubResult(ok=False, error="Unauthorized hub command", agent_used="hub")

        if cmd == "/hub_status":
            routes = self.list_routes()
            lines = [f"Hub status — {len(routes)} routing rules:"]
            for r in routes:
                lines.append(f"  [{r['channel']}] {r['user_pattern']} → {r['agent']}")
            return HubResult(ok=True, reply="\n".join(lines) or "No rules set.", agent_used="hub")

        if cmd == "/hub_route" and len(parts) >= 3:
            # /hub_route <user_id_or_pattern> <agent_name>
            target_user = parts[1]
            target_agent = parts[2]
            self.set_route(channel, target_user, target_agent)
            return HubResult(ok=True, reply=f"Routed {target_user} → {target_agent}", agent_used="hub")

        if cmd == "/hub_unroute" and len(parts) >= 2:
            removed = self.remove_route(channel, parts[1])
            msg = f"Removed route for {parts[1]}" if removed else f"No route found for {parts[1]}"
            return HubResult(ok=True, reply=msg, agent_used="hub")

        if cmd == "/hub_clear":
            self.clear_history(channel, user_id)
            return HubResult(ok=True, reply="Conversation history cleared.", agent_used="hub")

        if cmd == "/hub_agent" and len(parts) >= 2:
            # Force next message to use a specific agent
            self.set_route(channel, user_id, parts[1], note="manual override")
            return HubResult(ok=True, reply=f"Switched your agent to {parts[1]}", agent_used="hub")

        if cmd == "/hub_help":
            help_text = (
                "Hub commands:\n"
                "  /hub_status            — list all routing rules\n"
                "  /hub_route <user> <agent> — pin a user to an agent\n"
                "  /hub_unroute <user>    — remove a routing rule\n"
                "  /hub_agent <agent>     — switch your own agent\n"
                "  /hub_clear             — clear your conversation history\n"
                "  /hub_help              — show this help"
            )
            return HubResult(ok=True, reply=help_text, agent_used="hub")

        return HubResult(ok=False, error=f"Unknown hub command: {cmd}", agent_used="hub")

    # ── System prompt builder ────────────────────────────────────────────────

    def _build_system_prompt(self, agent: str, channel: str, extra: str) -> str:
        agent_descriptions = {
            "marketing-twitter-engager": "You are the Twitter/X marketing agent. Write engaging tweets and threads.",
            "marketing-content-marketer": "You are the content marketing agent. Create compelling articles and posts.",
            "marketing-social-media-strategist": "You are the social media strategist. Plan and create social content.",
            "marketing-paid-ads-optimizer": "You are the paid ads optimizer. Analyze and optimize Google and Meta ad campaigns.",
            "marketing-email-marketer": "You are the email marketing agent. Write and plan email campaigns.",
            "marketing-seo-strategist": "You are the SEO strategist. Research keywords and optimize content.",
            "support-support-responder": "You are the customer support agent. Respond to customer issues professionally.",
            "support-analytics-reporter": "You are the analytics reporter. Generate performance reports and insights.",
            "support-finance-tracker": "You are the finance tracker. Monitor budgets, expenses, and financial health.",
            "github-automation-agent": "You are the GitHub automation agent. Manage issues, PRs, and releases.",
            "cron-scheduler-agent": "You are the cron scheduler agent. Create and manage scheduled automated tasks.",
            "sales-outbound-strategist": "You are the sales agent. Craft outreach messages and manage prospects.",
            "hr-onboarding-assistant": "You are the HR assistant. Help with onboarding, hiring, and HR processes.",
            "legal-contract-reviewer": "You are the legal assistant. Review contracts and flag compliance issues.",
            "product-manager": "You are the product manager. Answer questions, prioritize features, and drive strategy.",
        }

        base = agent_descriptions.get(agent, f"You are {agent}, a specialized AI agent.")
        channel_note = f"You are responding via {channel}. Keep replies concise and mobile-friendly."

        parts = [base, channel_note]
        if extra:
            parts.append(extra)

        return "\n\n".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# Channel-specific send helpers (used by bot wrappers)
# ─────────────────────────────────────────────────────────────────────────────

def send_via_channel(channel: str, user_id: str, text: str) -> bool:
    """
    Send a reply back through the appropriate channel.

    Returns True if sent successfully. Channel credentials must be set in env:
      - telegram: TELEGRAM_BOT_TOKEN
      - whatsapp: META_WHATSAPP_TOKEN + META_WHATSAPP_PHONE_ID
      - slack:    SLACK_BOT_TOKEN
    """
    try:
        if channel == "telegram":
            return _send_telegram(user_id, text)
        elif channel == "whatsapp":
            return _send_whatsapp(user_id, text)
        elif channel == "slack":
            return _send_slack(user_id, text)
        else:
            return False
    except Exception:
        return False


def _send_telegram(chat_id: str, text: str) -> bool:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    if not token:
        return False
    # Split long messages (Telegram 4096 char limit)
    chunks = [text[i:i+4096] for i in range(0, len(text), 4096)]
    for chunk in chunks:
        body = json.dumps({"chat_id": chat_id, "text": chunk, "parse_mode": "Markdown"}).encode()
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{token}/sendMessage",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(req, timeout=10)
        except Exception:
            return False
    return True


def _send_whatsapp(to: str, text: str) -> bool:
    token = os.environ.get("META_WHATSAPP_TOKEN", "")
    phone_id = os.environ.get("META_WHATSAPP_PHONE_ID", "")
    if not token or not phone_id:
        return False
    body = json.dumps({
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text[:4096]},
    }).encode()
    req = urllib.request.Request(
        f"https://graph.facebook.com/v20.0/{phone_id}/messages",
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def _send_slack(channel_or_user: str, text: str) -> bool:
    token = os.environ.get("SLACK_BOT_TOKEN", "")
    if not token:
        return False
    body = json.dumps({"channel": channel_or_user, "text": text}).encode()
    req = urllib.request.Request(
        "https://slack.com/api/chat.postMessage",
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Convenience: handle + auto-reply
# ─────────────────────────────────────────────────────────────────────────────

def handle_and_reply(channel: str, user_id: str, text: str) -> HubResult:
    """
    Process message and immediately send the reply back through the same channel.
    Drop-in handler for webhook integrations.
    """
    hub = ConversationHub()
    result = hub.handle(channel=channel, user_id=user_id, text=text)
    if result.ok and result.reply:
        send_via_channel(channel, user_id, result.reply)
    return result
