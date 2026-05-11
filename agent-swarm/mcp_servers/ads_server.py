#!/usr/bin/env python3
"""
Ads MCP Server

Exposes Google Ads and Meta Ads as MCP tools for autonomous campaign
management, reporting, and budget optimisation.

Configure in swarm.config.json:
  "mcpServers": {
    "ads": {
      "command": "python",
      "args": ["mcp_servers/ads_server.py"]
    }
  }
"""
from __future__ import annotations

import json
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

from tools.ads import google_ads, meta_ads

mcp = FastMCP("ads")


# ─────────────────────────────────────────────────────────────────────────────
# Google Ads
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def google_list_campaigns(status: str = "ENABLED") -> dict:
    """
    List Google Ads campaigns.

    status: ENABLED | PAUSED | REMOVED | ALL
    """
    return google_ads.list_campaigns(status).to_dict()


@mcp.tool()
def google_get_campaign(campaign_id: str) -> dict:
    """Get details and current stats for a single Google Ads campaign."""
    return google_ads.get_campaign(campaign_id).to_dict()


@mcp.tool()
def google_pause_campaign(campaign_id: str) -> dict:
    """Pause a running Google Ads campaign."""
    return google_ads.pause_campaign(campaign_id).to_dict()


@mcp.tool()
def google_enable_campaign(campaign_id: str) -> dict:
    """Re-enable a paused Google Ads campaign."""
    return google_ads.enable_campaign(campaign_id).to_dict()


@mcp.tool()
def google_update_budget(campaign_id: str, daily_budget_usd: float) -> dict:
    """Update a Google Ads campaign's daily budget in USD."""
    return google_ads.update_campaign_budget(campaign_id, daily_budget_usd).to_dict()


@mcp.tool()
def google_performance_report(date_range: str = "LAST_7_DAYS") -> dict:
    """
    Get Google Ads account-level performance report.

    date_range: TODAY | YESTERDAY | LAST_7_DAYS | LAST_30_DAYS | THIS_MONTH | LAST_MONTH
    """
    return google_ads.get_performance_report(date_range).to_dict()


@mcp.tool()
def google_keyword_performance(campaign_id: str = "", date_range: str = "LAST_7_DAYS") -> dict:
    """Get keyword-level performance. campaign_id is optional for account-wide view."""
    return google_ads.get_keyword_performance(campaign_id or None, date_range).to_dict()


@mcp.tool()
def google_keyword_ideas(keywords: str, language_id: str = "1000") -> dict:
    """
    Generate keyword ideas using Google's Keyword Planner.

    keywords: JSON array of seed keywords.
    Example: '["AI tools", "productivity software", "automation"]'
    language_id: "1000" = English.
    """
    return google_ads.keyword_ideas(json.loads(keywords), language_id).to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# Meta Ads (Facebook & Instagram)
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def meta_list_campaigns(status: str = "ACTIVE") -> dict:
    """
    List Meta Ads campaigns.

    status: ACTIVE | PAUSED | ARCHIVED | ALL
    """
    return meta_ads.list_campaigns(status).to_dict()


@mcp.tool()
def meta_get_campaign_insights(campaign_id: str, date_preset: str = "last_7d") -> dict:
    """
    Get Meta campaign performance (spend, impressions, clicks, conversions).

    date_preset: today | yesterday | last_7d | last_30d | this_month | last_month
    """
    return meta_ads.get_campaign_insights(campaign_id, date_preset).to_dict()


@mcp.tool()
def meta_pause_campaign(campaign_id: str) -> dict:
    """Pause a running Meta Ads campaign."""
    return meta_ads.pause_campaign(campaign_id).to_dict()


@mcp.tool()
def meta_activate_campaign(campaign_id: str) -> dict:
    """Activate a paused Meta Ads campaign."""
    return meta_ads.activate_campaign(campaign_id).to_dict()


@mcp.tool()
def meta_create_campaign(name: str, objective: str,
                          daily_budget_cents: int) -> dict:
    """
    Create a new Meta Ads campaign (starts PAUSED for safety).

    objective: OUTCOME_AWARENESS | OUTCOME_TRAFFIC | OUTCOME_ENGAGEMENT |
               OUTCOME_LEADS | OUTCOME_SALES | OUTCOME_APP_PROMOTION
    daily_budget_cents: e.g. 500 = $5.00/day
    """
    return meta_ads.create_campaign(name, objective, daily_budget_cents).to_dict()


@mcp.tool()
def meta_account_insights(date_preset: str = "last_7d") -> dict:
    """Get account-wide Meta Ads performance summary."""
    return meta_ads.get_account_insights(date_preset).to_dict()


@mcp.tool()
def meta_list_ad_sets(campaign_id: str) -> dict:
    """List all ad sets within a Meta campaign."""
    return meta_ads.list_ad_sets(campaign_id).to_dict()


@mcp.tool()
def meta_ad_set_insights(adset_id: str, date_preset: str = "last_7d") -> dict:
    """Get performance insights for a specific Meta ad set."""
    return meta_ads.get_ad_set_insights(adset_id, date_preset).to_dict()


@mcp.tool()
def meta_pause_ad_set(adset_id: str) -> dict:
    """Pause a Meta ad set."""
    return meta_ads.pause_ad_set(adset_id).to_dict()


@mcp.tool()
def meta_ad_insights(ad_id: str, date_preset: str = "last_7d") -> dict:
    """Get performance for a specific ad (ad-level granularity)."""
    return meta_ads.get_ad_insights(ad_id, date_preset).to_dict()


if __name__ == "__main__":
    mcp.run(transport="stdio")
