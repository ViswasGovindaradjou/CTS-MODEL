from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, RiskPrediction
from app.schemas.prediction import HealthTrendResponse, PredictionHistoryItem
from app.services.db_service import db_service
from app.routers.auth import get_current_user
import json

router = APIRouter(prefix="/api/predictions", tags=["Predictions & Trends"])

@router.get("/history", response_model=list[PredictionHistoryItem])
def get_prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    predictions = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.user_id == current_user.id)
        .order_by(RiskPrediction.created_at.desc())
        .all()
    )
    
    items = []
    for p in predictions:
        try:
            inp = json.loads(p.input_data)
        except Exception:
            inp = {}
        items.append(
            PredictionHistoryItem(
                id=p.id,
                disease_type=p.disease_type,
                risk_score=p.risk_score,
                risk_percentage=f"{p.risk_score * 100:.1f}%",
                risk_category=p.risk_category,
                created_at=p.created_at,
                input_data=inp
            )
        )
    return items

@router.get("/trends", response_model=HealthTrendResponse)
def get_health_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db_service.get_health_trends(db, current_user.id)
