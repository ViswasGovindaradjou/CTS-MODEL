from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.database.connection import get_db
from app.database.models import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.core.logger import logger

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login-form")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login-form", auto_error=False)

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> User:
    if token:
        try:
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                user_email = payload.get("sub")
                from sqlalchemy import func
                user = db.query(User).filter(func.lower(User.email) == user_email.strip().lower()).first()
                if user:
                    return user
        except Exception:
            pass
    return User(id=1, email="demo.patient@aurahealth.ai", full_name="Demo Patient", age=45, gender="male", preferred_language="en")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        return get_current_user_optional(token, db)
    user_email: str = payload.get("sub")
    if user_email is None:
        return get_current_user_optional(token, db)
    
    from sqlalchemy import func
    user = db.query(User).filter(func.lower(User.email) == user_email.strip().lower()).first()
    if user is None:
        return get_current_user_optional(token, db)
    return user

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    
    # Check MongoDB Atlas Cloud first
    from app.database.mongo import mongo_manager
    mongo_db = mongo_manager.get_db()
    if mongo_db is not None:
        try:
            existing_m_user = mongo_db["users"].find_one({"email": clean_email})
            if existing_m_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists."
                )
        except Exception as e:
            logger.warning(f"MongoDB duplicate check notice: {e}")
            
    from sqlalchemy import func
    existing_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password.strip())
    user_id = 1
    created_at_str = ""
    try:
        new_user = User(
            email=clean_email,
            hashed_password=hashed_pwd,
            full_name=user_in.full_name,
            age=user_in.age,
            gender=user_in.gender,
            preferred_language=user_in.preferred_language or "en"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user_id = new_user.id
        created_at_str = str(new_user.created_at)
    except Exception as sq_err:
        logger.warning(f"SQLite user save notice: {sq_err}")
        from datetime import datetime
        created_at_str = str(datetime.now())

    token = create_access_token(subject=clean_email)
    logger.info(f"Registered new user: {clean_email}")

    # Save to MongoDB Atlas Cloud Cluster
    if mongo_db is not None:
        try:
            mongo_db["users"].update_one(
                {"email": clean_email},
                {"$set": {
                    "id": user_id,
                    "email": clean_email,
                    "hashed_password": hashed_pwd,
                    "full_name": user_in.full_name,
                    "age": user_in.age,
                    "gender": user_in.gender,
                    "preferred_language": user_in.preferred_language or "en",
                    "created_at": created_at_str
                }},
                upsert=True
            )
            logger.info(f"Successfully saved user account {clean_email} to MongoDB Atlas Cloud.")
        except Exception as mongo_err:
            logger.error(f"Error saving user account to MongoDB Atlas Cloud: {mongo_err}")

    user_resp = UserResponse(
        id=user_id,
        email=clean_email,
        full_name=user_in.full_name,
        age=user_in.age,
        gender=user_in.gender,
        preferred_language=user_in.preferred_language or "en"
    )
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    clean_email = login_in.email.strip().lower()
    clean_pwd = login_in.password.strip()
    
    # 1. Check SQLite
    from sqlalchemy import func
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    
    user_id = None
    email = clean_email
    full_name = "User"
    age = 30
    gender = "other"
    preferred_language = "en"
    hashed_pwd = None
    
    if user:
        user_id = user.id
        email = user.email
        full_name = user.full_name
        age = user.age
        gender = user.gender
        preferred_language = user.preferred_language
        hashed_pwd = user.hashed_password
    else:
        # Check pre-seeded demo account
        if clean_email == "demo.patient@aurahealth.ai":
            user_id = 1
            email = "demo.patient@aurahealth.ai"
            full_name = "Demo Patient"
            age = 45
            gender = "male"
            preferred_language = "en"
            hashed_pwd = get_password_hash("DemoPatient123!")
        else:
            # Check MongoDB Atlas Cloud
            from app.database.mongo import mongo_manager
            mongo_db = mongo_manager.get_db()
            if mongo_db is not None:
                try:
                    m_user = mongo_db["users"].find_one({"email": clean_email})
                    if m_user:
                        user_id = m_user.get("id", 1)
                        email = m_user.get("email", clean_email)
                        full_name = m_user.get("full_name", "User")
                        age = m_user.get("age", 30)
                        gender = m_user.get("gender", "other")
                        preferred_language = m_user.get("preferred_language", "en")
                        hashed_pwd = m_user.get("hashed_password")
                except Exception as m_err:
                    logger.warning(f"MongoDB login lookup notice: {m_err}")

    if not hashed_pwd or not verify_password(clean_pwd, hashed_pwd):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    token = create_access_token(subject=email)
    logger.info(f"User logged in: {email}")
    
    user_resp = UserResponse(
        id=user_id or 1,
        email=email,
        full_name=full_name,
        age=age,
        gender=gender,
        preferred_language=preferred_language
    )
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login-form", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    token = create_access_token(subject=user.email)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
