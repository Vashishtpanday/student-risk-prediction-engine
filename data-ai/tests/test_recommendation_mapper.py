import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[0] / ".." / "recommendation_engine" / "recommendation_mapper.py"
SPEC = importlib.util.spec_from_file_location("recommendation_mapper", MODULE_PATH)
recommendation_mapper = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(recommendation_mapper)


def test_map_recommendations_orders_by_priority_and_returns_json_ready_payload():
    payload = {
        "student_id": "STU001",
        "risk_category": "High Risk",
        "recommendations": [
            {"priority": "Medium", "category": "Status", "message": "NCP"},
            {"priority": "High", "category": "Attendance", "message": "Low attendance"},
            {"priority": "Low", "category": "Support", "message": "Support"},
        ],
    }

    result = recommendation_mapper.map_recommendations(payload)

    assert result["student_id"] == "STU001"
    assert [item["priority"] for item in result["recommendations"]] == ["High", "Medium", "Low"]
    assert result["recommendations"][0]["category"] == "Attendance"
    assert recommendation_mapper.to_json(result)
