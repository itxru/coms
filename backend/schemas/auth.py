from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CurrentUserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    
    model_config = {
        "from_attributes": True
    }