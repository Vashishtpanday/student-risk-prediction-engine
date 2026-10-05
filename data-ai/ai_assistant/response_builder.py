"""Build JSON responses for assistant queries."""

from __future__ import annotations

from typing import Any, Dict, List


def build_response(
    intent: str,
    data: List[Dict[str, Any]],
    count: int,
    message: str,
) -> Dict[str, Any]:
    """Build a consistent JSON response payload with chat-friendly answer text."""

    # Unknown intent help text
    if intent == "unknown":
        answer = (
            "I couldn't fully understand that query.\n\n"
            "Try asking:\n"
            "• Show high risk students\n"
            "• Moderate risk students in CSE\n"
            "• List NCP students\n"
            "• Students with low attendance\n"
            "• Show students with backlogs\n"
            "• Low marks students in MECH\n"
            "• Semester 3 high risk students\n"
            "• Give me a full summary"
        )
        return {
            "success": True,
            "intent": intent,
            "message": message or "Unknown intent",
            "count": 0,
            "results": [],
            "answer": answer,
        }

    # Summary style message (already prepared by assistant_api)
    if intent == "summary":
        return {
            "success": True,
            "intent": intent,
            "message": message,
            "count": count,
            "results": data[:10],
            "answer": message,
        }

    # No matches
    if count == 0:
        answer = f"No matching students found for this query."
        if message:
            answer += f"\n({message})"
        return {
            "success": True,
            "intent": intent,
            "message": message or "No records found",
            "count": 0,
            "results": [],
            "answer": answer,
        }

    title_map = {
        "high_risk_students": "High Risk Students",
        "moderate_risk_students": "Moderate Risk Students",
        "low_risk_students": "Low Risk Students",
        "ncp_students": "NCP Students",
        "cp_students": "CP Students",
        "students_with_backlogs": "Students with Backlogs",
        "attendance_below_75": "Students with Attendance below 75%",
        "low_marks_students": "Students with Low Internal Marks",
        "department_students": "Department Students",
        "all_students": "Matching Students",
    }
    title = title_map.get(intent, "Matching Students")

    # Keep chat readable
    preview = data[:25]
    lines = []
    for i, s in enumerate(preview, start=1):
        lines.append(
            f"{i}. {s.get('name', 'Unknown')} ({s.get('student_id', 'N/A')}) — "
            f"{s.get('department', 'N/A')}, Sem {s.get('semester', 'N/A')}, "
            f"Attendance: {s.get('attendance_pct', 'N/A')}%, "
            f"Risk: {s.get('risk_category', 'N/A')}"
        )

    more = f"\n\n...and {count - 25} more students." if count > 25 else ""
    answer = f"{title}: found {count} student(s).\n\n" + "\n".join(lines) + more

    return {
        "success": True,
        "intent": intent,
        "message": message or "Query processed successfully.",
        "count": count,
        "results": data,
        "answer": answer,
    }