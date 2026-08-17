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
    # HIGH RISK: Low attendance OR low internal marks OR multiple previous backlogs
    if attendance < 60 or internal_marks < 40 or backlogs >= 2:
        return "High Risk"
    # LOW RISK: Good attendance AND good internal marks AND no or very few previous backlogs
    if attendance >= 75 and internal_marks >= 70 and backlogs <= 1:
        return "Low Risk"
    # MODERATE RISK: Average attendance/marks and few backlogs
    return "Moderate Risk"


def _sample_attendance(semester: int, department: str) -> int:
    """Generate realistic attendance percentages between 0 and 100 with variation."""
    return int(random.triangular(30, 100, 78))


def _sample_internal_marks(attendance: int, semester: int, department: str) -> int:
    """Generate realistic internal marks with meaningful variation between 1 and 100."""
    mark_range = random.choices(
        ["1-20", "21-40", "41-60", "61-80", "81-100"],
        weights=[0.08, 0.12, 0.25, 0.35, 0.20],
        k=1
    )[0]
    if mark_range == "1-20":
        return random.randint(1, 20)
    elif mark_range == "21-40":
        return random.randint(21, 40)
    elif mark_range == "41-60":
        return random.randint(41, 60)
    elif mark_range == "61-80":
        return random.randint(61, 80)
    else:
        return random.randint(81, 100)


def _sample_backlogs(semester: int, attendance: int, internal_marks: int) -> int:
    """Generate realistic backlog values between 0 and 5, with semester 1 students having 0."""
    if semester == 1:
        return 0

    return random.choices(
        [0, 1, 2, 3, 4, 5],
        weights=[0.75, 0.12, 0.07, 0.03, 0.02, 0.01],
        k=1
    )[0]


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

    risk_categories_found = set()

    for record in records:
        for field in DATASET_COLUMNS:
            if record.get(field) in (None, ""):
                raise ValueError(f"Missing value found in field '{field}'")

        attendance = int(record["attendance_pct"])
        internal_marks = int(record["internal_marks"])
        semester = int(record["semester"])
        backlogs = int(record["previous_backlogs"])
        cp_ncp = str(record["cp_ncp"])
        risk = str(record["risk_category"])

        if not 0 <= attendance <= 100:
            raise ValueError(f"Attendance value {attendance} is not within 0-100")
        if not 1 <= internal_marks <= 100:
            raise ValueError(f"Internal marks value {internal_marks} is not within 1-100")
        if not 1 <= semester <= 8:
            raise ValueError(f"Semester value {semester} is not within 1-8")
        if not 0 <= backlogs <= 5:
            raise ValueError(f"Previous backlog value {backlogs} is not within 0-5")
        if semester == 1 and backlogs != 0:
            raise ValueError("Semester 1 students must have zero previous backlogs")
        if cp_ncp != "CP":
            raise ValueError(f"cp_ncp must contain ONLY 'CP', found '{cp_ncp}'")

        risk_categories_found.add(risk)

    if not {"Low Risk", "Moderate Risk", "High Risk"}.issubset(risk_categories_found):
        raise ValueError("All three risk categories must be represented")


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
        cp_ncp = "CP"
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

    risk_counts = {"Low Risk": 0, "Moderate Risk": 0, "High Risk": 0}
    cp_counts = {}
    attendances = []
    marks = []
    backlogs_counts = {}
    missing_count = 0
    marks_ranges = {"1-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}

    for record in records:
        risk_counts[record["risk_category"]] = risk_counts.get(record["risk_category"], 0) + 1
        cp_counts[record["cp_ncp"]] = cp_counts.get(record["cp_ncp"], 0) + 1
        attendances.append(record["attendance_pct"])
        m = record["internal_marks"]
        marks.append(m)
        if 1 <= m <= 20:
            marks_ranges["1-20"] += 1
        elif 21 <= m <= 40:
            marks_ranges["21-40"] += 1
        elif 41 <= m <= 60:
            marks_ranges["41-60"] += 1
        elif 61 <= m <= 80:
            marks_ranges["61-80"] += 1
        elif 81 <= m <= 100:
            marks_ranges["81-100"] += 1
            
        backlogs_counts[record["previous_backlogs"]] = backlogs_counts.get(record["previous_backlogs"], 0) + 1
        for field in DATASET_COLUMNS:
            if record.get(field) in (None, ""):
                missing_count += 1

    student_ids = [record["student_id"] for record in records]
    names = [record["name"] for record in records]
    duplicate_ids = len(student_ids) - len(set(student_ids))
    duplicate_names = len(names) - len(set(names))

    print(f"Total records: {len(records)}")
    print("Risk category counts:")
    for cat, cnt in risk_counts.items():
        print(f"  - {cat}: {cnt}")
    print("Risk category percentages:")
    for cat, cnt in risk_counts.items():
        print(f"  - {cat}: {cnt / len(records) * 100:.1f}%")
    print("CP/NCP counts:")
    for cat, cnt in cp_counts.items():
        print(f"  - {cat}: {cnt}")
    print(f"Internal marks minimum: {min(marks)}")
    print(f"Internal marks maximum: {max(marks)}")
    print("Internal marks distribution by ranges:")
    for r, cnt in marks_ranges.items():
        print(f"  - {r}: {cnt}")
    print(f"Attendance range: {min(attendances)} to {max(attendances)}")
    print("Previous backlog distribution:")
    for bk, cnt in sorted(backlogs_counts.items()):
        print(f"  - Backlogs {bk}: {cnt}")
    print(f"Missing values: {missing_count}")
    print(f"Duplicate IDs: {duplicate_ids}")
    print(f"Duplicate names: {duplicate_names}")
    print(f"Output CSV location: {resolved_output_path}")

    return records


if __name__ == "__main__":
    generate_dataset()
