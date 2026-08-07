"""Helpers for parsing faculty-style queries into actionable filters."""

from __future__ import annotations

import re
from typing import Dict, Optional, Tuple


def parse_query(query: str) -> Dict[str, Optional[str]]:
    """Parse simple faculty queries into a normalized structure."""
    normalized = (query or "").strip().lower()
    if not normalized:
        return {"intent": None, "department": None, "semester": None}

    department = None
    semester = None

    if "cse" in normalized:
        department = "CSE"
    elif "ece" in normalized:
        department = "ECE"
    elif "mech" in normalized:
        department = "MECH"

    semester_match = re.search(r"semester\s*(\d+)", normalized)
    if semester_match:
        semester = semester_match.group(1)

    if "high risk" in normalized or "high-risk" in normalized:
        intent = "high_risk_students"
    elif "backlog" in normalized or "backlogs" in normalized:
        intent = "students_with_backlogs"
    elif "ncp" in normalized:
        intent = "ncp_students"
    elif "attendance" in normalized and "75" in normalized:
        intent = "attendance_below_75"
    else:
        intent = "unknown"

    return {
        "intent": intent,
        "department": department,
        "semester": semester,
    }
