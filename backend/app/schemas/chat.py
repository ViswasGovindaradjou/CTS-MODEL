from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatMessageInput(BaseModel):
    message: str = Field(..., min_length=1, description="User's query to the chatbot")
    language: Optional[str] = Field("en", description="Preferred language: 'en' (English), 'ta' (Tamil), 'hi' (Hindi)")
    context: Optional[str] = Field(None, description="Optional medical context or recent risk assessment summary")

class ChatMessageResponse(BaseModel):
    id: Optional[int] = None
    user_message: str
    bot_response: str
    language: str
    created_at: datetime
