"""
GitHub REST API tool — automate issues, pull requests, reviews, and releases.

Required env vars:
  GITHUB_TOKEN      — Personal Access Token or GitHub App installation token
  GITHUB_OWNER      — default repo owner (org or user name)
  GITHUB_REPO       — default repo name

The default owner/repo can be overridden per-call.

Docs: https://docs.github.com/en/rest
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
import urllib.error
from typing import Optional

from tools.base import ToolResult, require_env

_BASE = "https://api.github.com"


def _headers() -> dict:
    cfg = require_env("GITHUB_TOKEN")
    return {
        "Authorization": f"Bearer {cfg['GITHUB_TOKEN']}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    }


def _default_repo() -> tuple[str, str]:
    return (
        os.environ.get("GITHUB_OWNER", ""),
        os.environ.get("GITHUB_REPO", ""),
    )


def _get(path: str, params: Optional[dict] = None) -> ToolResult:
    url = f"{_BASE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=_headers(), method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def _post(path: str, body: dict) -> ToolResult:
    url = f"{_BASE}{path}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def _patch(path: str, body: dict) -> ToolResult:
    url = f"{_BASE}{path}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_headers(), method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Issues
# ─────────────────────────────────────────────────────────────────────────────

def create_issue(title: str, body: str = "", labels: Optional[list[str]] = None,
                 assignees: Optional[list[str]] = None,
                 owner: str = "", repo: str = "") -> ToolResult:
    """Create a new GitHub issue."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    payload: dict = {"title": title}
    if body:
        payload["body"] = body
    if labels:
        payload["labels"] = labels
    if assignees:
        payload["assignees"] = assignees
    return _post(f"/repos/{o}/{r}/issues", payload)


def close_issue(issue_number: int, comment: str = "",
                owner: str = "", repo: str = "") -> ToolResult:
    """Close a GitHub issue, optionally adding a closing comment."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    if comment:
        _post(f"/repos/{o}/{r}/issues/{issue_number}/comments", {"body": comment})
    return _patch(f"/repos/{o}/{r}/issues/{issue_number}", {"state": "closed"})


def comment_on_issue(issue_number: int, body: str,
                     owner: str = "", repo: str = "") -> ToolResult:
    """Add a comment to an issue or PR."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _post(f"/repos/{o}/{r}/issues/{issue_number}/comments", {"body": body})


def add_labels(issue_number: int, labels: list[str],
               owner: str = "", repo: str = "") -> ToolResult:
    """Add labels to an issue or PR."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _post(f"/repos/{o}/{r}/issues/{issue_number}/labels", {"labels": labels})


def list_issues(state: str = "open", labels: str = "", limit: int = 20,
                owner: str = "", repo: str = "") -> ToolResult:
    """List issues in a repository. state: open | closed | all."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    params: dict = {"state": state, "per_page": str(min(limit, 100))}
    if labels:
        params["labels"] = labels
    return _get(f"/repos/{o}/{r}/issues", params)


def assign_issue(issue_number: int, assignees: list[str],
                 owner: str = "", repo: str = "") -> ToolResult:
    """Assign users to an issue."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _post(f"/repos/{o}/{r}/issues/{issue_number}/assignees", {"assignees": assignees})


# ─────────────────────────────────────────────────────────────────────────────
# Pull Requests
# ─────────────────────────────────────────────────────────────────────────────

def create_pr(title: str, head: str, base: str, body: str = "",
              draft: bool = False, owner: str = "", repo: str = "") -> ToolResult:
    """
    Create a pull request.

    head: branch with your changes (e.g. "feat/my-feature")
    base: target branch (e.g. "main")
    """
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _post(f"/repos/{o}/{r}/pulls", {
        "title": title, "head": head, "base": base,
        "body": body, "draft": draft,
    })


def list_prs(state: str = "open", limit: int = 20,
             owner: str = "", repo: str = "") -> ToolResult:
    """List pull requests. state: open | closed | all."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _get(f"/repos/{o}/{r}/pulls", {"state": state, "per_page": str(min(limit, 100))})


