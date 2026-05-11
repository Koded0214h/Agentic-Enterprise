"""
MCP server configuration integrity pins (SHA-256).

Stores a fingerprint of each server entry (normalized spec, secrets redacted) under
``~/.swarm/mcp-server-digests.json``. First time a server appears, the fingerprint
is recorded (TOFU). If the normalized spec later changes:

- Interactive TTY: prompt before trusting the new definition (default deny).
- Non-interactive: that server is **omitted** from the active MCP set until you
  confirm in TTY or reconcile pins.

Configurable via ``swarm.config.json`` → ``security.mcp.verify_server_digest`` (default on).
Verification is never silently stripped when enabled — only gated by confirmation.
"""

from __future__ import annotations

import copy
import hashlib
import json
import sys
from datetime import datetime, timezone
import os
from pathlib import Path
from typing import Any

SWARM_HOME = Path(os.environ.get("SWARM_HOME", str(Path.home() / ".swarm")))
DIGEST_PATH = SWARM_HOME / "mcp-server-digests.json"


def _iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _redacted_spec(spec: dict[str, Any]) -> dict[str, Any]:
    """Clone spec suitable for hashing: header values omitted, stable structure."""
    c = copy.deepcopy(spec)
    if isinstance(c.get("headers"), dict):
        c["headers"] = {str(k): "" for k in c["headers"].keys()}
    env = c.get("env")
    if isinstance(env, dict):
        c["env"] = {str(k): "" for k in env.keys()}
    return c


def _canonical_bytes(spec: dict[str, Any]) -> bytes:
    red = _redacted_spec(spec)
    keys_keep = ("command", "args", "url", "endpoint", "transport", "headers", "cwd")
    slim: dict[str, Any] = {k: red[k] for k in keys_keep if k in red}
    return json.dumps(slim, sort_keys=True, separators=(",", ":")).encode()


def digest_for_spec(spec: dict[str, Any]) -> str:
    return hashlib.sha256(_canonical_bytes(spec)).hexdigest()


def load_store() -> dict[str, dict[str, Any]]:
    if not DIGEST_PATH.is_file():
        return {}
    try:
        data = json.loads(DIGEST_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}
    servers = data.get("servers") if isinstance(data, dict) else None
    if not isinstance(servers, dict):
        return {}
    return {str(k): v for k, v in servers.items() if isinstance(v, dict)}


def save_store(servers_digest: dict[str, dict[str, Any]]) -> None:
    SWARM_HOME.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": 1,
        "updated_at": _iso_now(),
        "servers": servers_digest,
    }
    DIGEST_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _verification_enabled(sec: dict[str, Any] | None) -> bool:
    if isinstance(sec, dict):
        mcp = sec.get("mcp")
        if isinstance(mcp, dict) and mcp.get("verify_server_digest") is False:
            return False
    return True


def _tty() -> bool:
    try:
        return sys.stdin.isatty() and sys.stdout.isatty()
    except (ValueError, AttributeError):
        return False


def _prompt(server: str, old_hex: str, new_hex: str) -> bool:
    print(
        f"\n⚠  MCP server `{server}` configuration fingerprint changed.",
        file=sys.stderr,
    )
    print(f"    Previous SHA-256: {old_hex[:16]}…", file=sys.stderr)
    print(f"    Current  SHA-256: {new_hex[:16]}…", file=sys.stderr)
    print(
        "    If you changed this intentionally, allow once to update the trust pin.\n",
        file=sys.stderr,
    )
    try:
        reply = input(f"Trust updated MCP definition for `{server}`? [y/N]: ").strip().lower()
    except EOFError:
        return False
    return reply in ("y", "yes")


def reconcile_merged_servers(
    merged_server_specs: dict[str, dict[str, Any]],
    merged_cfg_security: dict[str, Any] | None,
) -> tuple[dict[str, dict[str, Any]], list[str]]:
    """
    Apply digest verification. Returns (servers_to_activate, stderr_messages).
    """
    msgs: list[str] = []

    merged_server_specs = {
        k: v for k, v in merged_server_specs.items() if isinstance(v, dict)
    }

    if not merged_server_specs:
        return {}, msgs

    if not _verification_enabled(merged_cfg_security):
        msgs.append("(MCP digest verification disabled via swarm.config.json)")
        return dict(merged_server_specs), msgs

    pins = load_store()
    updated_pins = dict(pins)
    out: dict[str, dict[str, Any]] = {}

    for name, spec in merged_server_specs.items():
        digest = digest_for_spec(spec)
        prev = pins.get(name)
        prev_hex = prev.get("sha256") if isinstance(prev, dict) else None

        if not prev_hex:
            updated_pins[name] = {"sha256": digest, "updated_at": _iso_now()}
            out[name] = spec
            continue

        if prev_hex == digest:
            out[name] = spec
            continue

        if _tty() and _prompt(name, str(prev_hex), digest):
            updated_pins[name] = {"sha256": digest, "updated_at": _iso_now()}
            out[name] = spec
            msgs.append(f"MCP pin: `{name}` trust updated.")
            continue

        msgs.append(
            f"MCP pin: `{name}` omitted — config changed vs stored SHA-256. "
            "Confirm in an interactive TTY or edit ~/.swarm/mcp-server-digests.json."
        )

    save_store(updated_pins)
    return out, msgs


def format_digest_help_line() -> str:
    """One-line slash-command help sentence."""
    return (
        "Security: MCP servers are pinned (SHA-256) in ~/.swarm/mcp-server-digests.json; "
        "definition changes require TTY confirmation when verification is enabled."
    )