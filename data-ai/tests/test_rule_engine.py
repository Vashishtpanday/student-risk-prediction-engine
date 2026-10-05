import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[0] / ".." / "recommendation_engine" / "rule_engine.py"
SPEC = importlib.util.spec_from_file_location("rule_engine", MODULE_PATH)
rule_engine = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(rule_engine)


def test_generate_recommendations_returns_expected_structure():
    student = {
        "student_id": "STU001",
        "attendance_pct": 55,
        "internal_marks": 35,
        "cp_ncp": "NCP",
        "previous_backlogs": 3,
        "risk_category": "High Risk",
    }

    result = rule_engine.generate_recommendations(student)

    assert result["student_id"] == "STU001"
    assert result["risk_category"] == "High Risk"
    assert len(result["recommendations"]) >= 3
    assert result["recommendations"][0]["category"] == "Attendance"
