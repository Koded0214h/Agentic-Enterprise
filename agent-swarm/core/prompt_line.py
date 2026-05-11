"""
TTY line editor for Swarm prompts (replace bare ``input()``).

- **Arrow keys / home / end** edit in place (prompt_toolkit).
- **Enter** submits; **Ctrl+J** inserts a real newline (typed multiline).
- **/** shows an interactive command picker (arrow-key navigable dropdown).
- **Bracketed paste**: pasted newlines do *not* submit; large / multiline / binary
  pastes become compact chips like ``[#7 · clip · 4820c · 103l]`` — full text is
  stitched back in when you press Enter.

Bundled ``requirements-swarm.txt`` is auto-installed on first run by the
orchestrator. Falls back to plain ``input()`` when ``prompt_toolkit`` is still
unavailable or stdin is not a TTY.
"""

from __future__ import annotations

import os
import re
import sys
from itertools import count as id_counter

_ARROW_PLAIN = "  \033[1;38;2;123;210;137m›\033[0m "

# ─────────────────────────────────────────────────────────────────────────────
#  Slash-command completer  — shows when the buffer starts with /
# ─────────────────────────────────────────────────────────────────────────────

def _get_slash_commands() -> "dict[str, str]":
    """Lazy-import SLASH_COMMANDS so we don't create a hard import cycle."""
    try:
        from core.slash_commands import SLASH_COMMANDS  # noqa: PLC0415
        return SLASH_COMMANDS
    except Exception:
        return {}


def _make_slash_completer() -> "object":
    """
    Return a prompt_toolkit Completer that activates on '/' and shows
    a searchable, arrow-key-navigable list of all swarm slash commands.
    Returns None if prompt_toolkit is not importable.
    """
    try:
        from prompt_toolkit.completion import Completer, Completion  # noqa: PLC0415
    except ImportError:
        return None

    cmds = _get_slash_commands()

    class _SlashCompleter(Completer):
        def get_completions(self, document, complete_event):
            text = document.text_before_cursor.lstrip()

            # Only fire when the input starts with / and has no space yet
            # (we complete the command name, not the arguments)
            if not text.startswith("/"):
                return
            after_slash = text[1:]
            if " " in after_slash:
                return   # user is already typing args — stay out of the way

            query = after_slash.lower()
            for cmd, desc in sorted(cmds.items()):
                if cmd.startswith(query):
                    yield Completion(
                        "/" + cmd,
                        start_position=-len(text),   # replace the whole /xxx fragment
                        display=f"/{cmd}",
                        display_meta=desc,
                    )

    return _SlashCompleter()


# Mint-themed completion menu style
_COMPLETION_STYLE_DICT = {
    # Dropdown background + foreground
    "completion-menu":                          "bg:#0f1f12 #7bd289",
    "completion-menu.completion":               "bg:#0f1f12 #7bd289",
    "completion-menu.completion.current":       "bg:#1e3d22 #ffffff bold",
    # Meta column (descriptions on the right)
    "completion-menu.meta.completion":          "bg:#0a1a0d #4a8a5a",
    "completion-menu.meta.completion.current":  "bg:#1e3d22 #a8d4b0",
    # Scrollbar
    "scrollbar.background":                     "bg:#0a1a0d",
    "scrollbar.button":                         "bg:#7bd289",
    # The prompt arrow
    "swarm-arrow":                              "bold #7bd289",
}

_BPASTE_ON = "\x1b[?2004h"
_BPASTE_OFF = "\x1b[?2004l"


def _no_bracket_paste() -> bool:
    return os.environ.get("SWARM_NO_BRACKETED_PASTE", "").strip().lower() in {"1", "true", "yes"}


def _bracket_paste_enable() -> None:
    """Enable after prompt_toolkit attached to the TTY (reduces cursorfight on first draw)."""
    if _no_bracket_paste():
        return
    if not getattr(sys.stdout, "isatty", lambda: False)():
        return
    sys.stdout.write(_BPASTE_ON)
    sys.stdout.flush()


