"""Format explainability results into the JSON structure expected by the project."""

from __future__ import annotations

from typing import Any, Dict, Mapping, Optional


FEATURE_LABELS = {
    "attendance_pct": "attendance",
    "internal_marks": "internal marks",
    "cp_ncp": "CP/NCP status",
    "previous_backlogs": "previous backlogs",
}


def _build_message(feature_name: str, contribution_pct: float, impact: str) -> str:
    """Create a short human-readable message for a contributing factor."""
    label = FEATURE_LABELS.get(feature_name, feature_name)
    if impact == "positive":
        return f"{label.title()} is supporting a lower-risk outcome"
    if impact == "negative":
        if feature_name == "attendance_pct":
            return "Low attendance is the primary risk factor"
        if feature_name == "internal_marks":
            return "Below average internal marks increasing risk"
        if feature_name == "cp_ncp":
            return "NCP status adds to academic risk"
        if feature_name == "previous_backlogs":
            return "Previous backlogs are increasing academic risk"
    return f"{label.title()} is influencing the prediction"


def format_explanation(
    explanation: Mapping[str, Any],
    student_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Convert SHAP or feature-importance results into the required JSON schema."""
    payload: Dict[str, Any] = {
        "student_id": student_id or str(explanation.get("student_id", "")),
        "contributing_factors": {},
    }

    raw_factors = explanation.get("contributing_factors", {})
    if isinstance(raw_factors, dict):
        for feature_name, details in raw_factors.items():
            if not isinstance(details, dict):
                continue

            contribution_pct = details.get("contribution_pct")
            impact = details.get("impact", "negative")
            if contribution_pct is None:
                continue

            payload["contributing_factors"][feature_name] = {
                "contribution_pct": int(round(float(contribution_pct))),
                "impact": str(impact).lower(),
                "message": details.get("message") or _build_message(feature_name, float(contribution_pct), str(impact).lower()),
            }

    return payload


if __name__ == "__main__":
    sample = {
        "student_id": "STU001",
        "contributing_factors": {
            "attendance_pct": {
                "contribution_pct": 58,
                "impact": "negative",
                "message": "Low attendance is the primary risk factor",
            },
            "internal_marks": {
                "contribution_pct": 32,
                "impact": "negative",
                "message": "Below average internal marks increasing risk",
            },
            "cp_ncp": {
                "contribution_pct": 10,
                "impact": "negative",
                "message": "NCP status adds to academic risk",
            },
        },
    }
    print(format_explanation(sample))
