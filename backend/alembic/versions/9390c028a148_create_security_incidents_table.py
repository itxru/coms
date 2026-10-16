"""create security incidents table

Revision ID: 9390c028a148
Revises: 6a266dd573cc
Create Date: 2026-10-13 19:30:06.663361
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "9390c028a148"
down_revision: Union[str, Sequence[str], None] = "6a266dd573cc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


incident_status_enum = postgresql.ENUM(
    "open",
    "under_investigation",
    "resolved",
    "closed",
    name="incident_status",
    create_type=False,
)


def upgrade() -> None:
    """Create the security incidents table."""

    # Create the PostgreSQL enum explicitly.
    incident_status_enum.create(op.get_bind(), checkfirst=False)

    op.create_table(
        "security_incidents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("incident_number", sa.String(length=30), nullable=False),
        sa.Column("incident_type", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column("occurred_at", sa.DateTime(), nullable=False),
        sa.Column("reported_at", sa.DateTime(), nullable=False),
        sa.Column("status", incident_status_enum, nullable=False),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("reported_by_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["reported_by_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_security_incidents_id"),
        "security_incidents",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_security_incidents_incident_number"),
        "security_incidents",
        ["incident_number"],
        unique=True,
    )


def downgrade() -> None:
    """Remove the security incidents table and enum."""

    op.drop_index(
        op.f("ix_security_incidents_incident_number"),
        table_name="security_incidents",
    )

    op.drop_index(
        op.f("ix_security_incidents_id"),
        table_name="security_incidents",
    )

    op.drop_table("security_incidents")

    # Remove the PostgreSQL enum after dropping its table.
    incident_status_enum.drop(op.get_bind(), checkfirst=False)
