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
# MCP-backed tool proxy
# ---------------------------------------------------------------------------

class MCPTool(Tool):
    """
    Proxy tool that calls a running MCP server via subprocess stdio.
    Used to wrap existing MCP server tools without rewriting them.
    """

    def __init__(
        self,
        name: str,
        description: str,
        mcp_tool_name: str,
        server_script: str,
        parameters: dict,
        required_permissions: list[str] | None = None,
        risk_level: int = 20,
        is_destructive: bool = False,
    ):
        self.name = name
        self.description = description
        self.mcp_tool_name = mcp_tool_name
        self.server_script = server_script
        self.parameters = parameters
        self.required_permissions = required_permissions or []
        self.risk_level = risk_level
        self.is_destructive = is_destructive

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        self.check_permissions(context)
        start = time.monotonic()
        try:
            import json
            payload = json.dumps({"tool": self.mcp_tool_name, "params": params})
            proc = subprocess.run(
                ["python3", self.server_script, "--call", payload],
                capture_output=True, text=True, timeout=self.timeout_seconds,
            )
            duration_ms = int((time.monotonic() - start) * 1000)
            if proc.returncode != 0:
                return ToolResult(tool_name=self.name, success=False, output="", error=proc.stderr[:500], duration_ms=duration_ms)
            return ToolResult(tool_name=self.name, success=True, output=proc.stdout, duration_ms=duration_ms)
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


def _mcp_server_path(filename: str) -> str:
    root = Path(__file__).parent.parent
    return str(root / "mcp_servers" / filename)


def _register_defaults():
    """Register built-in and MCP-backed tools into the global registry."""
    ToolRegistry.register(ShellTool())
    ToolRegistry.register(FileReadTool())
    ToolRegistry.register(FileWriteTool())
    ToolRegistry.register(FileListTool())

    # GitHub namespace — wraps mcp_servers/github_server.py tools
    github_tools = [
        ("github.create_issue",  "github_create_issue",  "Create a GitHub issue",             ["github.write"], 30, False),
        ("github.close_issue",   "github_close_issue",   "Close a GitHub issue",               ["github.write"], 30, True),
        ("github.create_pr",     "github_create_pr",     "Create a GitHub pull request",       ["github.write"], 50, False),
        ("github.merge_pr",      "github_merge_pr",      "Merge a GitHub pull request",        ["github.write"], 70, True),
        ("github.list_prs",      "github_list_prs",      "List open pull requests",            ["github.read"],  5,  False),
        ("github.get_file",      "github_get_file",      "Read a file from a GitHub repo",     ["github.read"],  5,  False),
        ("github.search_code",   "github_search_code",   "Search code in a GitHub repository", ["github.read"],  5,  False),
        ("github.create_branch", "github_create_branch", "Create a new git branch",            ["github.write"], 40, False),
        ("github.run_workflow",  "github_run_workflow",  "Trigger a GitHub Actions workflow",  ["github.write"], 60, False),
    ]
    for name, mcp_name, desc, perms, risk, destructive in github_tools:
        ToolRegistry.register(MCPTool(
            name=name, description=desc, mcp_tool_name=mcp_name,
            server_script=_mcp_server_path("github_server.py"),
            parameters={"type": "object", "properties": {}, "additionalProperties": True},
            required_permissions=perms, risk_level=risk, is_destructive=destructive,
        ))

    # Social namespace
    social_tools = [
        ("social.post",          "social_post",          "Post to a social media platform",   ["social.write"], 40, False),
        ("social.schedule_post", "social_schedule_post", "Schedule a social media post",      ["social.write"], 30, False),
        ("social.get_analytics", "social_analytics",     "Get social media analytics",        ["social.read"],  5,  False),
    ]
    for name, mcp_name, desc, perms, risk, destructive in social_tools:
        ToolRegistry.register(MCPTool(
            name=name, description=desc, mcp_tool_name=mcp_name,
            server_script=_mcp_server_path("social_server.py"),
            parameters={"type": "object", "properties": {}, "additionalProperties": True},
            required_permissions=perms, risk_level=risk, is_destructive=destructive,
        ))

    # Messaging namespace
    ToolRegistry.register(MCPTool(
        name="messaging.send",
        description="Send a message via a messaging platform (Slack, Teams, etc.)",
        mcp_tool_name="messaging_send",
        server_script=_mcp_server_path("messaging_server.py"),
        parameters={"type": "object", "properties": {}, "additionalProperties": True},
        required_permissions=["messaging.write"], risk_level=30, is_destructive=False,
    ))

    # Scheduler namespace
    ToolRegistry.register(MCPTool(
        name="scheduler.create_task",
        description="Create a scheduled task or reminder",
        mcp_tool_name="scheduler_create_task",
        server_script=_mcp_server_path("scheduler_server.py"),
        parameters={"type": "object", "properties": {}, "additionalProperties": True},
        required_permissions=["scheduler.write"], risk_level=20, is_destructive=False,
    ))

    # Ads namespace
    ToolRegistry.register(MCPTool(
        name="ads.create_campaign",
        description="Create an advertising campaign",
        mcp_tool_name="ads_create_campaign",
        server_script=_mcp_server_path("ads_server.py"),
        parameters={"type": "object", "properties": {}, "additionalProperties": True},
        required_permissions=["ads.write"], risk_level=50, is_destructive=False,
    ))


_register_defaults()
