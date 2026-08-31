from pathlib import Path
import sys

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "student_data.csv"
MODEL_PATH = BASE_DIR / "models" / "student_risk_model.pkl"


def main():

    print("=" * 60)
    print("STUDENT RISK MODEL EVALUATION")
    print("=" * 60)

    # Load dataset
    df = pd.read_csv(DATA_PATH)

    # Load model package
    model_package = joblib.load(MODEL_PATH)

    model = model_package["model"]
    features = model_package["features"]
    model_name = model_package["model_name"]

    print(f"\nModel: {model_name}")
    print(f"Features: {features}")
    print(f"Dataset shape: {df.shape}")

    # Prepare data
    X = df[features]
    y = df["risk_category"]

    # Same split used during model training
    _, X_test, _, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # Predictions
    predictions = model.predict(X_test)

    # Accuracy
    accuracy = accuracy_score(y_test, predictions)

    # Precision, recall and F1
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    print("\n" + "=" * 60)
    print("OVERALL METRICS")
    print("=" * 60)

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    print("\n" + "=" * 60)
    print("CLASSIFICATION REPORT")
    print("=" * 60)

    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    print("=" * 60)
    print("CONFUSION MATRIX")
    print("=" * 60)

    labels = sorted(y.unique())

    matrix = confusion_matrix(
        y_test,
        predictions,
        labels=labels
    )

    matrix_df = pd.DataFrame(
        matrix,
        index=[f"Actual {label}" for label in labels],
        columns=[f"Predicted {label}" for label in labels]
    )

    print(matrix_df)

    print("\n" + "=" * 60)
    print("EVALUATION COMPLETED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    main()