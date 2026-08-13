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

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_email: str = payload.get("sub")
    if user_email is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == user_email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        age=user_in.age,
        gender=user_in.gender,
        preferred_language=user_in.preferred_language or "en"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(subject=new_user.email)
    logger.info(f"Registered new user: {new_user.email}")
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(new_user))

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    token = create_access_token(subject=user.email)
    logger.info(f"User logged in: {user.email}")
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

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
