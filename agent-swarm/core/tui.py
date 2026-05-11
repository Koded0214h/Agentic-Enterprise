#!/usr/bin/env python3
"""
Agent Swarm — Terminal UI
Polished, animated, opinionated. No emojis. Maximum attitude.
"""

import os
import re
import select
import sys
import time
import threading
import itertools
import random
import textwrap
from datetime import datetime

_ANSI_RE = re.compile(r"\x1b\[[0-9;]*[mKJA-Z]")


# ─────────────────────────────────────────────────────────────────────────────
#  WITTY PHRASES
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
    "Five-phase pipeline. Zero hand-holding. Let's go.",
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
    "Done. The stack trace has been filed under someone else's problem.",
    "Signing off. Remember: undefined is not a design pattern.",
    "Session complete. Please do not blame the AI for the requirements.",
    "Closing. The build passed. Whether it works is a philosophical question.",
]

LOADING = [
    "Consulting the oracle",
    "Assembling agents of questionable intelligence",
    "Forwarding blame to the appropriate subsystem",
    "Negotiating with the compiler",
    "Herding digital cats",
    "Untangling the dependency graph",
    "Searching for a senior dev to blame",
    "Reviewing your life choices and code",
    "Cross-referencing the vibes",
    "Spawning worker threads with questionable motives",
    "This is the fast part, trust me",
    "Parsing intent. Finding none. Proceeding anyway",
    "Booting chaos engine",
    "Coercing agents to cooperate",
    "Asking five AIs what one human should do",
    "Fetching wisdom from the distributed brain trust",
    "Synthesising a plan that will inevitably need revision",
    "Deploying intellectual muscle",
    "Activating hive mind",
    "Summoning the council of agents",
    "Warming up the orchestration engine",
    "Bribing the task queue",
    "Translating your requirements into something achievable",
    "Generating plausible-sounding progress",
    "Staring into the abyss of undefined behaviour",
    "Computing things at an undisclosed rate",
    "Spinning up agents who have opinions",
    "Negotiating acceptable definition of done",
    "Applying intelligence to the problem",
    "Running the numbers and also some vibes",
]

AGENT_QUIPS = [
    "dispatched into the unknown",
    "on the case (allegedly)",
    "working diligently (or at least busy)",
    "questioning its own existence and also your requirements",
    "deep in thought — disturb at your peril",
    "making progress at an undisclosed rate",
    "constructively arguing with the task",
    "refusing to give up without a fight",
    "achieving things at a brisk pace",
    "doing what agents do",
    "ignoring the brief, constructively",
    "convinced it can do this better",
    "very much processing",
    "definitely not stuck",
]

SUCCESS_QUIPS = [
    "That went better than expected.",
    "Nailed it. Don't ask how.",
    "Success. The agents are insufferably smug.",
    "Done and dusted. Ship it.",
    "Completed. The code has been improved against its will.",
    "Mission accomplished. The compiler is satisfied.",
    "It works. Nobody knows exactly why. Shipping anyway.",
    "All green. The agents deserve a raise they won't get.",
    "Finished. Go commit before you break it again.",
    "Task complete. The swarm rests — briefly.",
]

ERROR_QUIPS = [
    "That didn't go as planned. Shocking.",
    "The code has opinions. Strong ones.",
    "Something broke. This is fine.",
    "An error has been detected. The blame is distributed.",
    "Failure encountered. The agents are disappointed but unsurprised.",
    "Welp.",
    "That's a new one. Adding it to the collection.",
    "Not great. Not catastrophic. Manageable.",
    "As expected by anyone who read the logs.",
    "The error message knows more than we do at this point.",
]

PHASE_QUIPS = {
    "QUESTIONNAIRE": [
        "Because assumptions are just untested code.",
        "Clarifying before building — revolutionary concept.",
        "Making sure we solve the right problem for once.",
    ],
    "PLANNER": [
        "Designing a plan that will survive first contact with reality.",
        "Architecture time. Scope creep begins now.",
        "Thinking before doing. What a concept.",
    ],
    "EXECUTE": [
        "Actually building the thing now.",
        "The rubber meets the road. And argues back.",
        "Specialists engaged. Results pending.",
    ],
    "DEBUG": [
        "Something broke. Now we fix it.",
        "The debugging arc. Every project has one.",
        "Hunting gremlins in the machine.",
    ],
    "SHIP": [
        "Final eyes on. Then it's your problem.",
        "Tech lead on deck. Brace for feedback.",
        "The last mile. Usually the bumpiest.",
    ],
}


class WittyPhrases:
    @staticmethod
    def startup() -> str:
        return random.choice(WELCOME)

    @staticmethod
    def goodbye() -> str:
        return random.choice(GOODBYE)

    @staticmethod
    def loading() -> str:
        return random.choice(LOADING)

    @staticmethod
    def agent() -> str:
        return random.choice(AGENT_QUIPS)

    @staticmethod
    def success() -> str:
        return random.choice(SUCCESS_QUIPS)

    @staticmethod
    def error() -> str:
        return random.choice(ERROR_QUIPS)

    @staticmethod
    def phase(phase_name: str) -> str:
        pool = PHASE_QUIPS.get(phase_name.upper(), [])
        return random.choice(pool) if pool else ""


