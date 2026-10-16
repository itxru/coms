from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models import IncidentStatus


class IncidentCreate(BaseModel):
    incident_type: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    location: str = Field(min_length=1, max_length=255)
    occurred_at: datetime


class IncidentUpdate(BaseModel):
    incident_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    description: str | None = Field(
        default=None,
        min_length=1,
    )
    location: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    occurred_at: datetime | None = None
    status: IncidentStatus | None = None
    resolution_notes: str | None = None


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_number: str
    incident_type: str
    title: str
    description: str
    location: str
    occurred_at: datetime
    reported_at: datetime
    status: IncidentStatus
    resolution_notes: str | None
    reported_by_id: int
    created_at: datetime
    updated_at: datetime


class IncidentAuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_id: int
    performed_by_id: int
    action: str
    changes: dict
    created_at: datetime
