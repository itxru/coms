from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, String, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    USER_STUDENT = "user_student"

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
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
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
