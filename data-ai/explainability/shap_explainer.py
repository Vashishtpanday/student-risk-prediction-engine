"""Generate SHAP-based explanations for student risk predictions."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Union

import matplotlib.pyplot as plt
import pandas as pd
import shap
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
    """Create the output directory for SHAP plots if needed."""
    directory = Path(output_dir) if output_dir is not None else Path(__file__).resolve().parents[1] / "outputs" / "shap_plots"
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def explain_dataset(
    model: BaseEstimator,
    data: Union[pd.DataFrame, Sequence[dict]],
    feature_columns: Optional[Sequence[str]] = None,
    categorical_columns: Optional[Sequence[str]] = None,
    output_dir: Optional[Union[str, Path]] = None,
    model_name: str = "student_risk_model",
) -> Dict[str, Any]:
    """Generate SHAP values and save relevant plots for a dataset."""
    if isinstance(data, pd.DataFrame):
        frame = data.copy()
    else:
        frame = pd.DataFrame(list(data))

    if feature_columns is None:
        feature_columns = [column for column in DEFAULT_FEATURES if column in frame.columns]

    prepared = prepare_features(frame[feature_columns], categorical_columns=categorical_columns)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(prepared)

    output_directory = _create_output_directory(output_dir)

    if isinstance(shap_values, list):
        shap_array = shap_values[1]
    else:
        shap_array = shap_values

    summary_path = output_directory / f"{model_name}_summary_plot.png"
    shap.summary_plot(shap_array, prepared, show=False)
    plt.savefig(summary_path)
    plt.close()

    for index in range(min(3, len(prepared))):
        waterfall_path = output_directory / f"{model_name}_waterfall_{index}.png"
        explanation = shap.Explanation(
            values=shap_array[index],
            base_values=explainer.expected_value[1],
            data=prepared.iloc[index],
            feature_names=prepared.columns.tolist(),
        )
        shap.plots.waterfall(explanation[0], show=False)
        plt.gcf().savefig(waterfall_path)
        plt.close()

    contributions: Dict[str, List[float]] = {}
    feature_names = prepared.columns.tolist()
    if isinstance(shap_array, list):
        shap_array = shap_array[0]

    if getattr(shap_array, "ndim", None) == 1:
        shap_array = shap_array.reshape(1, -1)
    elif getattr(shap_array, "ndim", None) == 2 and shap_array.shape[0] != len(prepared):
        shap_array = shap_array.T

    if getattr(shap_array, "ndim", None) > 2:
        shap_array = shap_array.reshape(shap_array.shape[0], -1)

    flattened = shap_array.reshape(len(prepared), -1)
    for column in DEFAULT_FEATURES:
        if column in prepared.columns:
            index = feature_names.index(column)
            values = []
            for row_index in range(flattened.shape[1]):
                values.append(float(flattened[index, row_index]))
            contributions[column] = values

    return {
        "shap_values": shap_array,
        "feature_contributions": contributions,
        "output_dir": str(output_directory),
    }


def explain_student_prediction(
    model: BaseEstimator,
    student_record: Union[pd.Series, dict],
    feature_columns: Optional[Sequence[str]] = None,
    categorical_columns: Optional[Sequence[str]] = None,
    output_dir: Optional[Union[str, Path]] = None,
    model_name: str = "student_risk_model",
) -> Dict[str, Any]:
    """Generate SHAP explanation for a single student record."""
    if isinstance(student_record, pd.Series):
        frame = pd.DataFrame([student_record.to_dict()])
    else:
        frame = pd.DataFrame([student_record])

    result = explain_dataset(
        model=model,
        data=frame[feature_columns] if feature_columns is not None else frame,
        feature_columns=feature_columns,
        categorical_columns=categorical_columns,
        output_dir=output_dir,
        model_name=model_name,
    )

    return result


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate SHAP explanations for student risk predictions")
    parser.add_argument("--model-path", default=None, help="Path to a trained joblib model")
    parser.add_argument("--input-csv", default=None, help="Optional CSV of student records to explain")
    parser.add_argument("--output-dir", default=None, help="Directory to save SHAP plots")
    parser.add_argument("--model-name", default="student_risk_model", help="Label prefix for saved plots")
    args = parser.parse_args()

    if args.input_csv is None:
        raise SystemExit("Please provide an input CSV with --input-csv to generate SHAP explanations.")

    model = load_model(args.model_path)
    data = pd.read_csv(args.input_csv)
    explain_dataset(model=model, data=data, feature_columns=DEFAULT_FEATURES, output_dir=args.output_dir, model_name=args.model_name)
