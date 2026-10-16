from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from core.dependencies import require_roles
from database import get_db
from models import User, UserRole

from schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse,
    IncidentAuditLogResponse,
)
from services.incident_service import (
    create_security_incident,
    get_security_incidents,
    get_security_incident_by_id,
    update_security_incident,
    get_security_incident_audit_history,
)

router = APIRouter(
    prefix="/incidents",
    tags=["Security Incidents"],
)


@router.post(
    "",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STAFF)),
):
    """
    Create a new Security Incident.

    Access:
    - Security Staff: Allowed
    - Administrator: Denied
    - Student: Denied

    The backend automatically assigns:
    - Incident reference number
    - Initial Open status
    - Authenticated reporter
    - Record timestamps
    """

    return create_security_incident(
        db=db,
        incident_data=incident_data,
        current_user=current_user,
    )


@router.get(
    "",
    response_model=list[IncidentResponse],
)
def list_incidents(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.STAFF)),
):
    """
    Retrieve paginated Security Incident records.

    Access:
    - Administrator: Allowed
    - Security Staff: Allowed
    - Student: Denied
    """

    return get_security_incidents(
        db=db,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def retrieve_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.STAFF)),
):
    """
    Retrieve a specific Security Incident.

    Returns HTTP 404 if the record does not exist.
    """

    return get_security_incident_by_id(
        db=db,
        incident_id=incident_id,
    )


@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def update_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.STAFF)),
):
    """
    Update an existing Security Incident.

    Access:
    - Administrator: Allowed
    - Security Staff: Allowed
    - Student: Denied

    Status transitions are validated by the service layer.
    Incident numbers and reporter IDs cannot be modified.
    """

    return update_security_incident(
        db=db,
        incident_id=incident_id,
        incident_data=incident_data,
        current_user=current_user,
    )


@router.get(
    "/{incident_id}/audit-history",
    response_model=list[IncidentAuditLogResponse],
)
def retrieve_incident_audit_history(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.STAFF)),
):
    """
    Retrieve the audit history of a Security Incident.

    Access:
    - Administrator: Allowed
    - Security Staff: Allowed
    - Student: Denied

    Audit entries are returned oldest first.
    """

    return get_security_incident_audit_history(
        db=db,
        incident_id=incident_id,
        current_user=current_user,
    )
