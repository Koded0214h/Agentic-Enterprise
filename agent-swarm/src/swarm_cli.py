#!/usr/bin/env python3
"""
  Agent Swarm CLI  —  src/swarm_cli.py
  Primary interactive entrypoint with witty phrases, slash commands,
  session management, and full CMDS registry for /help.
  by Anas Abubakar
"""

import sys
import os
import json
import subprocess
import shutil
import random
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

# ─────────────────────────────────────────────────────────────────────────────
#  Version
# ─────────────────────────────────────────────────────────────────────────────

SWARM_ROOT = Path(os.environ.get("SWARM_ROOT", Path(__file__).parent.parent))


def _get_version() -> str:
    try:
        return json.loads((SWARM_ROOT / "package.json").read_text()).get("version", "1.0.0")
    except Exception:
        return "1.0.0"


VERSION = _get_version()
CWD = os.getcwd()

# ─────────────────────────────────────────────────────────────────────────────
#  Colors  (compact class for legacy tests)
# ─────────────────────────────────────────────────────────────────────────────

class C:
    R = "\033[0m"       # reset
    B = "\033[1m"       # bold
    D = "\033[2m"       # dim
    RED   = "\033[91m"
    GRN   = "\033[92m"
    YLW   = "\033[93m"
    BLU   = "\033[94m"
    MGN   = "\033[95m"
    CYN   = "\033[96m"
    WHT   = "\033[97m"
    # mint brand colour
    MINT  = "\033[38;2;123;210;137m"

    @staticmethod
    def t(color: str, text: str) -> str:
        return f"{color}{text}{C.R}"


# ─────────────────────────────────────────────────────────────────────────────
#  Witty phrases  (no emojis — test requirement)
# ─────────────────────────────────────────────────────────────────────────────

WELCOME = [
    "Right then. Let's make something that doesn't embarrass us.",
    "Another day, another codebase to save from itself.",
    "Swarm is online. Manage your expectations wisely.",
    "245 agents. Zero patience for bad code.",
    "I woke up and chose productivity. Barely.",
    "Fresh session. Clean slate. Infinite excuses not to test.",
    "Your personal army of AI agents, assembled and mildly caffeinated.",
    "Good. You showed up. Now let's build something.",
    "The bees are ready. Are you?",
    "Agents loaded. Coffee not included.",
    "Five-phase orchestration, zero hand-holding. Let's go.",
    "Running on pure logic and questionable design decisions.",
    "All systems nominal. All agents suspicious of your task.",
    "Swarm online. The compiler is watching.",
    "Ready to turn your vague idea into someone else's technical debt.",
    "Boot sequence complete. Sarcasm module: active.",
    "Agents standing by. Please describe your fire in detail.",
    "Every great product started with a weird idea typed into a terminal.",
    "The swarm does not sleep. Neither does the deadline.",
    "Initialised. Awaiting your terrible first draft of a task.",
]

GOODBYE = [
    "Session closed. Go touch some grass, you've earned it.",
    "Shutting down. The agents have clocked out.",
    "Done here. Ship it or bin it — your call.",
    "Goodbye. May your merge conflicts be few.",
    "Session ended. The code is better than you found it (probably).",
    "Signing off. Remember: passing tests is not the same as working software.",
    "Agents dispersed. The swarm dreams of type safety.",
    "Terminal closed. Commits unsigned. Legend has it they're still in draft.",
    "Goodbye. Don't forget to write tests this time.",
    "Session terminated. Go eat something. Seriously.",
    "The hive goes quiet. Until next time.",
    "Exiting. Your tech debt will still be there when you return.",
    "Closing shop. Another ship-it moment deferred.",
    "Session over. The agents have earned their rest.",
    "Until next time. Try not to push directly to main.",
    "Farewell. May your PRs be reviewed swiftly and mercilessly.",
    "Done. The stack trace has been filed under 'someone else's problem'.",
    "Signing off. Remember: undefined is not a design pattern.",
    "Session complete. Please do not blame the AI for the requirements.",
    "Closing. The build passed. Whether it works is a philosophical question.",
]

