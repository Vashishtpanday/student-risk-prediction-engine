import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[0] / ".." / "ai_assistant" / "assistant_api.py"
SPEC = importlib.util.spec_from_file_location("assistant_api", MODULE_PATH)
assistant_api = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(assistant_api)


def test_query_endpoint_returns_json_for_high_risk_students():
    client = assistant_api.app.test_client()
    response = client.post(
        "/query",
        json={"query": "Show high risk students in CSE"},
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["intent"] == "high_risk_students"
    assert payload["count"] >= 0
