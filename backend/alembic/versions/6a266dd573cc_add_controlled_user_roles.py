"""add controlled user roles

Revision ID: 6a266dd573cc
Revises: bdec85b2e5f2
Create Date: 2026-10-09 09:43:32.796915

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '6a266dd573cc'
down_revision: Union[str, Sequence[str], None] = 'bdec85b2e5f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert user role column to controlled PostgereSQL enum."""
    
    user_role = postgresql.ENUM(
        "admin",
        "staff",
        "user_student",
        name="user_role",
    )
    
    #Create the PosrtgreSQL enum type in the database
    user_role.create(op.get_bind(), checkfirst=True)
    
    # Convert the existing string role column to the new enum values
    op.alter_column('users', 'role',
               existing_type=sa.VARCHAR(length=50),
               type_=user_role,
               existing_nullable=False,
               postgresql_using="role::user_role"
    )

def downgrade() -> None:
    """Restore the original VARCHAR type for the user role column."""
    
    user_role = postgresql.ENUM(
            "admin",
            "staff",
            "user_student",
            name="user_role",
    )
    
    # Remove the PostgreSQL enum type from the database
    user_role.drop(op.get_bind(), checkfirst=True)
    # op.alter_column('users', 'role',
    #            existing_type=sa.Enum('ADMIN', 'STAFF', 'USER_STUDENT', name='user_role'),
    #            type_=sa.VARCHAR(length=50),
    #            existing_nullable=False)
    # # ### end Alembic commands ###