# ─────────────────────────────────────────────────────────────────────────────
#  COLORS
# ─────────────────────────────────────────────────────────────────────────────

class Colors:
    RESET          = "\033[0m"
    BOLD           = "\033[1m"
    DIM            = "\033[2m"
    ITALIC         = "\033[3m"
    UNDERLINE      = "\033[4m"

    BLACK          = "\033[30m"
    RED            = "\033[31m"
    GREEN          = "\033[32m"
    YELLOW         = "\033[33m"
    BLUE           = "\033[34m"
    MAGENTA        = "\033[35m"
    CYAN           = "\033[36m"
    WHITE          = "\033[37m"

    BG_BLACK       = "\033[40m"
    BG_RED         = "\033[41m"
    BG_GREEN       = "\033[42m"
    BG_BLUE        = "\033[44m"
    BG_MAGENTA     = "\033[45m"
    BG_CYAN        = "\033[46m"
    BG_WHITE       = "\033[47m"

    BRIGHT_BLACK   = "\033[90m"
    BRIGHT_RED     = "\033[91m"
    BRIGHT_GREEN   = "\033[92m"
    BRIGHT_YELLOW  = "\033[93m"
    BRIGHT_BLUE    = "\033[94m"
    BRIGHT_MAGENTA = "\033[95m"
    BRIGHT_CYAN    = "\033[96m"
    BRIGHT_WHITE   = "\033[97m"

    SWARM_PRIMARY          = "\033[38;2;123;210;137m"   # brand mint
    SECONDARY_BRIGHT_BLUE  = "\033[94m"


C = Colors

# Terminal width helper
def _tw(default: int = 62) -> int:
    try:
        import shutil as _sh
        return max(40, min(_sh.get_terminal_size().columns - 4, 100))
    except Exception:
        return default


# ─────────────────────────────────────────────────────────────────────────────
#  SPINNER  — cycling witty messages + multiple animation styles
# ─────────────────────────────────────────────────────────────────────────────

class Spinner:
    """Animated spinner that cycles through witty loading phrases automatically."""

    STYLES = {
        "braille":   ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
        "braille2":  ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
        "line":      ["─", "\\", "│", "/"],
        "bar":       ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▄", "▃", "▂"],
        "fill":      ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "█", "▉", "▊", "▋", "▌", "▍", "▎"],
        "arrow":     ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"],
        "bounce":    ["▖", "▗", "▘", "▝"],
        "pulse":     ["·", "•", "●", "◉", "●", "•", "·"],
        "dots":      [".  ", ".. ", "...", " ..", "  ."],
        "box":       ["◰", "◳", "◲", "◱"],
        "squares":   ["▪", "▫", "▪", "▫"],
        "matrix":    ["0 1", "1 0", "01 ", " 10", "10 ", " 01", "110", "001", "101", "010"],
        "star":      ["✶", "✸", "✹", "✺", "✹", "✸"],
        "tri":       ["△", "▲", "▷", "▶", "▽", "▼", "◁", "◀"],
        "clock":     ["◴", "◷", "◶", "◵"],
        "wave":      ["▰▱▱▱▱", "▰▰▱▱▱", "▰▰▰▱▱", "▰▰▰▰▱", "▰▰▰▰▰", "▱▰▰▰▰", "▱▱▰▰▰", "▱▱▱▰▰", "▱▱▱▱▰", "▱▱▱▱▱"],
        "grow":      ["[        ]", "[=       ]", "[==      ]", "[===     ]", "[====    ]",
                      "[=====   ]", "[======  ]", "[======= ]", "[========]"],
    }

    # Best styles for general use — rotated per instance
    _POOL = ["braille", "braille2", "bar", "fill", "arrow", "pulse", "star", "tri", "wave", "clock"]

    # How many 80ms ticks before cycling to the next loading phrase
    _PHRASE_INTERVAL = 45   # ≈ 3.6 seconds

    def __init__(self, message: str = "", style: str = "auto"):
        self._initial = message or WittyPhrases.loading()
        self._phrases = random.sample(LOADING, len(LOADING))   # shuffled copy
        self._phrase_idx = 0
        self._tick = 0
        self._stop = False
        self._thread = None

        if style == "auto":
            style = random.choice(self._POOL)
        self.frames = self.STYLES.get(style, self.STYLES["braille"])
        self._style = style

    def start(self):
        self._stop = False
        self._thread = threading.Thread(target=self._animate, daemon=True)
        self._thread.start()
        return self

    def _animate(self):
        # First phrase is the initial message
        phrases = [self._initial] + self._phrases
        current_msg = phrases[0]
        msg_idx = 0

        for frame in itertools.cycle(self.frames):
            if self._stop:
                break

            self._tick += 1

            # Cycle to next phrase every _PHRASE_INTERVAL ticks
            if self._tick % self._PHRASE_INTERVAL == 0:
                msg_idx = (msg_idx + 1) % len(phrases)
                current_msg = phrases[msg_idx]

            # Render: left-pad frame, truncate message to ~56 chars
            display = current_msg[:56]
            sys.stdout.write(f"\r  {C.SWARM_PRIMARY}{frame}{C.RESET}  {C.DIM}{display}...{C.RESET}    ")
            sys.stdout.flush()
            time.sleep(0.08)

    def stop(self, success: bool = True, message: str = ""):
        self._stop = True
        if self._thread:
            self._thread.join(timeout=0.5)
        sys.stdout.write("\r\033[K")   # erase the spinner line
        icon = f"{C.GREEN}✓{C.RESET}" if success else f"{C.RED}✗{C.RESET}"
        label = message or self._initial
        print(f"  {icon}  {label}")
        sys.stdout.flush()

    def update(self, message: str):
        self._initial = message


