from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError

from schemas.incident import IncidentCreate, IncidentUpdate

from datetime import datetime

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from models import (
    IncidentStatus,
    SecurityIncident,
    SecurityIncidentAuditLog,
    User,
    UserRole,
)


def record_incident_audit(
    db: Session,
    incident_id: int,
    performed_by_id: int,
    action: str,
    changes: dict,
) -> None:
    """
    Add an incident audit record to the current transaction.

    The calling service is responsible for committing.
    """

    audit_log = SecurityIncidentAuditLog(
        incident_id=incident_id,
        performed_by_id=performed_by_id,
        action=action,
        changes=changes,
    )

    db.add(audit_log)


def generate_incident_number(
    db: Session,
    year: int | None = None,
) -> str:
    """
    Generate the next yearly incident reference.

    Must be called within the same database transaction
    that inserts the SecurityIncident record.

    Do not commit or roll back between generating the
    reference and inserting the incident.
    """

    if year is None:
        year = datetime.utcnow().year

    if not 1 <= year <= 9999:
        raise ValueError("Invalid incident reference year")

    # Serialize incident-number generation across transactions.
    # The lock is released automatically at transaction end.
    db.execute(
        text("SELECT pg_advisory_xact_lock(" "741001, :reference_year)"),
        {"reference_year": year},
    )

    prefix = f"INC-{year:04d}-"

    # Find the largest existing sequence for this year.
    latest_number = db.execute(
        select(SecurityIncident.incident_number)
        .where(SecurityIncident.incident_number.like(f"{prefix}%"))
        .order_by(SecurityIncident.incident_number.desc())
        .limit(1)
    ).scalar_one_or_none()

    if latest_number is None:
        next_sequence = 1
    else:
        next_sequence = int(latest_number.rsplit("-", 1)[1]) + 1

    return f"{prefix}{next_sequence:04d}"


def create_security_incident(
    db: Session,
    incident_data: IncidentCreate,
    current_user: User,
) -> SecurityIncident:

    if current_user.role != UserRole.STAFF:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Security Staff can create incidents",
        )

    try:
        incident_number = generate_incident_number(db)

        incident = SecurityIncident(
            incident_number=incident_number,
            incident_type=incident_data.incident_type,
            title=incident_data.title,
            description=incident_data.description,
            location=incident_data.location,
            occurred_at=incident_data.occurred_at,
            status=IncidentStatus.OPEN,
            reported_by_id=current_user.id,
        )

        db.add(incident)

        # Obtain the incident ID without committing.
        db.flush()

        # Record the initial incident information.
        changes = {
            field: {
                "old": None,
                "new": value,
            }
            for field, value in incident_data.model_dump(mode="json").items()
        }

        changes["incident_number"] = {
            "old": None,
            "new": incident.incident_number,
        }

        changes["status"] = {
            "old": None,
            "new": incident.status.value,
        }

        record_incident_audit(
            db=db,
            incident_id=incident.id,
            performed_by_id=current_user.id,
            action="created",
            changes=changes,
        )

        # Commit both records together.
        db.commit()
        db.refresh(incident)

        return incident

    except SQLAlchemyError:
        db.rollback()
        raise


def get_security_incidents(
    db: Session,
    limit: int = 50,
    offset: int = 0,
) -> list[SecurityIncident]:
    """
    Retrieve Security Incident records.

    Results are ordered by newest record first.
    Pagination prevents retrieving every record at once.
    """

    statement = (
        select(SecurityIncident)
        .order_by(
            SecurityIncident.created_at.desc(),
            SecurityIncident.id.desc(),
        )
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def get_security_incident_by_id(
    db: Session,
    incident_id: int,
) -> SecurityIncident:
    """
    Retrieve a specific Security Incident by ID.

    Return HTTP 404 when the record does not exist.
    """

    incident = db.get(SecurityIncident, incident_id)

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security Incident not found",
        )

    return incident


def update_security_incident(
    db: Session,
    incident_id: int,
    incident_data: IncidentUpdate,
    current_user: User,
) -> SecurityIncident:

    if current_user.role not in (
        UserRole.ADMIN,
        UserRole.STAFF,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update incidents",
        )

    try:
        # Lock the incident row while validating and updating it.
        incident = db.execute(
            select(SecurityIncident)
            .where(SecurityIncident.id == incident_id)
            .with_for_update()
        ).scalar_one_or_none()

        if incident is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Security Incident not found",
            )

        updates = incident_data.model_dump(exclude_unset=True)

        required_fields = (
            "incident_type",
            "title",
            "description",
            "location",
            "occurred_at",
            "status",
        )

        for field in required_fields:
            if field in updates and updates[field] is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"{field} cannot be null",
                )

        allowed_transitions = {
            IncidentStatus.OPEN: {
                IncidentStatus.UNDER_INVESTIGATION,
                IncidentStatus.RESOLVED,
                IncidentStatus.CLOSED,
            },
            IncidentStatus.UNDER_INVESTIGATION: {
                IncidentStatus.RESOLVED,
                IncidentStatus.CLOSED,
            },
            IncidentStatus.RESOLVED: {
                IncidentStatus.CLOSED,
            },
            IncidentStatus.CLOSED: set(),
        }

        new_status = updates.get("status")

        if (
            new_status is not None
            and new_status != incident.status
            and new_status not in allowed_transitions[incident.status]
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Cannot change incident status from "
                    f"{incident.status.value} to {new_status.value}"
                ),
            )

        changes = {}

        for field, new_value in updates.items():
            old_value = getattr(incident, field)

            if old_value == new_value:
                continue

            # Convert values to JSON-compatible representations.
            if isinstance(old_value, datetime):
                old_audit_value = old_value.isoformat()
            elif isinstance(old_value, IncidentStatus):
                old_audit_value = old_value.value
            else:
                old_audit_value = old_value

            if isinstance(new_value, datetime):
                new_audit_value = new_value.isoformat()
            elif isinstance(new_value, IncidentStatus):
                new_audit_value = new_value.value
            else:
                new_audit_value = new_value

            changes[field] = {
                "old": old_audit_value,
                "new": new_audit_value,
            }

            setattr(incident, field, new_value)

        # Only create an audit entry when something changed.
        if changes:
            record_incident_audit(
                db=db,
                incident_id=incident.id,
                performed_by_id=current_user.id,
                action="updated",
                changes=changes,
            )

            db.commit()
            db.refresh(incident)
        else:
            db.rollback()

        return incident

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        raise


def get_security_incident_audit_history(
    db: Session,
    incident_id: int,
    current_user: User,
) -> list[SecurityIncidentAuditLog]:
    """
    Retrieve the audit history of a Security Incident.

    Access:
    - Administrator: Allowed
    - Security Staff: Allowed
    - Student: Denied

    Audit entries are returned oldest first.
    """

    if current_user.role not in (
        UserRole.ADMIN,
        UserRole.STAFF,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view incident audit history",
        )

    # Verify that the Security Incident exists.
    get_security_incident_by_id(
        db=db,
        incident_id=incident_id,
    )

    # Retrieve audit records in chronological order.
    statement = (
        select(SecurityIncidentAuditLog)
        .where(SecurityIncidentAuditLog.incident_id == incident_id)
        .order_by(
            SecurityIncidentAuditLog.created_at.asc(),
            SecurityIncidentAuditLog.id.asc(),
        )
    )

    return list(db.scalars(statement).all())
