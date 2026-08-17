import csv
import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[0] / ".." / "dataset" / "synthetic" / "generate_data.py"
SPEC = importlib.util.spec_from_file_location("generate_data", MODULE_PATH)
generate_data = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(generate_data)


def test_generate_dataset_creates_valid_student_records(tmp_path):
    output_path = tmp_path / "student_data_raw.csv"

    records = generate_data.generate_dataset(output_path=output_path, count=1000)

    assert len(records) == 1000
    assert len({record["student_id"] for record in records}) == 1000
    assert len({record["name"] for record in records}) == 1000

    with output_path.open("r", encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))

    assert len(rows) == 1000
    assert rows[0].keys() == {
        "student_id",
        "name",
        "department",
        "semester",
        "attendance_pct",
        "internal_marks",
        "cp_ncp",
        "previous_backlogs",
        "risk_category",
    }

    risk_categories = set()
    for row in rows:
        assert row["student_id"].startswith("STU")
        assert row["name"]
        assert row["department"] in {"CSE", "ECE", "EEE", "MECH", "AI&DS"}
        
        semester = int(row["semester"])
        attendance = int(row["attendance_pct"])
        internal_marks = int(row["internal_marks"])
        backlogs = int(row["previous_backlogs"])
        cp_ncp = row["cp_ncp"]
        risk = row["risk_category"]

        assert 1 <= semester <= 8
        assert 0 <= attendance <= 100
        assert 1 <= internal_marks <= 100
        assert cp_ncp == "CP"
        assert 0 <= backlogs <= 5
        if semester == 1:
            assert backlogs == 0

        risk_categories.add(risk)

    assert {"Low Risk", "Moderate Risk", "High Risk"}.issubset(risk_categories)
