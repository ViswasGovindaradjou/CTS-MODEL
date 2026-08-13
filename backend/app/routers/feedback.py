from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, UserFeedback
from app.schemas.feedback import UserFeedbackInput, UserFeedbackResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

@router.post("", response_model=UserFeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    fb_input: UserFeedbackInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fb = UserFeedback(
        user_id=current_user.id,
        rating=fb_input.rating,
        comments=fb_input.comments,
        category=fb_input.category or "general"
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return UserFeedbackResponse.model_validate(fb)

@router.get("", response_model=list[UserFeedbackResponse])
def get_user_feedbacks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fbs = (
        db.query(UserFeedback)
        .filter(UserFeedback.user_id == current_user.id)
        .order_by(UserFeedback.created_at.desc())
        .all()
    )
    return [UserFeedbackResponse.model_validate(f) for f in fbs]
