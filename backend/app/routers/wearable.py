import time
from fastapi import APIRouter, Depends
from app.services.wearable_service import wearable_simulator
from app.services.ml_service import ml_service
from app.routers.auth import get_current_user
from app.database.models import User

router = APIRouter(prefix="/api/wearable", tags=["Wearable Device Simulator"])

@router.get("/live-telemetry", response_model=dict)
def get_live_telemetry(current_user: User = Depends(get_current_user)):
    """Returns real-time biometric telemetry stream from connected wearable device."""
    data = wearable_simulator.get_live_telemetry()
    return data

@router.get("/evaluate-live", response_model=dict)
def evaluate_live_telemetry(current_user: User = Depends(get_current_user)):
    """
    Fetches real-time IoT wearable telemetry, executes Diabetes & Cardiovascular ML model inferences,
    and returns a live real-time comparative risk assessment updated every 20s.
    """
    telemetry_data = wearable_simulator.get_live_telemetry()
    telem = telemetry_data.get("telemetry", {})

    hr = telem.get("heart_rate_bpm", 78)
    systolic = telem.get("blood_pressure_systolic", 120)
    diastolic = telem.get("blood_pressure_diastolic", 80)
    glucose = telem.get("blood_glucose_mg_dl", 110)
    cholesterol = telem.get("cholesterol_mg_dl", 195)
    bmi = telem.get("bmi", 26.5)
    oldpeak = telem.get("oldpeak_st", 0.4)
    cp = telem.get("chest_pain", "asymptomatic")
    restecg = telem.get("restecg", "normal")
    exang = telem.get("exang_flag", 0)

    user_age = getattr(current_user, "age", None) or 45
    user_gender = getattr(current_user, "gender", None) or "Male"
    sex_num = 1 if str(user_gender).lower() in ["male", "m"] else 0

    # 1. Prepare Diabetes ML Input Features
    diabetes_input = {
        "preg": 1,
        "plas": float(glucose),
        "pres": float(diastolic),
        "skin": 20,
        "insu": 85,
        "mass": float(bmi),
        "pedi": 0.35,
        "age": int(user_age)
    }
    diab_prob, diab_cat, diab_factors = ml_service.predict_diabetes(diabetes_input)

    # 2. Prepare Cardiovascular ML Input Features
    heart_input = {
        "age": int(user_age),
        "sex": sex_num,
        "cp": cp,
        "trestbps": float(systolic),
        "chol": float(cholesterol),
        "fbs": 1 if glucose > 120 else 0,
        "restecg": restecg,
        "thalach": float(hr),
        "exang": exang,
        "oldpeak": float(oldpeak),
        "slope": "upsloping",
        "ca": 0,
        "thal": "normal"
    }
    heart_prob, heart_cat, heart_factors = ml_service.predict_cardiovascular(heart_input)

    return {
        "timestamp": time.time(),
        "telemetry": telem,
        "diabetes": {
            "risk_score": diab_prob,
            "risk_category": diab_cat,
            "key_factors": diab_factors,
            "comparison": {
                "glucose_vs_threshold": f"{glucose} mg/dL vs ML baseline 140 mg/dL ({'EXCEEDS' if glucose > 140 else 'NORMAL'})",
                "bmi_vs_threshold": f"{bmi} vs ML baseline 30.0 ({'ELEVATED' if bmi >= 30 else 'NORMAL'})"
            }
        },
        "cardiovascular": {
            "risk_score": heart_prob,
            "risk_category": heart_cat,
            "key_factors": heart_factors,
            "comparison": {
                "bp_vs_threshold": f"{systolic}/{diastolic} mmHg vs ML baseline 130/80 mmHg ({'HIGH' if systolic >= 130 or diastolic >= 80 else 'NORMAL'})",
                "hr_vs_threshold": f"{hr} bpm vs ML baseline 100 bpm ({'ELEVATED' if hr > 100 else 'NORMAL'})"
            }
        }
    }