def _bracket_paste_disable() -> None:
    if _no_bracket_paste():
        return
    if not getattr(sys.stdout, "isatty", lambda: False)():
        return
    sys.stdout.write(_BPASTE_OFF)
    sys.stdout.flush()
# Pastes larger than this become a chip (chars)
_PASTE_CHARS = int(os.environ.get("SWARM_PROMPT_CHIP_CHARS", "900"))
# Pastes with more than this many *embedded newlines* become a chip
_PASTE_NEWLINES = int(os.environ.get("SWARM_PROMPT_CHIP_NEWLINES", "2"))

# [#id · …] — captures numeric id
_CHIP_RE = re.compile(r"\[#(\d+)\s*·[^\]]+\]")


def _is_probably_png(b: bytes) -> bool:
    return len(b) >= 8 and b[:8] == b"\x89PNG\r\n\x1a\n"


def _is_probably_binary(s: str) -> bool:
    if "\x00" in s:
        return True
    sample = s[:8192]
    if not sample:
        return False
    ctrl = sum(1 for c in sample if ord(c) < 9 or (14 <= ord(c) < 32))
    return len(sample) > 64 and ctrl / len(sample) > 0.08


def _paste_body_bytes(data: str) -> bytes:
    """Bytes view of pasted content.

    Raw/binary pastes map each byte to U+0000–U+00FF → latin-1 round-trip.
    Normal Unicode text (smart quotes, etc.) falls back to UTF-8 so paste never crashes.
    """
    try:
        return data.encode("latin-1")
    except UnicodeEncodeError:
        return data.encode("utf-8")


def _jpeg_head(b: bytes) -> bool:
    return len(b) >= 3 and b.startswith(b"\xff\xd8\xff")


def _gif_head(b: bytes) -> bool:
    return len(b) >= 6 and (b.startswith(b"GIF87a") or b.startswith(b"GIF89a"))


def _paste_kind(data: str) -> tuple[str, str]:
    lb = _paste_body_bytes(data)
    prefix = lb[:24]
    if _is_probably_png(prefix):
        return "image", "PNG"
    if _jpeg_head(prefix):
        return "image", "JPEG"
    if _gif_head(prefix):
        return "image", "GIF"
    if _is_probably_binary(data):
        return "binary", f"{len(lb)} bytes"

    lc = len(data)
    nl = data.count("\n")
    if lc <= _PASTE_CHARS and nl <= _PASTE_NEWLINES:
        return "inline", ""
    if lc == 0:
        return "inline", ""

    ln = len(data.splitlines())
    if ln <= 1 and lc <= _PASTE_CHARS:
        return "inline", ""
    return "clip", ""


def _should_chip(kind: str) -> bool:
    return kind in ("clip", "binary", "image")


def expand_prompt_chips(text: str, stash: dict[int, str]) -> str:
    """Replace ``[#id · …]`` chips with original paste bodies."""

    def repl(m: re.Match[str]) -> str:
        pid = int(m.group(1))
        return stash.get(pid, m.group(0))

    return _CHIP_RE.sub(repl, text)


