"""
Prompt I/O — TUI-ready line/block readers.

Uses ``prompt_toolkit`` when installed (paste chips, arrows, Enter vs newline).
Falls back to ``input()`` on minimal installs or non-TTY stdin.
"""

from __future__ import annotations

import sys

from core.prompt_line import read_prompt_line

_C = {
    "cyan": "\033[38;2;123;210;137m",  # Swarm primary (NWO mint)
    "dim": "\033[2m",
    "rst": "\033[0m",
}


def is_interactive_terminal() -> bool:
    return bool(getattr(sys.stdin, "isatty", lambda: False)() and getattr(sys.stdout, "isatty", lambda: False)())


def read_framed_line(
    title: str = "",
    placeholder: str = "",
    hint: str = "",
    default: str = "",
) -> str:
    """Single-line-ish message editor (TTY: prompt_toolkit + paste chips when available)."""
    if not is_interactive_terminal():
        line = sys.stdin.readline()
        got = (line or "").strip()
        return got if got else default.strip()

    parts: list[str] = []
    if title.strip():
        parts.append(f"{_C['dim']}{title.strip()}{_C['rst']}")
    if hint.strip():
        parts.append(f"{_C['dim']}{hint.strip()}{_C['rst']}")
    if placeholder.strip():
        parts.append(f"{_C['dim']}{placeholder.strip()}{_C['rst']}")
    header = ("\n".join(parts) + "\n") if parts else ""
    show_keys = not (title.strip() or hint.strip())
    raw = read_prompt_line(header.rstrip("\n"), show_hint=show_keys)
    got = (raw or "").strip()
    if not got and default:
        return default.strip()
    return got


def read_framed_block(
    title: str,
    body: str,
    placeholder: str = "",
) -> str:
    """Notice + framed editor (same TUI behavior as ``read_framed_line``)."""
    if not is_interactive_terminal():
        line = sys.stdin.readline()
        return (line or "").strip()
    chunks: list[str] = []
    if title.strip():
        chunks.append(f"{_C['dim']}{title.strip()}{_C['rst']}\n")
    if body.strip():
        chunks.append(body.rstrip())
    if placeholder.strip():
        chunks.append(f"\n{_C['dim']}{placeholder.strip()}{_C['rst']}")
    chunks.append("")  # blank before prompt hint
    return read_prompt_line("\n".join(chunks).strip("\n"), show_hint=False).strip()

