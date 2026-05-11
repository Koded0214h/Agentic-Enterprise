"""
Slack Web API tool.

Required env vars:
  SLACK_BOT_TOKEN   — xoxb-... Bot User OAuth Token

Optional:
  SLACK_SIGNING_SECRET   — for verifying incoming webhook signatures

Docs: https://api.slack.com/methods
"""
from __future__ import annotations

import json
import urllib.request
import urllib.error
from typing import Optional

from tools.base import ToolResult, require_env

_BASE = "https://slack.com/api"


def _post(method: str, body: dict) -> ToolResult:
    cfg = require_env("SLACK_BOT_TOKEN")
    url = f"{_BASE}/{method}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        url, data=data,
        headers={
            "Authorization": f"Bearer {cfg['SLACK_BOT_TOKEN']}",
            "Content-Type": "application/json; charset=utf-8",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            if result.get("ok"):
                return ToolResult(ok=True, data=result)
            return ToolResult(ok=False, error=result.get("error", "Slack API error"))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def send_message(channel: str, text: str,
                 blocks: Optional[list] = None,
                 thread_ts: Optional[str] = None) -> ToolResult:
    """
    Post a message to a Slack channel or DM.

    channel: channel ID (C...), channel name (#general), or user ID (U...) for DMs.
    blocks:  optional Block Kit blocks for rich formatting.
    thread_ts: reply in a thread by passing the parent message's ts.
    """
    body: dict = {"channel": channel, "text": text}
    if blocks:
        body["blocks"] = blocks
    if thread_ts:
        body["thread_ts"] = thread_ts
    return _post("chat.postMessage", body)


def send_ephemeral(channel: str, user: str, text: str) -> ToolResult:
    """Send a message visible only to one user in a channel."""
    return _post("chat.postEphemeral", {"channel": channel, "user": user, "text": text})


def update_message(channel: str, ts: str, text: str,
                   blocks: Optional[list] = None) -> ToolResult:
    """Update a previously sent message."""
    body: dict = {"channel": channel, "ts": ts, "text": text}
    if blocks:
        body["blocks"] = blocks
    return _post("chat.update", body)


def delete_message(channel: str, ts: str) -> ToolResult:
    """Delete a message."""
    return _post("chat.delete", {"channel": channel, "ts": ts})


def add_reaction(channel: str, ts: str, emoji: str) -> ToolResult:
    """Add an emoji reaction to a message (emoji name without colons)."""
    return _post("reactions.add", {"channel": channel, "timestamp": ts, "name": emoji})


def open_dm(user_id: str) -> ToolResult:
    """Open a direct message channel with a user. Returns channel ID."""
    return _post("conversations.open", {"users": user_id})


def list_channels(types: str = "public_channel,private_channel") -> ToolResult:
    """List all channels the bot can see."""
    body = {"types": types, "limit": 200}
    cfg = require_env("SLACK_BOT_TOKEN")
    url = f"{_BASE}/conversations.list?" + "&".join(f"{k}={v}" for k, v in body.items())
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {cfg['SLACK_BOT_TOKEN']}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            if result.get("ok"):
                return ToolResult(ok=True, data=result.get("channels", []))
            return ToolResult(ok=False, error=result.get("error", ""))
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def upload_file(channel: str, content: str, filename: str,
                title: str = "", comment: str = "") -> ToolResult:
    """Upload a text file to a Slack channel."""
    body: dict = {
        "channels": channel,
        "content": content,
        "filename": filename,
    }
    if title:
        body["title"] = title
    if comment:
        body["initial_comment"] = comment
    return _post("files.upload", body)


def send_rich_message(channel: str, header: str, sections: list[str],
                      color: str = "#36a64f") -> ToolResult:
    """
    Send a rich message with a header + sections using Block Kit.

    color: sidebar accent color hex.
    """
    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": header}},
    ] + [
        {"type": "section", "text": {"type": "mrkdwn", "text": s}}
        for s in sections
    ]
    return send_message(channel, text=header, blocks=blocks)
