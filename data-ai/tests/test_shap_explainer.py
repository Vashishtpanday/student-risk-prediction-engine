import importlib.util
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier


MODULE_PATH = Path(__file__).resolve().parents[0] / ".." / "explainability" / "shap_explainer.py"
SPEC = importlib.util.spec_from_file_location("shap_explainer", MODULE_PATH)
shap_explainer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(shap_explainer)


def test_explain_predictions_returns_feature_contributions(tmp_path):
    data = pd.DataFrame(
        [
            {"attendance_pct": 85, "internal_marks": 78, "previous_backlogs": 0, "cp_ncp": "CP", "risk_category": "Low Risk"},
            {"attendance_pct": 55, "internal_marks": 35, "previous_backlogs": 3, "cp_ncp": "NCP", "risk_category": "High Risk"},
            {"attendance_pct": 72, "internal_marks": 60, "previous_backlogs": 1, "cp_ncp": "CP", "risk_category": "Moderate Risk"},
            {"attendance_pct": 61, "internal_marks": 45, "previous_backlogs": 2, "cp_ncp": "NCP", "risk_category": "High Risk"},
        ]
    )

    model = RandomForestClassifier(n_estimators=10, random_state=0)
    feature_columns = ["attendance_pct", "internal_marks", "previous_backlogs", "cp_ncp"]
    prepared = shap_explainer.prepare_features(data[feature_columns], categorical_columns=["cp_ncp"])
    model.fit(prepared, data["risk_category"])

    result = shap_explainer.explain_dataset(
        model=model,
        data=data[feature_columns],
        feature_columns=prepared.columns.tolist(),
        categorical_columns=["cp_ncp"],
        output_dir=tmp_path,
        model_name="test_model",
    )

    assert set(["attendance_pct", "internal_marks", "cp_ncp", "previous_backlogs"]).issubset(result["feature_contributions"].keys())
    assert (tmp_path / "test_model_summary_plot.png").exists()
    assert (tmp_path / "test_model_waterfall_0.png").exists()
