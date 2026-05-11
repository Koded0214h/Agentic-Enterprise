"""
Base classes for all enterprise tool implementations.

Every tool:
  - Reads credentials from environment variables (never hardcoded)
  - Returns a consistent ToolResult dict
  - Raises ToolConfigError if required env vars are missing
  - Never crashes the swarm — errors are returned as failed results
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any


class ToolConfigError(Exception):
    """Raised when a required environment variable / config is absent."""


@dataclass
class ToolResult:
    ok: bool
    data: Any = None
    error: str = ""

    def __bool__(self) -> bool:
        return self.ok

    def to_dict(self) -> dict:
        return {"ok": self.ok, "data": self.data, "error": self.error}


def require_env(*names: str) -> dict[str, str]:
    """Return a dict of env-var values; raise ToolConfigError if any are missing."""
    missing = [n for n in names if not os.environ.get(n)]
    if missing:
        raise ToolConfigError(
            f"Missing required environment variable(s): {', '.join(missing)}"
        )
    return {n: os.environ[n] for n in names}