class ProgressBar:
    """Animated fill-bar with label."""

    def __init__(self, total: int = 100, width: int = 32, label: str = ""):
        self.total = max(1, total)
        self.width = width
        self.label = label

    def update(self, current: int, label: str = ""):
        if label:
            self.label = label
        pct = min(current, self.total) / self.total
        filled = int(self.width * pct)
        bar = (
            f"{C.SWARM_PRIMARY}{'█' * filled}"
            f"{C.DIM}{'░' * (self.width - filled)}{C.RESET}"
        )
        suffix = f"  {C.DIM}{self.label[:28]}{C.RESET}" if self.label else ""
        sys.stdout.write(f"\r  [{bar}] {C.BRIGHT_WHITE}{pct*100:5.1f}%{C.RESET}{suffix}  ")
        sys.stdout.flush()

    def done(self, message: str = ""):
        self.update(self.total)
        msg = f"  {C.GREEN}✓{C.RESET}  {message}" if message else ""
        sys.stdout.write(f"\n{msg}\n")
        sys.stdout.flush()


# ─────────────────────────────────────────────────────────────────────────────
#  BOX DRAWING HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _vlen(s: str) -> int:
    """Visible (printed) length of a string — strips ANSI escape codes."""
    return len(_ANSI_RE.sub("", s))


def _vpad(s: str, width: int) -> str:
    """Right-pad s to visible width (ANSI-aware)."""
    vis = _vlen(s)
    return s + " " * max(0, width - vis)


def _draw_box(
    lines: list,
    *,
    title: str = "",
    width: int = 0,
    style: str = "single",   # "single" | "double" | "bold"
    color: str = "",
    title_color: str = "",
) -> None:
    """
    Print a styled box around a list of content lines.
    lines: list of str — empty str → blank line; ANSI codes are safe.
    """
    w = width or _tw()
    # inner_w = width available between the two pipe chars + 1-space pads on each side
    inner_w = w - 4   # "  │" + content + "│" — 2 indent + 2 pipes
    content_w = inner_w - 2   # 1 space pad each side inside the box
    c = color or C.DIM
    tc = title_color or C.BRIGHT_WHITE
    reset = C.RESET

    chars = {
        "single": ("╭", "╮", "╰", "╯", "─", "│"),
        "double": ("╔", "╗", "╚", "╝", "═", "║"),
        "bold":   ("┏", "┓", "┗", "┛", "━", "┃"),
    }.get(style, ("╭", "╮", "╰", "╯", "─", "│"))
    tl, tr, bl, br, h, v = chars

    # ── Top border ────────────────────────────────────────────────────────────
    if title:
        t_vis   = len(title) + 2   # 1 space each side
        t_str   = f" {tc}{title}{reset}{c} "
        n_dashes = max(0, inner_w + 2 - 1 - t_vis)   # +2 for the pads, -1 for the first h
        print(f"  {c}{tl}{h}{c}{t_str}{c}{h * n_dashes}{tr}{reset}")
    else:
        print(f"  {c}{tl}{h * (inner_w + 2)}{tr}{reset}")

    # ── Content lines ─────────────────────────────────────────────────────────
    for ln in lines:
        if ln == "":
            # Blank line
            print(f"  {c}{v}{' ' * (inner_w + 2)}{v}{reset}")
        elif _ANSI_RE.search(ln):
            # Line already has colour codes — pad ANSI-aware, no wrapping
            padded = _vpad(ln, content_w)
            print(f"  {c}{v}{reset} {padded} {c}{v}{reset}")
        else:
            # Plain text — word-wrap if needed
            wrapped = textwrap.wrap(ln, content_w) or [""]
            for part in wrapped:
                padded = _vpad(part, content_w)
                print(f"  {c}{v}{reset} {padded} {c}{v}{reset}")

    # ── Bottom border ─────────────────────────────────────────────────────────
    print(f"  {c}{bl}{h * (inner_w + 2)}{br}{reset}")


# ─────────────────────────────────────────────────────────────────────────────
#  QUESTION DETECTOR  — shared by questionnaire_box & collect_agent_input
# ─────────────────────────────────────────────────────────────────────────────

def _extract_questions(content: str) -> list:
    """
    Pull question lines from agent text output.
    Matches: numbered items, bullet items, any sentence ending with '?'.
    Returns deduplicated list preserving order.
    """
    seen: set = set()
    questions: list = []
    for ln in content.strip().splitlines():
        s = ln.strip()
        if not s:
            continue
        is_list_item = bool(re.match(r"^(\d+[\.\)]\s+|\*\s+|-\s+|•\s+)", s)) and len(s) > 4
        has_question = "?" in s and len(s) > 10
        if is_list_item or has_question:
            key = s.lower()
            if key not in seen:
                seen.add(key)
                questions.append(s)
    return questions


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE STEP DOTS  e.g.  ●●○○○
# ─────────────────────────────────────────────────────────────────────────────

