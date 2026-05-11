"""
Parse clarifying questions from Questionnaire agent output and format Q&A for the planner.
"""

from __future__ import annotations

import json
import re
from typing import Any

_JSON_FENCE = re.compile(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", re.IGNORECASE)


def _strip_code_fences(text: str) -> str:
    """Remove fenced code blocks so numbered-line fallback ignores example sections."""
    return re.sub(r"```[\s\S]*?```", "", text)


def extract_questions_json(text: str) -> list[str] | None:
    """Prefer the last valid ```json ... ``` block (models often duplicate an example)."""
    matches = list(_JSON_FENCE.finditer(text))
    for m in reversed(matches):
        try:
            obj: Any = json.loads(m.group(1))
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            arr = obj.get("questions") or obj.get("clarifying_questions")
            if isinstance(arr, list):
                out = [str(x).strip() for x in arr if str(x).strip()]
                if out:
                    return out
    # Last-resort: first top-level {...} with "questions"
    try:
        brace = text.find("{")
        if brace >= 0:
            depth = 0
            for i in range(brace, len(text)):
                if text[i] == "{":
                    depth += 1
                elif text[i] == "}":
                    depth -= 1
                    if depth == 0:
                        snippet = text[brace : i + 1]
                        obj = json.loads(snippet)
                        if isinstance(obj, dict):
                            arr = obj.get("questions")
                            if isinstance(arr, list):
                                out = [str(x).strip() for x in arr if str(x).strip()]
                                return out or None
                        break
    except (json.JSONDecodeError, ValueError):
        pass
    return None


def questions_from_numbered_markdown(text: str) -> list[str]:
    """Lines like '1. Something?' under Clarifying Questions headings."""
    stripped = _strip_code_fences(text)
    in_section = False
    out: list[str] = []
    for line in stripped.splitlines():
        low = line.lower().strip()
        if "clarifying" in low and "question" in low and line.strip().startswith("#"):
            in_section = True
            continue
        if in_section and line.strip().startswith("#") and "question" not in low:
            break
        m = re.match(r"^\s*(\d+)\.\s+(.+?)\s*$", line)
        if m:
            q = m.group(2).strip()
            if len(q) > 3:
                out.append(q)
    return out


def parse_question_list(llm_output: str, *, max_questions: int = 20) -> list[str]:
    """Return ordered unique questions; prefers JSON contract, then numbered markdown."""
    if not (llm_output or "").strip():
        return []
    j = extract_questions_json(llm_output)
    if j:
        seen: set[str] = set()
        uniq: list[str] = []
        for q in j:
            if q not in seen:
                seen.add(q)
                uniq.append(q)
        return uniq[:max_questions]
    numbered = questions_from_numbered_markdown(llm_output)
    seen = set()
    uniq = []
    for q in numbered:
        if q not in seen:
            seen.add(q)
            uniq.append(q)
    return uniq[:max_questions]


def format_clarified_requirements(
    goal: str,
    raw_questionnaire: str,
    qa_pairs: list[tuple[str, str]],
    *,
    raw_ref_max_chars: int = 12000,
) -> str:
    """Markdown intake bundle (pre-synthesis); company-facing headings for Boss / Strategy Office."""
    parts = [
        "## Boss's verbatim directive\n\n"
        f"> {goal.strip().replace(chr(10), chr(10) + '> ')}\n\n"
        "_Reception must honour every detail above before asking questions._\n",
        "## Intake · Boss's answers (sequential)\n",
    ]
    for i, (q, a) in enumerate(qa_pairs, start=1):
        ans = (a or "").strip() or "_(Boss skipped — Strategy should flag)_"
        parts.append(f"### Q{i}\n\n{q}\n\n**Boss:** {ans}\n")
    ref = (raw_questionnaire or "").strip()
    if ref:
        parts.append(
            "\n## Reception team's raw notes (reference)\n\n"
            f"{ref[:raw_ref_max_chars]}"
            + ("\n\n_(truncated)_" if len(ref) > raw_ref_max_chars else "")
        )
    return "\n".join(parts)


def format_directive_only_for_synthesis(goal: str, raw_questionnaire: str, *, raw_max: int = 16000) -> str:
    """When Boss did not go through sequential Q&A — still hand a clear block to the briefing desk."""
    g = goal.strip()
    r = (raw_questionnaire or "").strip()
    return (
        "## Boss's verbatim directive\n\n"
        f"> {g.replace(chr(10), chr(10) + '> ')}\n\n"
        "## Reception output (no threaded answers — treat as open intake)\n\n"
        f"{r[:raw_max]}"
        + ("\n\n_(truncated)_" if len(r) > raw_max else "")
    )
