#!/usr/bin/env python3
"""
Messaging MCP Server

Exposes WhatsApp, Telegram, Slack, and Email as MCP tools so any swarm agent
can send messages across all channels through a single interface.

Run standalone:
  python mcp_servers/messaging_server.py

Or configure in swarm.config.json:
  "mcpServers": {
    "messaging": {
      "command": "python",
      "args": ["mcp_servers/messaging_server.py"]
    }
  }

Required env vars depend on which channels you want active:
  WhatsApp : WHATSAPP_TOKEN, WHATSAPP_PHONE_ID
  Telegram : TELEGRAM_BOT_TOKEN
  Slack    : SLACK_BOT_TOKEN
  Email    : SENDGRID_API_KEY + SENDGRID_FROM_EMAIL  (or SMTP_* vars)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Allow running from repo root or from mcp_servers/
_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("ERROR: mcp package not installed. Run: pip install mcp", file=sys.stderr)
    sys.exit(1)

from tools.messaging import whatsapp, telegram, slack, email as email_tool

mcp = FastMCP("messaging")


# ─────────────────────────────────────────────────────────────────────────────
# WhatsApp tools
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def whatsapp_send_text(to: str, message: str) -> dict:
    """
    Send a WhatsApp text message to a phone number.

    to: Phone number in E.164 format, e.g. +2348012345678
    message: The message body (max 4096 chars).
    """
    return whatsapp.send_text(to, message).to_dict()


@mcp.tool()
def whatsapp_send_image(to: str, image_url: str, caption: str = "") -> dict:
    """Send an image via WhatsApp. image_url must be publicly accessible."""
    return whatsapp.send_image(to, image_url, caption).to_dict()


@mcp.tool()
def whatsapp_send_template(to: str, template_name: str, language: str = "en_US") -> dict:
    """Send a pre-approved WhatsApp Business template message."""
    return whatsapp.send_template(to, template_name, language).to_dict()


@mcp.tool()
def whatsapp_send_buttons(to: str, body_text: str, buttons: str) -> dict:
    """
    Send an interactive WhatsApp button message.

    buttons: JSON array of {id, title} objects.
    Example: '[{"id":"yes","title":"Yes"},{"id":"no","title":"No"}]'
    """
    return whatsapp.send_buttons(to, body_text, json.loads(buttons)).to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# Telegram tools
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def telegram_send_message(chat_id: str, text: str, parse_mode: str = "HTML") -> dict:
    """
    Send a Telegram message to a chat or user.

    chat_id: Numeric chat ID or @username.
    text: Supports HTML tags (<b>, <i>, <code>, <a href=...>) when parse_mode=HTML.
    """
    return telegram.send_message(chat_id, text, parse_mode).to_dict()


@mcp.tool()
def telegram_send_photo(chat_id: str, photo_url: str, caption: str = "") -> dict:
    """Send a photo to a Telegram chat. photo_url must be publicly accessible."""
    return telegram.send_photo(chat_id, photo_url, caption).to_dict()


@mcp.tool()
def telegram_send_buttons(chat_id: str, text: str, buttons: str) -> dict:
    """
    Send a Telegram message with inline keyboard buttons.

    buttons: JSON 2D array of {text, callback_data} objects.
    Example: '[[{"text":"Yes","callback_data":"yes"},{"text":"No","callback_data":"no"}]]'
    """
    return telegram.send_inline_keyboard(chat_id, text, json.loads(buttons)).to_dict()


@mcp.tool()
def telegram_send_typing(chat_id: str) -> dict:
    """Show a typing indicator in a Telegram chat."""
    return telegram.send_typing(chat_id).to_dict()


@mcp.tool()
def telegram_get_bot_info() -> dict:
    """Return info about the configured Telegram bot (health check)."""
    return telegram.get_me().to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# Slack tools
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def slack_send_message(channel: str, text: str, thread_ts: str = "") -> dict:
    """
    Post a message to a Slack channel or DM.

    channel: Channel ID (C...), #channel-name, or user ID (U...) for DMs.
    thread_ts: Pass the parent message's ts to reply in a thread.
    """
    return slack.send_message(channel, text, thread_ts=thread_ts or None).to_dict()


@mcp.tool()
def slack_send_rich_message(channel: str, header: str, sections: str) -> dict:
    """
    Send a formatted Slack message with a header and body sections.

    sections: JSON array of markdown strings.
    Example: '["*Key metric:* Revenue up 12%", "Action required by Friday"]'
    """
    return slack.send_rich_message(channel, header, json.loads(sections)).to_dict()


@mcp.tool()
def slack_send_ephemeral(channel: str, user_id: str, text: str) -> dict:
    """Send a Slack message visible only to one user in a channel."""
    return slack.send_ephemeral(channel, user_id, text).to_dict()


@mcp.tool()
def slack_add_reaction(channel: str, message_ts: str, emoji: str) -> dict:
    """Add an emoji reaction to a Slack message. emoji = name without colons."""
    return slack.add_reaction(channel, message_ts, emoji).to_dict()


@mcp.tool()
def slack_list_channels() -> dict:
    """List all Slack channels the bot can access."""
    return slack.list_channels().to_dict()


@mcp.tool()
def slack_open_dm(user_id: str) -> dict:
    """Open a direct message channel with a Slack user. Returns channel ID."""
    return slack.open_dm(user_id).to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# Email tools
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def email_send(to: str, subject: str, body_html: str, body_text: str = "") -> dict:
    """
    Send an email via SendGrid or SMTP (auto-detected from env vars).

    to: Single email address or comma-separated list.
    body_html: HTML email body.
    body_text: Optional plain-text fallback.
    """
    recipients = [r.strip() for r in to.split(",")]
    return email_tool.send_email(recipients, subject, body_html, body_text).to_dict()


@mcp.tool()
def email_send_plain(to: str, subject: str, body: str) -> dict:
    """Send a plain-text email. Simpler than email_send."""
    recipients = [r.strip() for r in to.split(",")]
    return email_tool.send_plain(recipients, subject, body).to_dict()


@mcp.tool()
def email_send_report(to: str, title: str, sections: str, footer: str = "") -> dict:
    """
    Send a structured HTML report email.

    sections: JSON array of {heading, body} objects.
    Example: '[{"heading":"Summary","body":"Revenue up 12% this week."}]'
    """
    recipients = [r.strip() for r in to.split(",")]
    return email_tool.send_report(recipients, title, json.loads(sections), footer).to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run(transport="stdio")
