"""
Slash commands for the interactive Swarm REPL.

Every command callable from the interactive prompt lives here.
Add new ones at the bottom of handle_slash_line() — the dispatch table
at the top of _help_text() documents them all.

SLASH_COMMANDS is the single source of truth consumed by the completer in
core/prompt_line.py for the interactive / picker.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from engines.adapter import detect_all_available, get_engine, list_engines

# ─────────────────────────────────────────────────────────────────────────────
#  Model catalogues — shown by /model picker when no arg is given
# ─────────────────────────────────────────────────────────────────────────────
_MODELS_BY_ENGINE: dict[str, list] = {
    "claude": [
        ("claude-opus-4-7",           "Opus 4.7 — most powerful"),
        ("claude-sonnet-4-6",         "Sonnet 4.6 — balanced (current default)"),
        ("claude-haiku-4-5-20251001", "Haiku 4.5 — fastest / lowest cost"),
        ("claude-opus-4",             "Opus 4"),
        ("claude-sonnet-4",           "Sonnet 4"),
    ],
    "gemini": [
        ("gemini-2.5-pro",            "Gemini 2.5 Pro — most capable"),
        ("gemini-2.5-flash",          "Gemini 2.5 Flash — fast + affordable"),
        ("gemini-2.0-flash",          "Gemini 2.0 Flash"),
        ("gemini-1.5-pro",            "Gemini 1.5 Pro — long context"),
        ("gemini-1.5-flash",          "Gemini 1.5 Flash"),
    ],
    "codex": [
        ("o3",                        "o3 — top reasoning"),
        ("o4-mini",                   "o4-mini — fast reasoning"),
        ("gpt-4.1",                   "GPT-4.1 — latest GPT-4 series"),
        ("gpt-4o",                    "GPT-4o — multimodal"),
        ("gpt-4o-mini",               "GPT-4o mini — fast"),
    ],
    "kilocode": [
        ("claude-sonnet-4-6",         "Claude Sonnet via Kilo"),
        ("claude-opus-4-7",           "Claude Opus via Kilo"),
        ("gemini-2.5-pro",            "Gemini 2.5 Pro via Kilo"),
        ("gpt-4o",                    "GPT-4o via Kilo"),
    ],
    "cursor": [
        ("claude-sonnet-4-6",         "Claude Sonnet"),
        ("claude-opus-4-7",           "Claude Opus"),
        ("gpt-4o",                    "GPT-4o"),
    ],
    "aider": [
        ("claude-sonnet-4-6",         "Claude Sonnet"),
        ("gpt-4o",                    "GPT-4o"),
        ("deepseek/deepseek-coder",   "DeepSeek Coder"),
    ],
}

# ─────────────────────────────────────────────────────────────────────────────
#  SLASH_COMMANDS — consumed by the prompt_toolkit completer (/ picker)
#  Format: "cmd_name": "short description shown in the dropdown"
# ─────────────────────────────────────────────────────────────────────────────
SLASH_COMMANDS: dict[str, str] = {
    # Session
    "help":       "show all commands",
    "exit":       "leave session",
    "quit":       "leave session",
    "clear":      "clear the screen",
    "version":    "show swarm + TUI version",
    "about":      "about Agent Swarm",
    "who":        "who you are in this session",
    "status":     "session snapshot (engine · agent · model · mode)",
    "reset":      "reset engine / agent / model to defaults",
    "new":        "clear screen and start a fresh task",
    # Routing
    "mode":       "set routing: auto | chat | company",
    "task":       "full 5-phase orchestration",
    "company":    "alias for /task",
    "chat":       "direct assistant chat",
    "msg":        "alias for /chat",
    "dispatch":   "single agent, attached TTY",
    # Navigation
    "project":    "show project directory",
    "cd":         "change project directory",
    "output":     "list output/ directory",
    "paths":      "memory, output, config paths",
    # Engines & agents
    "engine":     "show / set session engine",
    "engines":    "all engines + PATH availability",
    "agent":      "show / set chat agent",
    "agents":     "list agents from config",
    "model":      "set model for current engine",
    "inspect":    "show agent config detail",
    "health":     "check engine availability",
    "ping":       "alias for /health",
    # Config & env
    "config":     "dump the active swarm config",
    "env":        "swarm-relevant environment variables",
    "vars":       "alias for /env",
    "reload":     "reload config from disk",
    "doc":        "orchestrator CLI help blob",
    # Skills & rules
    "skills":     "list skill files in commands/",
    "rules":      "list rule files in rules/",
    # Files & processes
    "run":        "subprocess in project dir (no shell)",
    "report":     "show .swarm-report.json",
    "log":        "tail swarm_log.txt",
    "stats":      "performance metrics",
    # MCP
    "mcp":        "MCP hub  (refresh | tools | call …)",
    # Misc
    "tips":       "power-user tips and tricks",
    "spinners":   "preview all spinner animation styles",
}


@dataclass
class SlashOutcome:
    stop: bool = False      # exit session
    consumed: bool = False  # True: skip normal chat/company routing


def _parse(slash_line: str) -> tuple[str, str]:
    s = slash_line.strip()
    tail = s[1:].lstrip()
    if not tail:
        return "", ""
    m = re.match(r"^([^\s]+)\s*(.*)$", tail, re.DOTALL)
    if not m:
        return "", ""
    return m.group(1).lower(), m.group(2).strip()


def _help_text() -> str:
    sections = [
        ("Session", [
            ("/exit  /quit  /q       ", "leave session"),
            ("/clear  /cls           ", "clear the screen"),
            ("/version               ", "show swarm + TUI version"),
            ("/about                 ", "about this project"),
            ("/who                   ", "show who you are in this session"),
            ("/status                ", "current session snapshot (engine · agent · model · mode)"),
            ("/reset                 ", "reset engine / agent / model to defaults"),
        ]),
        ("Navigation", [
            ("/project               ", "show project directory"),
            ("/cd <path>             ", "change project directory"),
            ("/output                ", "list output/ directory"),
            ("/paths                 ", "swarm memory dir, output, configs"),
        ]),
        ("Routing & Mode", [
            ("/mode auto|chat|company", "routing for this session only"),
            ("/task …  /company …    ", "force full swarm orchestration"),
            ("/chat …  /msg …        ", "force assistant chat (TTY attached)"),
            ("/dispatch <slug> …     ", "single agent, attached TTY"),
            ("/new                   ", "clear screen and prompt for a fresh task"),
        ]),
        ("Engines & Agents", [
            ("/engine [name|clear]   ", "show/set session engine"),
            ("/engines               ", "registry + PATH availability"),
            ("/agent [slug|clear]    ", "agent for interactive chat"),
            ("/agents [n]            ", "list first n agents (default 40)"),
            ("/model [id|clear]      ", "model flag for current engine"),
            ("/inspect <slug>        ", "show agent config detail"),
            ("/health                ", "check which engines are reachable on PATH"),
            ("/ping                  ", "same as /health — alias"),
        ]),
        ("Config & Environment", [
            ("/config                ", "dump the active swarm config (pretty)"),
            ("/env  /vars            ", "show swarm-relevant environment variables"),
            ("/reload                ", "reload config from disk"),
            ("/doc                   ", "orchestrator CLI help blob"),
        ]),
        ("Skills & Rules", [
            ("/skills                ", "list .md command files in commands/"),
            ("/rules                 ", "list rule files in rules/"),
        ]),
        ("Files & Processes", [
            ("/run <exe> [args …]   ", "subprocess in project dir (no shell)"),
            ("/report                ", "show .swarm-report.json"),
            ("/log [n]               ", "tail swarm_log.txt (default 40 lines)"),
            ("/stats                 ", "performance metrics from memory/metrics.json"),
        ]),
        ("MCP", [
            ("/mcp [refresh|tools|call …]", "company MCP hub"),
        ]),
        ("Misc", [
            ("/tips                  ", "usage tips and power-user tricks"),
            ("/spinners              ", "preview all spinner animation styles"),
            ("/help  /?              ", "this list"),
        ]),
    ]

    lines = ["\n  Slash commands\n  " + "─" * 54]
    for section, cmds in sections:
        lines.append(f"\n  {section}")
        for cmd, desc in cmds:
            lines.append(f"    {cmd}  {desc}")
    lines.append(
        "\n  Files in prompts: Boss uses [[swarm-file:path]] or INCLUDE_FILE: path"
        "\n  TUI input: Enter=send  Ctrl+J=newline  big paste→chip  arrows=history\n"
    )
    return "\n".join(lines)


def _tips_text() -> str:
    return textwrap.dedent("""
      Power-user tips
      ─────────────────────────────────────────────────────

      Routing shortcuts
        /task <goal>         — full 5-phase orchestration
        /chat <message>      — bypass swarm, talk to assistant directly
        /dispatch boss <goal>— single agent run, output to terminal

      Environment tricks
        SWARM_MODE=chat      — force chat mode for this shell session
        SWARM_ENGINE=gemini  — default engine without typing /engine
        SWARM_DEBUG=1        — verbose agent output

      Files in prompts
        INCLUDE_FILE: path/to/file   — inlined before agents see it
        [[swarm-file:path/to/file]]  — same, Boss-style

      Session juggling
        /engine gemini       — switch to Gemini CLI for this session
        /agent code-reviewer — every /chat goes to the code reviewer
        /model opus          — lock in a specific model for all runs

      MCP workflow
        /mcp refresh         — reconnect all configured MCP servers
        /mcp tools           — see the full tool catalog
        /mcp call <s> <t> {} — call a tool directly

      Config file: ~/.swarm/config.json (or swarm.config.json in project)
      Logs:        swarm_log.txt in project root
      Output:      output/ directory, .swarm-report.json
    """).rstrip()


def handle_slash_line(
    line: str,
    *,
    session_engine: dict,
    session_agent: dict,
    session_model: dict,
    project_path_holder: dict,
    load_config_fn: Callable[[], dict],
    agent_slug_ok_fn: Callable[[str], bool],
    paths_fn: Callable[[], None],
    print_help_doc_fn: Callable[[], None],
    run_company_fn: Callable[[str], None],
    run_chat_fn: Callable[[str], None],
    dispatch_agent_fn: Callable[..., dict],
    on_reload_config: Callable[[], None],
) -> SlashOutcome:
    s = line.strip()
    if not s.startswith("/"):
        return SlashOutcome(consumed=False)

    from core.tui import Colors as CC, TUI, WittyPhrases

    cmd, arg = _parse(s)
    if not cmd:
        print(f"{CC.YELLOW}  Incomplete command.{CC.RESET} Try {CC.BRIGHT_WHITE}/help{CC.RESET}\n")
        return SlashOutcome(consumed=True)

    # ── Help ──────────────────────────────────────────────────────────────────
    if cmd in ("help", "?"):
        print(f"\n{CC.BRIGHT_CYAN}{_help_text()}{CC.RESET}")
        return SlashOutcome(consumed=True)

    # ── Exit ──────────────────────────────────────────────────────────────────
    if cmd in ("exit", "quit", "q", ":q"):
        TUI.goodbye()
        return SlashOutcome(stop=True, consumed=True)

    # ── Clear ─────────────────────────────────────────────────────────────────
    if cmd in ("clear", "cls"):
        sys.stdout.write("\033[2J\033[H")
        sys.stdout.flush()
        return SlashOutcome(consumed=True)

    # ── Version ───────────────────────────────────────────────────────────────
    if cmd == "version":
        _version = _swarm_version()
        print(f"\n  Swarm orchestrator v{_version} • TUI {TUI.VERSION}\n")
        return SlashOutcome(consumed=True)

    # ── About ─────────────────────────────────────────────────────────────────
    if cmd == "about":
        v = _swarm_version()
        print(f"""
{CC.SWARM_PRIMARY}{CC.BOLD}  Agent Swarm{CC.RESET}  v{v}

  {CC.DIM}Engine-agnostic multi-agent orchestration.
  Dispatch specialists to Claude, Gemini, Kilo, Codex, Cursor — or all at once.
  Five-phase pipeline: clarify → plan → execute → debug → ship.
  Built by Anas Abubakar.  MIT licence.{CC.RESET}

  {CC.DIM}/help{CC.RESET} for commands  ·  {CC.DIM}/tips{CC.RESET} for power-user tricks
