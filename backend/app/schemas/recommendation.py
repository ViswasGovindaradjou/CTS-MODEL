from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RecommendationRequest(BaseModel):
    prediction_id: int
    language: Optional[str] = "en"

class CareRecommendationResponse(BaseModel):
    id: Optional[int] = None
    prediction_id: Optional[int] = None
    disease_type: str
    risk_category: str
    risk_score: float
    general_lifestyle: List[str]
    diet_suggestions: List[str]
    physical_activity: List[str]
    monitoring_suggestions: List[str]
    follow_up_suggestions: List[str]
    preventive_guidance: List[str]
    disclaimer: str
    created_at: datetime
