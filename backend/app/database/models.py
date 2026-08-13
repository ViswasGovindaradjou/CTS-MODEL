from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    preferred_language = Column(String, default="en") # en, ta, hi
    created_at = Column(DateTime, default=datetime.utcnow)

    health_records = relationship("PatientHealthRecord", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("RiskPrediction", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("CareRecommendation", back_populates="user", cascade="all, delete-orphan")
    chat_logs = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("UserAlert", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("UserFeedback", back_populates="user", cascade="all, delete-orphan")


class PatientHealthRecord(Base):
    __tablename__ = "patient_health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Common / Shared metrics
    age = Column(Integer, nullable=True)
    sex = Column(Integer, nullable=True) # 0 = female, 1 = male
    bmi = Column(Float, nullable=True)
    blood_pressure_systolic = Column(Float, nullable=True)
    cholesterol = Column(Float, nullable=True)

    # Detailed metrics dictionary stored as JSON
    raw_data = Column(Text, nullable=False) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="health_records")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    disease_type = Column(String, nullable=False) # 'diabetes', 'cardiovascular', 'brfss_chronic'
    risk_score = Column(Float, nullable=False) # 0.0 to 1.0 (probability)
    risk_category = Column(String, nullable=False) # 'LOW', 'MODERATE', 'HIGH'
    input_data = Column(Text, nullable=False) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")
    recommendations = relationship("CareRecommendation", back_populates="prediction", cascade="all, delete-orphan")


class CareRecommendation(Base):
    __tablename__ = "care_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("risk_predictions.id"), nullable=True)
    
    general_lifestyle = Column(Text, nullable=True)
    diet_suggestions = Column(Text, nullable=True)
    physical_activity = Column(Text, nullable=True)
    monitoring_suggestions = Column(Text, nullable=True)
    follow_up_suggestions = Column(Text, nullable=True)
    preventive_guidance = Column(Text, nullable=True)
    disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    prediction = relationship("RiskPrediction", back_populates="recommendations")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    language = Column(String, default="en") # en, ta, hi
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_logs")


class UserAlert(Base):
    __tablename__ = "user_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="INFO") # 'INFO', 'WARNING', 'CRITICAL'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    category = Column(String, default="general")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
