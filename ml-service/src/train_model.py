from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = BASE_DIR / "data" / "student_data.csv"
MODEL_PATH = BASE_DIR / "models" / "student_risk_model.pkl"


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "attendance_pct",
    "internal_marks",
    "semester",
    "previous_backlogs",
]

TARGET = "risk_category"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 60)
print("STUDENT RISK PREDICTION - MODEL TRAINING")
print("=" * 60)

print("\nLoading dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")


# ============================================================
# DATA VALIDATION
# ============================================================

required_columns = FEATURES + [TARGET]

missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing required columns: {missing_columns}"
    )

if df[required_columns].isnull().any().any():
    raise ValueError("Missing values found in required columns.")


# ============================================================
# FEATURES AND TARGET
# ============================================================

X = df[FEATURES]
y = df[TARGET]


print("\nFeatures used:")
for feature in FEATURES:
    print(f"  - {feature}")

print("\nTarget:")
print(f"  - {TARGET}")


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print("\nTraining samples:", len(X_train))
print("Testing samples :", len(X_test))


# ============================================================
# MODELS
# ============================================================

models = {

    "Logistic Regression": Pipeline([
        ("scaler", StandardScaler()),
        (
            "classifier",
            LogisticRegression(
                max_iter=5000,
                random_state=42,
            ),
        ),
    ]),

    "Decision Tree": DecisionTreeClassifier(
        max_depth=5,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    ),
}


# ============================================================
# TRAIN AND EVALUATE
# ============================================================

results = {}

best_model = None
best_model_name = None
best_f1 = -1


for name, model in models.items():

    print("\n")
    print("=" * 60)
    print(name)
    print("=" * 60)

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    precision = precision_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )

    results[name] = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0,
        )
    )

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    if f1 > best_f1:
        best_f1 = f1
        best_model = model
        best_model_name = name


# ============================================================
# MODEL SELECTION
# ============================================================

print("\n")
print("=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

for name, metrics in results.items():

    print(
        f"{name:20s} "
        f"Accuracy={metrics['accuracy']:.4f} "
        f"F1={metrics['f1']:.4f}"
    )


print("\nBest model:", best_model_name)


# ============================================================
# SAVE MODEL
# ============================================================

MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)

model_package = {
    "model": best_model,
    "features": FEATURES,
    "target": TARGET,
    "model_name": best_model_name,
    "results": results,
}

joblib.dump(
    model_package,
    MODEL_PATH,
)

print("\nModel saved to:")
print(MODEL_PATH)

print("\nTraining completed successfully.")