def read_prompt_line(message: str = "", *, show_hint: bool = True) -> str:
    """Read one user message; chips expanded on submit. Empty string on ^C/^D."""
    if not _stdout_tty():
        try:
            line = sys.stdin.readline()
        except (KeyboardInterrupt, EOFError):
            return ""
        return (line or "").rstrip("\n")

    try:
        from prompt_toolkit.history import FileHistory
        from prompt_toolkit.key_binding import KeyBindings
        from prompt_toolkit.keys import Keys
        from prompt_toolkit.styles import Style
        from prompt_toolkit import PromptSession
    except ImportError:
        return _fallback_input(message)

    stash: dict[int, str] = {}
    ids = id_counter(1)
    kb = KeyBindings()

    # ── Paste handler ─────────────────────────────────────────────────────────
    @kb.add(Keys.BracketedPaste)
    def _paste(event: object) -> None:  # type: ignore[no-untyped-def]
        data = getattr(event, "data", "") or ""
        kind, img_label = _paste_kind(data)
        buf = event.app.current_buffer  # type: ignore[attr-defined]
        if kind == "inline" or not _should_chip(kind):
            buf.insert_text(data)
            return
        pid = next(ids)
        stash[pid] = data
        b = _paste_body_bytes(data)
        if kind == "image":
            chip = f"[#{pid} · image · {img_label} · {len(b)} bytes]"
        elif kind == "binary":
            chip = f"[#{pid} · file · {len(b)} bytes]"
        else:
            line_count = len(data.splitlines()) or (1 if data.strip() else 0)
            if line_count < 1:
                line_count = 1
            chip = f"[#{pid} · clip · {len(data)} chars · {line_count} lines]"
        buf.insert_text(chip)

    # ── Enter: submit (close completion menu first if open) ───────────────────
    @kb.add("enter", eager=True)
    def _accept(event: object) -> None:  # type: ignore[no-untyped-def]
        app = event.app  # type: ignore[attr-defined]
        # If the completion menu is visible, apply the selection and close it
        buff = app.current_buffer
        if buff.complete_state:
            buff.apply_completion(buff.complete_state.current_completion)
        else:
            app.exit(result=buff.text)

    @kb.add("c-j")
    def _newline(event: object) -> None:  # type: ignore[no-untyped-def]
        event.current_buffer.insert_text("\n")

    # ── History path ──────────────────────────────────────────────────────────
    history_path = None
    try:
        from pathlib import Path

        h = Path(os.environ.get("SWARM_HOME", Path.home() / ".swarm")) / "prompt_history.txt"
        h.parent.mkdir(parents=True, exist_ok=True)
        history_path = str(h)
    except OSError:
        pass

    # ── Slash completer ───────────────────────────────────────────────────────
    slash_completer = _make_slash_completer()

    # ── Style: prompt arrow + mint completion menu ────────────────────────────
    _pt_style = Style.from_dict({
        **_COMPLETION_STYLE_DICT,
        "swarm-arrow": "bold #7bd289",
    })

    # ── Session ───────────────────────────────────────────────────────────────
    session = PromptSession(
        message=[("", "  "), ("class:swarm-arrow", "›"), ("", " ")],
        style=_pt_style,
        key_bindings=kb,
        completer=slash_completer,
        complete_while_typing=True,   # popup appears as soon as / is typed
        complete_in_thread=True,      # non-blocking completions
        multiline=True,
        wrap_lines=False,
        history=FileHistory(history_path) if history_path else None,
        enable_open_in_editor=False,
    )

    if message:
        print(message.rstrip(), flush=True)
    if show_hint:
        print(
            "\033[2m  Enter·send  Ctrl+J·newline  /·commands  ↑↓·history  paste→chip\033[0m",
            flush=True,
        )
    try:
        raw = session.prompt(pre_run=_bracket_paste_enable)
    except (EOFError, KeyboardInterrupt):
        return ""
    finally:
        _bracket_paste_disable()
    return expand_prompt_chips(raw, stash)


def _stdout_tty() -> bool:
    return bool(getattr(sys.stdin, "isatty", lambda: False)()) and bool(
        getattr(sys.stdout, "isatty", lambda: False)()
    )


_warned_pt = False


def _fallback_input(message: str) -> str:
    global _warned_pt
    if _stdout_tty():
        if not _warned_pt:
            print(
                "\033[33m  ⚠ prompt_toolkit unavailable — using basic input. "
                "Re-run swarm (auto-install) or: python3 -m pip install -r requirements-swarm.txt\033[0m",
                flush=True,
            )
            _warned_pt = True
    if message:
        print(message.rstrip(), flush=True)
    try:
        return input(_ARROW_PLAIN)
    except (EOFError, KeyboardInterrupt):
        return ""


def prompt_toolkit_available() -> bool:
    if not _stdout_tty():
        return False
    try:
        import prompt_toolkit  # noqa: F401

        return True
    except ImportError:
        return False
