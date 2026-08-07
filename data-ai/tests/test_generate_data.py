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

    for row in rows:
        assert row["student_id"].startswith("STU")
        assert row["name"]
        assert row["department"] in {"CSE", "ECE", "EEE", "MECH", "AI&DS"}
        assert 1 <= int(row["semester"]) <= 8
        assert 0 <= int(row["attendance_pct"]) <= 100
        assert 0 <= int(row["internal_marks"]) <= 100
        assert row["cp_ncp"] in {"CP", "NCP"}
        assert 0 <= int(row["previous_backlogs"]) <= 5
