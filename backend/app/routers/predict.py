import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.connection import get_db
from app.database.models import User, PatientHealthRecord, RiskPrediction, CareRecommendation
from app.schemas.health import DiabetesHealthInput, HeartHealthInput, BRFSSHealthInput
from app.schemas.prediction import RiskPredictionResult
from app.services.ml_service import ml_manager
from app.services.groq_service import groq_service
from app.services.alert_service import alert_service
from app.routers.auth import get_current_user
from app.core.logger import logger

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from app.services.pdf_service import pdf_service

router = APIRouter(prefix="/api/predict", tags=["ML Predictions"])

@router.post("/extract-pdf", response_model=dict)
async def extract_pdf_report(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")
    
    try:
        text = pdf_service.extract_text_from_pdf(contents)
        is_valid, extracted_fields, msg = pdf_service.parse_health_metrics_from_text(text)
        
        if not is_valid:
            raise HTTPException(
                status_code=400, 
                detail=msg
            )
            
        return {
            "status": "success",
            "filename": file.filename,
            "extracted_fields": extracted_fields,
            "message": msg,
            "snippet": text[:300] if text else ""
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing PDF upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF report: {str(e)}")

@router.post("/diabetes", response_model=dict)
def predict_diabetes(
    data: DiabetesHealthInput,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    input_dict = data.model_dump()
    target_lang = request.headers.get("accept-language") or current_user.preferred_language or "en"
    
    # 1. Run ML inference using existing .pkl model
    try:
        prob, category, key_factors = ml_manager.predict_diabetes(input_dict)
    except Exception as e:
        logger.error(f"Error during diabetes ML prediction: {e}")
        raise HTTPException(status_code=500, detail=f"ML Prediction failed: {str(e)}")

    # 2. Save Patient Health Record
    health_rec = PatientHealthRecord(
        user_id=current_user.id,
        age=data.age,
        bmi=data.mass,
        blood_pressure_systolic=data.pres,
        raw_data=json.dumps(input_dict)
    )
    db.add(health_rec)
    db.commit()

    # 3. Save Risk Prediction Record
    prediction_rec = RiskPrediction(
        user_id=current_user.id,
        disease_type="diabetes",
        risk_score=prob,
        risk_category=category,
        input_data=json.dumps(input_dict)
    )
    db.add(prediction_rec)
    db.commit()
    db.refresh(prediction_rec)

    # 4. Generate Groq AI Recommendations
    rec_data = groq_service.generate_recommendations(
        disease_type="diabetes",
        risk_score=prob,
        risk_category=category,
        key_factors=key_factors,
        patient_data=input_dict,
        patient_profile={"full_name": current_user.full_name, "age": current_user.age, "gender": current_user.gender},
        language=target_lang
    )

    # 5. Save Recommendation Record
    care_rec = CareRecommendation(
        user_id=current_user.id,
        prediction_id=prediction_rec.id,
        general_lifestyle=json.dumps(rec_data.get("general_lifestyle", [])),
        diet_suggestions=json.dumps(rec_data.get("diet_suggestions", [])),
        physical_activity=json.dumps(rec_data.get("physical_activity", [])),
        monitoring_suggestions=json.dumps(rec_data.get("monitoring_suggestions", [])),
        follow_up_suggestions=json.dumps(rec_data.get("follow_up_suggestions", [])),
        preventive_guidance=json.dumps(rec_data.get("preventive_guidance", [])),
        disclaimer=rec_data.get("disclaimer", "")
    )
    db.add(care_rec)
    db.commit()
    db.refresh(care_rec)

    # 6. Evaluate and create alerts
    alert_service.evaluate_and_create_alerts(db, current_user.id, prediction_rec)

    return {
        "prediction_id": prediction_rec.id,
        "disease_type": "diabetes",
        "risk_score": prob,
        "risk_percentage": f"{prob * 100:.1f}%",
        "risk_category": category,
        "key_factors": key_factors,
        "input_summary": input_dict,
        "recommendations": rec_data,
        "timestamp": prediction_rec.created_at
    }


@router.post("/cardiovascular", response_model=dict)
def predict_cardiovascular(
    data: HeartHealthInput,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    input_dict = data.model_dump()
    target_lang = request.headers.get("accept-language") or current_user.preferred_language or "en"

    try:
        prob, category, key_factors = ml_manager.predict_heart_disease(input_dict)
    except Exception as e:
        logger.error(f"Error during heart disease ML prediction: {e}")
        raise HTTPException(status_code=500, detail=f"ML Prediction failed: {str(e)}")

    health_rec = PatientHealthRecord(
        user_id=current_user.id,
        age=data.age,
        sex=data.sex,
        blood_pressure_systolic=data.trestbps,
        cholesterol=data.chol,
        raw_data=json.dumps(input_dict)
    )
    db.add(health_rec)
    db.commit()

    prediction_rec = RiskPrediction(
        user_id=current_user.id,
        disease_type="cardiovascular",
        risk_score=prob,
        risk_category=category,
        input_data=json.dumps(input_dict)
    )
    db.add(prediction_rec)
    db.commit()
    db.refresh(prediction_rec)

    rec_data = groq_service.generate_recommendations(
        disease_type="cardiovascular",
        risk_score=prob,
        risk_category=category,
        key_factors=key_factors,
        patient_data=input_dict,
        patient_profile={"full_name": current_user.full_name, "age": current_user.age, "gender": current_user.gender},
        language=target_lang
    )

    care_rec = CareRecommendation(
        user_id=current_user.id,
        prediction_id=prediction_rec.id,
        general_lifestyle=json.dumps(rec_data.get("general_lifestyle", [])),
        diet_suggestions=json.dumps(rec_data.get("diet_suggestions", [])),
        physical_activity=json.dumps(rec_data.get("physical_activity", [])),
        monitoring_suggestions=json.dumps(rec_data.get("monitoring_suggestions", [])),
        follow_up_suggestions=json.dumps(rec_data.get("follow_up_suggestions", [])),
        preventive_guidance=json.dumps(rec_data.get("preventive_guidance", [])),
        disclaimer=rec_data.get("disclaimer", "")
    )
    db.add(care_rec)
    db.commit()
    db.refresh(care_rec)

    alert_service.evaluate_and_create_alerts(db, current_user.id, prediction_rec)

    return {
        "prediction_id": prediction_rec.id,
        "disease_type": "cardiovascular",
        "risk_score": prob,
        "risk_percentage": f"{prob * 100:.1f}%",
        "risk_category": category,
        "key_factors": key_factors,
        "input_summary": input_dict,
        "recommendations": rec_data,
        "timestamp": prediction_rec.created_at
    }


@router.post("/chronic", response_model=dict)
def predict_chronic(
    data: BRFSSHealthInput,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    input_dict = data.model_dump()
    target_lang = request.headers.get("accept-language") or current_user.preferred_language or "en"

    try:
        prob, category, key_factors = ml_manager.predict_brfss_chronic(input_dict)
    except Exception as e:
        logger.error(f"Error during BRFSS chronic ML prediction: {e}")
        raise HTTPException(status_code=500, detail=f"ML Prediction failed: {str(e)}")

    health_rec = PatientHealthRecord(
        user_id=current_user.id,
        sex=data.Sex,
        bmi=data.BMI,
        raw_data=json.dumps(input_dict)
    )
    db.add(health_rec)
    db.commit()

    prediction_rec = RiskPrediction(
        user_id=current_user.id,
        disease_type="brfss_chronic",
        risk_score=prob,
        risk_category=category,
        input_data=json.dumps(input_dict)
    )
    db.add(prediction_rec)
    db.commit()
    db.refresh(prediction_rec)

    rec_data = groq_service.generate_recommendations(
        disease_type="brfss_chronic",
        risk_score=prob,
        risk_category=category,
        key_factors=key_factors,
        patient_data=input_dict,
        patient_profile={"full_name": current_user.full_name, "age": current_user.age, "gender": current_user.gender},
        language=target_lang
    )

    care_rec = CareRecommendation(
        user_id=current_user.id,
        prediction_id=prediction_rec.id,
        general_lifestyle=json.dumps(rec_data.get("general_lifestyle", [])),
        diet_suggestions=json.dumps(rec_data.get("diet_suggestions", [])),
        physical_activity=json.dumps(rec_data.get("physical_activity", [])),
        monitoring_suggestions=json.dumps(rec_data.get("monitoring_suggestions", [])),
        follow_up_suggestions=json.dumps(rec_data.get("follow_up_suggestions", [])),
        preventive_guidance=json.dumps(rec_data.get("preventive_guidance", [])),
        disclaimer=rec_data.get("disclaimer", "")
    )
    db.add(care_rec)
    db.commit()

    alert_service.evaluate_and_create_alerts(db, current_user.id, prediction_rec)

    return {
        "prediction_id": prediction_rec.id,
        "disease_type": "brfss_chronic",
        "risk_score": prob,
        "risk_percentage": f"{prob * 100:.1f}%",
        "risk_category": category,
        "key_factors": key_factors,
        "input_summary": input_dict,
        "recommendations": rec_data,
        "timestamp": prediction_rec.created_at
    }