def _phase_dots(current: int, total: int = 5) -> str:
    dots = []
    for i in range(1, total + 1):
        if i < current:
            dots.append(f"{C.DIM}●{C.RESET}")
        elif i == current:
            dots.append(f"{C.SWARM_PRIMARY}●{C.RESET}")
        else:
            dots.append(f"{C.DIM}○{C.RESET}")
    return "  ".join(dots)


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN TUI CLASS
# ─────────────────────────────────────────────────────────────────────────────

class TUI:
    VERSION = "1.0.0"

    @staticmethod
    def clear_line():
        sys.stdout.write("\r\033[K")
        sys.stdout.flush()

    # ── Banner ────────────────────────────────────────────────────────────────

    @staticmethod
    def banner():
        """Giant SWARM logo — untouched per user request."""
        quip = WittyPhrases.startup()
        print(f"""
{C.SWARM_PRIMARY}{C.BOLD}
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║    ███████╗██╗    ██╗ █████╗ ██████╗ ███╗   ███╗         ║
    ║    ██╔════╝██║    ██║██╔══██╗██╔══██╗████╗ ████║         ║
    ║    ███████╗██║ █╗ ██║███████║██████╔╝██╔████╔██║         ║
    ║    ╚════██║██║███╗██║██╔══██║██╔══██╗██║╚██╔╝██║         ║
    ║    ███████║╚███╔███╔╝██║  ██║██║  ██║██║ ╚═╝ ██║         ║
    ║    ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝         ║
    ║                                                           ║
    ║{C.BRIGHT_WHITE}    Engine-agnostic multi-agent orchestration               {C.SWARM_PRIMARY}║
    ║{C.DIM}    by Anas Abubakar  •  v{C.RESET}{C.SWARM_PRIMARY}{C.DIM}{TUI.VERSION}{C.RESET}{C.SWARM_PRIMARY}{C.DIM}                                  {C.SWARM_PRIMARY}║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
{C.RESET}""")
        print(f"  {C.DIM}{quip}{C.RESET}\n")

    @staticmethod
    def mini_banner():
        print(f"""
{C.SWARM_PRIMARY}{C.BOLD}  ╭───────────────────────────────────╮
  │  * SWARM  v{TUI.VERSION}                   │
  │  {C.DIM}Engine-agnostic orchestration{C.RESET}{C.SWARM_PRIMARY}{C.BOLD}    │
  ╰───────────────────────────────────╯{C.RESET}""")

    # ── Goodbye ───────────────────────────────────────────────────────────────

    @staticmethod
    def goodbye():
        quip = WittyPhrases.goodbye()
        w = _tw()
        print(f"\n  {C.DIM}{'─' * (w - 4)}{C.RESET}")
        print(f"  {C.DIM}{quip}{C.RESET}")
        print(f"  {C.DIM}{'─' * (w - 4)}{C.RESET}\n")

    # ── Goal display ──────────────────────────────────────────────────────────

    @staticmethod
    def goal(goal: str, workspace: str, engine: str):
        w = _tw()
        inner_w = w - 6
        print()
        _draw_box(
            ["", goal, "", f"@ {workspace}", f"engine  {engine}", ""],
            title="GOAL",
            width=w,
            style="single",
            color=C.SWARM_PRIMARY,
            title_color=C.BRIGHT_WHITE,
        )
        print()

    # ── Phase header ──────────────────────────────────────────────────────────

    @staticmethod
    def phase_header(phase_num: int, phase_name: str, description: str):
        colors = {
            1: C.BRIGHT_YELLOW,
            2: C.SECONDARY_BRIGHT_BLUE,
            3: C.SWARM_PRIMARY,
            4: C.BRIGHT_RED,
            5: C.BRIGHT_MAGENTA,
        }
        color = colors.get(phase_num, C.WHITE)
        quip  = WittyPhrases.phase(phase_name)
        w     = _tw()
        dots  = _phase_dots(phase_num)

        print()
        # Horizontal rule with phase number
        rule_text = f"  PHASE {phase_num} / 5"
        rule_pad  = w - len(rule_text) - 2
        print(f"{color}{C.BOLD}{rule_text}  {'─' * rule_pad}{C.RESET}")
        print(f"  {C.BOLD}{color}{phase_name}{C.RESET}  {C.DIM}{description}{C.RESET}")
        if quip:
            print(f"  {C.DIM}{C.ITALIC}{quip}{C.RESET}")
        print(f"  {dots}")
        print()

    # ── Questionnaire box ────────────────────────────────────────────────────

    @staticmethod
    def questionnaire_box(content: str) -> str:
        """
        Dedicated questionnaire-phase box.
        Always shows something — questions if found, else the raw output.
        Prompts user for answers and returns enriched context.
        """
        w = _tw()
        unique_q = _extract_questions(content)

        print()
        if unique_q:
            _draw_box(
                [""] + unique_q[:12] + [""],
                title="CLARIFYING QUESTIONS",
                width=w,
                style="bold",
                color=C.BRIGHT_YELLOW,
                title_color=C.BRIGHT_WHITE,
            )
        else:
            # No parseable questions — show the raw output so the user knows what the agent said
            raw_lines = [ln.strip() for ln in content.strip().splitlines() if ln.strip()][:10]
            _draw_box(
                [""] + raw_lines + [""],
                title="QUESTIONNAIRE OUTPUT",
                width=w,
                style="bold",
                color=C.BRIGHT_YELLOW,
                title_color=C.BRIGHT_WHITE,
            )

        answer = TUI.input_box(
            "Type your answers to the questions above.",
            label="YOUR ANSWERS",
            hint="Press Enter to skip · Ctrl+C to proceed without answering",
        )

        if answer:
            return f"{content}\n\nUser clarifications:\n{answer}"
        return content

    @staticmethod
    def collect_agent_input(agent_name: str, content: str) -> str:
        """
        Generic mid-pipeline question collector for any agent.

        Silently returns content unchanged when no questions are detected.
        When questions are found: shows them in a titled box, waits for
        the user to respond, then returns content enriched with the answers.
        The pipeline continues immediately after the user replies.
        """
        unique_q = _extract_questions(content)
        if not unique_q:
            return content   # agent didn't ask anything — don't interrupt

        w = _tw()
        label = agent_name.upper().replace("-", " ")
        print()
        _draw_box(
            [""] + unique_q[:12] + [""],
            title=f"{label}  —  NEEDS INPUT",
            width=w,
            style="bold",
            color=C.BRIGHT_YELLOW,
            title_color=C.BRIGHT_WHITE,
        )

        answer = TUI.input_box(
            f"{agent_name} is waiting for your response.",
            label="YOUR ANSWER",
            hint="The agent will continue as soon as you reply · Ctrl+C to skip",
        )

        if answer:
            return f"{content}\n\nUser response to {agent_name}:\n{answer}"
        return content

    # ── Agent lifecycle ───────────────────────────────────────────────────────

    @staticmethod
    def agent_roster(agents: list):
        """
        Show a roster box of agents about to run.
        agents: list of {"name": str, "engine": str}
        """
        w = _tw()
        lines = [""]
        for a in agents:
            name   = a.get("name", "?")
            engine = a.get("engine") or "auto"
            quip   = WittyPhrases.agent()
            line   = f"{C.SWARM_PRIMARY}▸{C.RESET} {C.BRIGHT_WHITE}{name:<22}{C.RESET} {C.DIM}[{engine}]{C.RESET}  {C.DIM}{quip}{C.RESET}"
            lines.append(line)
        lines.append("")
        _draw_box(
            lines,
            title=f"EXECUTING  {len(agents)} agent{'s' if len(agents) != 1 else ''}",
            width=w,
            style="single",
            color=C.SWARM_PRIMARY,
            title_color=C.BRIGHT_WHITE,
        )
        print()

    @staticmethod
    def agent_start(agent_name: str, engine: str):
        quip = WittyPhrases.agent()
        print(f"  {C.SWARM_PRIMARY}▸{C.RESET}  {C.BRIGHT_WHITE}{agent_name:<22}{C.RESET}  {C.DIM}[{engine}]  {quip}{C.RESET}")

    @staticmethod
    def agent_success(agent_name: str, duration: float):
        dur = f"{duration:.1f}s" if duration else ""
        print(f"  {C.GREEN}✓{C.RESET}  {agent_name:<22}  {C.DIM}{dur}{C.RESET}")

    @staticmethod
    def agent_fail(agent_name: str, error: str):
        print(f"  {C.RED}✗{C.RESET}  {agent_name:<22}  {C.DIM}{error[:52]}{C.RESET}")

    @staticmethod
    def agent_debug(agent_name: str):
        print(f"  {C.YELLOW}~{C.RESET}  {agent_name:<22}  {C.DIM}attempting fix...{C.RESET}")

    # ── Summary ───────────────────────────────────────────────────────────────

    @staticmethod
    def summary(total: int, succeeded: int, failed: int, debugged: int, duration: float):
        rate = (succeeded / max(1, total)) * 100
        bw   = 32
        fill = int(bw * succeeded / max(1, total))
        bar  = f"{C.SWARM_PRIMARY}{'█' * fill}{C.DIM}{'░' * (bw - fill)}{C.RESET}"
        quip = WittyPhrases.success() if rate >= 70 else WittyPhrases.error()
        w    = _tw()

        print()
        _draw_box(
            [
                "",
                f"{bar}  {rate:.0f}%",
                "",
                (
                    f"{C.GREEN}✓{C.RESET}  {succeeded} succeeded"
                    f"   {C.RED}✗{C.RESET}  {failed} failed"
                    f"   {C.YELLOW}~{C.RESET}  {debugged} debugged"
                ),
                f"{C.DIM}time  {duration:.1f}s{C.RESET}",
                "",
                f"{C.DIM}{C.ITALIC}{quip}{C.RESET}",
                "",
            ],
            title="RESULTS",
            width=w,
            style="double",
            color=C.BRIGHT_GREEN if rate >= 70 else C.YELLOW,
            title_color=C.BRIGHT_WHITE,
        )
        print()

    # ── Complete ──────────────────────────────────────────────────────────────

    @staticmethod
    def complete(workspace: str):
        quip = WittyPhrases.success()
        w    = _tw()
        _draw_box(
            [
                "",
                f"{C.BRIGHT_GREEN}{C.BOLD}SWARM COMPLETE{C.RESET}",
                "",
                f"workspace  {workspace}",
                f"report     .swarm-report.json",
                "",
                f"{C.DIM}{quip}{C.RESET}",
                "",
            ],
            width=w,
            style="double",
            color=C.BRIGHT_GREEN,
            title_color=C.BRIGHT_GREEN,
        )
        print()

    # ── Prompt / messages ─────────────────────────────────────────────────────

    @staticmethod
    def prompt(question: str) -> str:
        """
        Rich prompt — uses prompt_toolkit when available (/ picker, history,
        bracketed paste). Falls back to plain input() on non-TTY or bare installs.
        """
        print(f"\n  {C.BRIGHT_YELLOW}?{C.RESET}  {question}")
        try:
            from core.prompt_line import read_prompt_line  # noqa: PLC0415
            return read_prompt_line(show_hint=False)
        except Exception:
            pass
        try:
            return input(f"  {C.SWARM_PRIMARY}▸{C.RESET} ").strip()
        except (EOFError, KeyboardInterrupt):
            return ""

    @staticmethod
    def confirm(question: str, *, default: bool = True, danger: bool = False) -> bool:
        """
        Render question in a box with interactive horizontal buttons.

          [ ▶ Proceed ]          [   Deny ]

        ← → or Tab switch focus.  Enter accepts.  Esc / Ctrl+C → Deny.
        Falls back to y/n input when stdin is not a TTY.
        Returns True (proceed) or False (deny).
        """
        w = _tw()
        box_color = C.RED if danger else C.BRIGHT_YELLOW
        btn_color = C.RED if danger else C.SWARM_PRIMARY

        print()
        _draw_box(
            ["", question, ""],
            title="CONFIRMATION",
            width=w,
            style="bold",
            color=box_color,
            title_color=C.BRIGHT_WHITE,
        )
        print(f"\n  {C.DIM}← →  switch   Tab  toggle   Enter  confirm   Esc  cancel{C.RESET}\n")

        selected = 0 if default else 1   # 0 = Proceed, 1 = Deny

        def _render(sel: int) -> None:
            p_on = sel == 0
            pc = f"{btn_color}{C.BOLD}" if p_on else C.DIM
            dc = f"{C.BRIGHT_RED}{C.BOLD}" if sel == 1 else C.DIM
            pa = "▶ " if p_on else "  "
            da = "▶ " if sel == 1 else "  "
            sys.stdout.write(
                f"\r    {pc}[ {pa}Proceed ]{C.RESET}"
                f"          "
                f"{dc}[ {da}Deny ]{C.RESET}    "
            )
            sys.stdout.flush()

        is_tty = (
            getattr(sys.stdin,  "isatty", lambda: False)() and
            getattr(sys.stdout, "isatty", lambda: False)()
        )

        # ── Non-TTY / CI fallback ─────────────────────────────────────────────
        if not is_tty:
            hint = "y" if default else "n"
            try:
                ans = input(
                    f"  {C.SWARM_PRIMARY}Proceed? (y/n) [{hint}]:{C.RESET} "
                ).strip().lower()
            except (EOFError, KeyboardInterrupt):
                return False
            if ans in ("y", "yes"):
                return True
            if ans in ("n", "no"):
                return False
            return default

        # ── Raw-terminal key capture (Linux / macOS) ──────────────────────────
        try:
            import tty as _tty
            import termios as _termios
        except ImportError:
            # Windows — prompt_toolkit could be used but keep it simple
            hint = "y" if default else "n"
            try:
                ans = input(
                    f"  {C.SWARM_PRIMARY}Proceed? (y/n) [{hint}]:{C.RESET} "
                ).strip().lower()
            except (EOFError, KeyboardInterrupt):
                return False
            return ans in ("y", "yes") if ans else default

        def _read_key(fd: int) -> str:
            b = os.read(fd, 1)
            if b == b"\x1b":
                r, _, _ = select.select([fd], [], [], 0.05)
                if r:
                    b2 = os.read(fd, 1)
                    if b2 == b"[":
                        r2, _, _ = select.select([fd], [], [], 0.05)
                        if r2:
                            b3 = os.read(fd, 1)
                            return f"ESC[{b3.decode('ascii', errors='replace')}"
                return "ESC"
            return b.decode("utf-8", errors="replace")

        _render(selected)
        fd = sys.stdin.fileno()
        old_settings = _termios.tcgetattr(fd)
        try:
            _tty.setraw(fd)
            while True:
                k = _read_key(fd)
                if k in ("\r", "\n"):
                    break
                elif k == "ESC[C":            # right arrow → Deny
                    selected = 1
                elif k == "ESC[D":            # left arrow → Proceed
                    selected = 0
                elif k == "\t":               # Tab toggles
                    selected = 1 - selected
                elif k in ("y", "Y"):
                    selected = 0
                    break
                elif k in ("n", "N"):
                    selected = 1
                    break
                elif k in ("ESC", "\x03"):    # Esc / Ctrl+C → Deny
                    selected = 1
                    break
                _render(selected)
        finally:
            _termios.tcsetattr(fd, _termios.TCSADRAIN, old_settings)

        sys.stdout.write("\n\n")
        sys.stdout.flush()
        return selected == 0

    @staticmethod
    def input_box(
        prompt: str,
        *,
        label: str = "INPUT REQUIRED",
        secret: bool = False,
        default: str = "",
        hint: str = "",
    ) -> str:
        """
        Styled bordered rectangle for mid-task user input.

        secret=True hides keystrokes (passwords, API keys, env vars).
        hint    optional dim sub-label shown inside the box.
        default returned when the user submits an empty string.

        Returns the entered text, or default, or '' on Ctrl+C / Esc.
        """
        w = _tw()
        extra_lines = ([f"{C.DIM}{hint}{C.RESET}", ""] if hint else [])
        print()
        _draw_box(
            ["", prompt, ""] + extra_lines,
            title=label,
            width=w,
            style="bold",
            color=C.BRIGHT_YELLOW,
            title_color=C.BRIGHT_WHITE,
        )

        if secret:
            print(
                f"  {C.DIM}Input hidden  ·  Enter to submit  ·  Ctrl+C to skip{C.RESET}\n"
            )
            import getpass
            try:
                val = getpass.getpass(f"  {C.SWARM_PRIMARY}▸ {C.RESET}")
            except (KeyboardInterrupt, EOFError):
                print()
                return default
            return val.strip() or default

        print(
            f"  {C.DIM}Enter to submit  ·  Ctrl+J for newline  ·  Ctrl+C to skip{C.RESET}\n"
        )
        try:
            from core.prompt_line import read_prompt_line  # noqa: PLC0415
            val = read_prompt_line(show_hint=False)
        except Exception:
            try:
                val = input(f"  {C.SWARM_PRIMARY}▸{C.RESET} ").strip()
            except (EOFError, KeyboardInterrupt):
                val = ""
        return val.strip() or default

    @staticmethod
    def info(message: str):
        print(f"  {C.SECONDARY_BRIGHT_BLUE}i{C.RESET}  {message}")

    @staticmethod
    def warn(message: str):
        print(f"  {C.YELLOW}!{C.RESET}  {message}")

    @staticmethod
    def error(message: str):
        print(f"  {C.RED}✗{C.RESET}  {message}")

    @staticmethod
    def success(message: str):
        print(f"  {C.GREEN}✓{C.RESET}  {message}")

    @staticmethod
    def divider(label: str = ""):
        w = _tw()
        if label:
            pad = (w - len(label) - 4) // 2
            print(f"  {C.DIM}{'─' * pad} {label} {'─' * (w - pad - len(label) - 4)}{C.RESET}")
        else:
            print(f"  {C.DIM}{'─' * (w - 4)}{C.RESET}")

    @staticmethod
    def thinking(message: str = ""):
        quip = message or WittyPhrases.loading()
        sys.stdout.write(f"  {C.DIM}{quip}...{C.RESET}\n")
        sys.stdout.flush()

    @staticmethod
    def pick(
        items: list,
        *,
        title: str = "SELECT",
        available: "set | None" = None,
    ) -> "str | None":
        """
        Interactive arrow-key list picker.

        items    — list of (label, description) tuples, or plain strings
        title    — heading shown above the list
        available — optional set of labels marked ● (on PATH / installed)

        Returns the selected label string, or None on Esc / Ctrl+C.
        Falls back to a numbered menu on non-TTY.
        """
        if not items:
            return None

        # Normalise to (label, description) pairs
        norm: list = []
        for it in items:
            if isinstance(it, (list, tuple)) and len(it) >= 2:
                norm.append((str(it[0]), str(it[1])))
            else:
                norm.append((str(it), ""))

        w = _tw()
        selected = 0

        def _render_items(sel: int) -> list:
            """Return lines WITHOUT trailing newlines — caller chooses line ending."""
            out = []
            for i, (lbl, desc) in enumerate(norm):
                active = i == sel
                arrow = f"{C.SWARM_PRIMARY}{C.BOLD}▶{C.RESET}" if active else " "
                lc    = f"{C.SWARM_PRIMARY}{C.BOLD}" if active else ""
                rc    = C.RESET if active else ""
                dot   = ""
                if available is not None:
                    dot = (
                        f"  {C.BRIGHT_GREEN}●{C.RESET}"
                        if lbl in available
                        else f"  {C.DIM}○{C.RESET}"
                    )
                # erase to EOL (\033[K) prevents ghost chars from shorter previous lines
                out.append(
                    f"    {arrow} {lc}{lbl:<18}{rc}  {C.DIM}{desc[:48]}{C.RESET}{dot}\033[K"
                )
            out.append(f"  {C.DIM}{'─' * (w - 4)}{C.RESET}\033[K")
            out.append(f"  {C.DIM}↑ ↓  navigate   Enter  select   Esc  cancel{C.RESET}\033[K")
            return out

        is_tty = (
            getattr(sys.stdin,  "isatty", lambda: False)() and
            getattr(sys.stdout, "isatty", lambda: False)()
        )

        # ── Non-TTY: numbered fallback ────────────────────────────────────────
        if not is_tty:
            print(f"\n  {C.BOLD}{title}{C.RESET}")
            print(f"  {C.DIM}{'─' * (w - 4)}{C.RESET}")
            for i, (lbl, desc) in enumerate(norm, 1):
                dot = ""
                if available is not None:
                    dot = "  ●" if lbl in available else "  ○"
                print(f"  {C.DIM}{i:>2}.{C.RESET}  {lbl:<18}  {C.DIM}{desc}{C.RESET}{dot}")
            try:
                ans = input(f"\n  Enter number (1–{len(norm)}): ").strip()
                idx = int(ans) - 1
                if 0 <= idx < len(norm):
                    return norm[idx][0]
            except (ValueError, EOFError, KeyboardInterrupt):
                pass
            return None

        try:
            import tty as _tty
            import termios as _termios
        except ImportError:
            return None

        # ── Render initial list (cooked mode — \n handled normally) ─────────────
        print(f"\n  {C.BOLD}{title}{C.RESET}")
        print(f"  {C.DIM}{'─' * (w - 4)}{C.RESET}")
        rendered = _render_items(selected)
        for line in rendered:
            print(line)   # print() adds \n; cooked mode turns it into \r\n

        n_rerender = len(rendered)   # items + bottom rule + hint

        def _redraw(sel: int) -> None:
            # In raw mode \n is bare linefeed (cursor down, same column).
            # Use \r\n so every line resets to column 0.
            # \033[{n}A = cursor up n lines; \r = carriage return to col 0.
            sys.stdout.write(f"\033[{n_rerender}A\r")
            for line in _render_items(sel):
                sys.stdout.write(line + "\r\n")
            sys.stdout.flush()

        def _read_key(fd: int) -> str:
            b = os.read(fd, 1)
            if b == b"\x1b":
                r, _, _ = select.select([fd], [], [], 0.05)
                if r:
                    b2 = os.read(fd, 1)
                    if b2 == b"[":
                        r2, _, _ = select.select([fd], [], [], 0.05)
                        if r2:
                            b3 = os.read(fd, 1)
                            return f"ESC[{b3.decode('ascii', errors='replace')}"
                return "ESC"
            return b.decode("utf-8", errors="replace")

        fd  = sys.stdin.fileno()
        old = _termios.tcgetattr(fd)
        result: "str | None" = None
        try:
            _tty.setraw(fd)
            while True:
                k = _read_key(fd)
                if k in ("\r", "\n"):
                    result = norm[selected][0]
                    break
                elif k == "ESC[A":                     # up
                    selected = max(0, selected - 1)
                    _redraw(selected)
                elif k == "ESC[B":                     # down
                    selected = min(len(norm) - 1, selected + 1)
                    _redraw(selected)
                elif k in ("ESC", "\x03", "\x04"):     # Esc / Ctrl+C / Ctrl+D
                    break
        finally:
            _termios.tcsetattr(fd, _termios.TCSADRAIN, old)

        sys.stdout.write("\n")
        sys.stdout.flush()
        return result

    # ── Spinner factory ───────────────────────────────────────────────────────

    @staticmethod
    def spinner(label: str = "", style: str = "auto") -> "Spinner":
        return Spinner(label or WittyPhrases.loading(), style=style)

    # ── Agent table ───────────────────────────────────────────────────────────

    @staticmethod
    def agent_table(agents: list):
        w = _tw()
        print(f"\n  {C.BOLD}{'Agent':<22}  {'Engine':<10}  {'Status':<12}  {'Time':<8}{C.RESET}")
        print(f"  {C.DIM}{'─' * (w - 4)}{C.RESET}")
        for a in agents:
            icon = {
                "running":   f"{C.YELLOW}●{C.RESET}",
                "success":   f"{C.GREEN}✓{C.RESET}",
                "failed":    f"{C.RED}✗{C.RESET}",
                "debugging": f"{C.YELLOW}~{C.RESET}",
            }.get(a.get("status", ""), f"{C.DIM}○{C.RESET}")
            dur = f"{a.get('duration', 0):.1f}s" if a.get("duration") else "—"
            print(
                f"  {icon} {a['name']:<21}  {a.get('engine', '—'):<10}  "
                f"{a.get('status', '—'):<12}  {dur:<8}"
            )
        print()

    # ── Spinner demo ──────────────────────────────────────────────────────────

    @staticmethod
    def multi_spinner_demo():
        print(f"\n  {C.BOLD}Spinner styles{C.RESET}  {C.DIM}(used: auto-random per run){C.RESET}")
        print(f"  {C.DIM}{'─' * 44}{C.RESET}")
        for name, frames in Spinner.STYLES.items():
            preview = "  ".join(frames[:7])
            print(f"  {C.SWARM_PRIMARY}{name:<12}{C.RESET}  {C.DIM}{preview}{C.RESET}")
        print()


