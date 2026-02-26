from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin
from app.schemas import LoginRequest, LoginResponse, AdminProfileResponse
from app.services.auth_service import (
    verify_password,
    create_access_token,
    get_current_admin,
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for email: {credentials.email}")
    
    admin = db.query(Admin).filter(Admin.email == credentials.email).first()
    
    if not admin:
        logger.warning(f"Admin not found for email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    logger.info(f"Admin found: {admin.email}, is_active: {admin.is_active}")
    logger.info(f"Password hash from DB (first 20 chars): {admin.password_hash[:20]}")
    
    password_valid = verify_password(credentials.password, admin.password_hash)
    logger.info(f"Password verification result: {password_valid}")
    
    if not password_valid:
        logger.warning("Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not admin.is_active:
        logger.warning("Admin account is not active")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated",
        )

    token_payload = {
        "admin_id": admin.id,
        "email": admin.email,
        "role": admin.role,
    }
    access_token = create_access_token(data=token_payload)

    logger.info(f"Login successful for {admin.email}")
    return LoginResponse(
        access_token=access_token,
        admin_email=admin.email,
        admin_role=admin.role,
        admin_name=admin.name,
    )


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=AdminProfileResponse)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return current_admin
