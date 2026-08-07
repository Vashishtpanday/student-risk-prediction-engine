"""Clean and validate the synthetic student dataset for downstream modeling."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Optional, Union

import pandas as pd


VALID_DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "AI&DS"]
STRING_COLUMNS = ["student_id", "name", "department", "cp_ncp", "risk_category"]


def _trim_string_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Trim whitespace from all string-like columns."""
    for column in STRING_COLUMNS:
        if column in df.columns:
            df[column] = df[column].astype("string").str.strip()
    return df


def _handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Fill or drop missing values in a sensible way for the student dataset."""
    df = df.copy()

    for column in ["student_id", "name", "department", "cp_ncp", "risk_category"]:
        if column in df.columns:
            df[column] = df[column].fillna("")

    numeric_columns = ["semester", "attendance_pct", "internal_marks", "previous_backlogs"]
    for column in numeric_columns:
        if column in df.columns:
            df[column] = pd.to_numeric(df[column], errors="coerce")

    if "attendance_pct" in df.columns:
        df["attendance_pct"] = df["attendance_pct"].fillna(0)
    if "internal_marks" in df.columns:
        df["internal_marks"] = df["internal_marks"].fillna(0)
    if "semester" in df.columns:
        df["semester"] = df["semester"].fillna(1)
    if "previous_backlogs" in df.columns:
        df["previous_backlogs"] = df["previous_backlogs"].fillna(0)

    return df


def _validate_and_standardize(df: pd.DataFrame) -> pd.DataFrame:
    """Validate value ranges and standardize the data."""
    df = df.copy()

    if "attendance_pct" in df.columns:
        df["attendance_pct"] = df["attendance_pct"].clip(lower=0, upper=100)
    if "internal_marks" in df.columns:
        df["internal_marks"] = df["internal_marks"].clip(lower=0, upper=100)
    if "semester" in df.columns:
        df["semester"] = df["semester"].clip(lower=1, upper=8)
    if "previous_backlogs" in df.columns:
        df["previous_backlogs"] = df["previous_backlogs"].clip(lower=0)

    if "semester" in df.columns and "previous_backlogs" in df.columns:
        df.loc[df["semester"] == 1, "previous_backlogs"] = 0

    if "department" in df.columns:
        df["department"] = df["department"].where(df["department"].isin(VALID_DEPARTMENTS), "CSE")

    if "cp_ncp" in df.columns:
        df["cp_ncp"] = df["cp_ncp"].replace({"": "NCP"})
        df["cp_ncp"] = df["cp_ncp"].where(df["cp_ncp"].isin(["CP", "NCP"]), "NCP")

    if "risk_category" in df.columns:
        df["risk_category"] = df["risk_category"].fillna("Low Risk")

    return df


def _drop_duplicates(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """Remove duplicated rows and duplicate identifiers."""
    initial_rows = len(df)
    df = df.drop_duplicates()

    if "student_id" in df.columns:
        df = df.drop_duplicates(subset=["student_id"], keep="first")
    if "name" in df.columns:
        df = df.drop_duplicates(subset=["name"], keep="first")

    rows_removed = initial_rows - len(df)
    return df, rows_removed


def clean_dataset(
    input_path: Optional[Union[str, Path]] = None,
    output_path: Optional[Union[str, Path]] = None,
) -> Dict[str, int]:
    """Read, clean, validate, and save the student dataset."""
    input_file = Path(input_path) if input_path else Path(__file__).resolve().parents[2] / "dataset" / "raw" / "student_data_raw.csv"
    output_file = Path(output_path) if output_path else Path(__file__).resolve().parents[2] / "dataset" / "processed" / "student_data_cleaned.csv"

    if not input_file.exists():
        raise FileNotFoundError(f"Input dataset not found at {input_file}")

    df = pd.read_csv(input_file)
    rows_processed = len(df)
    missing_values_before = int(df.isna().sum().sum())

    df = _trim_string_columns(df)
    df = _handle_missing_values(df)
    df, rows_removed = _drop_duplicates(df)
    df = _validate_and_standardize(df)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_file, index=False)

    summary = {
        "rows_processed": rows_processed,
        "rows_removed": rows_removed,
        "missing_values_handled": missing_values_before,
        "output_file": str(output_file),
    }

    print(f"Rows processed: {summary['rows_processed']}")
    print(f"Duplicates removed: {summary['rows_removed']}")
    print(f"Missing values handled: {summary['missing_values_handled']}")
    print(f"Output file: {summary['output_file']}")

    return summary


if __name__ == "__main__":
    clean_dataset()
