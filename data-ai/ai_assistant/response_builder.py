"""Build JSON responses for assistant queries."""

from __future__ import annotations

from typing import Any, Dict, List


def build_response(intent: str, data: List[Dict[str, Any]], count: int, message: str) -> Dict[str, Any]:
    """Build a consistent JSON response payload."""
    return {
        "success": True,
        "intent": intent,
        "message": message,
        "count": count,
        "results": data,
    }
