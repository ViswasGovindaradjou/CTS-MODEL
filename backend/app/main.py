from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.core.config import settings
from app.core.logger import logger
from app.database.connection import engine, Base
from app.services.ml_service import ml_manager

from app.routers import (
    auth,
    users,
    health,
    predict,
    predictions,
    recommendations,
    chat,
    alerts,
    feedback,
    wearable
)

# Initialize database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Chronic Disease Health Monitoring and Risk Prediction Platform APIs",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
def startup_event():
    logger.info("Starting up Chronic Disease Health Monitoring Platform Backend...")
    try:
        ml_manager.load_models()
        logger.info("ML Models initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to load ML models on startup: {e}")
        
    # Initialize MongoDB Atlas Database Connection
    try:
        from app.database.mongo import mongo_manager
        mongo_manager.connect()
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB: {e}")
        
    # Auto-seed demo account
    try:
        from app.database.connection import SessionLocal
        from app.database.models import User
        from app.core.security import get_password_hash
        
        db = SessionLocal()
        demo_email = "demo.patient@aurahealth.ai"
        existing_demo = db.query(User).filter(User.email == demo_email).first()
        if not existing_demo:
            demo_user = User(
                email=demo_email,
                hashed_password=get_password_hash("DemoPatient123!"),
                full_name="Demo Patient",
                age=45,
                gender="male",
                preferred_language="en"
            )
            db.add(demo_user)
            db.commit()
            logger.info(f"Auto-seeded demo account: {demo_email}")
        db.close()
    except Exception as e:
        logger.error(f"Error seeding demo account: {e}")

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception at {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

# Routers inclusion
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(predictions.router)
app.include_router(recommendations.router)
app.include_router(chat.router)
app.include_router(alerts.router)
app.include_router(feedback.router)
app.include_router(wearable.router)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ml_models_loaded": ml_manager.is_loaded,
        "docs_url": "/docs"
    }

@app.get("/api/health-check", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "database": "connected",
        "ml_models": "loaded" if ml_manager.is_loaded else "unloaded"
    }

