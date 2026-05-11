"""
WhatsApp Business Cloud API tool.

Required env vars:
  WHATSAPP_TOKEN          — Meta permanent token (or System User token)
  WHATSAPP_PHONE_ID       — Phone Number ID from Meta Business dashboard
  WHATSAPP_VERIFY_TOKEN   — Arbitrary string you set for webhook verification

Optional:
  WHATSAPP_VERSION        — API version, default "v20.0"

Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
import urllib.error
from typing import Optional

from tools.base import ToolResult, require_env

_VERSION = os.environ.get("WHATSAPP_VERSION", "v20.0")
_BASE = f"https://graph.facebook.com/{_VERSION}"


def _headers() -> dict:
    cfg = require_env("WHATSAPP_TOKEN")
    return {
        "Authorization": f"Bearer {cfg['WHATSAPP_TOKEN']}",
        "Content-Type": "application/json",
    }


def _post(path: str, body: dict) -> ToolResult:
    cfg = require_env("WHATSAPP_PHONE_ID")
    url = f"{_BASE}/{cfg['WHATSAPP_PHONE_ID']}{path}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def send_text(to: str, message: str) -> ToolResult:
    """Send a plain-text WhatsApp message to a phone number (e164 format)."""
    return _post("/messages", {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": message},
    })


def send_template(to: str, template_name: str, language: str = "en_US",
                  components: Optional[list] = None) -> ToolResult:
    """Send a pre-approved WhatsApp template message."""
    body: dict = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": language},
        },
    }
    if components:
        body["template"]["components"] = components
    return _post("/messages", body)


def send_image(to: str, image_url: str, caption: str = "") -> ToolResult:
    """Send an image by URL."""
    payload: dict = {"link": image_url}
    if caption:
        payload["caption"] = caption
    return _post("/messages", {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "image",
        "image": payload,
    })


def send_document(to: str, doc_url: str, filename: str = "", caption: str = "") -> ToolResult:
    """Send a document/file by URL."""
    payload: dict = {"link": doc_url}
    if filename:
        payload["filename"] = filename
    if caption:
        payload["caption"] = caption
    return _post("/messages", {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "document",
        "document": payload,
    })


def send_buttons(to: str, body_text: str, buttons: list[dict]) -> ToolResult:
    """
    Send an interactive button message.

    buttons format: [{"id": "btn_yes", "title": "Yes"}, {"id": "btn_no", "title": "No"}]
    """
    return _post("/messages", {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text": body_text},
            "action": {
                "buttons": [
                    {"type": "reply", "reply": {"id": b["id"], "title": b["title"]}}
                    for b in buttons
                ]
            },
        },
    })


def mark_read(message_id: str) -> ToolResult:
    """Mark an inbound message as read."""
    return _post("/messages", {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": message_id,
    })


def verify_webhook(mode: str, token: str, challenge: str) -> Optional[str]:
    """
    Handle the Meta webhook verification handshake.
    Returns the challenge string if valid, None otherwise.
    """
    verify_token = os.environ.get("WHATSAPP_VERIFY_TOKEN", "")
    if mode == "subscribe" and token == verify_token:
        return challenge
    return None


def parse_inbound(payload: dict) -> list[dict]:
    """
    Parse a raw Meta webhook payload into a flat list of message dicts.

    Each returned dict has: from, message_id, type, text (if text), timestamp.
    """
    messages = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for msg in value.get("messages", []):
                messages.append({
                    "from": msg.get("from"),
                    "message_id": msg.get("id"),
                    "type": msg.get("type"),
                    "text": msg.get("text", {}).get("body", ""),
                    "timestamp": msg.get("timestamp"),
                    "name": value.get("contacts", [{}])[0].get("profile", {}).get("name", ""),
                })
    return messages