""")
        return SlashOutcome(consumed=True)

    # ── Status ────────────────────────────────────────────────────────────────
    if cmd == "status":
        cfg_def = (load_config_fn().get("default_engine") or "claude")
        se = session_engine.get("name") or f"(config default: {cfg_def})"
        sa = session_agent.get("name") or "swarm-assistant"
        sm = session_model.get("name") or "(engine default)"
        mode = os.environ.get("SWARM_MODE", "auto")
        proj = project_path_holder.get("path", os.getcwd())
        avail = set(detect_all_available())
        engine_status = f"{CC.BRIGHT_GREEN}on PATH{CC.RESET}" if session_engine.get("name") in avail else CC.DIM + "—" + CC.RESET

        print(f"""
  {CC.BOLD}Session Status{CC.RESET}
  {CC.DIM}{'─' * 44}{CC.RESET}
  Engine      {CC.BRIGHT_WHITE}{se}{CC.RESET}  {engine_status}
  Agent       {CC.BRIGHT_WHITE}{sa}{CC.RESET}
  Model       {CC.BRIGHT_WHITE}{sm}{CC.RESET}
  Mode        {CC.BRIGHT_WHITE}{mode}{CC.RESET}
  Project     {CC.DIM}{proj}{CC.RESET}
""")
        return SlashOutcome(consumed=True)

    # ── Who ───────────────────────────────────────────────────────────────────
    if cmd == "who":
        sa = session_agent.get("name") or "swarm-assistant"
        se = session_engine.get("name") or "(config default)"
        print(f"\n  You are orchestrating via {CC.BRIGHT_WHITE}{se}{CC.RESET}, chatting with {CC.BRIGHT_WHITE}{sa}{CC.RESET}.\n")
        return SlashOutcome(consumed=True)

    # ── Reset ─────────────────────────────────────────────────────────────────
    if cmd == "reset":
        session_engine["name"] = None
        session_agent["name"] = "swarm-assistant"
        session_model["name"] = None
        if "SWARM_MODE" in os.environ:
            del os.environ["SWARM_MODE"]
        TUI.success("Session reset: engine · agent · model · mode all back to defaults.")
        return SlashOutcome(consumed=True)

    # ── New ───────────────────────────────────────────────────────────────────
    if cmd == "new":
        sys.stdout.write("\033[2J\033[H")
        sys.stdout.flush()
        TUI.mini_banner()
        print(f"  {CC.DIM}Fresh start. What should the swarm do?{CC.RESET}\n")
        return SlashOutcome(consumed=True)

    # ── Reload ────────────────────────────────────────────────────────────────
    if cmd == "reload":
        try:
            on_reload_config()
        except Exception as e:
            TUI.warn(f"Reload hook failed: {e}")
            return SlashOutcome(consumed=True)
        TUI.success("Config will load fresh from ~/.swarm and package defaults.")
        return SlashOutcome(consumed=True)

    # ── Doc ───────────────────────────────────────────────────────────────────
    if cmd == "doc":
        print_help_doc_fn()
        return SlashOutcome(consumed=True)

    # ── Paths ─────────────────────────────────────────────────────────────────
    if cmd == "paths":
        paths_fn()
        print()
        return SlashOutcome(consumed=True)

    # ── Project ───────────────────────────────────────────────────────────────
    if cmd == "project":
        print(f"\n  {CC.BRIGHT_WHITE}{project_path_holder['path']}{CC.RESET}\n")
        return SlashOutcome(consumed=True)

    # ── cd ────────────────────────────────────────────────────────────────────
    if cmd == "cd":
        if not arg.strip():
            TUI.warn("/cd requires a path")
            return SlashOutcome(consumed=True)
        p = Path(arg).expanduser().resolve()
        if not p.is_dir():
            TUI.warn(f"Not a directory: {p}")
            return SlashOutcome(consumed=True)
        project_path_holder["path"] = str(p)
        TUI.success(f"Project → {project_path_holder['path']}")
        return SlashOutcome(consumed=True)

    # ── Output directory ──────────────────────────────────────────────────────
    if cmd == "output":
        proj = Path(project_path_holder.get("path", "."))
        out = proj / "output"
        if not out.exists():
            TUI.warn(f"No output/ directory at {out}")
            return SlashOutcome(consumed=True)
        entries = sorted(out.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True)
        print(f"\n  {CC.BOLD}output/{CC.RESET}  ({len(entries)} entries, newest first)")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        for entry in entries[:40]:
            mtime = entry.stat().st_mtime
            from datetime import datetime
            ts = datetime.fromtimestamp(mtime).strftime("%m-%d %H:%M")
            kind = "/" if entry.is_dir() else " "
            size = f"  {entry.stat().st_size:>8} B" if entry.is_file() else ""
            print(f"  {CC.DIM}{ts}{CC.RESET}  {CC.BRIGHT_WHITE}{entry.name}{kind}{CC.RESET}{CC.DIM}{size}{CC.RESET}")
        if len(entries) > 40:
            print(f"  {CC.DIM}… {len(entries) - 40} more entries{CC.RESET}")
        print()
        return SlashOutcome(consumed=True)

    # ── Mode ──────────────────────────────────────────────────────────────────
    if cmd == "mode":
        mode = arg.strip().lower()
        if mode not in ("auto", "chat", "company"):
            print("  Usage: /mode auto | chat | company\n")
            return SlashOutcome(consumed=True)
        os.environ["SWARM_MODE"] = mode
        TUI.success(f"SWARM_MODE={mode} (this process)")
        return SlashOutcome(consumed=True)

    # ── Engine ────────────────────────────────────────────────────────────────
    if cmd == "engine":
        avail = set(detect_all_available())

        # With an arg — set directly without picker
        if arg:
            key = arg.split(None, 1)[0].lower()
            if key == "clear":
                session_engine["name"] = None
                TUI.success("Session engine cleared.")
                return SlashOutcome(consumed=True)
            eng_cls = get_engine(key)
            if eng_cls and eng_cls.command:
                exe = eng_cls.command.split()[0]
                if shutil.which(exe):
                    session_engine["name"] = key
                    TUI.success(f"Session engine → `{key}`")
                else:
                    TUI.warn(f"`{exe}` not on PATH. Install it or pick another. (/engines)")
            else:
                TUI.warn(f"Unknown engine `{key}`. See /engines.")
            return SlashOutcome(consumed=True)

        # No arg — interactive picker
        cur = session_engine.get("name")
        cfg_def = load_config_fn().get("default_engine") or "claude"
        cur_label = cur or f"config default ({cfg_def})"
        print(f"\n  Current engine: {CC.BRIGHT_WHITE}{cur_label}{CC.RESET}")

        engine_items = [
            ("claude",   "Anthropic Claude Code CLI"),
            ("gemini",   "Google Gemini CLI"),
            ("codex",    "OpenAI Codex CLI"),
            ("kilocode", "Kilo Code"),
            ("cursor",   "Cursor agent"),
            ("aider",    "Aider — git-aware pair programmer"),
        ]
        # Add any registered engines not in the showcase
        registered = {r["name"] for r in list_engines()}
        for r in list_engines():
            if r["name"] not in {n for n, _ in engine_items}:
                engine_items.append((r["name"], r.get("command", "")))

        chosen = TUI.pick(
            engine_items,
            title="SELECT ENGINE",
            available=avail,
        )
        if chosen is None:
            print(f"  {CC.DIM}(cancelled){CC.RESET}\n")
            return SlashOutcome(consumed=True)
        if chosen == "clear":
            session_engine["name"] = None
            TUI.success("Session engine cleared.")
            return SlashOutcome(consumed=True)
        eng_cls = get_engine(chosen)
        if eng_cls and eng_cls.command:
            exe = eng_cls.command.split()[0]
            if shutil.which(exe):
                session_engine["name"] = chosen
                TUI.success(f"Session engine → `{chosen}`")
            else:
                TUI.warn(f"`{exe}` not on PATH — engine set anyway. Install it when ready.")
                session_engine["name"] = chosen
        else:
            session_engine["name"] = chosen
            TUI.success(f"Session engine → `{chosen}`")
        return SlashOutcome(consumed=True)

    # ── Agent ─────────────────────────────────────────────────────────────────
    if cmd == "agent":
        cur = (session_agent.get("name") or "").strip() or "swarm-assistant"
        if not arg.strip():
            print(
                f"\n  Chat agent: {CC.BRIGHT_WHITE}{cur}{CC.RESET}"
                f"\n  {CC.DIM}Use {CC.BRIGHT_WHITE}/agent <slug>{CC.RESET}{CC.DIM} or {CC.BRIGHT_WHITE}/agents{CC.RESET}"
                f"{CC.DIM} to list. {CC.BRIGHT_WHITE}/agent clear{CC.RESET}{CC.DIM} → swarm-assistant.{CC.RESET}\n"
            )
            return SlashOutcome(consumed=True)
        key = arg.split(None, 1)[0].strip()
        if key.lower() == "clear":
            session_agent["name"] = "swarm-assistant"
            TUI.success("Session chat agent → swarm-assistant")
            return SlashOutcome(consumed=True)
        if not agent_slug_ok_fn(key):
            TUI.warn(f"Unknown agent `{key}`. Try /agents or check agents/ paths.")
            return SlashOutcome(consumed=True)
        session_agent["name"] = key
        TUI.success(f"Session chat agent → `{key}`")
        return SlashOutcome(consumed=True)

    # ── Model ─────────────────────────────────────────────────────────────────
    if cmd == "model":
        # With an arg — set directly
        if arg.strip():
            if arg.strip().lower() == "clear":
                session_model["name"] = None
                TUI.success("Session model override cleared.")
                return SlashOutcome(consumed=True)
            session_model["name"] = arg.strip()
            TUI.success(f"Session model → `{session_model['name']}`")
            return SlashOutcome(consumed=True)

        # No arg — interactive picker using per-engine model catalogue
        cur_engine = (session_engine.get("name") or
                      load_config_fn().get("default_engine") or "claude")
        cur_model  = session_model.get("name")
        disp_model = cur_model or "(engine default)"

        print(
            f"\n  Engine: {CC.BRIGHT_WHITE}{cur_engine}{CC.RESET}"
            f"    Model: {CC.BRIGHT_WHITE}{disp_model}{CC.RESET}"
        )

        model_items = list(_MODELS_BY_ENGINE.get(cur_engine, []))

        if not model_items:
            # Engine not in catalogue — let user type it
            TUI.warn(
                f"No model catalogue for engine `{cur_engine}`. "
                "Use /model <model-id> to set one manually."
            )
            return SlashOutcome(consumed=True)

        # Append "clear" option at the bottom
        model_items.append(("clear", "remove model override — let engine choose"))

        chosen = TUI.pick(
            model_items,
            title=f"SELECT MODEL  ({cur_engine})",
        )
        if chosen is None:
            print(f"  {CC.DIM}(cancelled){CC.RESET}\n")
            return SlashOutcome(consumed=True)
        if chosen == "clear":
            session_model["name"] = None
            TUI.success("Session model override cleared.")
        else:
            session_model["name"] = chosen
            TUI.success(f"Session model → `{chosen}`")
        return SlashOutcome(consumed=True)

    # ── Engines ───────────────────────────────────────────────────────────────
    if cmd == "engines":
        avail = detect_all_available()
        print(f"\n{CC.BOLD}  Engines{CC.RESET}")
        print(f"  {CC.DIM}{'─' * 54}{CC.RESET}")
        for row in list_engines():
            dot = f"{CC.BRIGHT_GREEN}●{CC.RESET}" if row["name"] in avail else f"{CC.DIM}○{CC.RESET}"
            sp = row.get("system_prompt_flag") or "—"
            cmd0 = row["command"]
            print(f"  {dot} {row['name']:<12} {cmd0:<20} {CC.DIM}sys-flag: {sp}{CC.RESET}")
        se = session_engine.get("name")
        sa = session_agent.get("name") or "swarm-assistant"
        sm = session_model.get("name") or "(default)"
        print(f"  Session engine: {CC.BRIGHT_WHITE}{se or '(config default)'}{CC.RESET}")
        print(f"  Session agent (chat): {CC.BRIGHT_WHITE}{sa}{CC.RESET}")
        print(f"  Session model: {CC.BRIGHT_WHITE}{sm}{CC.RESET}\n")
        return SlashOutcome(consumed=True)

    # ── Agents ────────────────────────────────────────────────────────────────
    if cmd == "agents":
        limit = 40
        for p in arg.split():
            if p.isdigit():
                limit = max(5, min(500, int(p)))
                break
        cfg = load_config_fn()
        all_names = list((cfg.get("agents") or {}).keys())
        slice_ = all_names[:limit]
        print(f"\n{CC.BOLD}  Agents{CC.RESET} ({len(slice_)} / {len(all_names)})")
        for n in slice_:
            meta = cfg["agents"][n]
            desc = (meta.get("description") or meta.get("source") or "")[:56]
            print(f"  {CC.BRIGHT_MAGENTA}•{CC.RESET} {n:<26} {CC.DIM}{desc}{CC.RESET}")
        if len(all_names) > limit:
            print(f"  {CC.DIM}… /agents 100 for more.{CC.RESET}")
        print()
        return SlashOutcome(consumed=True)

    # ── Inspect agent ─────────────────────────────────────────────────────────
    if cmd == "inspect":
        slug = arg.strip().split()[0] if arg.strip() else ""
        if not slug:
            print("  Usage: /inspect <agent-slug>\n")
            return SlashOutcome(consumed=True)
        cfg = load_config_fn()
        agents = cfg.get("agents") or {}
        if slug not in agents:
            TUI.warn(f"Agent `{slug}` not found. Try /agents.")
            return SlashOutcome(consumed=True)
        meta = agents[slug]
        print(f"\n  {CC.BOLD}Agent:{CC.RESET} {CC.BRIGHT_WHITE}{slug}{CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        for k, v in sorted(meta.items()):
            val = str(v)[:120]
            print(f"  {CC.DIM}{k:<18}{CC.RESET}  {val}")
        print()
        return SlashOutcome(consumed=True)

    # ── Health / Ping ─────────────────────────────────────────────────────────
    if cmd in ("health", "ping"):
        avail = set(detect_all_available())
        print(f"\n  {CC.BOLD}Engine Health{CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        for row in list_engines():
            name = row["name"]
            exe = row["command"].split()[0]
            on_path = shutil.which(exe) is not None
            if on_path:
                dot = f"{CC.BRIGHT_GREEN}●{CC.RESET}"
                label = f"{CC.BRIGHT_GREEN}available{CC.RESET}"
            else:
                dot = f"{CC.DIM}○{CC.RESET}"
                label = f"{CC.DIM}not on PATH{CC.RESET}"
            print(f"  {dot} {name:<12}  {CC.DIM}{exe:<22}{CC.RESET}  {label}")
        print()
        return SlashOutcome(consumed=True)

    # ── Config ────────────────────────────────────────────────────────────────
    if cmd == "config":
        cfg = load_config_fn()
        safe_cfg = {k: v for k, v in cfg.items() if k != "agents"}
        n_agents = len(cfg.get("agents") or {})
        print(f"\n  {CC.BOLD}Active Config{CC.RESET}  {CC.DIM}(agents omitted — use /agents){CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        for k, v in sorted(safe_cfg.items()):
            val = json.dumps(v) if not isinstance(v, str) else v
            print(f"  {CC.DIM}{k:<22}{CC.RESET}  {val[:80]}")
        print(f"  {CC.DIM}{'agents':<22}{CC.RESET}  ({n_agents} defined)\n")
        return SlashOutcome(consumed=True)

    # ── Env / Vars ────────────────────────────────────────────────────────────
    if cmd in ("env", "vars"):
        relevant = [
            "SWARM_MODE", "SWARM_ENGINE", "SWARM_DEBUG", "SWARM_ROOT",
            "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY",
            "CLAUDE_CODE_USE_BEDROCK", "AWS_REGION",
            "SWARM_MCP_MAX_IMAGE_B64_CHARS", "SWARM_MCP_HTTP_READ_TIMEOUT",
        ]
        print(f"\n  {CC.BOLD}Swarm Environment{CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        for var in relevant:
            val = os.environ.get(var)
            if val:
                # Mask API keys
                display = ("*" * min(len(val), 8) + val[-4:]) if "KEY" in var and len(val) > 8 else val
                print(f"  {CC.BRIGHT_WHITE}{var:<34}{CC.RESET}  {display}")
            else:
                print(f"  {CC.DIM}{var:<34}  (unset){CC.RESET}")
        print()
        return SlashOutcome(consumed=True)

    # ── Report ────────────────────────────────────────────────────────────────
    if cmd == "report":
        proj = Path(project_path_holder.get("path", "."))
        report_path = proj / ".swarm-report.json"
        if not report_path.exists():
            TUI.warn("No .swarm-report.json in project root. Run a task first.")
            return SlashOutcome(consumed=True)
        try:
            data = json.loads(report_path.read_text())
        except Exception as e:
            TUI.warn(f"Could not parse report: {e}")
            return SlashOutcome(consumed=True)
        goal = data.get("goal", "—")[:72]
        total_time = data.get("total_time_seconds", "?")
        rate = data.get("success_rate", "?")
        total = data.get("total_agents", 0)
        print(f"\n  {CC.BOLD}Last Swarm Report{CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        print(f"  Goal       {goal}")
        print(f"  Agents     {total}")
        print(f"  Success    {CC.BRIGHT_GREEN}{rate}{CC.RESET}")
        print(f"  Time       {total_time}s")
        breakdown = data.get("status_breakdown") or {}
        if breakdown:
            for status, count in sorted(breakdown.items()):
                print(f"  {CC.DIM}{status:<12}{CC.RESET}  {count}")
        failures = data.get("failures") or []
        if failures:
            print(f"\n  {CC.RED}Failures:{CC.RESET}")
            for f in failures[:5]:
                err = (f.get("error") or "?")[:60]
                print(f"    {CC.DIM}{f.get('name', '?'):<20}{CC.RESET}  {err}")
        print()
        return SlashOutcome(consumed=True)

    # ── Log ───────────────────────────────────────────────────────────────────
    if cmd == "log":
        proj = Path(project_path_holder.get("path", "."))
        log_path = proj / "swarm_log.txt"
        n_lines = 40
        if arg.strip().isdigit():
            n_lines = max(5, min(500, int(arg.strip())))
        if not log_path.exists():
            TUI.warn("No swarm_log.txt in project root.")
            return SlashOutcome(consumed=True)
        try:
            lines = log_path.read_text().splitlines()
            tail = lines[-n_lines:]
        except Exception as e:
            TUI.warn(f"Could not read log: {e}")
            return SlashOutcome(consumed=True)
        print(f"\n  {CC.BOLD}swarm_log.txt{CC.RESET}  {CC.DIM}(last {len(tail)} of {len(lines)} lines){CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        for ln in tail:
            print(f"  {CC.DIM}{ln}{CC.RESET}")
        print()
        return SlashOutcome(consumed=True)

    # ── Stats ─────────────────────────────────────────────────────────────────
    if cmd == "stats":
        metrics_path = Path.home() / ".swarm" / "memory" / "metrics.json"
        # Also check local memory/
        local_metrics = Path(project_path_holder.get("path", ".")) / "memory" / "metrics.json"
        path = local_metrics if local_metrics.exists() else metrics_path
        if not path.exists():
            TUI.warn("No metrics recorded yet. Run some tasks first.")
            return SlashOutcome(consumed=True)
        try:
            data = json.loads(path.read_text())
        except Exception as e:
            TUI.warn(f"Could not read metrics: {e}")
            return SlashOutcome(consumed=True)
        trends = data.get("trends") or {}
        runs = data.get("runs") or []
        print(f"\n  {CC.BOLD}Performance Stats{CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        print(f"  Total runs       {trends.get('total_runs', len(runs))}")
        print(f"  Avg time         {trends.get('avg_time_seconds', '?')}s")
        print(f"  Avg agents/run   {trends.get('avg_agents_per_run', '?')}")
        print(f"  Latest rate      {CC.BRIGHT_GREEN}{trends.get('latest_success_rate', '?')}{CC.RESET}")
        if runs:
            recent = runs[-5:]
            print(f"\n  {CC.DIM}Last {len(recent)} runs:{CC.RESET}")
            for r in recent:
                g = (r.get("goal") or "?")[:40]
                t = r.get("total_time_seconds", "?")
                rate = r.get("success_rate", "?")
                print(f"    {CC.DIM}{t:>6}s{CC.RESET}  {rate:>5}  {g}")
        print()
        return SlashOutcome(consumed=True)

    # ── Skills ────────────────────────────────────────────────────────────────
    if cmd == "skills":
        commands_dir = Path(__file__).resolve().parent.parent / "commands"
        if not commands_dir.exists():
            TUI.warn(f"commands/ directory not found at {commands_dir}")
            return SlashOutcome(consumed=True)
        md_files = sorted(commands_dir.rglob("*.md"))
        print(f"\n  {CC.BOLD}Skills / Commands{CC.RESET}  {CC.DIM}({len(md_files)} files){CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        for f in md_files:
            rel = f.relative_to(commands_dir)
            stem = str(rel).removesuffix(".md")
            first_line = ""
            try:
                lines = f.read_text().splitlines()
                for ln in lines:
                    ln = ln.strip().lstrip("#").strip()
                    if ln:
                        first_line = ln[:50]
                        break
            except Exception:
                pass
            print(f"  {CC.SWARM_PRIMARY}/{stem:<28}{CC.RESET}  {CC.DIM}{first_line}{CC.RESET}")
        print()
        return SlashOutcome(consumed=True)

    # ── Rules ─────────────────────────────────────────────────────────────────
    if cmd == "rules":
        rules_dir = Path(__file__).resolve().parent.parent / "rules"
        if not rules_dir.exists():
            TUI.warn(f"rules/ directory not found at {rules_dir}")
            return SlashOutcome(consumed=True)
        md_files = sorted(rules_dir.rglob("*.md"))
        print(f"\n  {CC.BOLD}Rules{CC.RESET}  {CC.DIM}({len(md_files)} files){CC.RESET}")
        print(f"  {CC.DIM}{'─' * 44}{CC.RESET}")
        for f in md_files:
            rel = f.relative_to(rules_dir)
            first_line = ""
            try:
                lines = f.read_text().splitlines()
                for ln in lines:
                    ln = ln.strip().lstrip("#").strip()
                    if ln:
                        first_line = ln[:50]
                        break
            except Exception:
                pass
            print(f"  {CC.DIM}{str(rel):<38}{CC.RESET}  {CC.DIM}{first_line}{CC.RESET}")
        print()
        return SlashOutcome(consumed=True)

    # ── Tips ──────────────────────────────────────────────────────────────────
    if cmd == "tips":
        print(f"\n{CC.BRIGHT_CYAN}{_tips_text()}{CC.RESET}\n")
        return SlashOutcome(consumed=True)

    # ── Spinners ──────────────────────────────────────────────────────────────
    if cmd == "spinners":
        TUI.multi_spinner_demo()
        return SlashOutcome(consumed=True)

    # ── Task / Company ────────────────────────────────────────────────────────
    if cmd in ("task", "company"):
        if not arg.strip():
            TUI.warn(f"/{cmd} needs goal text after the command.")
            return SlashOutcome(consumed=True)
        run_company_fn(arg)
        return SlashOutcome(consumed=True)

    # ── Chat / Msg ────────────────────────────────────────────────────────────
    if cmd in ("chat", "msg"):
        if not arg.strip():
            TUI.warn(f"/{cmd} needs a message after the command.")
            return SlashOutcome(consumed=True)
        run_chat_fn(arg)
        return SlashOutcome(consumed=True)

    # ── Dispatch ──────────────────────────────────────────────────────────────
    if cmd == "dispatch":
        parts = arg.split(None, 1)
        if len(parts) < 2:
            print("  Usage: /dispatch <agent-slug> <task instructions…>\n")
            return SlashOutcome(consumed=True)
        slug, task = parts[0].strip(), parts[1].strip()
        proj = project_path_holder["path"]
        res = dispatch_agent_fn(
            slug,
            task,
            context="",
            engine_name=session_engine.get("name"),
            config=load_config_fn(),
            workspace=None,
            attach_stdio=True,
            cwd=proj,
            cli_model=session_model.get("name"),
        )
        status = str(res.get("status", "?"))
        if "SUCCESS" in status:
            TUI.success(f"{slug} • {status}")
        else:
            err = str(res.get("error", "") or res.get("stderr", ""))[:200]
            TUI.warn(f"{slug} • {status} — {err}")
        return SlashOutcome(consumed=True)

    # ── Run ───────────────────────────────────────────────────────────────────
    if cmd == "run":
        if not arg.strip():
            print("  Usage: /run <program> [arg1 arg2 …]  (no shell; project cwd)\n")
            return SlashOutcome(consumed=True)
        toks = re.split(r"\s+", arg.strip())
        try:
            rc = subprocess.run(toks, cwd=project_path_holder["path"]).returncode
            print(f"{CC.DIM}(exit {rc}){CC.RESET}\n")
        except FileNotFoundError:
            TUI.warn(f"Not found: `{toks[0]}`")
        return SlashOutcome(consumed=True)

    # ── MCP ───────────────────────────────────────────────────────────────────
    if cmd == "mcp":
        from core import mcp_hub

        cfg = load_config_fn()
        mcp_hub.ensure_catalog_if_needed(cfg)
        raw = arg.strip()
        parts = raw.split(None, 1)
        sub = (parts[0] or "").lower() if parts else ""
        tail = parts[1].strip() if len(parts) > 1 else ""

        if not sub or sub in ("help", "?"):
            print(f"\n{CC.BRIGHT_CYAN}{CC.BOLD}Swarm MCP{CC.RESET}")
            if mcp_hub.mcp_sdk_available():
                print("  Python `mcp` package: yes")
            else:
                print(f"  Python `mcp` package: {CC.YELLOW}no — pip install -r requirements-swarm.txt{CC.RESET}")
            n = mcp_hub.configured_server_count()
            print(f"  Configured servers: {n} (merge swarm.config.json + ~/.swarm/mcp.json)")
            print(
                f"\n  {CC.DIM}/mcp refresh{CC.RESET} — reconnect, refresh tool list"
                f"\n  {CC.DIM}/mcp tools{CC.RESET}   — print catalog"
                f"\n  {CC.DIM}/mcp call{CC.RESET} <server> <tool> '{{\"arg\":true}}'"
                f"\n  {CC.DIM}Agents:{CC.RESET} end replies with ```swarm-mcp JSON ``` (see CONTEXT when servers exist).\n"
            )
            print(
                f"  {CC.BRIGHT_WHITE}Transports:{CC.RESET}"
                f" `command`+`args` = stdio (Cursor-style); remote: `url` + optional "
                f"`transport` ({CC.DIM}sse | websocket | default streamable HTTP{CC.RESET}); "
                f"optional `headers` for Bearer tokens etc.\n"
            )
            from core import mcp_digest
            print(f"  {CC.BRIGHT_WHITE}Pins:{CC.RESET} {mcp_digest.format_digest_help_line()}\n")

        if sub == "refresh":
            mcp_hub.configure_mcp_servers(cfg)
            ok, msg = mcp_hub.refresh_tool_catalog_blocking()
            (TUI.success if ok else TUI.warn)(msg)
            print()
            return SlashOutcome(consumed=True)

        if sub == "tools":
            md = mcp_hub.format_tools_markdown()
            print(f"\n{md}\n")
            return SlashOutcome(consumed=True)

        if sub == "call":
            if not tail:
                TUI.warn("Usage: /mcp call <server> <tool> '{\"arguments\": …}' ")
                print()
                return SlashOutcome(consumed=True)
            m_re = re.match(r"^(\S+)\s+(\S+)\s+(.+)$", tail.strip(), re.DOTALL)
            if not m_re:
                TUI.warn("Expected: /mcp call <server> <tool> '<json-object>'")
                print()
                return SlashOutcome(consumed=True)
            srv, tool_name, js = m_re.group(1), m_re.group(2), m_re.group(3).strip()
            try:
                args_obj = json.loads(js)
            except json.JSONDecodeError as e:
                TUI.warn(f"Invalid JSON: {e}")
                print()
                return SlashOutcome(consumed=True)
            if not isinstance(args_obj, dict):
                TUI.warn("Tool arguments JSON must be an object `{}`.")
                print()
                return SlashOutcome(consumed=True)
            try:
                out = mcp_hub.call_tool_sync(srv, tool_name, args_obj)
                print(f"\n{CC.BRIGHT_WHITE}{out}{CC.RESET}\n")
            except Exception as e:
                TUI.warn(f"{type(e).__name__}: {e}")
                print()
            return SlashOutcome(consumed=True)

        TUI.warn(f"Unknown /mcp subcommand `{sub}`. Try /mcp help.\n")
        return SlashOutcome(consumed=True)

    print(f"  Unknown `/{cmd}`. Try {CC.BRIGHT_WHITE}/help{CC.RESET}\n")
    return SlashOutcome(consumed=True)


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _swarm_version() -> str:
    pkg = Path(__file__).resolve().parent.parent / "package.json"
    try:
        return json.loads(pkg.read_text()).get("version", "?")
    except Exception:
        return "?"
