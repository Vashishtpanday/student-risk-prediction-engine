from pathlib import Path
import sys

import pytest


BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "src"

sys.path.insert(0, str(SRC_DIR))

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "healthy"
    assert data["service"] == "student-risk-ml-service"
    assert data["model"] == "Decision Tree"


def test_predict_high_risk(client):
    response = client.post(
        "/predict",
        json={
            "attendance_pct": 55,
            "internal_marks": 30,
            "semester": 5,
            "previous_backlogs": 2
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True
    assert data["prediction"]["risk_category"] == "High Risk"


def test_predict_low_risk(client):
    response = client.post(
        "/predict",
        json={
            "attendance_pct": 90,
            "internal_marks": 90,
            "semester": 3,
            "previous_backlogs": 0
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True
    assert data["prediction"]["risk_category"] == "Low Risk"


def test_predict_moderate_risk(client):
    response = client.post(
        "/predict",
        json={
            "attendance_pct": 70,
            "internal_marks": 55,
            "semester": 4,
            "previous_backlogs": 0
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True
    assert data["prediction"]["risk_category"] == "Moderate Risk"


def test_invalid_attendance(client):
    response = client.post(
        "/predict",
        json={
            "attendance_pct": 150,
            "internal_marks": 55,
            "semester": 4,
            "previous_backlogs": 0
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["success"] is False
    assert "attendance_pct" in data["error"]


def test_missing_required_field(client):
    response = client.post(
        "/predict",
        json={
            "attendance_pct": 70
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["success"] is False
    assert "Missing required fields" in data["error"]


def test_batch_predict(client):
    response = client.post(
        "/batch-predict",
        json=[
            {
                "attendance_pct": 55,
                "internal_marks": 30,
                "semester": 5,
                "previous_backlogs": 2
            },
            {
                "attendance_pct": 90,
                "internal_marks": 90,
                "semester": 3,
                "previous_backlogs": 0
            },
            {
                "attendance_pct": 70,
                "internal_marks": 55,
                "semester": 4,
                "previous_backlogs": 0
            }
        ]
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True
    assert data["count"] == 3
    assert data["results"][0]["risk_category"] == "High Risk"
    assert data["results"][1]["risk_category"] == "Low Risk"
    assert data["results"][2]["risk_category"] == "Moderate Risk"


def test_batch_predict_with_invalid_student(client):
    response = client.post(
        "/batch-predict",
        json=[
            {
                "attendance_pct": 150,
                "internal_marks": 55,
                "semester": 4,
                "previous_backlogs": 0
            },
            {
                "attendance_pct": 70,
                "internal_marks": 55,
                "semester": 4,
                "previous_backlogs": 0
            }
        ]
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True
    assert data["count"] == 2
    assert data["results"][0]["success"] is False
    assert data["results"][1]["success"] is True


def test_empty_batch(client):
    response = client.post(
        "/batch-predict",
        json=[]
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["success"] is False
    assert data["error"] == "Student list cannot be empty."