"""
Ensure bundled Python dependencies from ``requirements-swarm.txt`` are importable.

Runs ``python -m pip install -r …`` once when critical imports fail (first launch or
fresh venv). Idempotent: no-op when ``prompt_toolkit`` and ``mcp`` already load.

Set ``SWARM_SKIP_PYTHON_DEPS=1`` to disable (advanced).
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def _package_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _requirements_path(root: Path) -> Path:
    return root / "requirements-swarm.txt"


def _deps_satisfied() -> bool:
    try:
        import mcp  # noqa: F401
        import prompt_toolkit  # noqa: F401
        return True
    except ImportError:
        return False


def ensure_swarm_python_deps(*, package_root: Path | None = None, quiet: bool = False) -> bool:
    """
    Install from ``requirements-swarm.txt`` if needed. Returns True if imports work after.
    """
    if os.environ.get("SWARM_SKIP_PYTHON_DEPS", "").strip().lower() in {"1", "true", "yes"}:
        return _deps_satisfied()

    if _deps_satisfied():
        return True

    root = package_root or _package_root()
    req = _requirements_path(root)
    if not req.is_file():
        if not quiet:
            print(
                f"  ⚠️  Swarm: missing {req.name} — cannot auto-install Python deps.",
                file=sys.stderr,
            )
        return False

    if not quiet:
        print(
            "  ℹ️  Swarm: installing bundled Python dependencies (first run, or new environment)…",
            file=sys.stderr,
            flush=True,
        )

    cmd = [
        sys.executable,
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
        "-r",
        str(req),
    ]
    try:
        r = subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL if quiet else None,
            stderr=subprocess.DEVNULL if quiet else None,
            check=False,
        )
    except OSError as e:
        if not quiet:
            print(f"  ⚠️  Swarm: pip failed to start: {e}", file=sys.stderr)
        return _deps_satisfied()

    if r.returncode != 0 and not quiet:
        print(
            "  ⚠️  Swarm: pip install returned non-zero — TUI/MCP may be limited. "
            "Try: python3 -m pip install -r requirements-swarm.txt",
            file=sys.stderr,
        )

    return _deps_satisfied()
