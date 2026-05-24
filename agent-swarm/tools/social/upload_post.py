"""
Upload-Post API connector.

Used for direct carousel publishing and analytics across TikTok / Instagram.

Required env vars:
  UPLOADPOST_TOKEN
  UPLOADPOST_USER

API shape is inferred from the repository's marketing-carousel-growth-engine
spec and is intentionally small:
  - POST /api/upload_photos
  - GET  /api/analytics/{user}
  - GET  /api/uploadposts/total-impressions/{user}
  - GET  /api/uploadposts/post-analytics/{request_id}
"""
from __future__ import annotations

import mimetypes
import os
from pathlib import Path
from typing import Iterable

import requests

from tools.base import ToolResult, require_env

_BASE = "https://api.upload-post.com"


def _cfg() -> dict[str, str]:
    return require_env("UPLOADPOST_TOKEN", "UPLOADPOST_USER")


def _headers() -> dict[str, str]:
    cfg = _cfg()
    return {
        "Authorization": f"Bearer {cfg['UPLOADPOST_TOKEN']}",
        "X-Upload-Post-User": cfg["UPLOADPOST_USER"],
    }


def _load_photo(photo: str):
    """
    Return a (filename, fileobj, mimetype) tuple for multipart upload.
    Accepts local filesystem paths or public http(s) URLs.
    """
    if photo.startswith("http://") or photo.startswith("https://"):
        resp = requests.get(photo, timeout=60)
        resp.raise_for_status()
        filename = Path(photo.split("?")[0]).name or "photo.jpg"
        mime = resp.headers.get("content-type") or mimetypes.guess_type(filename)[0] or "image/jpeg"
        return filename, resp.content, mime

    path = Path(photo)
    if not path.exists():
        raise FileNotFoundError(f"Photo not found: {photo}")
    mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
    return path.name, path.read_bytes(), mime


def publish_photos(
    photos: list[str],
    platforms: Iterable[str] = ("tiktok", "instagram"),
    auto_add_music: bool = True,
    privacy_level: str = "PUBLIC_TO_EVERYONE",
    async_upload: bool = True,
    caption: str = "",
) -> ToolResult:
    """
    Publish a multi-photo carousel to Upload-Post.

    `photos` may be local file paths or public URLs.
    Returns the Upload-Post JSON response (expected to include `request_id`).
    """
    if not photos:
        return ToolResult(ok=False, error="photos list is empty")

    url = f"{_BASE}/api/upload_photos"
    files = []
    handles = []
    try:
        for photo in photos:
            filename, payload, mime = _load_photo(photo)
            if isinstance(payload, bytes):
                from io import BytesIO
                fh = BytesIO(payload)
                handles.append(fh)
            else:
                fh = payload
                handles.append(fh)
            files.append(("photos[]", (filename, fh, mime)))

        data = []
        for platform in platforms:
            data.append(("platform[]", platform))
        data.extend([
            ("auto_add_music", "true" if auto_add_music else "false"),
            ("privacy_level", privacy_level),
            ("async_upload", "true" if async_upload else "false"),
        ])
        if caption:
            data.append(("caption", caption))

        resp = requests.post(url, headers=_headers(), files=files, data=data, timeout=120)
        if not resp.ok:
            return ToolResult(ok=False, error=f"HTTP {resp.status_code}: {resp.text[:500]}")
        try:
            return ToolResult(ok=True, data=resp.json())
        except Exception:
            return ToolResult(ok=True, data={"raw": resp.text})
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))
    finally:
        for fh in handles:
            try:
                fh.close()
            except Exception:
                pass


def get_profile_analytics(platforms: str = "tiktok") -> ToolResult:
    cfg = _cfg()
    url = f"{_BASE}/api/analytics/{cfg['UPLOADPOST_USER']}"
    resp = requests.get(url, headers=_headers(), params={"platforms": platforms}, timeout=30)
    if not resp.ok:
        return ToolResult(ok=False, error=f"HTTP {resp.status_code}: {resp.text[:500]}")
    return ToolResult(ok=True, data=resp.json())


def get_total_impressions(platform: str = "tiktok", breakdown: bool = True) -> ToolResult:
    cfg = _cfg()
    url = f"{_BASE}/api/uploadposts/total-impressions/{cfg['UPLOADPOST_USER']}"
    resp = requests.get(url, headers=_headers(), params={"platform": platform, "breakdown": str(breakdown).lower()}, timeout=30)
    if not resp.ok:
        return ToolResult(ok=False, error=f"HTTP {resp.status_code}: {resp.text[:500]}")
    return ToolResult(ok=True, data=resp.json())


def get_post_analytics(request_id: str) -> ToolResult:
    url = f"{_BASE}/api/uploadposts/post-analytics/{request_id}"
    resp = requests.get(url, headers=_headers(), timeout=30)
    if not resp.ok:
        return ToolResult(ok=False, error=f"HTTP {resp.status_code}: {resp.text[:500]}")
    return ToolResult(ok=True, data=resp.json())
