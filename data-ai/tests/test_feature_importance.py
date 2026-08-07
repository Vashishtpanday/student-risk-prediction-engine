import importlib.util
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier


MODULE_PATH = Path(__file__).resolve().parents[0] / ".." / "explainability" / "feature_importance.py"
SPEC = importlib.util.spec_from_file_location("feature_importance", MODULE_PATH)
feature_importance = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(feature_importance)


def test_compute_feature_importance_returns_ranked_features(tmp_path):
    data = pd.DataFrame(
        [
            {"attendance_pct": 85, "internal_marks": 78, "previous_backlogs": 0, "cp_ncp": "CP", "risk_category": "Low Risk"},
            {"attendance_pct": 55, "internal_marks": 35, "previous_backlogs": 3, "cp_ncp": "NCP", "risk_category": "High Risk"},
            {"attendance_pct": 72, "internal_marks": 60, "previous_backlogs": 1, "cp_ncp": "CP", "risk_category": "Moderate Risk"},
            {"attendance_pct": 61, "internal_marks": 45, "previous_backlogs": 2, "cp_ncp": "NCP", "risk_category": "High Risk"},
        ]
    )

    model = RandomForestClassifier(n_estimators=20, random_state=0)
    feature_columns = ["attendance_pct", "internal_marks", "previous_backlogs", "cp_ncp"]
    encoded = feature_importance.prepare_features(data[feature_columns], categorical_columns=["cp_ncp"])
    model.fit(encoded, data["risk_category"])

    result = feature_importance.compute_feature_importance(
        model=model,
        data=data[feature_columns],
        feature_columns=feature_columns,
        categorical_columns=["cp_ncp"],
        output_dir=tmp_path,
        model_name="test_model",
    )

    assert len(result["ranked_features"]) >= 2
    assert (tmp_path / "test_model_feature_importance.png").exists()
