"""
Twitter / X API v2 tool.

Required env vars:
  TWITTER_BEARER_TOKEN    — for read-only operations
  TWITTER_API_KEY         — OAuth 1.0a consumer key
  TWITTER_API_SECRET      — OAuth 1.0a consumer secret
  TWITTER_ACCESS_TOKEN    — OAuth 1.0a access token (your account)
  TWITTER_ACCESS_SECRET   — OAuth 1.0a access token secret

Docs: https://developer.twitter.com/en/docs/twitter-api
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
import urllib.parse
import urllib.request
import urllib.error
import uuid
from typing import Optional

from tools.base import ToolResult, require_env

_BASE = "https://api.twitter.com/2"


# ─────────────────────────────────────────────────────────────────────────────
# OAuth 1.0a signing (required for write operations)
# ─────────────────────────────────────────────────────────────────────────────

def _oauth1_header(method: str, url: str, params: dict) -> str:
    cfg = require_env(
        "TWITTER_API_KEY", "TWITTER_API_SECRET",
        "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_SECRET",
    )
    oauth_params = {
        "oauth_consumer_key": cfg["TWITTER_API_KEY"],
        "oauth_nonce": uuid.uuid4().hex,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_token": cfg["TWITTER_ACCESS_TOKEN"],
        "oauth_version": "1.0",
    }
    all_params = {**params, **oauth_params}
    sorted_params = sorted(all_params.items())
    param_string = "&".join(f"{urllib.parse.quote(k, safe='')}={urllib.parse.quote(str(v), safe='')}" for k, v in sorted_params)
    base_string = "&".join([
        method.upper(),
        urllib.parse.quote(url, safe=""),
        urllib.parse.quote(param_string, safe=""),
    ])
    signing_key = (
        urllib.parse.quote(cfg["TWITTER_API_SECRET"], safe="") + "&" +
        urllib.parse.quote(cfg["TWITTER_ACCESS_SECRET"], safe="")
    )
    signature = base64.b64encode(
        hmac.new(signing_key.encode(), base_string.encode(), hashlib.sha1).digest()
    ).decode()
    oauth_params["oauth_signature"] = signature
    header_parts = ", ".join(
        f'{urllib.parse.quote(k, safe="")}="{urllib.parse.quote(str(v), safe="")}"'
        for k, v in sorted(oauth_params.items())
    )
    return f"OAuth {header_parts}"


def _bearer_header() -> dict:
    cfg = require_env("TWITTER_BEARER_TOKEN")
    return {"Authorization": f"Bearer {cfg['TWITTER_BEARER_TOKEN']}"}


def _post_oauth(path: str, body: dict) -> ToolResult:
    url = f"{_BASE}{path}"
    data = json.dumps(body).encode()
    auth = _oauth1_header("POST", url, {})
    req = urllib.request.Request(
        url, data=data,
        headers={"Authorization": auth, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def _get(path: str, params: Optional[dict] = None) -> ToolResult:
    url = f"{_BASE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=_bearer_header(), method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def post_tweet(text: str, reply_to_id: Optional[str] = None,
               media_ids: Optional[list[str]] = None) -> ToolResult:
    """Post a tweet. Optionally reply to an existing tweet or attach media."""
    body: dict = {"text": text}
    if reply_to_id:
        body["reply"] = {"in_reply_to_tweet_id": reply_to_id}
    if media_ids:
        body["media"] = {"media_ids": media_ids}
    return _post_oauth("/tweets", body)


def delete_tweet(tweet_id: str) -> ToolResult:
    """Delete a tweet by ID."""
    url = f"{_BASE}/tweets/{tweet_id}"
    cfg = require_env("TWITTER_API_KEY", "TWITTER_API_SECRET", "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_SECRET")
    auth = _oauth1_header("DELETE", url, {})
    req = urllib.request.Request(url, headers={"Authorization": auth}, method="DELETE")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:200]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def post_thread(tweets: list[str]) -> ToolResult:
    """
    Post a Twitter thread (list of tweet texts).
    Each tweet is posted as a reply to the previous one.
    Returns list of created tweet IDs.
    """
    if not tweets:
        return ToolResult(ok=False, error="tweets list is empty")

    created_ids = []
    reply_to = None

    for text in tweets:
        result = post_tweet(text, reply_to_id=reply_to)
        if not result.ok:
            return ToolResult(ok=False, error=f"Thread failed at tweet {len(created_ids)+1}: {result.error}", data=created_ids)
        tweet_id = result.data.get("data", {}).get("id")
        created_ids.append(tweet_id)
        reply_to = tweet_id

    return ToolResult(ok=True, data={"thread_ids": created_ids, "count": len(created_ids)})


def like_tweet(tweet_id: str, user_id: str) -> ToolResult:
    """Like a tweet on behalf of user_id."""
    return _post_oauth(f"/users/{user_id}/likes", {"tweet_id": tweet_id})


def retweet(tweet_id: str, user_id: str) -> ToolResult:
    """Retweet a tweet on behalf of user_id."""
    return _post_oauth(f"/users/{user_id}/retweets", {"tweet_id": tweet_id})


def search_recent(query: str, max_results: int = 10) -> ToolResult:
    """Search recent tweets. max_results: 10-100."""
    return _get("/tweets/search/recent", {
        "query": query,
        "max_results": min(max(max_results, 10), 100),
        "tweet.fields": "created_at,author_id,public_metrics",
    })


def get_user_tweets(user_id: str, max_results: int = 10) -> ToolResult:
    """Get recent tweets from a user by their Twitter user ID."""
    return _get(f"/users/{user_id}/tweets", {
        "max_results": min(max(max_results, 5), 100),
        "tweet.fields": "created_at,public_metrics",
    })


def get_user_by_username(username: str) -> ToolResult:
    """Look up a Twitter user by @username."""
    return _get(f"/users/by/username/{username.lstrip('@')}", {
        "user.fields": "public_metrics,description,verified",
    })


def send_dm(participant_id: str, text: str) -> ToolResult:
    """Send a Direct Message to a Twitter user."""
    return _post_oauth("/dm_conversations/with_participant_id/dm_events", {
        "event_type": "MessageCreate",
        "text": text,
        "participant_id": participant_id,
    })