def get_pr(pr_number: int, owner: str = "", repo: str = "") -> ToolResult:
    """Get details of a specific PR."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _get(f"/repos/{o}/{r}/pulls/{pr_number}")


def merge_pr(pr_number: int, commit_message: str = "",
             merge_method: str = "squash",
             owner: str = "", repo: str = "") -> ToolResult:
    """
    Merge a pull request.

    merge_method: merge | squash | rebase
    """
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    body: dict = {"merge_method": merge_method}
    if commit_message:
        body["commit_message"] = commit_message
    url = f"{_BASE}/repos/{o}/{r}/pulls/{pr_number}/merge"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_headers(), method="PUT")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data=json.loads(resp.read()))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


def request_review(pr_number: int, reviewers: list[str],
                   owner: str = "", repo: str = "") -> ToolResult:
    """Request reviews from specific GitHub users."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _post(f"/repos/{o}/{r}/pulls/{pr_number}/requested_reviewers",
                 {"reviewers": reviewers})


def submit_review(pr_number: int, body: str,
                  event: str = "COMMENT",
                  owner: str = "", repo: str = "") -> ToolResult:
    """
    Submit a PR review.

    event: APPROVE | REQUEST_CHANGES | COMMENT
    """
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _post(f"/repos/{o}/{r}/pulls/{pr_number}/reviews",
                 {"body": body, "event": event})


def get_pr_diff(pr_number: int, owner: str = "", repo: str = "") -> ToolResult:
    """Get the diff for a pull request (returns raw patch text)."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    url = f"{_BASE}/repos/{o}/{r}/pulls/{pr_number}"
    req = urllib.request.Request(
        url,
        headers={**_headers(), "Accept": "application/vnd.github.v3.diff"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data=resp.read().decode(errors="replace"))
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Releases
# ─────────────────────────────────────────────────────────────────────────────

def create_release(tag: str, name: str, body: str = "",
                   prerelease: bool = False, draft: bool = False,
                   owner: str = "", repo: str = "") -> ToolResult:
    """Create a GitHub release."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _post(f"/repos/{o}/{r}/releases", {
        "tag_name": tag, "name": name, "body": body,
        "prerelease": prerelease, "draft": draft,
    })


def list_releases(limit: int = 10, owner: str = "", repo: str = "") -> ToolResult:
    """List recent releases."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _get(f"/repos/{o}/{r}/releases", {"per_page": str(min(limit, 100))})


# ─────────────────────────────────────────────────────────────────────────────
# Repository / general
# ─────────────────────────────────────────────────────────────────────────────

def get_repo(owner: str = "", repo: str = "") -> ToolResult:
    """Get repository metadata (stars, forks, open issues, etc.)."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _get(f"/repos/{o}/{r}")


def list_workflows(owner: str = "", repo: str = "") -> ToolResult:
    """List GitHub Actions workflows."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _get(f"/repos/{o}/{r}/actions/workflows")


def trigger_workflow(workflow_id: str, ref: str = "main",
                     inputs: Optional[dict] = None,
                     owner: str = "", repo: str = "") -> ToolResult:
    """Manually trigger a GitHub Actions workflow dispatch."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _post(f"/repos/{o}/{r}/actions/workflows/{workflow_id}/dispatches", {
        "ref": ref,
        "inputs": inputs or {},
    })


def list_workflow_runs(workflow_id: str, limit: int = 10,
                       owner: str = "", repo: str = "") -> ToolResult:
    """Get recent runs for a workflow."""
    o, r = owner or _default_repo()[0], repo or _default_repo()[1]
    return _get(f"/repos/{o}/{r}/actions/workflows/{workflow_id}/runs",
                {"per_page": str(min(limit, 100))})


def search_issues(query: str, limit: int = 20) -> ToolResult:
    """
    Search issues and PRs across GitHub.

    query examples:
      "repo:owner/repo is:open label:bug"
      "org:myorg is:open is:issue assignee:username"
    """
    return _get("/search/issues", {"q": query, "per_page": str(min(limit, 100))})
