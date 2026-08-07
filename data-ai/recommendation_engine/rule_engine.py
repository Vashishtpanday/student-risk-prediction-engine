"""Generate personalized student recommendations based on the README rule table."""

from __future__ import annotations

from typing import Any, Dict, List, Mapping, Optional, Sequence, Union


def _build_recommendation(priority: str, category: str, message: str) -> Dict[str, str]:
    """Create a recommendation object with the expected schema."""
    return {
        "priority": priority,
        "category": category,
        "message": message,
    }


def _normalize_student_record(student: Mapping[str, Any]) -> Dict[str, Any]:
    """Ensure a student record has the expected keys and normalized values."""
    normalized = dict(student)
    normalized.setdefault("student_id", "")
    normalized.setdefault("attendance_pct", 0)
    normalized.setdefault("internal_marks", 0)
    normalized.setdefault("cp_ncp", "")
    normalized.setdefault("previous_backlogs", 0)
    normalized.setdefault("risk_category", "")
    return normalized


def generate_recommendations(student: Mapping[str, Any]) -> Dict[str, Any]:
    """Return a recommendation payload for a single student using README rules."""
    student_record = _normalize_student_record(student)
    recommendations: List[Dict[str, str]] = []

    attendance_pct = float(student_record.get("attendance_pct", 0))
    internal_marks = float(student_record.get("internal_marks", 0))
    cp_ncp = str(student_record.get("cp_ncp", "")).upper()
    previous_backlogs = int(student_record.get("previous_backlogs", 0))
    risk_category = str(student_record.get("risk_category", "")).strip()

    if attendance_pct < 60:
        recommendations.append(
            _build_recommendation(
                "High",
                "Attendance",
                "Attendance is critically low. Attend all remaining classes immediately.",
            )
        )
    elif attendance_pct < 75:
        recommendations.append(
            _build_recommendation(
                "Medium",
                "Attendance",
                "Attendance is below required 75%. Improve to avoid debarment.",
            )
        )

    if internal_marks < 40:
        recommendations.append(
            _build_recommendation(
                "High",
                "Assessment",
                "Internal marks are very low. Focus on assignments and internal exams.",
            )
        )
    elif internal_marks < 60:
        recommendations.append(
            _build_recommendation(
                "Medium",
                "Assessment",
                "Marks are average. Target improvement in upcoming assessments.",
            )
        )

    if cp_ncp == "NCP":
        recommendations.append(
            _build_recommendation(
                "Medium",
                "Status",
                "NCP status detected. Attend remedial sessions and consult your faculty.",
            )
        )

    if risk_category == "High Risk":
        recommendations.append(
            _build_recommendation(
                "High",
                "Intervention",
                "Immediate faculty intervention recommended. Schedule a counselling session.",
            )
        )

    if previous_backlogs > 2:
        recommendations.append(
            _build_recommendation(
                "Medium",
                "Academic Support",
                "Multiple backlogs detected. Consider academic counselling.",
            )
        )

    return {
        "student_id": student_record.get("student_id", ""),
        "risk_category": risk_category,
        "recommendations": recommendations,
    }


def generate_recommendations_batch(students: Sequence[Mapping[str, Any]]) -> List[Dict[str, Any]]:
    """Return recommendation payloads for multiple students."""
    return [generate_recommendations(student) for student in students]


if __name__ == "__main__":
    sample_student = {
        "student_id": "STU001",
        "attendance_pct": 55,
        "internal_marks": 35,
        "cp_ncp": "NCP",
        "previous_backlogs": 3,
        "risk_category": "High Risk",
    }
    print(generate_recommendations(sample_student))
