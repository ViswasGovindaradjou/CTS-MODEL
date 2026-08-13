from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    severity: str # 'INFO', 'WARNING', 'CRITICAL'
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AlertMarkRead(BaseModel):
    alert_ids: Optional[list[int]] = None
    mark_all: bool = False
