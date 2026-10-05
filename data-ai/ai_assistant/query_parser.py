"""Parse faculty natural language queries into intent + filters."""

from __future__ import annotations

import re
from typing import Any, Dict, Optional


DEPARTMENTS = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT", "AI&DS", "AIDS"]


def _extract_department(text: str) -> Optional[str]:
    upper = (text or "").upper()

    for dept in DEPARTMENTS:
        token = dept.replace("&", "")
        if dept in upper or token in upper.replace("&", ""):
            return "AI&DS" if dept in ["AI&DS", "AIDS"] else dept

    aliases = {
        "COMPUTER SCIENCE": "CSE",
        "COMPUTERS": "CSE",
        "COMPUTER": "CSE",
        "CS ": "CSE",
        "ELECTRONICS": "ECE",
        "MECHANICAL": "MECH",
        "ELECTRICAL": "EEE",
        "INFORMATION TECHNOLOGY": "IT",
        "DATA SCIENCE": "AI&DS",
        "ARTIFICIAL INTELLIGENCE": "AI&DS",
    }
    for key, val in aliases.items():
        if key in upper:
            return val
    return None


def _extract_semester(text: str) -> Optional[str]:
    q = (text or "").lower()
    patterns = [
        r"(?:semester|sem)\s*[-\s]?\s*(\d)",
        r"(\d)(?:st|nd|rd|th)?\s*(?:semester|sem)",
    ]
    for p in patterns:
        m = re.search(p, q)
        if m:
            return m.group(1)
    return None


def parse_query(query: str) -> Dict[str, Any]:
    """
    Returns:
      {
        intent: str,
        department: Optional[str],
        semester: Optional[str],
        raw_query: str
      }
    """
    raw = (query or "").strip()
    q = raw.lower()

    department = _extract_department(raw)
    semester = _extract_semester(raw)

    # Intent priority: specific first
    if any(k in q for k in [
        "high risk", "high-risk", "critical", "urgent",
        "immediate intervention", "most critical", "danger"
    ]):
        intent = "high_risk_students"

    elif any(k in q for k in [
        "moderate risk", "medium risk", "mod risk", "average risk"
    ]):
        intent = "moderate_risk_students"

    elif any(k in q for k in [
        "low risk", "safe students", "good performing", "good students"
    ]):
        intent = "low_risk_students"

    elif any(k in q for k in [
        "ncp", "no credit", "non credit", "not credit pass"
    ]):
        intent = "ncp_students"

    elif any(k in q for k in [
        "cp students", "credit pass", "only cp"
    ]):
        intent = "cp_students"

    elif any(k in q for k in [
        "backlog", "backlogs", "arrear", "arrears"
    ]):
        intent = "students_with_backlogs"

    elif any(k in q for k in [
        "attendance", "low attendance", "below 75", "debar", "absent"
    ]):
        intent = "attendance_below_75"

    elif any(k in q for k in [
        "low marks", "internal marks", "poor marks", "failed internals", "marks below"
    ]):
        intent = "low_marks_students"

    elif any(k in q for k in [
        "how many", "count", "total", "summary", "overview", "stats", "statistics"
    ]):
        intent = "summary"

    elif any(k in q for k in [
        "list all", "all students", "show all students", "every student"
    ]):
        intent = "all_students"

    elif department and not any(k in q for k in [
        "high", "low", "moderate", "medium", "ncp", "backlog", "attendance", "marks"
    ]):
        # e.g. "CSE students", "show MECH"
        intent = "department_students"

    else:
        # Keep unknown, assistant_api can try name/id fallback
        intent = "unknown"

    return {
        "intent": intent,
        "department": department,
        "semester": semester,
        "raw_query": raw,
    }