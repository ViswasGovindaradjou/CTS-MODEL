from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User
from app.schemas.auth import UserResponse
from app.routers.auth import get_current_user
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/users", tags=["Users"])

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = None

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.age is not None:
        current_user.age = user_update.age
    if user_update.gender is not None:
        current_user.gender = user_update.gender
    if user_update.preferred_language is not None:
        current_user.preferred_language = user_update.preferred_language

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
