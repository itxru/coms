from datetime import date, datetime
from enum import Enum
from sqlalchemy import (
    Date,
    DateTime,
    String,
    Text,
    ForeignKey,
    JSON,
    Integer,
    CheckConstraint,
    UniqueConstraint,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    USER_STUDENT = "user_student"


class IncidentStatus(str, Enum):
    OPEN = "open"
    UNDER_INVESTIGATION = "under_investigation"
    RESOLVED = "resolved"
    CLOSED = "closed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_class: [member.value for member in enum_class],
            validate_strings=True,
        ),
        nullable=False,
        default=UserRole.USER_STUDENT,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class SecurityIncident(Base):
    __tablename__ = "security_incidents"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    incident_number: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
    )

    incident_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    reported_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    status: Mapped[IncidentStatus] = mapped_column(
        SQLEnum(
            IncidentStatus,
            name="incident_status",
            values_callable=lambda enum_class: [member.value for member in enum_class],
            validate_strings=True,
        ),
        default=IncidentStatus.OPEN,
        nullable=False,
    )

    resolution_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    reported_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class SecurityIncidentAuditLog(Base):
    __tablename__ = "security_incident_audit_logs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    incident_id: Mapped[int] = mapped_column(
        ForeignKey("security_incidents.id"),
        nullable=False,
        index=True,
    )

    performed_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    action: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    changes: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class StudentViolationDailySummary(Base):
    __tablename__ = "student_violation_daily_summaries"

    __table_args__ = (
        UniqueConstraint(
            "college",
            "report_date",
            name="uq_student_violation_college_date",
        ),
        CheckConstraint(
            "violation_count >= 0",
            name="ck_student_violation_count_nonnegative",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    college: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    report_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    violation_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    source: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="SDU",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
