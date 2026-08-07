"""Generate a realistic synthetic student dataset for the risk prediction engine."""

from __future__ import annotations

import csv
import random
from pathlib import Path
from typing import Dict, List, Optional, Union

from faker import Faker


DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "AI&DS"]
DATASET_COLUMNS = [
    "student_id",
    "name",
    "department",
    "semester",
    "attendance_pct",
    "internal_marks",
    "cp_ncp",
    "previous_backlogs",
    "risk_category",
]


def _clamp(value: float, lower: float, upper: float) -> float:
    """Keep a numeric value within a bounded range."""
    return max(lower, min(upper, value))


def _build_student_id(index: int) -> str:
    """Create a zero-padded student ID in the required format."""
    return f"STU{index:04d}"


def _generate_unique_name(fake: Faker, used_names: set[str]) -> str:
    """Generate a full name that is not already present in the dataset."""
    for _ in range(10000):
        name = fake.name()
        if name not in used_names:
            used_names.add(name)
            return name

    raise RuntimeError("Unable to generate a unique student name after many attempts.")


def _sample_semester() -> int:
    """Pick a semester with a realistic distribution across the academic years."""
    weights = [0.14, 0.14, 0.13, 0.12, 0.11, 0.10, 0.08, 0.08]
    return random.choices(range(1, 9), weights=weights, k=1)[0]


def _infer_risk(attendance: float, internal_marks: float, backlogs: int) -> str:
    """Classify a student risk category according to the provided rules."""
    if attendance < 60 or internal_marks < 40 or backlogs > 2:
        return "High Risk"
    if attendance < 75 or internal_marks < 60:
        return "Moderate Risk"
    return "Low Risk"


def _sample_attendance(semester: int, department: str) -> int:
    """Generate attendance with a realistic relationship to semester and department."""
    base = 78 + random.uniform(-8, 8)

    if semester > 4:
        base -= 2.5
    if department in {"CSE", "AI&DS"}:
        base += 1.0
    if department == "EEE":
        base -= 0.5

    return int(_clamp(base, 40, 100))


def _sample_internal_marks(attendance: int, semester: int, department: str) -> int:
    """Generate internal marks that correlate with attendance and academic level."""
    base = attendance * 0.58 + random.uniform(-7, 7)

    if semester > 4:
        base -= 2.5
    if department in {"CSE", "AI&DS"}:
        base += 1.5
    if department == "MECH":
        base -= 0.8

    return int(_clamp(base, 20, 100))


def _sample_backlogs(semester: int, attendance: int, internal_marks: int) -> int:
    """Generate backlogs with a realistic dependence on academic performance."""
    if semester == 1:
        return 0

    poor_performance = 0.0
    if attendance < 70:
        poor_performance += 0.22
    if internal_marks < 50:
        poor_performance += 0.24
    if semester >= 6:
        poor_performance += 0.08

    backlog_prob = min(0.70, 0.06 + poor_performance)
    if random.random() < backlog_prob:
        backlog_count = 1
        if random.random() < backlog_prob * 0.55:
            backlog_count += 1
        if random.random() < backlog_prob * 0.25:
            backlog_count += 1
        return min(5, backlog_count)

    return 0


def validate_dataset(records: List[Dict[str, object]]) -> None:
    """Validate the generated dataset against the required business rules."""
    if len(records) != 1000:
        raise ValueError(f"Expected 1000 records but found {len(records)}")

    student_ids = [record["student_id"] for record in records]
    names = [record["name"] for record in records]

    if len(student_ids) != len(set(student_ids)):
        raise ValueError("Duplicate student_id values found")
    if len(names) != len(set(names)):
        raise ValueError("Duplicate student names found")

    for record in records:
        for field in DATASET_COLUMNS:
            if record.get(field) in (None, ""):
                raise ValueError(f"Missing value found in field '{field}'")

        attendance = int(record["attendance_pct"])
        internal_marks = int(record["internal_marks"])
        semester = int(record["semester"])
        backlogs = int(record["previous_backlogs"])

        if not 0 <= attendance <= 100:
            raise ValueError("Attendance values must be within 0-100")
        if not 0 <= internal_marks <= 100:
            raise ValueError("Internal marks must be within 0-100")
        if not 1 <= semester <= 8:
            raise ValueError("Semester values must be within 1-8")
        if not 0 <= backlogs <= 5:
            raise ValueError("Previous backlog values must be within 0-5")
        if semester == 1 and backlogs != 0:
            raise ValueError("Semester 1 students must have zero previous backlogs")


def write_dataset(records: List[Dict[str, object]], output_path: Union[str, Path]) -> Path:
    """Save the generated records to a CSV file."""
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with output_file.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=DATASET_COLUMNS)
        writer.writeheader()
        writer.writerows(records)

    return output_file


def generate_dataset(
    output_path: Optional[Union[str, Path]] = None,
    count: int = 1000,
) -> List[Dict[str, object]]:
    """Generate a synthetic student dataset and save it to disk."""
    if count <= 0:
        raise ValueError("Count must be greater than zero")

    random.seed(42)
    fake = Faker("en_IN")
    fake.seed_instance(42)

    records: List[Dict[str, object]] = []
    used_names: set[str] = set()

    for index in range(1, count + 1):
        student_id = _build_student_id(index)
        department = random.choice(DEPARTMENTS)
        semester = _sample_semester()
        attendance = _sample_attendance(semester, department)
        internal_marks = _sample_internal_marks(attendance, semester, department)
        previous_backlogs = _sample_backlogs(semester, attendance, internal_marks)
        risk_category = _infer_risk(attendance, internal_marks, previous_backlogs)

        # Make CP/NCP more realistic by aligning it with good academic standing.
        if attendance >= 80 and internal_marks >= 70 and previous_backlogs <= 1:
            cp_ncp = "CP"
        else:
            cp_ncp = "NCP"

        name = _generate_unique_name(fake, used_names)

        records.append(
            {
                "student_id": student_id,
                "name": name,
                "department": department,
                "semester": semester,
                "attendance_pct": attendance,
                "internal_marks": internal_marks,
                "cp_ncp": cp_ncp,
                "previous_backlogs": previous_backlogs,
                "risk_category": risk_category,
            }
        )

    validate_dataset(records)

    resolved_output_path = Path(output_path) if output_path else Path(__file__).resolve().parents[2] / "dataset" / "raw" / "student_data_raw.csv"
    write_dataset(records, resolved_output_path)

    risk_counts = {}
    for record in records:
        risk_counts[record["risk_category"]] = risk_counts.get(record["risk_category"], 0) + 1

    print(f"Total students generated: {len(records)}")
    print(f"Number of unique student IDs: {len({record['student_id'] for record in records})}")
    print(f"Number of unique student names: {len({record['name'] for record in records})}")
    print("Number of students in each risk category:")
    for category in ["High Risk", "Moderate Risk", "Low Risk"]:
        print(f"  - {category}: {risk_counts.get(category, 0)}")
    print(f"Output CSV location: {resolved_output_path}")

    return records


if __name__ == "__main__":
    generate_dataset()
