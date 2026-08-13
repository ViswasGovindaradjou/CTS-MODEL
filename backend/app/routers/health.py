import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, PatientHealthRecord
from app.schemas.health import PatientHealthRecordResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/health", tags=["Health Records"])

@router.get("/records", response_model=list[PatientHealthRecordResponse])
def get_health_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recs = (
        db.query(PatientHealthRecord)
        .filter(PatientHealthRecord.user_id == current_user.id)
        .order_by(PatientHealthRecord.created_at.desc())
        .all()
    )
    
    result = []
    for r in recs:
        try:
            raw = json.loads(r.raw_data)
        except Exception:
            raw = {}
        result.append(
            PatientHealthRecordResponse(
                id=r.id,
                user_id=r.user_id,
                age=r.age,
                sex=r.sex,
                bmi=r.bmi,
                blood_pressure_systolic=r.blood_pressure_systolic,
                cholesterol=r.cholesterol,
                raw_data=raw,
                created_at=r.created_at
            )
        )
    return result
