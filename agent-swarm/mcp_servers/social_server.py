#!/usr/bin/env python3
"""
Social Media MCP Server

Exposes Twitter/X, LinkedIn, and Instagram as MCP tools.

Configure in swarm.config.json:
  "mcpServers": {
    "social": {
      "command": "python",
      "args": ["mcp_servers/social_server.py"]
    }
  }

Required env vars (per platform):
  Twitter  : TWITTER_BEARER_TOKEN, TWITTER_API_KEY, TWITTER_API_SECRET,
             TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
  LinkedIn : LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN
             Optional: LINKEDIN_ORG_URN (for company page posts)
  Instagram: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_ACCOUNT_ID
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

from tools.social import twitter, linkedin, instagram

mcp = FastMCP("social")


# ─────────────────────────────────────────────────────────────────────────────
# Twitter / X
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def twitter_post_tweet(text: str, reply_to_id: str = "") -> dict:
    """
    Post a tweet. Max 280 chars.

    reply_to_id: tweet ID to reply to (optional).
    """
    return twitter.post_tweet(text, reply_to_id=reply_to_id or None).to_dict()


@mcp.tool()
def twitter_post_thread(tweets: str) -> dict:
    """
    Post a Twitter thread.

    tweets: JSON array of tweet strings, posted in sequence.
    Example: '["First tweet here", "Second tweet continues...", "Final tweet."]'
    """
    return twitter.post_thread(json.loads(tweets)).to_dict()


@mcp.tool()
def twitter_delete_tweet(tweet_id: str) -> dict:
    """Delete a tweet by its ID."""
    return twitter.delete_tweet(tweet_id).to_dict()


@mcp.tool()
def twitter_search(query: str, max_results: int = 10) -> dict:
    """
    Search recent tweets matching a query.

    query: Twitter search query, e.g. 'AI startup lang:en -is:retweet'
    max_results: 10–100.
    """
    return twitter.search_recent(query, max_results).to_dict()


@mcp.tool()
def twitter_get_user(username: str) -> dict:
    """Look up a Twitter user's profile by @username."""
    return twitter.get_user_by_username(username).to_dict()


@mcp.tool()
def twitter_send_dm(participant_id: str, text: str) -> dict:
    """Send a Twitter Direct Message to a user by their numeric user ID."""
    return twitter.send_dm(participant_id, text).to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# LinkedIn
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def linkedin_post_text(text: str, as_company: bool = False) -> dict:
    """
    Post a text update on LinkedIn.

    as_company: Set True to post as the company page (requires LINKEDIN_ORG_URN).
    """
    return linkedin.post_text(text, as_company=as_company).to_dict()


@mcp.tool()
def linkedin_post_with_link(text: str, url: str, title: str = "",
                             description: str = "", as_company: bool = False) -> dict:
    """
    Post a LinkedIn update with a link preview.

    url: The URL to share. LinkedIn will generate a preview card.
    """
    return linkedin.post_with_link(text, url, title, description, as_company=as_company).to_dict()


@mcp.tool()
def linkedin_add_comment(post_urn: str, text: str) -> dict:
    """Add a comment to a LinkedIn post."""
    return linkedin.add_comment(post_urn, text).to_dict()


@mcp.tool()
def linkedin_like_post(post_urn: str) -> dict:
    """Like a LinkedIn post."""
    return linkedin.like_post(post_urn).to_dict()


@mcp.tool()
def linkedin_get_profile() -> dict:
    """Get the authenticated user's LinkedIn profile info."""
    return linkedin.get_profile().to_dict()


@mcp.tool()
def linkedin_get_post_stats(post_urn: str) -> dict:
    """Get engagement statistics for a LinkedIn post."""
    return linkedin.get_post_stats(post_urn).to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# Instagram
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def instagram_post_image(image_url: str, caption: str = "") -> dict:
    """
    Publish an image post to Instagram.

    image_url: Must be a publicly accessible JPEG or PNG.
    caption: Post text with hashtags (max 2200 chars).
    """
    return instagram.post_image(image_url, caption).to_dict()


@mcp.tool()
def instagram_post_reel(video_url: str, caption: str = "", cover_url: str = "") -> dict:
    """
    Publish a Reel to Instagram.

    video_url: Publicly accessible MP4 video URL.
    cover_url: Optional thumbnail image URL.
    """
    return instagram.post_reel(video_url, caption, cover_url).to_dict()


@mcp.tool()
def instagram_post_carousel(image_urls: str, caption: str = "") -> dict:
    """
    Publish a multi-image carousel post.

    image_urls: JSON array of 2–10 image URLs.
    Example: '["https://example.com/img1.jpg", "https://example.com/img2.jpg"]'
    """
    return instagram.post_carousel(json.loads(image_urls), caption).to_dict()


@mcp.tool()
def instagram_get_insights() -> dict:
    """Get account-level insights (reach, impressions, follower count)."""
    return instagram.get_account_insights().to_dict()


@mcp.tool()
def instagram_get_recent_posts(limit: int = 10) -> dict:
    """Get recent media posts with engagement counts."""
    return instagram.get_recent_media(limit).to_dict()


@mcp.tool()
def instagram_reply_to_comment(comment_id: str, text: str) -> dict:
    """Reply to an Instagram comment."""
    return instagram.reply_to_comment(comment_id, text).to_dict()


if __name__ == "__main__":
    mcp.run(transport="stdio")
