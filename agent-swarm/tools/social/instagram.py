"""
Instagram Graph API tool — post content to Instagram Business/Creator accounts.

Required env vars:
  INSTAGRAM_ACCESS_TOKEN   — long-lived Instagram Graph API access token
  INSTAGRAM_ACCOUNT_ID     — Instagram Business Account ID

Note: You can only post to Instagram Business or Creator accounts via the API.
Personal accounts are not supported by Meta's Graph API.

Docs: https://developers.facebook.com/docs/instagram-api
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
import urllib.error
from typing import Optional

from tools.base import ToolResult, require_env

_VERSION = os.environ.get("INSTAGRAM_API_VERSION", "v20.0")
_BASE = f"https://graph.facebook.com/{_VERSION}"


def _cfg() -> dict:
    return require_env("INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_ACCOUNT_ID")


def _get(path: str, params: Optional[dict] = None) -> ToolResult:
    cfg = _cfg()
    p = {"access_token": cfg["INSTAGRAM_ACCESS_TOKEN"], **(params or {})}
    url = f"{_BASE}{path}?" + urllib.parse.urlencode(p)
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def _post(path: str, params: dict) -> ToolResult:
    cfg = _cfg()
    params["access_token"] = cfg["INSTAGRAM_ACCESS_TOKEN"]
    url = f"{_BASE}{path}"
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Two-step publish flow: create container → publish
# ─────────────────────────────────────────────────────────────────────────────

def _create_image_container(image_url: str, caption: str = "",
                             is_carousel_item: bool = False) -> ToolResult:
    cfg = _cfg()
    params: dict = {"image_url": image_url}
    if caption and not is_carousel_item:
        params["caption"] = caption
    if is_carousel_item:
        params["is_carousel_item"] = "true"
    return _post(f"/{cfg['INSTAGRAM_ACCOUNT_ID']}/media", params)


def _create_video_container(video_url: str, caption: str = "",
                             cover_url: str = "") -> ToolResult:
    cfg = _cfg()
    params: dict = {"media_type": "REELS", "video_url": video_url}
    if caption:
        params["caption"] = caption
    if cover_url:
        params["cover_url"] = cover_url
    return _post(f"/{cfg['INSTAGRAM_ACCOUNT_ID']}/media", params)


def _publish_container(container_id: str) -> ToolResult:
    cfg = _cfg()
    return _post(f"/{cfg['INSTAGRAM_ACCOUNT_ID']}/media_publish",
                 {"creation_id": container_id})


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def post_image(image_url: str, caption: str = "") -> ToolResult:
    """
    Publish a single image post to Instagram.

    image_url: Publicly accessible image URL (JPEG or PNG).
    caption: Post caption with hashtags.
    """
    container = _create_image_container(image_url, caption)
    if not container.ok:
        return container
    container_id = container.data.get("id")
    if not container_id:
        return ToolResult(ok=False, error="No container ID returned")
    return _publish_container(container_id)


def post_reel(video_url: str, caption: str = "", cover_url: str = "") -> ToolResult:
    """
    Publish a Reel (short video) to Instagram.

    video_url: Publicly accessible video URL (MP4, max 15 min).
    cover_url: Optional thumbnail image URL.
    """
    container = _create_video_container(video_url, caption, cover_url)
    if not container.ok:
        return container
    container_id = container.data.get("id")
    if not container_id:
        return ToolResult(ok=False, error="No container ID returned")
    # Video containers may need processing time — in production, poll status
    return _publish_container(container_id)


def post_carousel(image_urls: list[str], caption: str = "") -> ToolResult:
    """
    Publish a carousel (multi-image) post.

    image_urls: List of 2-10 publicly accessible image URLs.
    """
    if not (2 <= len(image_urls) <= 10):
        return ToolResult(ok=False, error="Carousel requires 2–10 images")

    child_ids = []
    for url in image_urls:
        container = _create_image_container(url, is_carousel_item=True)
        if not container.ok:
            return ToolResult(ok=False, error=f"Carousel item failed: {container.error}")
        child_ids.append(container.data["id"])

    cfg = _cfg()
    carousel_result = _post(f"/{cfg['INSTAGRAM_ACCOUNT_ID']}/media", {
        "media_type": "CAROUSEL",
        "children": ",".join(child_ids),
        "caption": caption,
    })
    if not carousel_result.ok:
        return carousel_result
    return _publish_container(carousel_result.data["id"])


def add_comment(media_id: str, text: str) -> ToolResult:
    """Post a comment on an Instagram media object."""
    return _post(f"/{media_id}/comments", {"message": text})


def reply_to_comment(comment_id: str, text: str) -> ToolResult:
    """Reply to an Instagram comment."""
    return _post(f"/{comment_id}/replies", {"message": text})


def get_media_insights(media_id: str) -> ToolResult:
    """Fetch engagement insights for a media post."""
    return _get(f"/{media_id}/insights", {
        "metric": "impressions,reach,likes,comments,saved,video_views",
    })


def get_account_insights(period: str = "day") -> ToolResult:
    """Fetch account-level insights. period: day | week | month."""
    cfg = _cfg()
    return _get(f"/{cfg['INSTAGRAM_ACCOUNT_ID']}/insights", {
        "metric": "impressions,reach,follower_count,profile_views",
        "period": period,
    })


def get_recent_media(limit: int = 10) -> ToolResult:
    """Get the most recent media posts from the account."""
    cfg = _cfg()
    return _get(f"/{cfg['INSTAGRAM_ACCOUNT_ID']}/media", {
        "fields": "id,caption,media_type,timestamp,like_count,comments_count",
        "limit": str(limit),
    })
