"""
LinkedIn API tool — post updates, articles, and comments.

Required env vars:
  LINKEDIN_ACCESS_TOKEN   — OAuth 2.0 access token with w_member_social scope
  LINKEDIN_PERSON_URN     — your LinkedIn person URN, e.g. urn:li:person:ABC123
                            (find it via GET /v2/me after auth)

Optional:
  LINKEDIN_ORG_URN        — company page URN, e.g. urn:li:organization:12345
                            Required for company page posts.

Docs: https://learn.microsoft.com/en-us/linkedin/marketing/
"""
from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
from typing import Optional

from tools.base import ToolResult, require_env

_BASE = "https://api.linkedin.com/v2"


def _headers() -> dict:
    cfg = require_env("LINKEDIN_ACCESS_TOKEN")
    return {
        "Authorization": f"Bearer {cfg['LINKEDIN_ACCESS_TOKEN']}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }


def _post(path: str, body: dict) -> ToolResult:
    url = f"{_BASE}{path}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            return ToolResult(ok=True, data=json.loads(raw) if raw else {"id": resp.headers.get("x-restli-id")})
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def _get(path: str) -> ToolResult:
    url = f"{_BASE}{path}"
    req = urllib.request.Request(url, headers=_headers(), method="GET")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:200]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def _author_urn(use_org: bool = False) -> str:
    if use_org:
        org = os.environ.get("LINKEDIN_ORG_URN", "")
        if not org:
            raise ValueError("LINKEDIN_ORG_URN is required for company page posts")
        return org
    cfg = require_env("LINKEDIN_PERSON_URN")
    return cfg["LINKEDIN_PERSON_URN"]


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def post_text(text: str, as_company: bool = False) -> ToolResult:
    """Post a plain-text LinkedIn update."""
    return _post("/ugcPosts", {
        "author": _author_urn(as_company),
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    })


def post_with_link(text: str, url: str, title: str = "", description: str = "",
                   as_company: bool = False) -> ToolResult:
    """Post a LinkedIn update with a link preview."""
    media = {"status": "READY", "originalUrl": url}
    if title:
        media["title"] = {"text": title}
    if description:
        media["description"] = {"text": description}

    return _post("/ugcPosts", {
        "author": _author_urn(as_company),
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "ARTICLE",
                "media": [media],
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    })


def post_with_image(text: str, image_urn: str, alt_text: str = "",
                    as_company: bool = False) -> ToolResult:
    """
    Post a LinkedIn update with an image.

    image_urn: LinkedIn asset URN from a prior upload (see upload_image).
    """
    return _post("/ugcPosts", {
        "author": _author_urn(as_company),
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "IMAGE",
                "media": [{
                    "status": "READY",
                    "media": image_urn,
                    "description": {"text": alt_text},
                }],
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    })


def add_comment(post_urn: str, text: str) -> ToolResult:
    """Comment on a LinkedIn post."""
    return _post("/socialActions/{post_urn}/comments".replace("{post_urn}", post_urn), {
        "actor": _author_urn(),
        "message": {"text": text},
    })


def like_post(post_urn: str) -> ToolResult:
    """Like a LinkedIn post."""
    return _post(f"/socialActions/{post_urn}/likes", {"actor": _author_urn()})


def get_profile() -> ToolResult:
    """Fetch the authenticated user's LinkedIn profile."""
    return _get("/me?projection=(id,firstName,lastName,headline,vanityName)")


def get_org_followers(org_urn: str) -> ToolResult:
    """Get follower count for a company page."""
    org_id = org_urn.split(":")[-1]
    return _get(f"/networkSizes/{org_urn}?edgeType=CompanyFollowedByMember")


def get_post_stats(post_urn: str) -> ToolResult:
    """Fetch engagement stats for a post (likes, comments, shares)."""
    return _get(f"/socialMetadata/{urllib.parse.quote(post_urn, safe='')}")


import urllib.parse