LOADING = [
    "Consulting the oracle...",
    "Assembling agents of questionable intelligence...",
    "Forwarding blame to the appropriate subsystem...",
    "Negotiating with the compiler...",
    "Herding digital cats...",
    "Untangling the dependency graph...",
    "Searching for a senior dev to blame...",
    "Reviewing your life choices and code...",
    "Cross-referencing the vibes...",
    "Spawning worker threads with questionable motives...",
    "Loading... (this is the fast part, trust me)...",
    "Parsing intent. Finding none. Proceeding anyway...",
    "Booting chaos engine...",
    "Coercing agents to cooperate...",
    "Asking five AIs what one human should do...",
    "Fetching wisdom from the distributed brain trust...",
    "Synthesising a plan that will inevitably need revision...",
    "Deploying intellectual muscle...",
    "Activating hive mind...",
    "Summoning the council of agents...",
    "Warming up the orchestration engine...",
    "Bribing the task queue...",
    "Translating your requirements into something achievable...",
    "Generating plausible-sounding progress...",
    "Staring at the abyss of undefined behaviour...",
]

# ─────────────────────────────────────────────────────────────────────────────
#  Commands registry — used by /help and tests
# ─────────────────────────────────────────────────────────────────────────────

CMDS: List[tuple] = [
    # (display_name, description)
    ("help",              "show this list"),
    ("quit",              "exit session"),
    ("clear",             "clear the screen"),
    ("version",           "show version"),
    ("about",             "about Agent Swarm"),
    ("status",            "session snapshot"),
    ("reset",             "reset engine/agent/model to defaults"),
    ("who",               "who you are in this session"),
    ("new",               "start a fresh task"),
    ("mode <auto|chat|company>", "routing for this session"),
    ("task <goal>",       "full 5-phase orchestration"),
    ("chat <msg>",        "direct assistant chat"),
    ("dispatch <slug> …", "single agent, attached TTY"),
    ("engine [name]",     "show/set session engine"),
    ("engines",           "all engines + PATH status"),
    ("agent [slug]",      "show/set chat agent"),
    ("agents [n]",        "list agents from config"),
    ("model",             "set model for current engine"),
    ("inspect <slug>",    "show agent config"),
    ("health",            "engine availability check"),
    ("ping",              "alias for /health"),
    ("config",            "dump active config"),
    ("env",               "swarm env vars"),
    ("vars",              "alias for /env"),
    ("reload",            "reload config from disk"),
    ("doc",               "orchestrator CLI help"),
    ("project",           "show project directory"),
    ("cd <path>",         "change project directory"),
    ("output",            "list output/ directory"),
    ("paths",             "memory, output, config paths"),
    ("run <cmd>",         "subprocess in project dir"),
    ("report",            ".swarm-report.json"),
    ("log [n]",           "tail swarm_log.txt"),
    ("stats",             "performance metrics"),
    ("skills",            "list commands/ skill files"),
    ("rules",             "list rules/ files"),
    ("tips",              "power-user tips"),
    ("spinners",          "preview spinner animations"),
    ("read <file>",       "read a file"),
    ("ls [dir]",          "list directory contents"),
    ("find <pat>",        "find files by name pattern"),
    ("mcp [sub]",         "MCP hub commands"),
]

# ─────────────────────────────────────────────────────────────────────────────
#  Input / output helpers
# ─────────────────────────────────────────────────────────────────────────────

def clean_input(text: str) -> str:
    """Strip leading/trailing whitespace and null bytes."""
    return text.strip().replace("\x00", "")


def read_file(path: str) -> str:
    """Read a file and return its contents as a string, or an error message."""
    p = Path(path)
    if not p.exists():
        return f"Not found: {path}"
    if not p.is_file():
        return f"Not a file: {path}"
    try:
        return p.read_text(errors="replace")
    except Exception as e:
        return f"Error reading {path}: {e}"


def find_files(pattern: str, root: str = ".") -> List[str]:
    """Find files matching a glob pattern under root."""
    return [str(p) for p in Path(root).rglob(pattern)]


