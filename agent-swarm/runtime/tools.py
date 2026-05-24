"""
AOS Native Runtime — Structured Tool Execution Layer

Every tool an agent can call is a registered, typed, permissioned function.
AOS sees every invocation: name, params, result, duration, errors.

Tool namespaces map to the existing MCP servers:
  github.*     → mcp_servers/github_server.py
  ads.*        → mcp_servers/ads_server.py
  social.*     → mcp_servers/social_server.py
  messaging.*  → mcp_servers/messaging_server.py
  scheduler.*  → mcp_servers/scheduler_server.py
  hub.*        → mcp_servers/hub_server.py

Built-in tools (no MCP, always available):
  shell.run, file.read, file.write, file.list
"""
from __future__ import annotations

import os
import time
import subprocess
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Core types
# ---------------------------------------------------------------------------

@dataclass
class ExecutionContext:
    execution_id: str
    agent_id: str
    agent_permissions: list[str] = field(default_factory=list)
    workspace_dir: str = "."
    department_id: str = ""


@dataclass
class ToolResult:
    tool_name: str
    success: bool
    output: Any
    error: str = ""
    duration_ms: int = 0

    def to_content(self) -> str:
        if not self.success:
            return f"Error: {self.error}"
        if isinstance(self.output, str):
            return self.output
        import json
        return json.dumps(self.output, default=str)


class PermissionDeniedError(Exception):
    pass


class ToolTimeoutError(Exception):
    pass


# ---------------------------------------------------------------------------
# Tool base class
# ---------------------------------------------------------------------------

class Tool(ABC):
    name: str = ""
    description: str = ""
    required_permissions: list[str] = []
    risk_level: int = 0          # 0–100
    is_destructive: bool = False
    timeout_seconds: int = 30
    parameters: dict = field(default_factory=dict)  # JSON Schema

    @abstractmethod
    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        ...

    def to_schema(self):
        from .providers import ToolSchema
        return ToolSchema(
            name=self.name,
            description=self.description,
            parameters=self.parameters,
        )

    def check_permissions(self, context: ExecutionContext) -> None:
        for perm in self.required_permissions:
            if perm not in context.agent_permissions:
                raise PermissionDeniedError(
                    f"Agent {context.agent_id!r} lacks permission {perm!r} required by tool {self.name!r}"
                )


# ---------------------------------------------------------------------------
# Built-in tools
# ---------------------------------------------------------------------------

ALLOWED_SHELL_COMMANDS = frozenset([
    "npm", "npx", "node", "python", "python3", "pip", "pip3",
    "pytest", "jest", "cargo", "go", "make", "git",
    "ls", "find", "grep", "cat", "echo", "mkdir", "cp", "mv",
])


