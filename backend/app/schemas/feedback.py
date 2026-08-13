from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserFeedbackInput(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comments: Optional[str] = None
    category: Optional[str] = "general"

class UserFeedbackResponse(BaseModel):
    id: int
    user_id: int
    rating: int
    comments: Optional[str] = None
    category: str
    created_at: datetime

    class Config:
        from_attributes = True
