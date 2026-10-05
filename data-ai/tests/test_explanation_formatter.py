import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[0] / ".." / "explainability" / "explanation_formatter.py"
SPEC = importlib.util.spec_from_file_location("explanation_formatter", MODULE_PATH)
formatter = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(formatter)


def test_format_explanation_matches_required_schema():
    explanation = {
        "student_id": "STU001",
        "contributing_factors": {
            "attendance_pct": {"contribution_pct": 58, "impact": "negative", "message": "Low attendance is the primary risk factor"},
            "internal_marks": {"contribution_pct": 32, "impact": "negative", "message": "Below average internal marks increasing risk"},
            "cp_ncp": {"contribution_pct": 10, "impact": "negative", "message": "NCP status adds to academic risk"},
        },
    }

    result = formatter.format_explanation(explanation)

    assert result["student_id"] == "STU001"
    assert set(result["contributing_factors"].keys()) == {"attendance_pct", "internal_marks", "cp_ncp"}
    assert result["contributing_factors"]["attendance_pct"]["impact"] == "negative"
    assert result["contributing_factors"]["attendance_pct"]["contribution_pct"] == 58
