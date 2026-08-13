from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    sub: Optional[str] = None
