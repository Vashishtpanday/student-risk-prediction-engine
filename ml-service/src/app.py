from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from pathlib import Path


# ---------------------------------------------------------
# Flask application
# ---------------------------------------------------------

app = Flask(__name__)
CORS(app)


# ---------------------------------------------------------
# Load trained model
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "student_risk_model.pkl"

model_package = joblib.load(MODEL_PATH)

model = model_package["model"]
FEATURES = model_package["features"]
MODEL_NAME = model_package["model_name"]


# ---------------------------------------------------------
# Validation helper
# ---------------------------------------------------------

def validate_student_data(data):
    """
    Validate and convert incoming student data.
    """

    if not isinstance(data, dict):
        return False, "Request body must be a JSON object."

    missing = [feature for feature in FEATURES if feature not in data]

    if missing:
        return False, f"Missing required fields: {missing}"

    try:
        attendance = float(data["attendance_pct"])
        internal_marks = float(data["internal_marks"])
        semester = int(data["semester"])
        previous_backlogs = int(data["previous_backlogs"])
    except (ValueError, TypeError):
        return False, "Numeric fields contain invalid values."

    if not 0 <= attendance <= 100:
        return False, "attendance_pct must be between 0 and 100."

    if not 0 <= internal_marks <= 100:
        return False, "internal_marks must be between 0 and 100."

    if not 1 <= semester <= 8:
        return False, "semester must be between 1 and 8."

    if not 0 <= previous_backlogs <= 5:
        return False, "previous_backlogs must be between 0 and 5."

    return True, None


# ---------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "healthy",
        "service": "student-risk-ml-service",
        "model": MODEL_NAME,
        "features": FEATURES
    })


# ---------------------------------------------------------
# Prediction endpoint
# ---------------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json(silent=True)

    valid, error = validate_student_data(data)

    if not valid:
        return jsonify({
            "success": False,
            "error": error
        }), 400

    input_data = pd.DataFrame([{
        feature: data[feature]
        for feature in FEATURES
    }])

    prediction = model.predict(input_data)[0]

    response = {
        "success": True,
        "prediction": {
            "risk_category": prediction
        },
        "model": MODEL_NAME,
        "input": {
            feature: data[feature]
            for feature in FEATURES
        }
    }

    # Include probability/confidence when available
    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(input_data)[0]

        classes = model.classes_

        probability_data = {
            str(cls): round(float(prob), 4)
            for cls, prob in zip(classes, probabilities)
        }

        response["prediction"]["probabilities"] = probability_data
        response["prediction"]["confidence"] = round(
            float(max(probabilities)),
            4
        )

    return jsonify(response)


# ---------------------------------------------------------
# Batch prediction endpoint
# ---------------------------------------------------------

@app.route("/batch-predict", methods=["POST"])
def batch_predict():

    data = request.get_json(silent=True)

    if not isinstance(data, list):
        return jsonify({
            "success": False,
            "error": "Request body must be a JSON array."
        }), 400

    if len(data) == 0:
        return jsonify({
            "success": False,
            "error": "Student list cannot be empty."
        }), 400

    results = []

    for index, student in enumerate(data):

        valid, error = validate_student_data(student)

        if not valid:
            results.append({
                "index": index,
                "success": False,
                "error": error
            })
            continue

        input_data = pd.DataFrame([{
            feature: student[feature]
            for feature in FEATURES
        }])

        prediction = model.predict(input_data)[0]

        result = {
            "index": index,
            "success": True,
            "risk_category": prediction
        }

        if hasattr(model, "predict_proba"):

            probabilities = model.predict_proba(input_data)[0]

            result["confidence"] = round(
                float(max(probabilities)),
                4
            )

        results.append(result)

    return jsonify({
        "success": True,
        "count": len(data),
        "results": results
    })


# ---------------------------------------------------------
# Application entry point
# ---------------------------------------------------------

if __name__ == "__main__":

    print("=" * 60)
    print("STUDENT RISK PREDICTION ML SERVICE")
    print("=" * 60)
    print(f"Model: {MODEL_NAME}")
    print(f"Features: {FEATURES}")
    print("Server: http://localhost:5001")
    print("=" * 60)

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False,
        use_reloader=False
    )