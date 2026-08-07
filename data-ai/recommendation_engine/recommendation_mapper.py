"""Map recommendation-engine output to the backend-friendly JSON format."""

from __future__ import annotations

import json
from typing import Any, Dict, List, Mapping, Sequence


PRIORITY_ORDER = {"High": 0, "Medium": 1, "Low": 2}


def _normalize_priority(priority: str) -> str:
    """Normalize priority values to the README-friendly format."""
    normalized = str(priority or "").strip().title()
    if normalized not in PRIORITY_ORDER:
        return "Low"
    return normalized


def map_recommendations(payload: Mapping[str, Any]) -> Dict[str, Any]:
    """Convert rule-engine output into the final JSON structure expected by the backend."""
    recommendations = payload.get("recommendations", []) or []
    ordered_recommendations: List[Dict[str, str]] = []

    for item in recommendations:
        if not isinstance(item, Mapping):
            continue
        ordered_recommendations.append(
            {
                "priority": _normalize_priority(item.get("priority", "Low")),
                "category": str(item.get("category", "General")).strip() or "General",
                "message": str(item.get("message", "")).strip(),
            }
        )

    ordered_recommendations.sort(
        key=lambda item: PRIORITY_ORDER.get(item["priority"], 99)
    )

    return {
        "student_id": str(payload.get("student_id", "")).strip(),
        "risk_category": str(payload.get("risk_category", "")).strip(),
        "recommendations": ordered_recommendations,
    }


def map_recommendations_batch(payloads: Sequence[Mapping[str, Any]]) -> List[Dict[str, Any]]:
    """Map a batch of recommendation payloads."""
    return [map_recommendations(payload) for payload in payloads]


def to_json(payload: Mapping[str, Any]) -> str:
    """Serialize the mapped payload to valid JSON."""
    return json.dumps(payload, indent=2)
