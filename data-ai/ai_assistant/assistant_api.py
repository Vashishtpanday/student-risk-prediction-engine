"""Flask API for faculty-facing student assistant queries."""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from flask import Flask, jsonify, request

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ai_assistant.intent_classifier import classify_query
from ai_assistant.response_builder import build_response


app = Flask(__name__)


DATA_PATH = Path(__file__).resolve().parents[1] / "dataset" / "processed" / "student_data_cleaned.csv"


def _load_dataset() -> pd.DataFrame:
    """Load the processed dataset if it exists; otherwise return an empty frame."""
    if not DATA_PATH.exists():
        return pd.DataFrame(columns=[
            "student_id",
            "name",
            "department",
            "semester",
            "attendance_pct",
            "internal_marks",
            "cp_ncp",
            "previous_backlogs",
            "risk_category",
        ])
    return pd.read_csv(DATA_PATH)


DATASET = _load_dataset()


def _filter_students(query: str) -> Dict[str, Any]:
    """Filter the dataset using keyword matching based on the incoming faculty query."""
    parsed = classify_query(query)
    intent = parsed.get("intent") or "unknown"
    department = parsed.get("department")
    semester = parsed.get("semester")

    df = DATASET.copy()

    if df.empty:
        return {
            "intent": intent,
            "message": "No student records available.",
            "count": 0,
            "results": [],
        }

    if department:
        df = df[df["department"].astype(str).str.upper() == department]

    if semester:
        df = df[df["semester"].astype(str) == semester]

    if intent == "high_risk_students":
        df = df[df["risk_category"].astype(str).str.lower() == "high risk"]
    elif intent == "students_with_backlogs":
        df = df[df["previous_backlogs"].astype(int) > 0]
    elif intent == "ncp_students":
        df = df[df["cp_ncp"].astype(str).str.upper() == "NCP"]
    elif intent == "attendance_below_75":
        df = df[df["attendance_pct"].astype(float) < 75]

    results = []
    for _, row in df.iterrows():
        results.append(
            {
                "student_id": str(row.get("student_id", "")),
                "name": str(row.get("name", "")),
                "department": str(row.get("department", "")),
                "semester": int(row.get("semester", 0)),
                "attendance_pct": float(row.get("attendance_pct", 0)),
                "risk_category": str(row.get("risk_category", "")),
            }
        )

    return {
        "intent": intent,
        "message": "Query processed successfully.",
        "count": len(results),
        "results": results,
    }


@app.route("/health", methods=["GET"])
def health() -> Any:
    """Simple health check endpoint."""
    return jsonify({"status": "ok"})


@app.route("/query", methods=["POST"])
def query() -> Any:
    """Handle faculty assistant queries and return a JSON response."""
    payload = request.get_json(silent=True) or {}
    query_text = payload.get("query") or ""

    if not query_text.strip():
        return jsonify({
            "success": False,
            "error": "A non-empty 'query' field is required.",
        }), 400

    response = _filter_students(query_text)
    return jsonify(build_response(
        response["intent"],
        response["results"],
        response["count"],
        response["message"],
    ))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)
