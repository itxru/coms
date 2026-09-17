from sqlalchemy import select
from sqlalchemy.orm import Session

from core.security import create_access_token, verify_password
from models import User


def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    result = db.execute(select(User).where(User.email == email))

    user = result.scalar_one_or_none()
    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
        }
    )

    return access_token
