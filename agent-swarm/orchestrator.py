#!/usr/bin/env python3
"""
Agent Swarm Orchestrator — cross-version launcher.

Loads the pre-compiled Python 3.13 bytecode when running under Python 3.13.
For any other Python 3.x, compiles and runs the bundled snapshot source so
users on Python 3.12 (the most common version) are not left with a segfault.

When no goal is given on the CLI, both paths show an interactive TUI prompt.
"""
from __future__ import annotations

import importlib.util
import marshal
import sys
from pathlib import Path

_pkg = Path(__file__).resolve().parent
if str(_pkg) not in sys.path:
    sys.path.insert(0, str(_pkg))

_PYC_CANDIDATES = (
    _pkg / "recovery" / "orchestrator.cpython-313.pyc",
    _pkg / "__pycache__" / "orchestrator.cpython-313.pyc",
)

_SNAPSHOT = _pkg / "recovery" / "orchestrator.github_560.snapshot.py"

# Flags that consume the next token (so we can detect positional goal args)
_VALUE_FLAGS = {"--engine", "-e", "--agent", "-a", "--command",
                "--system-flag", "--auto-flag", "--project"}


def _pyc_magic_ok(pyc: Path) -> bool:
    """Return True only when the .pyc was compiled for the running Python."""
    try:
        with pyc.open("rb") as f:
            return f.read(4) == importlib.util.MAGIC_NUMBER
    except OSError:
        return False


def _has_goal_in_argv() -> bool:
    """Return True if a positional goal arg (non-flag) is already in sys.argv."""
    skip = False
    for tok in sys.argv[1:]:
        if skip:
            skip = False
            continue
        if tok in _VALUE_FLAGS:
            skip = True
        elif tok in ("--list-engines", "--list-agents", "-h", "--help",
                     "--interactive", "-i"):
            return True  # these flags mean "don't prompt", let main() handle
        elif not tok.startswith("-"):
            return True  # found a positional goal
    return False


def _exec_pyc(pyc: Path) -> None:
    with pyc.open("rb") as f:
        f.read(16)  # skip header
        code = marshal.load(f)
    tgt = sys.modules["__main__"].__dict__
    tgt.setdefault("__file__", str(_pkg / "orchestrator.py"))
    tgt.setdefault("__package__", None)
    tgt["__cached__"] = str(pyc)
    exec(code, tgt)  # noqa: S102


def _exec_snapshot() -> None:
    src = _SNAPSHOT.read_text(encoding="utf-8")
    code = compile(src, str(_SNAPSHOT), "exec")
    globs: dict = {
        "__file__": str(_pkg / "orchestrator.py"),
        "__name__": "__main__",
        "__package__": None,
        "__spec__": None,
    }
    exec(code, globs)  # noqa: S102


def _pick_runner():
    """Return (runner_fn, needs_interactive_wrap) tuple."""
    for pyc in _PYC_CANDIDATES:
        if pyc.is_file() and _pyc_magic_ok(pyc):
            return _exec_pyc, pyc, True   # .pyc: its main() may have old print_help
    if not _SNAPSHOT.is_file():
        sys.stderr.write(
            "\nSwarm cannot start: no compatible orchestrator found.\n"
            f"  Bytecode requires Python 3.13 (you have {sys.version.split()[0]})\n"
            f"  Snapshot fallback not found: {_SNAPSHOT}\n"
            "Try upgrading to Python 3.13 or reinstalling the package.\n\n"
        )
        sys.exit(1)
    return _exec_snapshot, None, False  # snapshot: its main() handles interactive


def _run() -> None:
    exec_fn, pyc_arg, needs_wrap = _pick_runner()

    # The snapshot's main() already has a full interactive loop.
    # For the .pyc path the original main() may just print_help on no-args,
    # so we wrap it here: show the banner, prompt for a goal, inject into
    # sys.argv, exec (which calls main() with the goal), then ask for another.
    if needs_wrap and not _has_goal_in_argv():
        try:
            from core.tui import TUI, Colors as C  # noqa: PLC0415
        except ImportError:
            exec_fn(pyc_arg)
            return

        TUI.banner()
        print(f"  {C.DIM}Type your goal, or /help for commands. Empty input or Ctrl+C to exit.{C.RESET}\n")

        # Session state shared with slash-command handlers
        _session_engine      = {"name": "openai"}
        _session_agent       = {"name": "swarm-assistant"}
        _session_model       = {"name": None}
        _project_path_holder = {"path": str(_pkg)}

        try:
            from core.slash_commands import handle_slash_line  # noqa: PLC0415
            _slash_available = True
        except ImportError:
            _slash_available = False

        def _handle_slash(raw: str):
            if not _slash_available:
                print(f"  {C.DIM}(slash commands unavailable — core.slash_commands not found){C.RESET}")
                class _FakeOutcome:
                    stop = False
                return _FakeOutcome()
            return handle_slash_line(
                raw,
                session_engine=_session_engine,
                session_agent=_session_agent,
                session_model=_session_model,
                project_path_holder=_project_path_holder,
                on_reload_config=lambda: None,
                on_set_agent=lambda slug: None,
                on_set_paths=lambda: None,
                on_run_company=lambda goal: (
                    sys.argv.append(goal),
                    exec_fn(pyc_arg),
                    (sys.argv.pop() if sys.argv and sys.argv[-1] == goal else None),
                ),
            )

        while True:
            try:
                goal = TUI.prompt("What should the swarm build for you?")
            except (KeyboardInterrupt, EOFError):
                goal = ""
            if not goal:
                TUI.goodbye()
                sys.exit(0)

            goal = goal.strip()
            if not goal:
                continue

            # Intercept slash commands — never pass them to exec_fn
            if goal.startswith("/"):
                outcome = _handle_slash(goal)
                if getattr(outcome, "stop", False):
                    TUI.goodbye()
                    sys.exit(0)
                print()
                continue

            sys.argv.append(goal)
            try:
                exec_fn(pyc_arg)
            finally:
                if sys.argv and sys.argv[-1] == goal:
                    sys.argv.pop()

            print()
        sys.exit(0)

    # Normal path: goal already in argv (or snapshot handles its own TUI loop)
    if pyc_arg is not None:
        exec_fn(pyc_arg)
    else:
        exec_fn()


_run()
