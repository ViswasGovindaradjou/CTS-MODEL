from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, UserAlert
from app.schemas.alert import AlertResponse, AlertMarkRead
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Notifications"])

@router.get("", response_model=list[AlertResponse])
def get_user_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = (
        db.query(UserAlert)
        .filter(UserAlert.user_id == current_user.id)
        .order_by(UserAlert.created_at.desc())
        .all()
    )
    return [AlertResponse.model_validate(a) for a in alerts]

@router.post("/mark-read", response_model=dict)
def mark_alerts_read(
    payload: AlertMarkRead,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(UserAlert).filter(UserAlert.user_id == current_user.id)
    if payload.mark_all:
        query.update({UserAlert.is_read: True})
    elif payload.alert_ids:
        query.filter(UserAlert.id.in_(payload.alert_ids)).update({UserAlert.is_read: True}, synchronize_session=False)
    
    db.commit()
    return {"message": "Alerts updated successfully"}
