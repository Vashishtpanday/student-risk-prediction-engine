"""Flask API for faculty-facing student assistant queries."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ai_assistant.intent_classifier import classify_query
from ai_assistant.response_builder import build_response


app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend (Port 5173)


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

    df = pd.read_csv(DATA_PATH)

    # Normalize possible alternate column names
    lower_map = {c.lower().strip(): c for c in df.columns}
    rename = {}
    wanted = {
        "student_id": ["student_id", "studentid"],
        "name": ["name"],
        "department": ["department", "dept"],
        "semester": ["semester", "sem"],
        "attendance_pct": ["attendance_pct", "attendance", "attendancepercentage"],
        "internal_marks": ["internal_marks", "marks", "internalmarksaverage"],
        "cp_ncp": ["cp_ncp", "cpncp", "cpncpstatus"],
        "previous_backlogs": ["previous_backlogs", "backlogs"],
        "risk_category": ["risk_category", "risk", "latestrisklevel", "risklevel"],
    }
    for std, options in wanted.items():
        if std in df.columns:
            continue
        for opt in options:
            if opt in lower_map:
                rename[lower_map[opt]] = std
                break
    if rename:
        df = df.rename(columns=rename)

    return df


DATASET = _load_dataset()


def _norm_risk(val: Any) -> str:
    s = str(val or "").strip().lower()
    if "high" in s:
        return "High Risk"
    if "mod" in s or "med" in s:
        return "Moderate Risk"
    if "low" in s:
        return "Low Risk"
    return str(val or "Unknown")


def _contains_risk(series: pd.Series, key: str) -> pd.Series:
    return series.astype(str).str.lower().str.contains(key, na=False)


def _filter_students(query: str) -> Dict[str, Any]:
    """Filter dataset based on parsed intent + department/semester filters."""
    parsed = classify_query(query)
    intent = parsed.get("intent") or "unknown"
    department = parsed.get("department")
    semester = parsed.get("semester")
    raw_query = (parsed.get("raw_query") or query or "").strip()

    df = DATASET.copy()

    if df.empty:
        return {
            "intent": intent,
            "message": "No student records available.",
            "count": 0,
            "results": [],
        }

    # numeric safety
    for col in ["attendance_pct", "internal_marks", "previous_backlogs", "semester"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # department filter
    if department and "department" in df.columns:
        df = df[df["department"].astype(str).str.upper() == str(department).upper()]

    # semester filter
    if semester and "semester" in df.columns:
        df = df[df["semester"].astype(str) == str(semester)]

    # intent filters
    if intent == "high_risk_students" and "risk_category" in df.columns:
        df = df[_contains_risk(df["risk_category"], "high")]

    elif intent == "moderate_risk_students" and "risk_category" in df.columns:
        df = df[_contains_risk(df["risk_category"], "mod") | _contains_risk(df["risk_category"], "med")]

    elif intent == "low_risk_students" and "risk_category" in df.columns:
        df = df[_contains_risk(df["risk_category"], "low")]

    elif intent == "students_with_backlogs" and "previous_backlogs" in df.columns:
        df = df[df["previous_backlogs"].fillna(0) > 0]

    elif intent == "ncp_students" and "cp_ncp" in df.columns:
        df = df[df["cp_ncp"].astype(str).str.upper().str.contains("NCP", na=False)]

    elif intent == "cp_students" and "cp_ncp" in df.columns:
        df = df[df["cp_ncp"].astype(str).str.upper().eq("CP")]

    elif intent == "attendance_below_75" and "attendance_pct" in df.columns:
        df = df[df["attendance_pct"].fillna(100) < 75]

    elif intent == "low_marks_students" and "internal_marks" in df.columns:
        df = df[df["internal_marks"].fillna(100) < 50]

    elif intent in ["summary", "all_students", "department_students"]:
        pass

    elif intent == "unknown":
        # Free-text fallback: try matching name / student_id
        q = raw_query.lower()
        mask = None
        if "name" in df.columns:
            mask = df["name"].astype(str).str.lower().str.contains(q, na=False)
        if "student_id" in df.columns:
            id_mask = df["student_id"].astype(str).str.lower().str.contains(q, na=False)
            mask = id_mask if mask is None else (mask | id_mask)

        if mask is not None and mask.any():
            df = df[mask]
            intent = "all_students"
        else:
            return {
                "intent": "unknown",
                "message": "Could not understand the query.",
                "count": 0,
                "results": [],
            }

    # Build result rows
    results = []
    for _, row in df.iterrows():
        results.append({
            "student_id": str(row.get("student_id", "")),
            "name": str(row.get("name", "")),
            "department": str(row.get("department", "")),
            "semester": int(row.get("semester", 0) if pd.notna(row.get("semester", 0)) else 0),
            "attendance_pct": float(row.get("attendance_pct", 0) if pd.notna(row.get("attendance_pct", 0)) else 0),
            "internal_marks": float(row.get("internal_marks", 0) if pd.notna(row.get("internal_marks", 0)) else 0),
            "cp_ncp": str(row.get("cp_ncp", "")),
            "previous_backlogs": int(row.get("previous_backlogs", 0) if pd.notna(row.get("previous_backlogs", 0)) else 0),
            "risk_category": _norm_risk(row.get("risk_category", "")),
        })

    message = "Query processed successfully."

    # Summary message
    if intent == "summary":
        total = len(results)
        high = sum(1 for r in results if "high" in r["risk_category"].lower())
        mod = sum(1 for r in results if "mod" in r["risk_category"].lower())
        low = sum(1 for r in results if "low" in r["risk_category"].lower())
        ncp = sum(1 for r in results if "ncp" in str(r.get("cp_ncp", "")).lower())
        low_att = sum(1 for r in results if float(r.get("attendance_pct", 100)) < 75)
        low_marks = sum(1 for r in results if float(r.get("internal_marks", 100)) < 50)
        backlogs = sum(1 for r in results if int(r.get("previous_backlogs", 0)) > 0)

        scope = []
        if department:
            scope.append(f"Department={department}")
        if semester:
            scope.append(f"Semester={semester}")
        scope_text = f" ({', '.join(scope)})" if scope else ""

        message = (
            f"Summary{scope_text} for {total} students:\n"
            f"• High Risk: {high}\n"
            f"• Moderate Risk: {mod}\n"
            f"• Low Risk: {low}\n"
            f"• NCP Status: {ncp}\n"
            f"• Attendance < 75%: {low_att}\n"
            f"• Marks < 50: {low_marks}\n"
            f"• With Backlogs: {backlogs}"
        )

    return {
        "intent": intent,
        "message": message,
        "count": len(results),
        "results": results,
    }


@app.route("/health", methods=["GET"])
def health() -> Any:
    return jsonify({
        "status": "ok",
        "records": int(len(DATASET)),
    })


@app.route("/query", methods=["POST"])
def query() -> Any:
    payload = request.get_json(silent=True) or {}
    query_text = (
        payload.get("query")
        or payload.get("message")
        or payload.get("text")
        or ""
    )

    if not str(query_text).strip():
        return jsonify({
            "success": False,
            "error": "A non-empty 'query' field is required.",
            "answer": "Please type a question first.",
        }), 400

    response = _filter_students(str(query_text))
    return jsonify(build_response(
        response["intent"],
        response["results"],
        response["count"],
        response["message"],
    ))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)