from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, Job, Application
from app.services.auth_service import get_current_admin
from app.schemas import ApplicationResponse, ApplicationStatusUpdate
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import cloudinary
import cloudinary.uploader
import tempfile

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)
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
        
        # Upload to Cloudinary
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_content = await cv.read()
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        upload_result = cloudinary.uploader.upload(
            tmp_path,
            public_id=f"cvs/{unique_filename}",
            resource_type="raw"
        )
        import os as _os
        _os.unlink(tmp_path)
        cv_url = upload_result["secure_url"]
    
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
    
    # Send notification email if enabled
    try:
        import os, httpx
        from app.models import NotificationPreference, Admin
        admin = db.query(Admin).first()
        if admin:
            prefs = db.query(NotificationPreference).filter(NotificationPreference.admin_id == admin.id).first()
            if not prefs or prefs.email_new_application:
                resend_api_key = os.getenv("RESEND_API_KEY")
                if resend_api_key:
                    httpx.post(
                        "https://api.resend.com/emails",
                        headers={"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"},
                        json={
                            "from": "onboarding@resend.dev",
                            "to": [admin.email],
                            "subject": f"New Job Application: {name}",
                            "html": f"<h2>New Job Application</h2><p><strong>Name:</strong> {name}</p><p><strong>Email:</strong> {email}</p><p><strong>Phone:</strong> {phone}</p><p><a href='https://luton-friendship-homecarers.vercel.app/admin/applications'>View Application</a></p>"
                        }
                    )
    except Exception:
        pass

    return {"message": "Application submitted successfully", "application_id": new_application.id}


@router.get("/cloudinary-test", dependencies=[])
async def test_cloudinary():
    import os
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "NOT SET")
    api_key = os.getenv("CLOUDINARY_API_KEY", "NOT SET")
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "NOT SET")
    return {
        "cloud_name": cloud_name,
        "api_key": api_key,
        "api_secret_length": len(api_secret) if api_secret != "NOT SET" else 0,
        "api_secret_first5": api_secret[:5] if api_secret != "NOT SET" else "NOT SET"
    }

@router.get("/cv/download")
async def download_cv(
    url: str,
    filename: str = "CV",
    current_admin: Admin = Depends(get_current_admin)
):
    import httpx
    from fastapi.responses import StreamingResponse
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    
    content_type = response.headers.get("content-type", "application/octet-stream")
    ext = ".pdf" if "pdf" in content_type else ""
    
    return StreamingResponse(
        iter([response.content]),
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}_CV{ext}"'}
    )
