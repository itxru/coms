from pydantic import BaseModel, EmailStr
from models import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CurrentUserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    
    model_config = {
        "from_attributes": True
    }