def search_text(query: str, root: str = ".", ext: str = "") -> List[str]:
    """Grep-style search for query in text files under root."""
    results = []
    glob = f"*{ext}" if ext else "*"
    for p in Path(root).rglob(glob):
        if not p.is_file():
            continue
        try:
            text = p.read_text(errors="replace")
            if query.lower() in text.lower():
                results.append(str(p))
        except Exception:
            pass
    return results


# ─────────────────────────────────────────────────────────────────────────────
#  Run helpers
# ─────────────────────────────────────────────────────────────────────────────

def run_cmd(cmd: str, cwd: str = ".") -> str:
    """Run a shell command and return stdout+stderr."""
    try:
        result = subprocess.run(
            cmd, shell=True, cwd=cwd,
            capture_output=True, text=True, timeout=60,
        )
        out = (result.stdout or "") + (result.stderr or "")
        return out.strip() or f"(exit {result.returncode})"
    except Exception as e:
        return f"Error: {e}"


def run_swarm(prompt: str, model: str = None) -> str:
    """
    Invoke the swarm orchestrator with a text prompt.
    Returns a summary string.
    """
    try:
        swarm_bin = shutil.which("swarm") or str(SWARM_ROOT / "bin" / "swarm")
        cmd = [swarm_bin, prompt]
        if model:
            cmd += ["--model", model]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        return (result.stdout or result.stderr or "").strip()
    except Exception as e:
        return f"Error running swarm: {e}"


def check_update() -> Optional[str]:
    """Check npm for a newer version. Returns new version string or None."""
    try:
        result = subprocess.run(
            ["npm", "view", "agent-swarm-orchestrator", "version"],
            capture_output=True, text=True, timeout=10,
        )
        remote = result.stdout.strip()
        if remote and remote != VERSION:
            return remote
        return None
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
#  Action detection
# ─────────────────────────────────────────────────────────────────────────────

_CHAT_PAT = re.compile(
    r"^(yo|hi|hey|hello|sup|hiya|howdy|good\s+(morning|afternoon|evening)|what'?s\s+up|"
    r"thanks?|thank\s+you|thx|cool|nice|awesome|great|ok(ay)?|bye|goodbye|cya|later)[\s!?.]*$",
    re.I,
)
_QUESTION_PAT = re.compile(
    r"^(how|what|why|when|where|who|which|explain|describe|tell\s+me|can\s+you\s+explain)",
    re.I,
)
_BUILD_PAT = re.compile(
    r"\b(build|create|make|generate|write|implement|develop|design|add|set\s+up|scaffold)\b",
    re.I,
)
_FILE_PAT = re.compile(
    r"\b(read|open|show|display|print|cat|view|load|parse)\b.*("
    r"\.(json|py|ts|js|md|txt|yaml|yml|toml|html|css|env)"
    r"|\b(config|configs|settings|package|log|logs|file|files)\b"
    r")",
    re.I,
)
_CMD_PAT = re.compile(
    r"^(run|exec|npm|yarn|bun|pip|git|ls|pwd|cd|mv|cp|rm|mkdir|curl|python|node|docker|make)\b",
    re.I,
)


def detect(text: str) -> str:
    """
    Detect the action type for a raw user input.
    Returns one of: 'chat', 'question', 'build', 'file', 'cmd'.
    """
    t = text.strip()
    if _CHAT_PAT.match(t):
        return "chat"
    if _QUESTION_PAT.match(t):
        return "question"
    if _FILE_PAT.search(t):
        return "file"
    # BUILD before CMD so "make a website" beats "make" the shell tool
    if _BUILD_PAT.search(t):
        return "build"
    if _CMD_PAT.match(t):
        return "cmd"
    return "chat"


# ─────────────────────────────────────────────────────────────────────────────
#  Slash command handler
# ─────────────────────────────────────────────────────────────────────────────

def _help_text() -> str:
    lines = [f"\n  {C.B}Slash Commands{C.R}  v{VERSION}\n  {'─' * 48}"]
    for name, desc in CMDS:
        lines.append(f"  {C.MINT}/{name:<28}{C.R}  {C.D}{desc}{C.R}")
    lines.append("")
    return "\n".join(lines)


