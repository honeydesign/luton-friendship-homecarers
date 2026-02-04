from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, Job, Application
from app.services.auth_service import get_current_admin
from app.schemas import ApplicationResponse, ApplicationStatusUpdate

router = APIRouter(prefix="/api/applications", tags=["Applications"])

VALID_STATUSES = ("New", "Reviewed", "Interview", "Hired", "Rejected")


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


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_status(
    application_id: int,
    update: ApplicationStatusUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if update.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}",
        )

    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app.status = update.status
    db.commit()
    db.refresh(app)

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


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    db.delete(app)
    db.commit()


# ── Public Application Submission (no auth) ──────────────
from pydantic import BaseModel, EmailStr
from typing import Optional

class ApplicationCreate(BaseModel):
    job_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    experience: Optional[str] = None
    availability: Optional[str] = None
    cv_url: Optional[str] = None


@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
):
    # Verify job exists
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    # Create application
    new_application = Application(
        job_id=application.job_id,
        name=application.name,
        email=application.email,
        phone=application.phone,
        experience=application.experience,
        availability=application.availability,
        cv_url=application.cv_url,
        status="New"
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return {"message": "Application submitted successfully", "application_id": new_application.id}
