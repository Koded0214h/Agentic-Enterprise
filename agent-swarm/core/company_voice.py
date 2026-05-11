"""
Company cockpit copy — user-facing strings use org language (Boss, employees, departments).
Internal code may still say 'agent'; everything printed to Boss should prefer this vocabulary.
"""

from __future__ import annotations

BOSS = "Boss"


# phase_num -> (headline, subtitle) for TUI.phase_header
PHASE_CORPORATE = {
    1: ("INTAKE · RECEPTION", f"Honor {BOSS}'s wording exactly — close gaps before Strategy"),
    2: ("STRATEGY OFFICE", "Blueprint departments can execute"),
    3: ("DELIVERY FLOOR", "Employees shipping — every rostered role pulls weight"),
    4: ("QUALITY RECOVERY", "Fix misses before they reach Boss"),
    5: ("EXECUTIVE SIGN-OFF", "Tech lead readout for Boss"),
}


def employee_title(slug: str) -> str:
    """Turn `frontend-dev` into 'Frontend Dev' for display."""
    if not slug:
        return "Team member"
    return slug.replace("-", " ").strip().title()


def assignment_line(engine_name: str, slug: str) -> str:
    return f"[{engine_name}] → {employee_title(slug)} (`{slug}`)"
