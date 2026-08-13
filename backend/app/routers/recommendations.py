import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, CareRecommendation, RiskPrediction
from app.schemas.recommendation import CareRecommendationResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("/latest", response_model=dict)
def get_latest_recommendation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = (
        db.query(CareRecommendation)
        .filter(CareRecommendation.user_id == current_user.id)
        .order_by(CareRecommendation.created_at.desc())
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="No care recommendations found. Complete a health assessment first.")

    pred = db.query(RiskPrediction).filter(RiskPrediction.id == rec.prediction_id).first()

    def parse_json_list(text: str):
        if not text:
            return []
        try:
            return json.loads(text)
        except Exception:
            return [text]

    return {
        "id": rec.id,
        "prediction_id": rec.prediction_id,
        "disease_type": pred.disease_type if pred else "chronic",
        "risk_category": pred.risk_category if pred else "MODERATE",
        "risk_score": pred.risk_score if pred else 0.5,
        "general_lifestyle": parse_json_list(rec.general_lifestyle),
        "diet_suggestions": parse_json_list(rec.diet_suggestions),
        "physical_activity": parse_json_list(rec.physical_activity),
        "monitoring_suggestions": parse_json_list(rec.monitoring_suggestions),
        "follow_up_suggestions": parse_json_list(rec.follow_up_suggestions),
        "preventive_guidance": parse_json_list(rec.preventive_guidance),
        "disclaimer": rec.disclaimer,
        "created_at": rec.created_at
    }

@router.get("/{prediction_id}", response_model=dict)
def get_recommendation_by_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = (
        db.query(CareRecommendation)
        .filter(CareRecommendation.user_id == current_user.id, CareRecommendation.prediction_id == prediction_id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found for this prediction.")

    pred = db.query(RiskPrediction).filter(RiskPrediction.id == prediction_id).first()

    def parse_json_list(text: str):
        if not text:
            return []
        try:
            return json.loads(text)
        except Exception:
            return [text]

    return {
        "id": rec.id,
        "prediction_id": rec.prediction_id,
        "disease_type": pred.disease_type if pred else "chronic",
        "risk_category": pred.risk_category if pred else "MODERATE",
        "risk_score": pred.risk_score if pred else 0.5,
        "general_lifestyle": parse_json_list(rec.general_lifestyle),
        "diet_suggestions": parse_json_list(rec.diet_suggestions),
        "physical_activity": parse_json_list(rec.physical_activity),
        "monitoring_suggestions": parse_json_list(rec.monitoring_suggestions),
        "follow_up_suggestions": parse_json_list(rec.follow_up_suggestions),
        "preventive_guidance": parse_json_list(rec.preventive_guidance),
        "disclaimer": rec.disclaimer,
        "created_at": rec.created_at
    }

from app.services.groq_service import groq_service

@router.post("/translate", response_model=dict)
def translate_care_recommendation(
    payload: dict,
    current_user: User = Depends(get_current_user)
):
    recommendations = payload.get("recommendations", {})
    target_language = payload.get("target_language", "en")

    if not recommendations:
        return {}

    translated = groq_service.translate_recommendations(recommendations, target_language)
    return translated
