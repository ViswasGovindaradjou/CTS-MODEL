from sqlalchemy.orm import Session
from app.database.models import UserAlert, RiskPrediction
from app.core.logger import logger

class AlertService:
    @staticmethod
    def evaluate_and_create_alerts(db: Session, user_id: int, prediction: RiskPrediction):
        """
        Evaluates risk score and creates alerts based on risk levels or trends.
        """
        alerts_created = []

        # 1. High Risk Alert
        if prediction.risk_category == "HIGH":
            alert = UserAlert(
                user_id=user_id,
                title=f"Elevated {prediction.disease_type.replace('_', ' ').capitalize()} Risk Alert",
                message=f"Your latest assessment indicates a HIGH risk level ({prediction.risk_score * 100:.1f}%). Please review personalized recommendations and consider consulting your physician.",
                severity="CRITICAL"
            )
            db.add(alert)
            alerts_created.append(alert)

        elif prediction.risk_category == "MODERATE":
            alert = UserAlert(
                user_id=user_id,
                title=f"Moderate {prediction.disease_type.replace('_', ' ').capitalize()} Risk Alert",
                message=f"Your assessment score shows MODERATE risk ({prediction.risk_score * 100:.1f}%). Preventive lifestyle adjustments are recommended.",
                severity="WARNING"
            )
            db.add(alert)
            alerts_created.append(alert)

        # 2. Trend Alert (Compare with previous prediction of same disease_type)
        prev_predictions = (
            db.query(RiskPrediction)
            .filter(RiskPrediction.user_id == user_id, RiskPrediction.disease_type == prediction.disease_type)
            .order_by(RiskPrediction.created_at.desc())
            .offset(1)
            .limit(1)
            .all()
        )

        if prev_predictions:
            prev_score = prev_predictions[0].risk_score
            diff = prediction.risk_score - prev_score
            if diff >= 0.10: # Increased by 10% or more
                alert = UserAlert(
                    user_id=user_id,
                    title=f"Increasing Risk Trend Detected",
                    message=f"Your {prediction.disease_type.replace('_', ' ')} risk has increased by {diff * 100:.1f}% compared to your previous assessment.",
                    severity="WARNING"
                )
                db.add(alert)
                alerts_created.append(alert)

        db.commit()
        for a in alerts_created:
            db.refresh(a)
            logger.info(f"Created alert ID {a.id} for user {user_id}: {a.title}")
            
        return alerts_created

alert_service = AlertService()
