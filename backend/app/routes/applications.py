from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, Job, Application, NotificationPreference
from app.services.auth_service import get_current_admin
from app.schemas import ApplicationResponse, ApplicationStatusUpdate
from typing import Optional
import os
import uuid
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

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


@router.get("/cv/download")
async def download_cv(
    url: str,
    filename: str = "CV",
    current_admin: Admin = Depends(get_current_admin)
):
    import httpx
    from fastapi.responses import StreamingResponse
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(url)
    # Determine file extension from URL or content-type
    if ".pdf" in url.lower():
        ext = ".pdf"
        media_type = "application/pdf"
    elif ".doc" in url.lower():
        ext = ".doc"
        media_type = "application/msword"
    elif ".docx" in url.lower():
        ext = ".docx"
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        ext = ".pdf"
        media_type = "application/pdf"
    return StreamingResponse(
        iter([response.content]),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}_CV{ext}"'}
    )


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
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
        raise HTTPException(status_code=400, detail="Invalid status")
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
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
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    return {"message": "Application deleted successfully"}


@router.post("/submit")
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
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    cv_url = None
    if cv and cv.filename:
        allowed_extensions = ['.pdf', '.doc', '.docx']
        file_ext = os.path.splitext(cv.filename)[1].lower() or '.pdf'
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are allowed")
        try:
            file_content = await cv.read()
            unique_filename = f"cvs/{uuid.uuid4()}{file_ext}"
            upload_result = cloudinary.uploader.upload(
                file_content,
                public_id=unique_filename,
                resource_type="raw",
                overwrite=True
            )
            cv_url = upload_result["secure_url"]
        except Exception as e:
            import traceback
            print(f"CV upload failed: {e}")
            print(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"CV upload failed: {str(e)}")

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

    try:
        import httpx
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
                            "html": f"<h2>New Job Application</h2><p><strong>Name:</strong> {name}</p><p><strong>Email:</strong> {email}</p><p><strong>Phone:</strong> {phone}</p>"
                        }
                    )
    except Exception:
        pass

    return {"message": "Application submitted successfully", "application_id": new_application.id}
