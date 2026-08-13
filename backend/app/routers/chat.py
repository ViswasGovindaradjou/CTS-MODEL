from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, ChatHistory, RiskPrediction, PatientHealthRecord
from app.schemas.chat import ChatMessageInput, ChatMessageResponse
from app.services.groq_service import groq_service
from app.routers.auth import get_current_user_optional as get_current_user

router = APIRouter(prefix="/api/chat", tags=["Healthcare Chatbot"])

@router.post("", response_model=ChatMessageResponse)
def send_chat_message(
    chat_input: ChatMessageInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lang = chat_input.language or current_user.preferred_language or "en"
    
    # Fetch user's latest risk assessments and health records for context
    latest_preds = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.user_id == current_user.id)
        .order_by(RiskPrediction.created_at.desc())
        .limit(3)
        .all()
    )
    latest_record = (
        db.query(PatientHealthRecord)
        .filter(PatientHealthRecord.user_id == current_user.id)
        .order_by(PatientHealthRecord.created_at.desc())
        .first()
    )

    preds_summary = ", ".join([f"{p.disease_type.upper()}: {p.risk_category} ({p.risk_score*100:.1f}%)" for p in latest_preds]) if latest_preds else "No past assessments yet"
    metrics_summary = latest_record.raw_data if (latest_record and latest_record.raw_data) else "Standard metrics"

    patient_context = {
        "full_name": current_user.full_name,
        "age": current_user.age,
        "gender": current_user.gender,
        "latest_assessment": preds_summary,
        "key_metrics": metrics_summary
    }

    bot_reply = groq_service.chat(
        user_message=chat_input.message,
        language=lang,
        patient_context=patient_context
    )

    chat_rec = ChatHistory(
        user_id=current_user.id,
        user_message=chat_input.message,
        bot_response=bot_reply,
        language=lang
    )
    db.add(chat_rec)
    db.commit()
    db.refresh(chat_rec)

    return ChatMessageResponse(
        id=chat_rec.id,
        user_message=chat_rec.user_message,
        bot_response=chat_rec.bot_response,
        language=chat_rec.language,
        created_at=chat_rec.created_at
    )

@router.get("/history", response_model=list[ChatMessageResponse])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.asc())
        .all()
    )
    return [
        ChatMessageResponse(
            id=c.id,
            user_message=c.user_message,
            bot_response=c.bot_response,
            language=c.language,
            created_at=c.created_at
        ) for c in logs
    ]
