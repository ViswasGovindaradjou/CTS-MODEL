from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime

class RiskPredictionResult(BaseModel):
    prediction_id: Optional[int] = None
    disease_type: str # 'diabetes', 'cardiovascular', 'brfss_chronic'
    risk_score: float # 0.0 to 1.0 (e.g. 0.75 = 75%)
    risk_percentage: str # '75.00%'
    risk_category: str # 'LOW', 'MODERATE', 'HIGH'
    key_factors: List[str]
    input_summary: Dict[str, Any]
    timestamp: datetime

class PredictionHistoryItem(BaseModel):
    id: int
    disease_type: str
    risk_score: float
    risk_percentage: str
    risk_category: str
    created_at: datetime
    input_data: Dict[str, Any]

    class Config:
        from_attributes = True

class MetricTrend(BaseModel):
    metric_name: str
    current_value: float
    previous_value: Optional[float] = None
    trend_direction: str # 'increasing', 'decreasing', 'stable'
    change_percentage: Optional[float] = None

class HealthTrendResponse(BaseModel):
    diabetes_trend: str # 'increasing', 'decreasing', 'stable', 'insufficient_data'
    heart_trend: str
    chronic_trend: str
    latest_diabetes_risk: Optional[float] = None
    latest_heart_risk: Optional[float] = None
    latest_chronic_risk: Optional[float] = None
    total_assessments: int
    history: List[PredictionHistoryItem]
