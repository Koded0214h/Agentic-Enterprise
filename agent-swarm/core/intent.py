"""
Heuristic routing: casual / Q&A message vs. full multi-agent company execution.
Override with /task or /chat prefix, or SWARM_MODE=chat|company|auto.
"""

from __future__ import annotations

import os
import re


_COMPANY_PATTERNS = re.compile(
    r"(?i)\b("
    r"implement|build|create(\s+a)?\s+(app|api|site|dashboard|service|cli|tool|feature|repo|project|mvp|prototype)|"
    r"migrate|refactor|dockerize|deploy|ship|scaffold|orchestrat|npm\s+publish|"
    r"set\s+up\s+ci|ci/cd|kubernetes|terraform|microservice|full[\s-]?stack|"
    r"landing\s+page|codebase|multi[\s-]?agent|spawn(\s+)?agents|"
    r"fix(\s+the)?\s+bug|patch(\s+)?\d+|add(\s+a)?\s+feature|write(\s+)?tests(\s+for)?|"
    r"architecture(\s+for)?|database\s+migration|opentelemetry|production(\s+)?ready"
    r")\b"
)

_CHAT_GREETINGS = re.compile(
    r"(?i)^[\s,!?.]*("
    r"hi+|hello+|hey+|yo+|howdy+|good\s+(morning|afternoon|evening)|"
    r"thanks?|thank\s+you|thx|cool|nice|awesome|great|ok(ay)?|bye|goodbye|cya|later"
    r")[\s,!?.]*$"
)

_CHAT_ONLY_FRAGMENTS = (
    "what does",
    "what is",
    "what's",
    "who is",
    "why is",
    "how do",
    "how does",
    "can you explain",
    "tell me about",
    "difference between",
    "vs ",
    " versus ",
)


def classify_intent(user_text: str) -> str:
    """
    Return 'company' for executable multi-phase work, or 'chat' for conversational / Q&A.
    """
    mode = os.environ.get("SWARM_MODE", "auto").strip().lower()
    if mode == "company":
        return "company"
    if mode == "chat":
        return "chat"

    text = user_text.strip()
    if not text:
        return "chat"

    low = text.lower()
    force_task = low.startswith("/task ") or low.startswith("/company ")
    force_chat = low.startswith("/chat ") or low.startswith("/msg ")
    if force_task:
        return "company"
    if force_chat:
        return "chat"

    if _COMPANY_PATTERNS.search(text):
        return "company"

    if _CHAT_GREETINGS.match(text) and len(text) < 120:
        return "chat"

    if "?" in text and len(text) < 400:
        if not _COMPANY_PATTERNS.search(text):
            hit = next((frag for frag in _CHAT_ONLY_FRAGMENTS if frag in low), None)
            if hit or len(text.split()) <= 35:
                return "chat"

    if len(text) < 32 and len(text.split()) <= 6 and not _COMPANY_PATTERNS.search(text):
        return "chat"

    return "company"


def strip_intent_prefix(user_text: str) -> str:
    """Remove /task or /chat prefix after routing."""
    t = user_text.strip()
    for p in ("/task ", "/company ", "/chat ", "/msg "):
        if t.lower().startswith(p):
            return t[len(p) :].strip()
    return t
