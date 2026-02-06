from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, Job, Application
from app.services.auth_service import get_current_admin
from app.schemas import ApplicationResponse, ApplicationStatusUpdate
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/applications", tags=["Applications"])

VALID_STATUSES = ("New", "Reviewed", "Interview", "Hired", "Rejected")
UPLOAD_DIR = "uploads/cvs"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("", response_model=list[ApplicationResponse])
def get_applications(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
    status_filter: str = None,
    job_id: int = None,
):
    query = db.query(Application).order_by(Application.applied_at.desc())
    if status_filter:
        query = query.filter(Application.status == status_filter)
    if job_id:
        query = query.filter(Application.job_id == job_id)
    applications = query.all()
    return [
        ApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            position=app.job.title if app.job else "Unknown",
            name=app.name,
            email=app.email,
            phone=app.phone,
            experience=app.experience,
            availability=app.availability,
            cv_url=app.cv_url,
            status=app.status,
            applied_at=app.applied_at,
            updated_at=app.updated_at,
        )
        for app in applications
    ]


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return ApplicationResponse(
        id=app.id,
        job_id=app.job_id,
        position=app.job.title if app.job else "Unknown",
        name=app.name,
        email=app.email,
        phone=app.phone,
        experience=app.experience,
        availability=app.availability,
        cv_url=app.cv_url,
        status=app.status,
        applied_at=app.applied_at,
        updated_at=app.updated_at,
    )


@router.patch("/{application_id}/status")
def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if status_update.status not in VALID_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
    
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    app.status = status_update.status
    db.commit()
    return {"message": "Status updated successfully"}


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    # Delete CV file if exists
    if app.cv_url:
        cv_path = app.cv_url.replace("/uploads/", "uploads/")
        if os.path.exists(cv_path):
            os.remove(cv_path)
    
    db.delete(app)
    db.commit()
    return {"message": "Application deleted successfully"}


# ── Public Application Submission (no auth) ──────────────
@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_application(
    job_id: int = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    availability: Optional[str] = Form(None),
    cv: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Verify job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    cv_url = None
    
    # Handle CV upload
    if cv:
        # Validate file type
        allowed_extensions = ['.pdf', '.doc', '.docx']
        file_ext = os.path.splitext(cv.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF, DOC, and DOCX files are allowed"
            )
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await cv.read()
            buffer.write(content)
        
        cv_url = f"/uploads/cvs/{unique_filename}"
    
    # Create application
    new_application = Application(
        job_id=job_id,
        name=name,
        email=email,
        phone=phone,
        experience=experience,
        availability=availability,
        cv_url=cv_url,
        status="New"
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return {"message": "Application submitted successfully", "application_id": new_application.id}
