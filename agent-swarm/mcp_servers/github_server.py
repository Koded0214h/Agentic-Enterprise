#!/usr/bin/env python3
"""
GitHub MCP Server

Exposes full GitHub automation as MCP tools: issues, PRs, reviews,
releases, Actions workflows, and code search.

Configure in swarm.config.json:
  "mcpServers": {
    "github": {
      "command": "python",
      "args": ["mcp_servers/github_server.py"]
    }
  }

Required env vars:
  GITHUB_TOKEN   — Personal Access Token or GitHub App installation token
  GITHUB_OWNER   — default owner (org or username)
  GITHUB_REPO    — default repository name
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

from tools.github import github as gh

mcp = FastMCP("github")


# ─────────────────────────────────────────────────────────────────────────────
# Issues
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def github_create_issue(title: str, body: str = "",
                         labels: str = "", assignees: str = "",
                         owner: str = "", repo: str = "") -> dict:
    """
    Create a GitHub issue.

    labels:    comma-separated label names, e.g. "bug,urgent"
    assignees: comma-separated GitHub usernames
    """
    return gh.create_issue(
        title, body,
        labels=[l.strip() for l in labels.split(",") if l.strip()] or None,
        assignees=[a.strip() for a in assignees.split(",") if a.strip()] or None,
        owner=owner, repo=repo,
    ).to_dict()


@mcp.tool()
def github_close_issue(issue_number: int, comment: str = "",
                        owner: str = "", repo: str = "") -> dict:
    """Close a GitHub issue, optionally adding a closing comment."""
    return gh.close_issue(issue_number, comment, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_comment_on_issue(issue_number: int, body: str,
                              owner: str = "", repo: str = "") -> dict:
    """Add a comment to a GitHub issue or PR."""
    return gh.comment_on_issue(issue_number, body, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_add_labels(issue_number: int, labels: str,
                       owner: str = "", repo: str = "") -> dict:
    """
    Add labels to an issue or PR.

    labels: comma-separated label names.
    """
    return gh.add_labels(
        issue_number,
        [l.strip() for l in labels.split(",") if l.strip()],
        owner=owner, repo=repo,
    ).to_dict()


@mcp.tool()
def github_list_issues(state: str = "open", labels: str = "",
                        limit: int = 20, owner: str = "", repo: str = "") -> dict:
    """
    List issues. state: open | closed | all. labels: comma-separated filter.
    """
    return gh.list_issues(state, labels, limit, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_search_issues(query: str, limit: int = 20) -> dict:
    """
    Search issues and PRs across GitHub.

    query: GitHub search syntax, e.g. 'repo:owner/name is:open label:bug'
    """
    return gh.search_issues(query, limit).to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# Pull Requests
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def github_create_pr(title: str, head: str, base: str = "main",
                      body: str = "", draft: bool = False,
                      owner: str = "", repo: str = "") -> dict:
    """
    Create a pull request.

    head: source branch with your changes.
    base: target branch (default: main).
    """
    return gh.create_pr(title, head, base, body, draft, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_list_prs(state: str = "open", limit: int = 20,
                     owner: str = "", repo: str = "") -> dict:
    """List pull requests. state: open | closed | all."""
    return gh.list_prs(state, limit, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_get_pr(pr_number: int, owner: str = "", repo: str = "") -> dict:
    """Get details of a specific pull request."""
    return gh.get_pr(pr_number, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_get_pr_diff(pr_number: int, owner: str = "", repo: str = "") -> dict:
    """Get the full diff/patch for a pull request."""
    return gh.get_pr_diff(pr_number, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_submit_review(pr_number: int, body: str,
                          event: str = "COMMENT",
                          owner: str = "", repo: str = "") -> dict:
    """
    Submit a PR review.

    event: APPROVE | REQUEST_CHANGES | COMMENT
    """
    return gh.submit_review(pr_number, body, event, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_request_review(pr_number: int, reviewers: str,
                            owner: str = "", repo: str = "") -> dict:
    """
    Request reviews from GitHub users.

    reviewers: comma-separated GitHub usernames.
    """
    return gh.request_review(
        pr_number,
        [r.strip() for r in reviewers.split(",") if r.strip()],
        owner=owner, repo=repo,
    ).to_dict()


@mcp.tool()
def github_merge_pr(pr_number: int, commit_message: str = "",
                     merge_method: str = "squash",
                     owner: str = "", repo: str = "") -> dict:
    """
    Merge a PR. merge_method: merge | squash | rebase.
    """
    return gh.merge_pr(pr_number, commit_message, merge_method, owner=owner, repo=repo).to_dict()


# ─────────────────────────────────────────────────────────────────────────────
# Releases & Workflows
# ─────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def github_create_release(tag: str, name: str, body: str = "",
                            prerelease: bool = False, draft: bool = False,
                            owner: str = "", repo: str = "") -> dict:
    """Create a GitHub release with release notes."""
    return gh.create_release(tag, name, body, prerelease, draft, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_list_releases(limit: int = 10, owner: str = "", repo: str = "") -> dict:
    """List recent GitHub releases."""
    return gh.list_releases(limit, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_trigger_workflow(workflow_id: str, ref: str = "main",
                              inputs: str = "{}",
                              owner: str = "", repo: str = "") -> dict:
    """
    Manually trigger a GitHub Actions workflow.

    workflow_id: workflow filename, e.g. "deploy.yml" or workflow ID number.
    inputs: JSON object of workflow_dispatch inputs.
    """
    return gh.trigger_workflow(workflow_id, ref, json.loads(inputs), owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_list_workflow_runs(workflow_id: str, limit: int = 10,
                               owner: str = "", repo: str = "") -> dict:
    """Get recent runs for a GitHub Actions workflow."""
    return gh.list_workflow_runs(workflow_id, limit, owner=owner, repo=repo).to_dict()


@mcp.tool()
def github_get_repo(owner: str = "", repo: str = "") -> dict:
    """Get repository metadata: stars, forks, open issues, language, etc."""
    return gh.get_repo(owner=owner, repo=repo).to_dict()


if __name__ == "__main__":
    mcp.run(transport="stdio")
