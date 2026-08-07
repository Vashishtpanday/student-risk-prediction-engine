import importlib.util
from pathlib import Path

import pandas as pd


MODULE_PATH = Path(__file__).resolve().parents[0] / ".." / "dataset" / "synthetic" / "clean_data.py"
SPEC = importlib.util.spec_from_file_location("clean_data", MODULE_PATH)
clean_data = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(clean_data)


def test_clean_dataset_handles_duplicates_and_invalid_values(tmp_path):
    input_path = tmp_path / "student_data_raw.csv"
    output_path = tmp_path / "student_data_cleaned.csv"

    pd.DataFrame(
        [
            {
                "student_id": "STU0001",
                "name": " Alice Smith ",
                "department": "CSE",
                "semester": "2",
                "attendance_pct": "85",
                "internal_marks": "78",
                "cp_ncp": "CP",
                "previous_backlogs": "0",
                "risk_category": "Low Risk",
            },
            {
                "student_id": "STU0001",
                "name": "Alice Smith",
                "department": "CSE",
                "semester": "2",
                "attendance_pct": "85",
                "internal_marks": "78",
                "cp_ncp": "CP",
                "previous_backlogs": "0",
                "risk_category": "Low Risk",
            },
            {
                "student_id": "STU0002",
                "name": "",
                "department": "INVALID",
                "semester": "9",
                "attendance_pct": "120",
                "internal_marks": "-5",
                "cp_ncp": "",
                "previous_backlogs": "-1",
                "risk_category": "High Risk",
            },
            {
                "student_id": "STU0003",
                "name": "Bob Jones",
                "department": "ECE",
                "semester": "1",
                "attendance_pct": "70",
                "internal_marks": "55",
                "cp_ncp": "NCP",
                "previous_backlogs": "2",
                "risk_category": "Moderate Risk",
            },
        ]
    ).to_csv(input_path, index=False)

    summary = clean_data.clean_dataset(input_path=input_path, output_path=output_path)

    assert output_path.exists()
    cleaned_df = pd.read_csv(output_path)

    assert len(cleaned_df) == 3
    assert cleaned_df["student_id"].is_unique
    assert cleaned_df["name"].is_unique
    assert cleaned_df["department"].isin(["CSE", "ECE", "EEE", "MECH", "AI&DS"]).all()
    assert (cleaned_df["attendance_pct"] >= 0).all() and (cleaned_df["attendance_pct"] <= 100).all()
    assert (cleaned_df["internal_marks"] >= 0).all() and (cleaned_df["internal_marks"] <= 100).all()
    assert (cleaned_df["semester"] >= 1).all() and (cleaned_df["semester"] <= 8).all()
    assert (cleaned_df["previous_backlogs"] >= 0).all()
    assert (cleaned_df.loc[cleaned_df["semester"] == 1, "previous_backlogs"] == 0).all()
    assert summary["rows_processed"] == 4
    assert summary["rows_removed"] >= 1
