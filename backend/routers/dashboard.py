from datetime import datetime
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from fastapi import APIRouter, Depends
from core.dependencies import require_roles
from models import (
    User,
    UserRole,
    SecurityIncident,
    IncidentStatus,
    StudentViolationDailySummary,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.STAFF)),
):
    """
    Return the operational dashboard overview.

    Accessible only to Administrator and Security Staff.

    Operational statistics will be populated when
    their corresponding database models are implemented.
    """

    security_incident_count = db.scalar(select(func.count(SecurityIncident.id))) or 0

    incident_status_counts = {
        incident_status.value: db.scalar(
            select(func.count(SecurityIncident.id)).where(
                SecurityIncident.status == incident_status
            )
        )
        or 0
        for incident_status in IncidentStatus
    }

    # PB-014: Student Violation Statistics
    # Counts are based on daily college summaries received from SDU.

    student_violation_count = (
        db.scalar(
            select(
                func.coalesce(
                    func.sum(StudentViolationDailySummary.violation_count),
                    0,
                )
            )
        )
        or 0
    )

    violation_rows = db.execute(
        select(
            StudentViolationDailySummary.college,
            func.sum(StudentViolationDailySummary.violation_count).label("total"),
        )
        .group_by(StudentViolationDailySummary.college)
        .order_by(StudentViolationDailySummary.college)
    ).all()

    violations_by_college = [
        {
            "college": college,
            "violations": int(total),
        }
        for college, total in violation_rows
    ]

    # Calculate quarterly incident trends for the current year.
    current_year = datetime.now().year

    incident_trends = []

    for quarter in range(1, 5):
        start_month = (quarter - 1) * 3 + 1

        start_date = datetime(
            current_year,
            start_month,
            1,
        )

        if quarter == 4:
            end_date = datetime(
                current_year + 1,
                1,
                1,
            )
        else:
            end_date = datetime(
                current_year,
                start_month + 3,
                1,
            )

        total_incidents = (
            db.scalar(
                select(func.count(SecurityIncident.id)).where(
                    SecurityIncident.occurred_at >= start_date,
                    SecurityIncident.occurred_at < end_date,
                )
            )
            or 0
        )

        resolved_incidents = (
            db.scalar(
                select(func.count(SecurityIncident.id)).where(
                    SecurityIncident.occurred_at >= start_date,
                    SecurityIncident.occurred_at < end_date,
                    SecurityIncident.status.in_(
                        [
                            IncidentStatus.RESOLVED,
                            IncidentStatus.CLOSED,
                        ]
                    ),
                )
            )
            or 0
        )

        incident_trends.append(
            {
                "quarter": f"Q{quarter}",
                "incidents": total_incidents,
                "resolved": resolved_incidents,
            }
        )

    # Retrieve the five most recently reported security incidents.
    # This query runs once, after calculating all four quarters.
    recent_incidents = db.scalars(
        select(SecurityIncident)
        .order_by(
            SecurityIncident.reported_at.desc(),
            SecurityIncident.id.desc(),
        )
        .limit(5)
    ).all()

    # Format incidents for the Recent Operational Records table.
    recent_operational_records = [
        {
            "id": f"incident-{incident.id}",
            "reference": incident.incident_number,
            "category": "Security Incident",
            "description": incident.title,
            "status": incident.status.value.replace("_", " ").title(),
            "recordedAt": incident.reported_at.isoformat(),
        }
        for incident in recent_incidents
    ]

    return {
        "data_available": True,
        "summary": {
            "security_incidents": security_incident_count,
            "student_violations": int(student_violation_count),
            "gate_pass_verifications": None,
            "service_requests": None,
        },
        "incident_status_counts": incident_status_counts,
        "incident_trends": incident_trends,
        "violations_by_college": violations_by_college,
        "recent_operational_records": recent_operational_records,
    }
