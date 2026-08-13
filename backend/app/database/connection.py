from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.logger import logger

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info(f"Database engine initialized with URL type: {settings.DATABASE_URL.split(':')[0]}")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    # Fallback to local SQLite if AWS DB fails during dev
    fallback_url = "sqlite:///./fallback_health_platform.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
