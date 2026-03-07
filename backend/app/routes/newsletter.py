from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean, DateTime, text
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.database import get_db, Base
from app.models import Admin
from app.services.auth_service import get_current_admin
import httpx
import os

router = APIRouter(prefix="/api/newsletter", tags=["Newsletter"])

# ── Model ──────────────────────────────────────────────
class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)

# ── Schemas ────────────────────────────────────────────
class SubscribeRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class SendNewsletterRequest(BaseModel):
    subject: str
    message: str

# ── Routes ────────────────────────────────────────────
@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
def subscribe(data: SubscribeRequest, db: Session = Depends(get_db)):
    existing = db.execute(
        text("SELECT id FROM newsletter_subscribers WHERE email = :email"),
        {"email": data.email}
    ).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    db.execute(
        text("INSERT INTO newsletter_subscribers (email, name) VALUES (:email, :name)"),
        {"email": data.email, "name": data.name or ""}
    )
    db.commit()
    return {"message": "Successfully subscribed!"}

@router.get("/subscribers", dependencies=[Depends(get_current_admin)])
def get_subscribers(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT id, email, name, is_active, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC")
    ).fetchall()
    return [{"id": r[0], "email": r[1], "name": r[2], "is_active": r[3], "subscribed_at": r[4]} for r in rows]

@router.delete("/subscribers/{subscriber_id}", dependencies=[Depends(get_current_admin)])
def delete_subscriber(subscriber_id: int, db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM newsletter_subscribers WHERE id = :id"), {"id": subscriber_id})
    db.commit()
    return {"message": "Subscriber removed"}

@router.post("/send", dependencies=[Depends(get_current_admin)])
async def send_newsletter(data: SendNewsletterRequest, db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT email, name FROM newsletter_subscribers WHERE is_active = TRUE")
    ).fetchall()
    if not rows:
        raise HTTPException(status_code=400, detail="No active subscribers")

    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        raise HTTPException(status_code=500, detail="Email service not configured")

    emails = [r[0] for r in rows]
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Luton Friendship Homecarers</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1e40af;">{data.subject}</h2>
            <div style="color: #374151; line-height: 1.6;">
                {data.message.replace(chr(10), '<br>')}
            </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Luton Friendship Homecarers | Luton, Bedfordshire, UK</p>
        </div>
    </div>
    """

    failed = []
    async with httpx.AsyncClient() as client:
        for email in emails:
            try:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"},
                    json={
                        "from": "Luton Friendship Homecarers <onboarding@resend.dev>",
                        "to": [email],
                        "subject": data.subject,
                        "html": html_content
                    }
                )
                if response.status_code != 200:
                    failed.append(email)
            except Exception:
                failed.append(email)

    return {
        "message": f"Newsletter sent to {len(emails) - len(failed)} subscribers",
        "failed": failed
    }

# ── Upload Routes ──────────────────────────────────────
import shutil
from fastapi import UploadFile, File

NEWSLETTER_UPLOAD_DIR = "uploads/newsletter"
os.makedirs(NEWSLETTER_UPLOAD_DIR, exist_ok=True)

@router.post("/uploads", dependencies=[Depends(get_current_admin)])
async def upload_newsletter_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    allowed_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif']
    import uuid
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="File type not allowed")

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(NEWSLETTER_UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    file_type = "image" if file_ext in ['.jpg', '.jpeg', '.png', '.gif'] else "document"
    url = f"/uploads/newsletter/{unique_filename}"

    db.execute(
        text("INSERT INTO newsletter_uploads (filename, original_name, file_type, file_size, url) VALUES (:filename, :original_name, :file_type, :file_size, :url)"),
        {"filename": unique_filename, "original_name": file.filename, "file_type": file_type, "file_size": file_size, "url": url}
    )
    db.commit()

    result = db.execute(text("SELECT id FROM newsletter_uploads WHERE filename = :filename"), {"filename": unique_filename}).fetchone()
    return {"id": result[0], "filename": unique_filename, "original_name": file.filename, "file_type": file_type, "file_size": file_size, "url": url}

@router.get("/uploads", dependencies=[Depends(get_current_admin)])
def get_newsletter_uploads(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT id, filename, original_name, file_type, file_size, url, uploaded_at FROM newsletter_uploads ORDER BY uploaded_at DESC")
    ).fetchall()
    return [{"id": r[0], "filename": r[1], "original_name": r[2], "file_type": r[3], "file_size": r[4], "url": r[5], "uploaded_at": r[6]} for r in rows]

@router.delete("/uploads/{upload_id}", dependencies=[Depends(get_current_admin)])
def delete_newsletter_upload(upload_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT filename FROM newsletter_uploads WHERE id = :id"), {"id": upload_id}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="File not found")
    file_path = os.path.join(NEWSLETTER_UPLOAD_DIR, row[0])
    if os.path.exists(file_path):
        os.remove(file_path)
    db.execute(text("DELETE FROM newsletter_uploads WHERE id = :id"), {"id": upload_id})
    db.commit()
    return {"message": "File deleted"}