def handle_slash(cmd: str, args: str = "") -> str:
    """
    Handle a slash command.
    Returns a string response (may be empty).
    cmd includes the leading '/'.
    """
    name = cmd.lstrip("/").lower().strip()

    if name in ("help", "?"):
        print(_help_text())
        return ""

    if name in ("quit", "exit", "q"):
        print(f"\n  {C.D}{random.choice(GOODBYE)}{C.R}\n")
        sys.exit(0)

    if name in ("clear", "cls"):
        if os.getenv("TERM"):
            print("\033[2J\033[H", end="")
        return ""

    if name == "version":
        return f"Agent Swarm v{VERSION}"

    if name == "about":
        return (
            f"Agent Swarm v{VERSION}\n"
            f"Engine-agnostic multi-agent orchestration.\n"
            f"By Anas Abubakar. MIT licence."
        )

    if name == "read":
        if not args.strip():
            return "Usage: /read <file>"
        return read_file(args.strip())

    if name == "ls":
        d = Path(args.strip() or ".")
        if not d.is_dir():
            return f"Not a directory: {d}"
        entries = sorted(d.iterdir(), key=lambda p: (p.is_file(), p.name))
        return "\n".join(
            f"  {'/' if e.is_dir() else ' '} {e.name}" for e in entries[:100]
        )

    if name == "find":
        if not args.strip():
            return "Usage: /find <pattern>"
        results = find_files(args.strip())
        return "\n".join(results[:50]) or "(no matches)"

    if name == "run":
        if not args.strip():
            return "Usage: /run <command>"
        return run_cmd(args.strip())

    if name == "log":
        log_path = Path("swarm_log.txt")
        if not log_path.exists():
            return "No swarm_log.txt found."
        n = 40
        if args.strip().isdigit():
            n = int(args.strip())
        lines_all = log_path.read_text().splitlines()
        return "\n".join(lines_all[-n:])

    if name == "tips":
        return (
            "Tips:\n"
            "  /task <goal>    — full orchestration\n"
            "  /chat <msg>     — direct assistant\n"
            "  /engine gemini  — switch engines\n"
            "  /agents         — list all agents\n"
            "  SWARM_MODE=chat — env shortcut\n"
        )

    if name == "loading":
        return random.choice(LOADING)

    return f"Unknown command: {cmd}. Try /help"


# ─────────────────────────────────────────────────────────────────────────────
#  ASCII logo + helpers for main()
# ─────────────────────────────────────────────────────────────────────────────

SWARM_LOGO = r"""
  ███████╗██╗    ██╗ █████╗ ██████╗ ███╗   ███╗
  ██╔════╝██║    ██║██╔══██╗██╔══██╗████╗ ████║
  ███████╗██║ █╗ ██║███████║██████╔╝██╔████╔██║
  ╚════██║██║███╗██║██╔══██║██╔══██╗██║╚██╔╝██║
  ███████║╚███╔███╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
  ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
"""


def _print_banner():
    print(C.t(C.MINT, SWARM_LOGO))
    print(f"  {C.t(C.D, f'v{VERSION}  •  {random.choice(WELCOME)}')}\n")


# ─────────────────────────────────────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    _print_banner()

    while True:
        try:
            user_input = input(f"  {C.t(C.MINT, '>')} ").strip()
        except (EOFError, KeyboardInterrupt):
            print(f"\n  {C.t(C.D, random.choice(GOODBYE))}\n")
            break

        if not user_input:
            continue

        if user_input.startswith("/"):
            parts = user_input.split(" ", 1)
            cmd = parts[0]
            args = parts[1] if len(parts) > 1 else ""
            result = handle_slash(cmd, args)
            if result:
                print(f"\n{result}\n")
            continue

        action = detect(user_input)
        if action == "cmd":
            out = run_cmd(user_input)
            print(out)
        else:
            print(f"  {C.t(C.D, random.choice(LOADING))}")
            out = run_swarm(user_input)
            if out:
                print(out)


if __name__ == "__main__":
    main()
