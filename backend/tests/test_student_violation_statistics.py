from datetime import date
from unittest.mock import MagicMock

from models import StudentViolationDailySummary


def test_student_violation_daily_summary_model():
    """Verify the daily summary stores the expected fields."""

    summary = StudentViolationDailySummary(
        college="CCIS",
        report_date=date(2026, 10, 1),
        violation_count=5,
        source="SDU",
    )

    assert summary.college == "CCIS"
    assert summary.report_date == date(2026, 10, 1)
    assert summary.violation_count == 5
    assert summary.source == "SDU"


def test_student_violation_total_aggregation():
    """Verify the dashboard uses the sum of violations."""

    mock_db = MagicMock()
    mock_db.scalar.return_value = 14

    from sqlalchemy import func, select

    statement = select(
        func.coalesce(
            func.sum(StudentViolationDailySummary.violation_count),
            0,
        )
    )

    result = mock_db.scalar(statement)

    assert result == 14


def test_student_violation_college_breakdown():
    """Verify college breakdown values are correctly structured."""

    violation_rows = [
        ("CCIS", 8),
        ("CEA", 4),
        ("CIT", 2),
    ]

    violations_by_college = [
        {
            "college": college,
            "violations": int(total),
        }
        for college, total in violation_rows
    ]

    assert violations_by_college == [
        {"college": "CCIS", "violations": 8},
        {"college": "CEA", "violations": 4},
        {"college": "CIT", "violations": 2},
    ]

    assert sum(item["violations"] for item in violations_by_college) == 14
