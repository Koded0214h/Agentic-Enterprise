"""
Meta Ads API tool — Facebook & Instagram campaign management.

Required env vars:
  META_ADS_ACCESS_TOKEN   — long-lived System User token with ads_management scope
  META_ADS_ACCOUNT_ID     — ad account ID, e.g. act_123456789

Optional:
  META_ADS_API_VERSION    — API version, default "v20.0"

Docs: https://developers.facebook.com/docs/marketing-api
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
import urllib.error
from typing import Optional

from tools.base import ToolResult, require_env

_VERSION = os.environ.get("META_ADS_API_VERSION", "v20.0")
_BASE = f"https://graph.facebook.com/{_VERSION}"


def _cfg() -> dict:
    return require_env("META_ADS_ACCESS_TOKEN", "META_ADS_ACCOUNT_ID")


def _account_id() -> str:
    cfg = _cfg()
    aid = cfg["META_ADS_ACCOUNT_ID"]
    return aid if aid.startswith("act_") else f"act_{aid}"


def _get(path: str, params: Optional[dict] = None) -> ToolResult:
    cfg = _cfg()
    p = {"access_token": cfg["META_ADS_ACCESS_TOKEN"], **(params or {})}
    url = f"{_BASE}{path}?" + urllib.parse.urlencode(p)
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:400]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def _post(path: str, body: dict) -> ToolResult:
    cfg = _cfg()
    body["access_token"] = cfg["META_ADS_ACCESS_TOKEN"]
    url = f"{_BASE}{path}"
    data = urllib.parse.urlencode(body).encode()
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:400]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Campaigns
# ─────────────────────────────────────────────────────────────────────────────

def list_campaigns(status: str = "ACTIVE") -> ToolResult:
    """
    List ad campaigns. status: ACTIVE | PAUSED | ARCHIVED | ALL.
    """
    params = {
        "fields": "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
    }
    if status != "ALL":
        params["effective_status"] = json.dumps([status])
    return _get(f"/{_account_id()}/campaigns", params)


def get_campaign_insights(campaign_id: str, date_preset: str = "last_7d") -> ToolResult:
    """
    Get performance insights for a campaign.

    date_preset: today | yesterday | last_7d | last_30d | this_month | last_month
    """
    return _get(f"/{campaign_id}/insights", {
        "fields": "campaign_name,spend,impressions,clicks,ctr,cpc,cpm,actions,cost_per_action_type,reach,frequency",
        "date_preset": date_preset,
    })


def pause_campaign(campaign_id: str) -> ToolResult:
    """Pause a running campaign."""
    return _post(f"/{campaign_id}", {"status": "PAUSED"})


def activate_campaign(campaign_id: str) -> ToolResult:
    """Activate a paused campaign."""
    return _post(f"/{campaign_id}", {"status": "ACTIVE"})


def create_campaign(name: str, objective: str,
                    daily_budget_cents: int,
                    start_time: str = "",
                    end_time: str = "") -> ToolResult:
    """
    Create a new Meta Ads campaign.

    objective: OUTCOME_AWARENESS | OUTCOME_TRAFFIC | OUTCOME_ENGAGEMENT |
               OUTCOME_LEADS | OUTCOME_SALES | OUTCOME_APP_PROMOTION
    daily_budget_cents: budget in cents (e.g. 500 = $5.00/day)
    start_time: ISO 8601, e.g. "2025-01-15T00:00:00-0500" (optional)
    """
    body: dict = {
        "name": name,
        "objective": objective,
        "status": "PAUSED",  # always start paused
        "daily_budget": str(daily_budget_cents),
    }
    if start_time:
        body["start_time"] = start_time
    if end_time:
        body["stop_time"] = end_time
    return _post(f"/{_account_id()}/campaigns", body)


# ─────────────────────────────────────────────────────────────────────────────
# Ad Sets
# ─────────────────────────────────────────────────────────────────────────────

def list_ad_sets(campaign_id: str) -> ToolResult:
    """List all ad sets in a campaign."""
    return _get(f"/{campaign_id}/adsets", {
        "fields": "id,name,status,targeting,daily_budget,optimization_goal,billing_event",
    })


def get_ad_set_insights(adset_id: str, date_preset: str = "last_7d") -> ToolResult:
    """Get performance insights for a specific ad set."""
    return _get(f"/{adset_id}/insights", {
        "fields": "adset_name,spend,impressions,clicks,ctr,cpc,actions,reach",
        "date_preset": date_preset,
    })


def pause_ad_set(adset_id: str) -> ToolResult:
    """Pause an ad set."""
    return _post(f"/{adset_id}", {"status": "PAUSED"})


def activate_ad_set(adset_id: str) -> ToolResult:
    """Activate a paused ad set."""
    return _post(f"/{adset_id}", {"status": "ACTIVE"})


# ─────────────────────────────────────────────────────────────────────────────
# Ads
# ─────────────────────────────────────────────────────────────────────────────

def list_ads(adset_id: str) -> ToolResult:
    """List all ads in an ad set."""
    return _get(f"/{adset_id}/ads", {
        "fields": "id,name,status,creative,effective_status",
    })


def get_ad_insights(ad_id: str, date_preset: str = "last_7d") -> ToolResult:
    """Get performance insights for a single ad."""
    return _get(f"/{ad_id}/insights", {
        "fields": "ad_name,spend,impressions,clicks,ctr,cpc,actions,reach,frequency",
        "date_preset": date_preset,
    })


# ─────────────────────────────────────────────────────────────────────────────
# Account-level reporting
# ─────────────────────────────────────────────────────────────────────────────

def get_account_insights(date_preset: str = "last_7d") -> ToolResult:
    """
    Get account-wide ad performance summary.

    date_preset: today | yesterday | last_7d | last_30d | this_month | last_month
    """
    return _get(f"/{_account_id()}/insights", {
        "fields": "spend,impressions,clicks,ctr,cpc,cpm,actions,reach,frequency",
        "date_preset": date_preset,
        "level": "account",
    })


def get_audience_insights(interests: list[str],
                           age_min: int = 18,
                           age_max: int = 65,
                           geo_locations: Optional[dict] = None) -> ToolResult:
    """
    Get estimated audience size for a targeting spec.

    interests: list of interest names (matched against Meta's interest taxonomy)
    geo_locations: {"countries": ["US", "NG"]} format
    """
    targeting_spec = {
        "age_min": age_min,
        "age_max": age_max,
        "interests": [{"name": i} for i in interests],
    }
    if geo_locations:
        targeting_spec["geo_locations"] = geo_locations

    return _post("/act_/delivery_estimate", {
        "targeting_spec": json.dumps(targeting_spec),
        "optimization_goal": "REACH",
    })
