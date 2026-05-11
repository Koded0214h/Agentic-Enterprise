"""
Telegram Bot API tool.

Required env vars:
  TELEGRAM_BOT_TOKEN   — from @BotFather

Optional:
  TELEGRAM_API_BASE    — override for local Bot API server, default "https://api.telegram.org"

Docs: https://core.telegram.org/bots/api
"""
from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
from typing import Optional

from tools.base import ToolResult, require_env

_BASE = os.environ.get("TELEGRAM_API_BASE", "https://api.telegram.org")


def _call(method: str, body: dict) -> ToolResult:
    cfg = require_env("TELEGRAM_BOT_TOKEN")
    url = f"{_BASE}/bot{cfg['TELEGRAM_BOT_TOKEN']}/{method}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            if result.get("ok"):
                return ToolResult(ok=True, data=result.get("result"))
            return ToolResult(ok=False, error=result.get("description", "Telegram error"))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def send_message(chat_id: str | int, text: str,
                 parse_mode: str = "HTML",
                 reply_to: Optional[int] = None) -> ToolResult:
    """Send a text message to a chat or user."""
    body: dict = {"chat_id": chat_id, "text": text, "parse_mode": parse_mode}
    if reply_to:
        body["reply_to_message_id"] = reply_to
    return _call("sendMessage", body)


def send_photo(chat_id: str | int, photo_url: str, caption: str = "") -> ToolResult:
    """Send a photo by URL."""
    body: dict = {"chat_id": chat_id, "photo": photo_url}
    if caption:
        body["caption"] = caption
        body["parse_mode"] = "HTML"
    return _call("sendPhoto", body)


def send_document(chat_id: str | int, doc_url: str, caption: str = "") -> ToolResult:
    """Send a document/file by URL."""
    body: dict = {"chat_id": chat_id, "document": doc_url}
    if caption:
        body["caption"] = caption
    return _call("sendDocument", body)


def send_inline_keyboard(chat_id: str | int, text: str,
                         buttons: list[list[dict]]) -> ToolResult:
    """
    Send a message with an inline keyboard.

    buttons: 2D list of {"text": "Label", "callback_data": "action_id"}
    Example: [[{"text": "Yes ✅", "callback_data": "yes"}, {"text": "No ❌", "callback_data": "no"}]]
    """
    return _call("sendMessage", {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": {"inline_keyboard": buttons},
    })


def answer_callback(callback_query_id: str, text: str = "", show_alert: bool = False) -> ToolResult:
    """Answer an inline keyboard callback so Telegram stops the spinner."""
    return _call("answerCallbackQuery", {
        "callback_query_id": callback_query_id,
        "text": text,
        "show_alert": show_alert,
    })


def edit_message(chat_id: str | int, message_id: int, new_text: str) -> ToolResult:
    """Edit a previously sent message."""
    return _call("editMessageText", {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": new_text,
        "parse_mode": "HTML",
    })


def delete_message(chat_id: str | int, message_id: int) -> ToolResult:
    """Delete a message."""
    return _call("deleteMessage", {"chat_id": chat_id, "message_id": message_id})


def send_typing(chat_id: str | int) -> ToolResult:
    """Show typing indicator in a chat."""
    return _call("sendChatAction", {"chat_id": chat_id, "action": "typing"})


def get_me() -> ToolResult:
    """Return info about the bot (useful for health checks)."""
    cfg = require_env("TELEGRAM_BOT_TOKEN")
    url = f"{_BASE}/bot{cfg['TELEGRAM_BOT_TOKEN']}/getMe"
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            return ToolResult(ok=result.get("ok", False), data=result.get("result"))
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def set_webhook(url: str, secret_token: str = "") -> ToolResult:
    """Register a webhook URL with Telegram."""
    body: dict = {"url": url}
    if secret_token:
        body["secret_token"] = secret_token
    return _call("setWebhook", body)


def delete_webhook() -> ToolResult:
    """Remove the webhook (switch back to long-polling mode)."""
    return _call("deleteWebhook", {"drop_pending_updates": False})


def get_updates(offset: int = 0, timeout: int = 30) -> ToolResult:
    """Long-poll for updates (use only when webhook is not set)."""
    return _call("getUpdates", {"offset": offset, "timeout": timeout})


def parse_update(update: dict) -> Optional[dict]:
    """
    Extract the essential fields from any Telegram Update object.

    Returns a normalised dict: chat_id, user_id, username, text, type, raw.
    Returns None for updates that have no actionable message.
    """
    msg = update.get("message") or update.get("edited_message")
    cb = update.get("callback_query")

    if cb:
        msg = cb.get("message", {})
        return {
            "type": "callback",
            "chat_id": msg.get("chat", {}).get("id"),
            "user_id": cb["from"]["id"],
            "username": cb["from"].get("username", ""),
            "text": cb.get("data", ""),
            "callback_query_id": cb["id"],
            "raw": update,
        }

    if msg:
        return {
            "type": "message",
            "chat_id": msg["chat"]["id"],
            "user_id": msg["from"]["id"],
            "username": msg["from"].get("username", ""),
            "text": msg.get("text", ""),
            "raw": update,
        }

    return None
