from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database.models import User, PatientHealthRecord, RiskPrediction, CareRecommendation, ChatHistory, UserAlert, UserFeedback
from app.schemas.prediction import HealthTrendResponse, PredictionHistoryItem
import json

class DBService:
    @staticmethod
    def get_health_trends(db: Session, user_id: int) -> HealthTrendResponse:
        predictions = (
            db.query(RiskPrediction)
            .filter(RiskPrediction.user_id == user_id)
            .order_by(RiskPrediction.created_at.desc())
            .all()
        )

        history_items = []
        for p in predictions:
            try:
                input_dict = json.loads(p.input_data)
            except Exception:
                input_dict = {}
                
            history_items.append(
                PredictionHistoryItem(
                    id=p.id,
                    disease_type=p.disease_type,
                    risk_score=p.risk_score,
                    risk_percentage=f"{p.risk_score * 100:.1f}%",
                    risk_category=p.risk_category,
                    created_at=p.created_at,
                    input_data=input_dict
                )
            )

        # Helper to compute trend direction
        def calculate_trend_direction(disease: str) -> tuple[str, Optional[float]]:
            d_preds = [p for p in predictions if p.disease_type == disease]
            if not d_preds:
                return "insufficient_data", None
            latest = d_preds[0].risk_score
            if len(d_preds) == 1:
                return "stable", latest
            previous = d_preds[1].risk_score
            if latest > previous + 0.03:
                return "increasing", latest
            elif latest < previous - 0.03:
                return "decreasing", latest
            else:
                return "stable", latest

        diab_trend, latest_diab = calculate_trend_direction("diabetes")
        heart_trend, latest_heart = calculate_trend_direction("cardiovascular")
        chronic_trend, latest_chronic = calculate_trend_direction("brfss_chronic")

        return HealthTrendResponse(
            diabetes_trend=diab_trend,
            heart_trend=heart_trend,
            chronic_trend=chronic_trend,
            latest_diabetes_risk=latest_diab,
            latest_heart_risk=latest_heart,
            latest_chronic_risk=latest_chronic,
            total_assessments=len(predictions),
            history=history_items
        )

db_service = DBService()
