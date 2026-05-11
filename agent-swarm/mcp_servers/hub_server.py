#!/usr/bin/env python3
"""
Conversation Hub MCP Server

Exposes the unified messaging router as MCP tools.
Any swarm agent can use these tools to send messages, manage routing rules,
and query conversation history across all channels.

Configure in swarm.config.json:
  "mcpServers": {
    "hub": {
      "command": "python",
      "args": ["mcp_servers/hub_server.py"]
    }
  }
"""
from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("ERROR: mcp package not installed. Run: pip install mcp", file=sys.stderr)
    sys.exit(1)

from bots.conversation_hub import ConversationHub, send_via_channel

mcp = FastMCP("hub")
_hub = ConversationHub()


@mcp.tool()
def hub_send(channel: str, user_id: str, text: str) -> dict:
    """
    Send a message to a user on any channel without triggering agent processing.

    channel: telegram | whatsapp | slack
    user_id: platform user ID (chat_id for Telegram, phone for WhatsApp, channel for Slack)
    text:    message text to send
    """
    ok = send_via_channel(channel, user_id, text)
    return {"ok": ok, "channel": channel, "user_id": user_id}


@mcp.tool()
def hub_handle(channel: str, user_id: str, text: str) -> dict:
    """
    Route an inbound message through the conversation hub and get a reply.
    Applies routing rules, AOS policy gate, and conversation history.

    channel: telegram | whatsapp | slack
    user_id: platform user ID
    text:    inbound message text
    """
    result = _hub.handle(channel=channel, user_id=user_id, text=text)
    return {"ok": result.ok, "reply": result.reply, "agent": result.agent_used, "error": result.error}


@mcp.tool()
def hub_set_route(channel: str, user_id: str, agent: str, note: str = "") -> dict:
    """
    Pin a user to a specific swarm agent on a channel.

    channel:  telegram | whatsapp | slack
    user_id:  exact user ID or wildcard pattern (e.g. "+234*" for all Nigerian numbers)
    agent:    swarm agent name, e.g. "support-support-responder"
    note:     optional note about why this rule exists
    """
    _hub.set_route(channel=channel, user_id=user_id, agent=agent, note=note)
    return {"ok": True, "channel": channel, "user_id": user_id, "agent": agent}


@mcp.tool()
def hub_remove_route(channel: str, user_id: str) -> dict:
    """Remove a routing rule so the user falls back to keyword-based auto-triage."""
    removed = _hub.remove_route(channel=channel, user_id=user_id)
    return {"ok": True, "removed": removed}


@mcp.tool()
def hub_list_routes() -> dict:
    """List all current routing rules."""
    return {"ok": True, "routes": _hub.list_routes()}


@mcp.tool()
def hub_clear_history(channel: str, user_id: str) -> dict:
    """Clear the conversation history for a user on a given channel."""
    _hub.clear_history(channel=channel, user_id=user_id)
    return {"ok": True, "channel": channel, "user_id": user_id}


@mcp.tool()
def hub_broadcast(channels: str, user_ids: str, text: str) -> dict:
    """
    Broadcast a message to multiple users across channels.

    channels: JSON array of channel names, e.g. '["telegram", "slack"]'
    user_ids: JSON array of user IDs (same order as channels)
    text:     message to broadcast
    """
    import json
    ch_list = json.loads(channels)
    uid_list = json.loads(user_ids)
    results = []
    for ch, uid in zip(ch_list, uid_list):
        ok = send_via_channel(ch, uid, text)
        results.append({"channel": ch, "user_id": uid, "sent": ok})
    return {"ok": True, "results": results}


if __name__ == "__main__":
    mcp.run(transport="stdio")
