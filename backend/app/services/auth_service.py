import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import Admin
from app.schemas import TokenData
import logging

logger = logging.getLogger(__name__)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    logger.info(f"Verifying password...")
    logger.info(f"Plain password: {plain_password}")
    logger.info(f"Hashed password (full): {hashed_password}")
    logger.info(f"Hash length: {len(hashed_password)}")
    
    try:
        result = bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        logger.info(f"bcrypt.checkpw result: {result}")
        return result
    except Exception as e:
        logger.error(f"bcrypt verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        admin_id: int = payload.get("admin_id")
        if admin_id is None:
            raise credentials_exception
        token_data = TokenData(admin_id=admin_id, email=payload.get("email", ""), role=payload.get("role", ""))
    except JWTError:
        raise credentials_exception
    
    admin = db.query(Admin).filter(Admin.id == token_data.admin_id).first()
    if admin is None or not admin.is_active:
        raise credentials_exception
    
    return admin
