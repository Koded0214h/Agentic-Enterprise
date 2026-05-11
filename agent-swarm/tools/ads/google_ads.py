"""
Google Ads API tool — campaign management, reporting, and keyword research.

Required env vars:
  GOOGLE_ADS_DEVELOPER_TOKEN   — from Google Ads API Center
  GOOGLE_ADS_CLIENT_ID         — OAuth2 client ID
  GOOGLE_ADS_CLIENT_SECRET     — OAuth2 client secret
  GOOGLE_ADS_REFRESH_TOKEN     — OAuth2 refresh token
  GOOGLE_ADS_CUSTOMER_ID       — Google Ads customer ID (digits only, no dashes)

Optional:
  GOOGLE_ADS_LOGIN_CUSTOMER_ID — Manager account ID (if using an MCC account)

Docs: https://developers.google.com/google-ads/api/docs
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
import urllib.error
from typing import Optional

from tools.base import ToolResult, require_env

_TOKEN_URL = "https://oauth2.googleapis.com/token"
_BASE = "https://googleads.googleapis.com/v17"
_API_VERSION = "v17"

_cached_token: dict = {}


def _get_access_token() -> str:
    """Exchange refresh token for access token (cached for 50 minutes)."""
    now = time.time()
    if _cached_token.get("access_token") and _cached_token.get("expires_at", 0) > now + 60:
        return _cached_token["access_token"]

    cfg = require_env(
        "GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_REFRESH_TOKEN"
    )
    data = urllib.parse.urlencode({
        "client_id": cfg["GOOGLE_ADS_CLIENT_ID"],
        "client_secret": cfg["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": cfg["GOOGLE_ADS_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(_TOKEN_URL, data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            token_data = json.loads(resp.read())
            _cached_token["access_token"] = token_data["access_token"]
            _cached_token["expires_at"] = now + token_data.get("expires_in", 3600)
            return _cached_token["access_token"]
    except Exception as exc:
        raise RuntimeError(f"Google token refresh failed: {exc}") from exc


def _headers() -> dict:
    cfg = require_env("GOOGLE_ADS_DEVELOPER_TOKEN", "GOOGLE_ADS_CUSTOMER_ID")
    h = {
        "Authorization": f"Bearer {_get_access_token()}",
        "developer-token": cfg["GOOGLE_ADS_DEVELOPER_TOKEN"],
        "Content-Type": "application/json",
    }
    import os
    login_id = os.environ.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID")
    if login_id:
        h["login-customer-id"] = login_id.replace("-", "")
    return h


def _customer_id() -> str:
    cfg = require_env("GOOGLE_ADS_CUSTOMER_ID")
    return cfg["GOOGLE_ADS_CUSTOMER_ID"].replace("-", "")


def _post(path: str, body: dict) -> ToolResult:
    url = f"{_BASE}/customers/{_customer_id()}{path}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:400]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def _gaql(query: str) -> ToolResult:
    """Execute a Google Ads Query Language (GAQL) query."""
    return _post("/googleAds:searchStream", {"query": query})


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def list_campaigns(status: str = "ENABLED") -> ToolResult:
    """
    List campaigns. status: ENABLED | PAUSED | REMOVED | ALL.
    """
    where = f"WHERE campaign.status = '{status}'" if status != "ALL" else ""
    return _gaql(f"""
        SELECT campaign.id, campaign.name, campaign.status,
               campaign.advertising_channel_type,
               metrics.cost_micros, metrics.impressions,
               metrics.clicks, metrics.conversions
        FROM campaign
        {where}
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
    """)


def get_campaign(campaign_id: str) -> ToolResult:
    """Get details and current stats for a single campaign."""
    return _gaql(f"""
        SELECT campaign.id, campaign.name, campaign.status,
               campaign.start_date, campaign.end_date,
               campaign_budget.amount_micros,
               metrics.cost_micros, metrics.impressions,
               metrics.clicks, metrics.ctr, metrics.conversions,
               metrics.cost_per_conversion
        FROM campaign
        WHERE campaign.id = {campaign_id}
    """)


def pause_campaign(campaign_id: str) -> ToolResult:
    """Pause a running campaign."""
    return _post("/campaigns:mutate", {
        "operations": [{
            "update": {
                "resourceName": f"customers/{_customer_id()}/campaigns/{campaign_id}",
                "status": "PAUSED",
            },
            "updateMask": "status",
        }]
    })


def enable_campaign(campaign_id: str) -> ToolResult:
    """Re-enable a paused campaign."""
    return _post("/campaigns:mutate", {
        "operations": [{
            "update": {
                "resourceName": f"customers/{_customer_id()}/campaigns/{campaign_id}",
                "status": "ENABLED",
            },
            "updateMask": "status",
        }]
    })


def update_campaign_budget(campaign_id: str, daily_budget_usd: float) -> ToolResult:
    """Update a campaign's daily budget (in USD)."""
    budget_micros = int(daily_budget_usd * 1_000_000)
    return _post("/campaignBudgets:mutate", {
        "operations": [{
            "update": {
                "resourceName": f"customers/{_customer_id()}/campaignBudgets/{campaign_id}",
                "amountMicros": str(budget_micros),
            },
            "updateMask": "amountMicros",
        }]
    })


def get_performance_report(date_range: str = "LAST_7_DAYS") -> ToolResult:
    """
    Get an account-level performance summary.

    date_range: LAST_7_DAYS | LAST_30_DAYS | THIS_MONTH | LAST_MONTH | TODAY
    """
    return _gaql(f"""
        SELECT
            segments.date,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.conversions,
            metrics.cost_per_conversion
        FROM customer
        WHERE segments.date DURING {date_range}
        ORDER BY segments.date DESC
    """)


def get_keyword_performance(campaign_id: Optional[str] = None,
                             date_range: str = "LAST_7_DAYS") -> ToolResult:
    """Get keyword-level performance. Optionally filter by campaign."""
    where = f"WHERE segments.date DURING {date_range}"
    if campaign_id:
        where += f" AND campaign.id = {campaign_id}"
    return _gaql(f"""
        SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            campaign.name,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions
        FROM keyword_view
        {where}
        ORDER BY metrics.cost_micros DESC
        LIMIT 100
    """)


def keyword_ideas(keywords: list[str], language_id: str = "1000",
                  geo_target_ids: Optional[list[str]] = None) -> ToolResult:
    """
    Generate keyword ideas using the Keyword Planner.

    keywords: seed keyword list.
    language_id: "1000" = English.
    """
    seed = {"keywords": {"keywords": keywords}}
    body: dict = {
        "keywordSeed": seed,
        "language": f"languageConstants/{language_id}",
        "includeAdultKeywords": False,
    }
    if geo_target_ids:
        body["geoTargetConstants"] = [f"geoTargetConstants/{g}" for g in geo_target_ids]
    return _post("/keywordPlanIdeas:generateKeywordIdeas", body)
