from fastapi import APIRouter, Depends
from app.services.wearable_service import wearable_simulator
from app.routers.auth import get_current_user
from app.database.models import User

router = APIRouter(prefix="/api/wearable", tags=["Wearable Device Simulator"])

@router.get("/live-telemetry", response_model=dict)
def get_live_telemetry(current_user: User = Depends(get_current_user)):
    """Returns real-time biometric telemetry stream from connected wearable device."""
    data = wearable_simulator.get_live_telemetry()
    return data