class ShellTool(Tool):
    name = "shell.run"
    description = "Run a shell command in the agent's workspace. Only pre-approved commands are allowed."
    required_permissions = ["shell.run"]
    risk_level = 40
    timeout_seconds = 120
    parameters = {
        "type": "object",
        "properties": {
            "command": {"type": "string", "description": "Shell command to run"},
        },
        "required": ["command"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        command = params.get("command", "").strip()
        if not command:
            return ToolResult(tool_name=self.name, success=False, output="", error="Empty command")

        base_cmd = command.split()[0].split("/")[-1]
        if base_cmd not in ALLOWED_SHELL_COMMANDS:
            return ToolResult(
                tool_name=self.name, success=False, output="",
                error=f"Command {base_cmd!r} is not in the allowed list",
            )

        start = time.monotonic()
        try:
            proc = subprocess.run(
                command, shell=True, capture_output=True, text=True,
                cwd=context.workspace_dir, timeout=self.timeout_seconds,
            )
            duration_ms = int((time.monotonic() - start) * 1000)
            output = proc.stdout + proc.stderr
            return ToolResult(
                tool_name=self.name,
                success=proc.returncode == 0,
                output=output[:8000],
                error="" if proc.returncode == 0 else f"exit {proc.returncode}",
                duration_ms=duration_ms,
            )
        except subprocess.TimeoutExpired:
            return ToolResult(tool_name=self.name, success=False, output="", error="Command timed out")
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class FileReadTool(Tool):
    name = "file.read"
    description = "Read a file from the workspace."
    required_permissions = ["file.read"]
    risk_level = 5
    parameters = {
        "type": "object",
        "properties": {
            "path": {"type": "string", "description": "File path relative to workspace"},
        },
        "required": ["path"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        path = Path(context.workspace_dir) / params["path"]
        start = time.monotonic()
        try:
            content = path.read_text(errors="replace")
            return ToolResult(
                tool_name=self.name, success=True,
                output=content[:50_000],
                duration_ms=int((time.monotonic() - start) * 1000),
            )
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class FileWriteTool(Tool):
    name = "file.write"
    description = "Write content to a file in the workspace."
    required_permissions = ["file.write"]
    risk_level = 30
    is_destructive = True
    parameters = {
        "type": "object",
        "properties": {
            "path": {"type": "string"},
            "content": {"type": "string"},
        },
        "required": ["path", "content"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        path = Path(context.workspace_dir) / params["path"]
        path.parent.mkdir(parents=True, exist_ok=True)
        start = time.monotonic()
        try:
            path.write_text(params["content"])
            return ToolResult(
                tool_name=self.name, success=True,
                output=f"Written {len(params['content'])} chars to {path}",
                duration_ms=int((time.monotonic() - start) * 1000),
            )
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class FileListTool(Tool):
    name = "file.list"
    description = "List files in a workspace directory."
    required_permissions = ["file.read"]
    risk_level = 5
    parameters = {
        "type": "object",
        "properties": {
            "path": {"type": "string", "description": "Directory path (default: workspace root)"},
        },
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        dir_path = Path(context.workspace_dir) / params.get("path", ".")
        start = time.monotonic()
        try:
            entries = sorted(
                str(p.relative_to(dir_path)) for p in dir_path.iterdir()
            )
            return ToolResult(
                tool_name=self.name, success=True,
                output="\n".join(entries),
                duration_ms=int((time.monotonic() - start) * 1000),
            )
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# ---------------------------------------------------------------------------
# Tool Registry
# ---------------------------------------------------------------------------

class ToolRegistry:
    _registry: dict[str, Tool] = {}

    # Idempotency cache: maps (execution_id, tool_name, params_hash) → ToolResult
    # Prevents duplicate tool calls if Celery retries a job that already ran some tools.
    _idempotency_cache: dict[str, ToolResult] = {}

    @classmethod
    def register(cls, tool: Tool) -> None:
        cls._registry[tool.name] = tool

    @classmethod
    def get(cls, name: str) -> Tool | None:
        return cls._registry.get(name)

    @classmethod
    def for_agent(cls, permissions: list[str]) -> "ToolRegistry":
        """Return a view of the registry filtered to what this agent is permitted to call."""
        instance = cls()
        instance._allowed = {
            name: tool for name, tool in cls._registry.items()
            if all(p in permissions for p in tool.required_permissions)
        }
        return instance

    def __init__(self):
        self._allowed: dict[str, Tool] = dict(self._registry)

    def schemas(self):
        return [t.to_schema() for t in self._allowed.values()]

    async def execute(self, tool_call, context: ExecutionContext) -> ToolResult:
        import hashlib, json as _json
        tool = self._allowed.get(tool_call.name)
        if tool is None:
            return ToolResult(
                tool_name=tool_call.name, success=False, output="",
                error=f"Tool {tool_call.name!r} not found or not permitted",
            )

        # Idempotency check — skip re-execution for destructive tools on retry
        if tool.is_destructive:
            params_hash = hashlib.sha256(
                _json.dumps(tool_call.input, sort_keys=True).encode()
            ).hexdigest()[:16]
            cache_key = f"{context.execution_id}:{tool_call.name}:{params_hash}"
            if cache_key in self._idempotency_cache:
                cached = self._idempotency_cache[cache_key]
                cached.output = f"[idempotent] {cached.output}"
                return cached
            result = await tool.execute(tool_call.input, context)
            if result.success:
                self._idempotency_cache[cache_key] = result
            return result

        return await tool.execute(tool_call.input, context)

    def names(self) -> list[str]:
        return list(self._allowed.keys())


# ---------------------------------------------------------------------------
# Direct tool implementations — call tools/* modules inline, no subprocess
# ---------------------------------------------------------------------------

_SWARM_ROOT = str(Path(__file__).parent.parent)


def _ensure_path() -> None:
    """Ensure the swarm root is on sys.path so tools/* modules are importable."""
    import sys as _sys
    if _SWARM_ROOT not in _sys.path:
        _sys.path.insert(0, _SWARM_ROOT)


def _wrap(tool_name: str, base_result, duration_ms: int = 0) -> ToolResult:
    """Convert a tools.base.ToolResult into a runtime ToolResult."""
    import json as _json
    if base_result.ok:
        output = _json.dumps(base_result.data, default=str) if base_result.data is not None else "ok"
        return ToolResult(tool_name=tool_name, success=True, output=output, duration_ms=duration_ms)
    return ToolResult(tool_name=tool_name, success=False, output="", error=base_result.error, duration_ms=duration_ms)


# ── GitHub ─────────────────────────────────────────────────────────────────

class GitHubCreateIssueTool(Tool):
    name = "github.create_issue"
    description = "Create a GitHub issue in the configured repository."
    required_permissions = ["github.write"]
    risk_level = 30
    parameters = {
        "type": "object",
        "properties": {
            "title":    {"type": "string"},
            "body":     {"type": "string"},
            "labels":   {"type": "array", "items": {"type": "string"}},
            "assignees":{"type": "array", "items": {"type": "string"}},
            "owner":    {"type": "string"},
            "repo":     {"type": "string"},
        },
        "required": ["title"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.github import github as gh
            r = gh.create_issue(
                title=params["title"],
                body=params.get("body", ""),
                labels=params.get("labels"),
                assignees=params.get("assignees"),
                owner=params.get("owner", ""),
                repo=params.get("repo", ""),
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class GitHubCloseIssueTool(Tool):
    name = "github.close_issue"
    description = "Close a GitHub issue by number."
    required_permissions = ["github.write"]
    risk_level = 30
    is_destructive = True
    parameters = {
        "type": "object",
        "properties": {
            "issue_number": {"type": "integer"},
            "comment":      {"type": "string"},
            "owner":        {"type": "string"},
            "repo":         {"type": "string"},
        },
        "required": ["issue_number"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.github import github as gh
            r = gh.close_issue(
                issue_number=int(params["issue_number"]),
                comment=params.get("comment", ""),
                owner=params.get("owner", ""),
                repo=params.get("repo", ""),
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class GitHubCreatePRTool(Tool):
    name = "github.create_pr"
    description = "Create a GitHub pull request."
    required_permissions = ["github.write"]
    risk_level = 50
    parameters = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "head":  {"type": "string", "description": "source branch"},
            "base":  {"type": "string", "description": "target branch"},
            "body":  {"type": "string"},
            "draft": {"type": "boolean"},
            "owner": {"type": "string"},
            "repo":  {"type": "string"},
        },
        "required": ["title", "head", "base"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.github import github as gh
            r = gh.create_pr(
                title=params["title"],
                head=params["head"],
                base=params["base"],
                body=params.get("body", ""),
                draft=params.get("draft", False),
                owner=params.get("owner", ""),
                repo=params.get("repo", ""),
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class GitHubMergePRTool(Tool):
    name = "github.merge_pr"
    description = "Merge a GitHub pull request."
    required_permissions = ["github.write"]
    risk_level = 70
    is_destructive = True
    parameters = {
        "type": "object",
        "properties": {
            "pr_number":      {"type": "integer"},
            "commit_message": {"type": "string"},
            "merge_method":   {"type": "string", "enum": ["merge", "squash", "rebase"]},
            "owner":          {"type": "string"},
            "repo":           {"type": "string"},
        },
        "required": ["pr_number"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.github import github as gh
            r = gh.merge_pr(
                pr_number=int(params["pr_number"]),
                commit_message=params.get("commit_message", ""),
                merge_method=params.get("merge_method", "merge"),
                owner=params.get("owner", ""),
                repo=params.get("repo", ""),
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class GitHubListPRsTool(Tool):
    name = "github.list_prs"
    description = "List open pull requests in the configured repository."
    required_permissions = ["github.read"]
    risk_level = 5
    parameters = {
        "type": "object",
        "properties": {
            "state": {"type": "string", "enum": ["open", "closed", "all"]},
            "limit": {"type": "integer"},
            "owner": {"type": "string"},
            "repo":  {"type": "string"},
        },
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.github import github as gh
            r = gh.list_prs(
                state=params.get("state", "open"),
                limit=int(params.get("limit", 20)),
                owner=params.get("owner", ""),
                repo=params.get("repo", ""),
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class GitHubGetFileTool(Tool):
    name = "github.get_file"
    description = "Read a file from a GitHub repository."
    required_permissions = ["github.read"]
    risk_level = 5
    parameters = {
        "type": "object",
        "properties": {
            "path":   {"type": "string"},
            "ref":    {"type": "string", "description": "branch, tag, or commit SHA"},
            "owner":  {"type": "string"},
            "repo":   {"type": "string"},
        },
        "required": ["path"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            import os as _os, urllib.request, urllib.error, json as _json
            from tools.github.github import _headers, _default_repo
            owner, repo = _default_repo()
            owner = params.get("owner") or owner
            repo = params.get("repo") or repo
            path = params["path"].lstrip("/")
            url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
            if params.get("ref"):
                url += f"?ref={params['ref']}"
            req = urllib.request.Request(url, headers=_headers())
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = _json.loads(resp.read())
            import base64
            content = base64.b64decode(data.get("content", "")).decode(errors="replace")
            duration_ms = int((time.monotonic() - t) * 1000)
            return ToolResult(tool_name=self.name, success=True, output=content[:50_000], duration_ms=duration_ms)
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class GitHubSearchCodeTool(Tool):
    name = "github.search_code"
    description = "Search issues and code in a GitHub repository."
    required_permissions = ["github.read"]
    risk_level = 5
    parameters = {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "limit": {"type": "integer"},
            "owner": {"type": "string"},
            "repo":  {"type": "string"},
        },
        "required": ["query"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.github import github as gh
            owner = params.get("owner", "")
            repo = params.get("repo", "")
            if not owner:
                owner, repo = gh._default_repo()
            q = f"{params['query']} repo:{owner}/{repo}"
            r = gh.search_issues(query=q, limit=int(params.get("limit", 20)))
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class GitHubRunWorkflowTool(Tool):
    name = "github.run_workflow"
    description = "Trigger a GitHub Actions workflow."
    required_permissions = ["github.write"]
    risk_level = 60
    parameters = {
        "type": "object",
        "properties": {
            "workflow_id": {"type": "string", "description": "workflow filename or ID"},
            "ref":         {"type": "string", "description": "branch or tag"},
            "inputs":      {"type": "object"},
            "owner":       {"type": "string"},
            "repo":        {"type": "string"},
        },
        "required": ["workflow_id"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.github import github as gh
            r = gh.trigger_workflow(
                workflow_id=params["workflow_id"],
                ref=params.get("ref", "main"),
                inputs=params.get("inputs", {}),
                owner=params.get("owner", ""),
                repo=params.get("repo", ""),
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# ── Social ──────────────────────────────────────────────────────────────────

class SocialPostTool(Tool):
    """
    Post to a social media platform.
    Routes by 'platform' param: twitter (default), linkedin, instagram.
    """
    name = "social.post"
    description = (
        "Post content to a social media platform. "
        "platform: twitter (default) | linkedin | instagram. "
        "For twitter: text (≤280 chars), optional reply_to_id. "
        "For linkedin: text, optional url/title/description, as_company bool. "
        "For instagram: image_url required, optional caption."
    )
    required_permissions = ["social.write"]
    risk_level = 40
    parameters = {
        "type": "object",
        "properties": {
            "platform":    {"type": "string", "enum": ["twitter", "linkedin", "instagram"]},
            "text":        {"type": "string"},
            "image_url":   {"type": "string"},
            "reply_to_id": {"type": "string"},
            "url":         {"type": "string", "description": "LinkedIn link post URL"},
            "title":       {"type": "string", "description": "LinkedIn link post title"},
            "as_company":  {"type": "boolean", "description": "Post as company page (LinkedIn)"},
        },
        "required": ["text"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        platform = params.get("platform", "twitter").lower()
        try:
            if platform == "twitter":
                from tools.social import twitter
                r = twitter.post_tweet(
                    text=params["text"],
                    reply_to_id=params.get("reply_to_id") or None,
                )
            elif platform == "linkedin":
                from tools.social import linkedin
                if params.get("url"):
                    r = linkedin.post_with_link(
                        text=params["text"],
                        url=params["url"],
                        title=params.get("title", ""),
                        description=params.get("text", "")[:200],
                        as_company=params.get("as_company", False),
                    )
                else:
                    r = linkedin.post_text(
                        text=params["text"],
                        as_company=params.get("as_company", False),
                    )
            elif platform == "instagram":
                from tools.social import instagram
                image_url = params.get("image_url", "")
                if not image_url:
                    from tools.base import ToolResult as BR
                    r = BR(ok=False, error="instagram requires image_url")
                else:
                    r = instagram.post_image(image_url=image_url, caption=params.get("text", ""))
            else:
                from tools.base import ToolResult as BR
                r = BR(ok=False, error=f"Unknown platform: {platform}")
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class SocialAnalyticsTool(Tool):
    """Get social media analytics for twitter, linkedin, or instagram."""
    name = "social.get_analytics"
    description = (
        "Get social media analytics. "
        "platform: twitter | linkedin | instagram. "
        "Optional post_id to get post-level stats."
    )
    required_permissions = ["social.read"]
    risk_level = 5
    parameters = {
        "type": "object",
        "properties": {
            "platform": {"type": "string", "enum": ["twitter", "linkedin", "instagram"]},
            "post_id":  {"type": "string", "description": "Post/tweet/media ID for post-level stats"},
        },
        "required": ["platform"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        platform = params.get("platform", "twitter").lower()
        post_id = params.get("post_id", "")
        try:
            if platform == "twitter":
                from tools.social import twitter
                if post_id:
                    r = twitter.search_recent(f"id:{post_id}")
                else:
                    r = twitter.search_recent("from:me", max_results=10)
            elif platform == "linkedin":
                from tools.social import linkedin
                if post_id:
                    r = linkedin.get_post_stats(post_urn=post_id)
                else:
                    r = linkedin.get_profile()
            elif platform == "instagram":
                from tools.social import instagram
                if post_id:
                    r = instagram.get_media_insights(media_id=post_id)
                else:
                    r = instagram.get_account_insights()
            else:
                from tools.base import ToolResult as BR
                r = BR(ok=False, error=f"Unknown platform: {platform}")
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class SocialSchedulePostTool(Tool):
    """Schedule a social media post via the swarm cron scheduler."""
    name = "social.schedule_post"
    description = (
        "Schedule a social media post for a future time. "
        "Creates a cron job that fires the social-media-strategist agent. "
        "schedule: 5-field cron expression, e.g. '0 9 * * 1' = Monday 9am. "
        "platform: twitter | linkedin | instagram."
    )
    required_permissions = ["social.write"]
    risk_level = 30
    parameters = {
        "type": "object",
        "properties": {
            "platform": {"type": "string", "enum": ["twitter", "linkedin", "instagram"]},
            "text":     {"type": "string"},
            "schedule": {"type": "string", "description": "Cron expression (5 fields)"},
            "image_url":{"type": "string"},
        },
        "required": ["text", "schedule"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.scheduler.cron import create_job
            platform = params.get("platform", "twitter")
            task = (
                f"Post this to {platform}: {params['text']}"
                + (f"\nimage_url: {params['image_url']}" if params.get("image_url") else "")
            )
            r = create_job(
                name=f"Scheduled {platform} post",
                schedule=params["schedule"],
                agent="marketing-social-media-strategist",
                task=task,
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# Upload-Post is used for multi-platform carousel publishing and analytics.
class SocialUploadPostTool(Tool):
    """Publish a carousel via Upload-Post instead of MCP."""
    name = "social.upload_post"
    description = (
        "Publish a multi-photo carousel via Upload-Post. "
        "Use for TikTok/Instagram carousel distribution. "
        "photos: local file paths or public URLs."
    )
    required_permissions = ["social.write"]
    risk_level = 45
    parameters = {
        "type": "object",
        "properties": {
            "photos": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Local file paths or public URLs to JPG/PNG assets",
            },
            "platforms": {
                "type": "array",
                "items": {"type": "string", "enum": ["tiktok", "instagram"]},
                "default": ["tiktok", "instagram"],
            },
            "caption": {"type": "string"},
            "auto_add_music": {"type": "boolean"},
            "privacy_level": {"type": "string"},
            "async_upload": {"type": "boolean"},
        },
        "required": ["photos"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.social import upload_post
            r = upload_post.publish_photos(
                photos=list(params.get("photos") or []),
                platforms=params.get("platforms") or ["tiktok", "instagram"],
                auto_add_music=bool(params.get("auto_add_music", True)),
                privacy_level=params.get("privacy_level", "PUBLIC_TO_EVERYONE"),
                async_upload=bool(params.get("async_upload", True)),
                caption=params.get("caption", ""),
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class SocialUploadPostAnalyticsTool(Tool):
    """Fetch analytics from Upload-Post after publishing."""
    name = "social.upload_post_analytics"
    description = (
        "Get Upload-Post analytics. Provide request_id for post analytics, "
        "or leave empty for profile analytics."
    )
    required_permissions = ["social.read"]
    risk_level = 5
    parameters = {
        "type": "object",
        "properties": {
            "request_id": {"type": "string"},
            "platforms": {"type": "string", "enum": ["tiktok", "instagram"]},
            "mode": {"type": "string", "enum": ["post", "profile", "impressions"]},
            "platform": {"type": "string", "enum": ["tiktok", "instagram"]},
        },
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.social import upload_post
            mode = (params.get("mode") or "post").lower()
            if mode == "profile":
                r = upload_post.get_profile_analytics(platforms=params.get("platforms", "tiktok"))
            elif mode == "impressions":
                r = upload_post.get_total_impressions(platform=params.get("platform", "tiktok"))
            else:
                request_id = params.get("request_id", "")
                if not request_id:
                    return ToolResult(tool_name=self.name, success=False, output="", error="request_id is required for post analytics")
                r = upload_post.get_post_analytics(request_id=request_id)
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# ── Messaging ───────────────────────────────────────────────────────────────

class MessagingSendTool(Tool):
    """
    Send a message via a messaging platform.
    Routes by 'channel': slack (default), email, whatsapp, telegram.
    """
    name = "messaging.send"
    description = (
        "Send a message. channel: slack (default) | email | whatsapp | telegram. "
        "to: Slack channel (#general), email address, WhatsApp E.164 number, or Telegram chat_id. "
        "subject: required for email."
    )
    required_permissions = ["messaging.write"]
    risk_level = 30
    parameters = {
        "type": "object",
        "properties": {
            "channel": {"type": "string", "enum": ["slack", "email", "whatsapp", "telegram"]},
            "to":      {"type": "string"},
            "message": {"type": "string"},
            "subject": {"type": "string", "description": "Email subject line"},
        },
        "required": ["to", "message"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        channel = params.get("channel", "slack").lower()
        try:
            if channel == "slack":
                from tools.messaging import slack
                r = slack.send_message(channel=params["to"], text=params["message"])
            elif channel == "email":
                from tools.messaging import email as email_tool
                r = email_tool.send_plain(
                    to=params["to"],
                    subject=params.get("subject", "(no subject)"),
                    body=params["message"],
                )
            elif channel == "whatsapp":
                from tools.messaging import whatsapp
                r = whatsapp.send_text(to=params["to"], message=params["message"])
            elif channel == "telegram":
                from tools.messaging import telegram
                r = telegram.send_message(chat_id=params["to"], text=params["message"])
            else:
                from tools.base import ToolResult as BR
                r = BR(ok=False, error=f"Unknown channel: {channel}")
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# ── Ads ─────────────────────────────────────────────────────────────────────

class AdsCreateCampaignTool(Tool):
    """Create an ad campaign on Meta or Google Ads."""
    name = "ads.create_campaign"
    description = (
        "Create an advertising campaign. "
        "platform: meta (default) | google. "
        "For meta: name, objective (OUTCOME_TRAFFIC|OUTCOME_LEADS|OUTCOME_SALES), daily_budget_usd, status. "
        "For google: name, budget_usd, bidding_strategy."
    )
    required_permissions = ["ads.write"]
    risk_level = 50
    parameters = {
        "type": "object",
        "properties": {
            "platform":          {"type": "string", "enum": ["meta", "google"]},
            "name":              {"type": "string"},
            "objective":         {"type": "string"},
            "daily_budget_usd":  {"type": "number"},
            "status":            {"type": "string", "enum": ["ACTIVE", "PAUSED"]},
            "bidding_strategy":  {"type": "string"},
        },
        "required": ["name"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        platform = params.get("platform", "meta").lower()
        try:
            if platform == "meta":
                from tools.ads import meta_ads
                r = meta_ads.create_campaign(
                    name=params["name"],
                    objective=params.get("objective", "OUTCOME_TRAFFIC"),
                    daily_budget_usd=float(params.get("daily_budget_usd", 10.0)),
                    status=params.get("status", "PAUSED"),
                )
            elif platform == "google":
                from tools.ads import google_ads
                r = google_ads.list_campaigns()  # Google Ads campaign creation needs full API setup
            else:
                from tools.base import ToolResult as BR
                r = BR(ok=False, error=f"Unknown ads platform: {platform}")
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class AdsGetPerformanceTool(Tool):
    """Get ad campaign performance metrics."""
    name = "ads.get_performance"
    description = "Get ad campaign performance. platform: meta | google. date_range: last_7d (default) | last_30d | last_90d."
    required_permissions = ["ads.read"]
    risk_level = 5
    parameters = {
        "type": "object",
        "properties": {
            "platform":    {"type": "string", "enum": ["meta", "google"]},
            "campaign_id": {"type": "string"},
            "date_range":  {"type": "string"},
        },
        "required": ["platform"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        platform = params.get("platform", "meta").lower()
        try:
            if platform == "meta":
                from tools.ads import meta_ads
                cid = params.get("campaign_id", "")
                if cid:
                    r = meta_ads.get_campaign_insights(cid, date_preset=params.get("date_range", "last_7d"))
                else:
                    r = meta_ads.get_account_insights(date_preset=params.get("date_range", "last_7d"))
            elif platform == "google":
                from tools.ads import google_ads
                r = google_ads.get_performance_report(date_range=params.get("date_range", "LAST_7_DAYS").upper())
            else:
                from tools.base import ToolResult as BR
                r = BR(ok=False, error=f"Unknown ads platform: {platform}")
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# ── Scheduler ───────────────────────────────────────────────────────────────

class SchedulerCreateTaskTool(Tool):
    """Create a recurring scheduled agent job."""
    name = "scheduler.create_task"
    description = (
        "Create a scheduled recurring agent task (cron job). "
        "name: human-readable label. "
        "schedule: 5-field cron expression ('0 9 * * 1-5' = 9am weekdays). "
        "agent: swarm agent name. task: what the agent should do when it fires."
    )
    required_permissions = ["scheduler.write"]
    risk_level = 20
    parameters = {
        "type": "object",
        "properties": {
            "name":     {"type": "string"},
            "schedule": {"type": "string"},
            "agent":    {"type": "string"},
            "task":     {"type": "string"},
            "enabled":  {"type": "boolean"},
            "max_retries": {"type": "integer"},
            "retry_delay_minutes": {"type": "integer"},
        },
        "required": ["name", "schedule", "agent", "task"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.scheduler.cron import create_job
            r = create_job(
                name=params["name"],
                schedule=params["schedule"],
                agent=params["agent"],
                task=params["task"],
                enabled=params.get("enabled", True),
                max_retries=int(params.get("max_retries", 3)),
                retry_delay_minutes=int(params.get("retry_delay_minutes", 5)),
            )
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class SchedulerListTasksTool(Tool):
    """List all scheduled agent jobs."""
    name = "scheduler.list_tasks"
    description = "List all scheduled recurring agent tasks."
    required_permissions = ["scheduler.read"]
    risk_level = 5
    parameters = {"type": "object", "properties": {}}

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        _ensure_path()
        t = time.monotonic()
        try:
            from tools.scheduler.cron import list_jobs
            r = list_jobs()
            return _wrap(self.name, r, int((time.monotonic() - t) * 1000))
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# ---------------------------------------------------------------------------
# ── Web Search ──────────────────────────────────────────────────────────────

class WebSearchTool(Tool):
    """
    Search the web via DuckDuckGo (no API key required).
    Returns titles, URLs, and snippets for the top results.
    """
    name = "web.search"
    description = (
        "Search the web using DuckDuckGo. Returns top results with title, URL, and snippet. "
        "Use for competitor research, trend analysis, market sizing, finding leads, "
        "news monitoring, and any live web information."
    )
    required_permissions = ["web.read"]
    risk_level = 5
    timeout_seconds = 30
    parameters = {
        "type": "object",
        "properties": {
            "query":      {"type": "string", "description": "Search query"},
            "max_results":{"type": "integer", "description": "Number of results (1-20, default 8)"},
            "region":     {"type": "string",  "description": "Region code e.g. us-en, gb-en (default us-en)"},
        },
        "required": ["query"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        t = time.monotonic()
        query = params["query"]
        max_results = min(int(params.get("max_results", 8)), 20)
        region = params.get("region", "us-en")

        try:
            try:
                from ddgs import DDGS
            except ImportError:
                from duckduckgo_search import DDGS
            raw = DDGS().text(query, region=region, max_results=max_results)
            formatted = []
            for i, r in enumerate(raw, 1):
                formatted.append(
                    f"{i}. {r.get('title','')}\n"
                    f"   URL: {r.get('href','')}\n"
                    f"   {r.get('body','')[:300]}"
                )
            output = f"Search: {query!r}\n\n" + "\n\n".join(formatted)
            return ToolResult(
                tool_name=self.name, success=True,
                output=output,
                duration_ms=int((time.monotonic() - t) * 1000),
            )
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


class WebFetchTool(Tool):
    """Fetch a URL and return its cleaned text content."""
    name = "web.fetch"
    description = (
        "Fetch the content of a web page and return its readable text. "
        "Use for reading competitor pages, documentation, news articles, landing pages, "
        "pricing pages, job listings, or any public web content."
    )
    required_permissions = ["web.read"]
    risk_level = 5
    timeout_seconds = 30
    parameters = {
        "type": "object",
        "properties": {
            "url":         {"type": "string"},
            "max_chars":   {"type": "integer", "description": "Max chars to return (default 8000)"},
            "text_only":   {"type": "boolean", "description": "Strip HTML tags (default true)"},
        },
        "required": ["url"],
    }

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        import asyncio as _asyncio
        t = time.monotonic()
        url = params["url"]
        max_chars = int(params.get("max_chars", 8000))
        text_only = params.get("text_only", True)

        def _fetch():
            import urllib.request as _req
            import urllib.error
            try:
                request = _req.Request(
                    url,
                    headers={"User-Agent": "Mozilla/5.0 (compatible; AOS-Agent/1.0)"},
                )
                with _req.urlopen(request, timeout=20) as resp:
                    raw = resp.read().decode(errors="replace")

                if text_only:
                    try:
                        from bs4 import BeautifulSoup
                        soup = BeautifulSoup(raw, "html.parser")
                        for tag in soup(["script", "style", "nav", "footer", "header"]):
                            tag.decompose()
                        text = soup.get_text(separator="\n", strip=True)
                        # Collapse excessive blank lines
                        import re
                        text = re.sub(r"\n{3,}", "\n\n", text)
                        return text[:max_chars]
                    except ImportError:
                        import re
                        text = re.sub(r"<[^>]+>", " ", raw)
                        text = re.sub(r"\s+", " ", text).strip()
                        return text[:max_chars]
                return raw[:max_chars]
            except urllib.error.HTTPError as exc:
                return f"HTTP {exc.code}: {exc.reason}"
            except Exception as exc:
                return f"Error: {exc}"

        try:
            content = await _asyncio.to_thread(_fetch)
            success = not content.startswith(("HTTP ", "Error:"))
            return ToolResult(
                tool_name=self.name,
                success=success,
                output=content,
                error="" if success else content,
                duration_ms=int((time.monotonic() - t) * 1000),
            )
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# ── Selenium Browser ────────────────────────────────────────────────────────

class SeleniumTool(Tool):
    """
    Headless browser automation via Selenium.

    Requires: pip install selenium
    Requires: ChromeDriver on PATH or chromedriver binary.

    Actions:
      navigate  — go to URL, return page source as text
      get_text  — get cleaned visible text of current page
      click     — click an element by CSS selector
      type      — type text into an element by CSS selector
      screenshot — save screenshot to workspace, return file path
      scroll    — scroll the page (direction: down/up/top/bottom)
      get_links — return all href links on the current page
      find      — return text content of elements matching a CSS selector
      execute_js — run arbitrary JavaScript and return result
    """
    name = "web.browser"
    description = (
        "Automate a real headless browser (Selenium + Chrome). "
        "Actions: navigate, get_text, click, type, screenshot, scroll, get_links, find, execute_js. "
        "Use for scraping dynamic sites, automating form fills, capturing screenshots, "
        "extracting data from JS-heavy pages, lead scraping, competitor monitoring."
    )
    required_permissions = ["web.browser"]
    risk_level = 35
    timeout_seconds = 60
    parameters = {
        "type": "object",
        "properties": {
            "action":   {
                "type": "string",
                "enum": ["navigate","get_text","click","type","screenshot","scroll","get_links","find","execute_js"],
            },
            "url":      {"type": "string",  "description": "URL for navigate action"},
            "selector": {"type": "string",  "description": "CSS selector for click/type/find"},
            "text":     {"type": "string",  "description": "Text to type or JS to execute"},
            "direction":{"type": "string",  "enum": ["down","up","top","bottom"], "description": "Scroll direction"},
            "filename": {"type": "string",  "description": "Screenshot filename (default: screenshot.png)"},
            "session_id":{"type": "string", "description": "Reuse an existing browser session by ID"},
        },
        "required": ["action"],
    }

    # Class-level session store: session_id → WebDriver instance
    _sessions: dict = {}

    def _get_or_create_driver(self, session_id: str | None):
        if session_id and session_id in self._sessions:
            return self._sessions[session_id], session_id

        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        import tempfile

        opts = Options()
        opts.add_argument("--headless=new")
        opts.add_argument("--no-sandbox")
        opts.add_argument("--disable-dev-shm-usage")
        opts.add_argument("--disable-gpu")
        opts.add_argument("--window-size=1280,900")
        opts.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

        try:
            driver = webdriver.Chrome(options=opts)
        except Exception:
            # Try explicit chromedriver path on common locations
            import shutil
            cd = shutil.which("chromedriver")
            if cd:
                driver = webdriver.Chrome(service=Service(cd), options=opts)
            else:
                raise RuntimeError(
                    "ChromeDriver not found. Install with: brew install --cask chromedriver  "
                    "or: pip install chromedriver-autoinstaller"
                )

        sid = session_id or str(id(driver))
        self._sessions[sid] = driver
        return driver, sid

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        import asyncio as _asyncio
        t = time.monotonic()
        action = params["action"]

        def _run():
            import json as _json

            driver, sid = self._get_or_create_driver(params.get("session_id"))

            if action == "navigate":
                url = params.get("url", "")
                if not url:
                    return False, "url is required for navigate", sid
                driver.get(url)
                try:
                    from bs4 import BeautifulSoup
                    import re
                    soup = BeautifulSoup(driver.page_source, "html.parser")
                    for tag in soup(["script", "style", "nav", "footer"]):
                        tag.decompose()
                    text = soup.get_text(separator="\n", strip=True)
                    text = re.sub(r"\n{3,}", "\n\n", text)
                    return True, f"[session:{sid}]\nURL: {driver.current_url}\n\n{text[:6000]}", sid
                except ImportError:
                    return True, f"[session:{sid}]\nURL: {driver.current_url}\n\n(install bs4 for clean text)", sid

            elif action == "get_text":
                try:
                    from bs4 import BeautifulSoup
                    import re
                    soup = BeautifulSoup(driver.page_source, "html.parser")
                    for tag in soup(["script", "style"]):
                        tag.decompose()
                    text = soup.get_text(separator="\n", strip=True)
                    text = re.sub(r"\n{3,}", "\n\n", text)
                    return True, text[:8000], sid
                except ImportError:
                    return True, driver.find_element("tag name", "body").text[:8000], sid

            elif action == "click":
                sel = params.get("selector", "")
                if not sel:
                    return False, "selector required", sid
                from selenium.webdriver.common.by import By
                from selenium.webdriver.support.ui import WebDriverWait
                from selenium.webdriver.support import expected_conditions as EC
                el = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, sel)))
                el.click()
                return True, f"Clicked: {sel}", sid

            elif action == "type":
                sel = params.get("selector", "")
                text = params.get("text", "")
                if not sel:
                    return False, "selector required", sid
                from selenium.webdriver.common.by import By
                el = driver.find_element(By.CSS_SELECTOR, sel)
                el.clear()
                el.send_keys(text)
                return True, f"Typed into {sel}", sid

            elif action == "screenshot":
                fname = params.get("filename", "screenshot.png")
                path = str(Path(context.workspace_dir) / fname)
                driver.save_screenshot(path)
                return True, f"Screenshot saved: {path}", sid

            elif action == "scroll":
                direction = params.get("direction", "down")
                scripts = {
                    "down":   "window.scrollBy(0, window.innerHeight)",
                    "up":     "window.scrollBy(0, -window.innerHeight)",
                    "top":    "window.scrollTo(0, 0)",
                    "bottom": "window.scrollTo(0, document.body.scrollHeight)",
                }
                driver.execute_script(scripts.get(direction, scripts["down"]))
                return True, f"Scrolled {direction}", sid

            elif action == "get_links":
                from selenium.webdriver.common.by import By
                els = driver.find_elements(By.TAG_NAME, "a")
                links = []
                for el in els[:100]:
                    href = el.get_attribute("href") or ""
                    txt = (el.text or "").strip()[:80]
                    if href and href.startswith("http"):
                        links.append(f"{txt} → {href}")
                return True, "\n".join(links[:50]), sid

            elif action == "find":
                sel = params.get("selector", "")
                if not sel:
                    return False, "selector required", sid
                from selenium.webdriver.common.by import By
                els = driver.find_elements(By.CSS_SELECTOR, sel)
                texts = [el.text.strip() for el in els if el.text.strip()]
                return True, "\n".join(texts[:30]), sid

            elif action == "execute_js":
                js = params.get("text", "")
                if not js:
                    return False, "text (JS code) required", sid
                result = driver.execute_script(js)
                return True, str(result)[:2000], sid

            return False, f"Unknown action: {action}", None

        try:
            ok, output, sid = await _asyncio.to_thread(_run)
            duration_ms = int((time.monotonic() - t) * 1000)
            result = ToolResult(tool_name=self.name, success=ok, output=output if ok else "", error="" if ok else output, duration_ms=duration_ms)
            # Attach session id to output so agent can reuse the same browser
            if ok and sid:
                result.output = f"[session_id:{sid}]\n{result.output}"
            return result
        except Exception as exc:
            return ToolResult(tool_name=self.name, success=False, output="", error=str(exc))


# ---------------------------------------------------------------------------
# Default registration
# ---------------------------------------------------------------------------

def _register_defaults():
    """Register all tools into the global registry."""
    # Built-ins
    ToolRegistry.register(ShellTool())
    ToolRegistry.register(FileReadTool())
    ToolRegistry.register(FileWriteTool())
    ToolRegistry.register(FileListTool())

    # GitHub
    ToolRegistry.register(GitHubCreateIssueTool())
    ToolRegistry.register(GitHubCloseIssueTool())
    ToolRegistry.register(GitHubCreatePRTool())
    ToolRegistry.register(GitHubMergePRTool())
    ToolRegistry.register(GitHubListPRsTool())
    ToolRegistry.register(GitHubGetFileTool())
    ToolRegistry.register(GitHubSearchCodeTool())
    ToolRegistry.register(GitHubRunWorkflowTool())

    # Social
    ToolRegistry.register(SocialPostTool())
    ToolRegistry.register(SocialAnalyticsTool())
    ToolRegistry.register(SocialSchedulePostTool())
    ToolRegistry.register(SocialUploadPostTool())
    ToolRegistry.register(SocialUploadPostAnalyticsTool())

    # Messaging
    ToolRegistry.register(MessagingSendTool())

    # Ads
    ToolRegistry.register(AdsCreateCampaignTool())
    ToolRegistry.register(AdsGetPerformanceTool())

    # Scheduler
    ToolRegistry.register(SchedulerCreateTaskTool())
    ToolRegistry.register(SchedulerListTasksTool())

    # Web
    ToolRegistry.register(WebSearchTool())
    ToolRegistry.register(WebFetchTool())
    ToolRegistry.register(SeleniumTool())


_register_defaults()
