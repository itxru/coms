from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth import (LoginRequest, LoginResponse, CurrentUserResponse,)
from services.auth_service import authenticate_user
from core.dependencies import get_current_user
from models import User

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    access_token = authenticate_user(
        db=db,
        email=login_data.email,
        password=login_data.password,
    )

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return LoginResponse(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=CurrentUserResponse,)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user)
):
    return {"message": "Successfully logged out"}