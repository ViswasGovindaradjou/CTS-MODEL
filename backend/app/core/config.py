import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Chronic Disease Health Monitoring & Risk Prediction Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-in-production- chronic-health-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./health_platform.db")
    AWS_DATABASE_TYPE: str = os.getenv("AWS_DATABASE_TYPE", "sqlite")
    
    # AWS Credentials
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    
    # Groq API Key
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # ML Models path
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MODEL_DIR: str = os.getenv("MODEL_DIR", os.path.join(BASE_DIR, "ml_models"))

    class Config:
        case_sensitive = True

settings = Settings()
