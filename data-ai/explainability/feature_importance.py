"""Compute and visualize feature importance for student risk prediction models."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Union

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.base import BaseEstimator


DEFAULT_FEATURES = ["attendance_pct", "internal_marks", "cp_ncp", "previous_backlogs"]


def prepare_features(
    data: Union[pd.DataFrame, Sequence[dict]],
    categorical_columns: Optional[Sequence[str]] = None,
) -> pd.DataFrame:
    """Prepare a dataframe for model inference by encoding categorical values."""
    if isinstance(data, pd.DataFrame):
        frame = data.copy()
    else:
        frame = pd.DataFrame(list(data))

    if categorical_columns is None:
        categorical_columns = []

    for column in categorical_columns:
        if column in frame.columns:
            frame[column] = frame[column].astype("string").str.strip()
            frame[column] = frame[column].fillna("")
            frame[column] = frame[column].replace({"CP": 1, "NCP": 0})

    return frame


def _resolve_model_path(model_path: Optional[Union[str, Path]]) -> Optional[Path]:
    """Resolve a model path from a provided argument or the default project structure."""
    if model_path is not None:
        return Path(model_path)

    candidates = [
        Path(__file__).resolve().parents[1] / "models" / "student_risk_model.joblib",
        Path(__file__).resolve().parents[1] / "artifacts" / "student_risk_model.joblib",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def load_model(model_path: Optional[Union[str, Path]] = None) -> BaseEstimator:
    """Load a trained scikit-learn model from disk."""
    resolved_path = _resolve_model_path(model_path)
    if resolved_path is None or not resolved_path.exists():
        raise FileNotFoundError(
            "No trained model was found. Provide a model_path or place a joblib model in the expected artifacts folder."
        )

    import joblib

    return joblib.load(resolved_path)


def _create_output_directory(output_dir: Optional[Union[str, Path]]) -> Path:
    """Create the output directory for feature importance charts if needed."""
    directory = Path(output_dir) if output_dir is not None else Path(__file__).resolve().parents[1] / "outputs" / "shap_plots"
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def compute_feature_importance(
    model: BaseEstimator,
    data: Union[pd.DataFrame, Sequence[dict]],
    feature_columns: Optional[Sequence[str]] = None,
    categorical_columns: Optional[Sequence[str]] = None,
    output_dir: Optional[Union[str, Path]] = None,
    model_name: str = "student_risk_model",
) -> Dict[str, Any]:
    """Compute feature importance values and save a bar chart."""
    if isinstance(data, pd.DataFrame):
        frame = data.copy()
    else:
        frame = pd.DataFrame(list(data))

    if feature_columns is None:
        feature_columns = [column for column in DEFAULT_FEATURES if column in frame.columns]

    prepared = prepare_features(frame[feature_columns], categorical_columns=categorical_columns)

    if not hasattr(model, "feature_importances_"):
        raise AttributeError("The provided model does not support feature_importances_.")

    importances = model.feature_importances_
    feature_names = list(prepared.columns)

    importance_frame = pd.DataFrame(
        {"feature": feature_names, "importance": importances}
    )
    importance_frame = importance_frame.sort_values("importance", ascending=False).reset_index(drop=True)
    importance_frame["importance_pct"] = importance_frame["importance"] * 100

    output_directory = _create_output_directory(output_dir)
    plot_path = output_directory / f"{model_name}_feature_importance.png"

    plt.figure(figsize=(8, 5))
    plt.barh(importance_frame["feature"], importance_frame["importance_pct"], color="steelblue")
    plt.xlabel("Importance (%)")
    plt.title(f"Feature Importance for {model_name}")
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig(plot_path)
    plt.close()

    ranked_features = []
    for _, row in importance_frame.iterrows():
        ranked_features.append(
            {
                "feature": row["feature"],
                "importance": round(float(row["importance"]), 6),
                "importance_pct": round(float(row["importance_pct"]), 2),
            }
        )

    return {
        "ranked_features": ranked_features,
        "plot_path": str(plot_path),
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Compute feature importance for student risk prediction")
    parser.add_argument("--model-path", default=None, help="Path to a trained joblib model")
    parser.add_argument("--input-csv", default=None, help="Optional CSV of student records used for feature importance")
    parser.add_argument("--output-dir", default=None, help="Directory to save the feature importance chart")
    parser.add_argument("--model-name", default="student_risk_model", help="Label prefix for the saved chart")
    args = parser.parse_args()

    if args.input_csv is None:
        raise SystemExit("Please provide an input CSV with --input-csv to compute feature importance.")

    model = load_model(args.model_path)
    data = pd.read_csv(args.input_csv)
    compute_feature_importance(model=model, data=data, feature_columns=DEFAULT_FEATURES, output_dir=args.output_dir, model_name=args.model_name)
