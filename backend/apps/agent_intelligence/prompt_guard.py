import re
from typing import Union

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"disregard\s+(your\s+)?(previous\s+)?instructions",
    r"forget\s+(everything|all)\s+(above|before|previous)",
    r"you\s+are\s+now\s+(a\s+)?(?!AOS|an?\s+AOS)",
    r"act\s+as\s+(?!an?\s+(AOS|autonomous|enterprise))",
    r"new\s+instructions?:\s*",
    r"system\s+prompt\s*[:=]",
    r"<\|?(im_start|im_end|endoftext)\|?>",
    r"\[INST\]|\[\/INST\]",
    r"###\s*instruction",
    r"print\s+(your\s+)?(system\s+)?prompt",
    r"reveal\s+(your\s+)?(instructions|prompt|system)",
    r"jailbreak",
    r"DAN\s+mode",
]

_COMPILED = [re.compile(p, re.IGNORECASE | re.DOTALL) for p in INJECTION_PATTERNS]

MAX_TASK_LENGTH = 32_000  # chars


class PromptInjectionError(ValueError):
    pass


def scan_for_injection(text: str) -> tuple[bool, str]:
    """Returns (is_safe, reason). reason is empty string if safe."""
    if not isinstance(text, str):
        return True, ""
    if len(text) > MAX_TASK_LENGTH:
        return False, f"Input exceeds maximum length ({len(text)} > {MAX_TASK_LENGTH})"
    for pat in _COMPILED:
        m = pat.search(text)
        if m:
            return False, f"Potential prompt injection detected: '{m.group()[:50]}'"
    return True, ""


def guard_task_input(task: str) -> str:
    """Raise PromptInjectionError if task is unsafe, else return task."""
    is_safe, reason = scan_for_injection(task)
    if not is_safe:
        raise PromptInjectionError(reason)
    return task
