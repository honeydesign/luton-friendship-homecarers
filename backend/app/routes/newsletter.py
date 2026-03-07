from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
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
import shutil
import uuid
import cloudinary
import cloudinary.uploader
import tempfile

router = APIRouter(prefix="/api/newsletter", tags=["Newsletter"])

NEWSLETTER_UPLOAD_DIR = "uploads/newsletter"
os.makedirs(NEWSLETTER_UPLOAD_DIR, exist_ok=True)

BACKEND_URL = os.getenv("BACKEND_URL", "https://luton-friendship-homecarers-production.up.railway.app")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# ── Models ─────────────────────────────────────────────
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
    image_ids: Optional[List[int]] = []
    attachment_ids: Optional[List[int]] = []

# ── Subscribe ──────────────────────────────────────────
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

# ── Subscribers ────────────────────────────────────────
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

# ── Send Newsletter ────────────────────────────────────
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

    # Fetch selected images
    images_html = ""
    if data.image_ids:
        for img_id in data.image_ids:
            img = db.execute(text("SELECT url, original_name FROM newsletter_uploads WHERE id = :id"), {"id": img_id}).fetchone()
            if img:
                images_html += f'<div style="margin: 16px 0;"><img src="{img[0]}" alt="{img[1]}" style="max-width:100%; border-radius:8px;"></div>'

    # Fetch attachments from Cloudinary URLs
    attachments = []
    if data.attachment_ids:
        import base64
        async with httpx.AsyncClient() as dl_client:
            for att_id in data.attachment_ids:
                att = db.execute(text("SELECT url, original_name FROM newsletter_uploads WHERE id = :id"), {"id": att_id}).fetchone()
                if att:
                    try:
                        resp = await dl_client.get(att[0])
                        if resp.status_code == 200:
                            encoded = base64.b64encode(resp.content).decode()
                            attachments.append({
                                "filename": att[1],
                                "content": encoded
                            })
                    except Exception:
                        pass

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Luton Friendship Homecarers</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1e40af; margin-top: 0;">{data.subject}</h2>
            {images_html}
            <div style="color: #374151; line-height: 1.8; font-size: 15px;">
                {data.message.replace(chr(10), '<br>')}
            </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin:0;">Luton Friendship Homecarers | Luton, Bedfordshire, UK</p>
        </div>
    </div>
    """

    emails = [r[0] for r in rows]
    failed = []

    async with httpx.AsyncClient() as client:
        for email in emails:
            payload = {
                "from": "Luton Friendship Homecarers <onboarding@resend.dev>",
                "to": [email],
                "subject": data.subject,
                "html": html_content
            }
            if attachments:
                payload["attachments"] = attachments
            try:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"},
                    json=payload
                )
                if response.status_code != 200:
                    failed.append(email)
            except Exception:
                failed.append(email)

    sent_count = len(emails) - len(failed)

    # Save to history with attachment info
    attachment_info = []
    if data.attachment_ids:
        for att_id in data.attachment_ids:
            att = db.execute(text("SELECT original_name, url FROM newsletter_uploads WHERE id = :id"), {"id": att_id}).fetchone()
            if att:
                attachment_info.append({"name": att[0], "url": att[1]})

    import json
    db.execute(
        text("INSERT INTO newsletter_history (subject, message, sent_to, failed, attachments) VALUES (:subject, :message, :sent_to, :failed, :attachments)"),
        {"subject": data.subject, "message": data.message, "sent_to": sent_count, "failed": len(failed), "attachments": json.dumps(attachment_info)}
    )
    db.commit()

    return {"message": f"Newsletter sent to {sent_count} subscribers", "failed": failed}

# ── History ────────────────────────────────────────────
@router.get("/history", dependencies=[Depends(get_current_admin)])
def get_newsletter_history(db: Session = Depends(get_db)):
    import json
    rows = db.execute(
        text("SELECT id, subject, message, sent_to, failed, sent_at, attachments FROM newsletter_history ORDER BY sent_at DESC")
    ).fetchall()
    result = []
    for r in rows:
        attachments = []
        try:
            attachments = json.loads(r[6]) if r[6] else []
        except Exception:
            pass
        result.append({"id": r[0], "subject": r[1], "message": r[2], "sent_to": r[3], "failed": r[4], "sent_at": r[5], "attachments": attachments})
    return result

# ── Uploads ────────────────────────────────────────────
@router.post("/uploads", dependencies=[Depends(get_current_admin)])
async def upload_newsletter_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    allowed_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="File type not allowed")

    file_type = "image" if file_ext in ['.jpg', '.jpeg', '.png', '.gif'] else "document"
    unique_filename = f"{uuid.uuid4()}{file_ext}"

    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    file_size = os.path.getsize(tmp_path)

    # Upload to Cloudinary
    resource_type = "image" if file_type == "image" else "raw"
    upload_result = cloudinary.uploader.upload(
        tmp_path,
        public_id=f"newsletter/{unique_filename}",
        resource_type=resource_type
    )
    os.unlink(tmp_path)

    cloudinary_url = upload_result["secure_url"]

    db.execute(
        text("INSERT INTO newsletter_uploads (filename, original_name, file_type, file_size, url) VALUES (:filename, :original_name, :file_type, :file_size, :url)"),
        {"filename": unique_filename, "original_name": file.filename, "file_type": file_type, "file_size": file_size, "url": cloudinary_url}
    )
    db.commit()

    result = db.execute(text("SELECT id FROM newsletter_uploads WHERE filename = :filename"), {"filename": unique_filename}).fetchone()
    return {"id": result[0], "filename": unique_filename, "original_name": file.filename, "file_type": file_type, "file_size": file_size, "url": cloudinary_url}

@router.get("/uploads", dependencies=[Depends(get_current_admin)])
def get_newsletter_uploads(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT id, filename, original_name, file_type, file_size, url, uploaded_at FROM newsletter_uploads ORDER BY uploaded_at DESC")
    ).fetchall()
    return [{"id": r[0], "filename": r[1], "original_name": r[2], "file_type": r[3], "file_size": r[4], "url": r[5], "uploaded_at": r[6]} for r in rows]

@router.delete("/uploads/{upload_id}", dependencies=[Depends(get_current_admin)])
def delete_newsletter_upload(upload_id: int, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT filename, file_type FROM newsletter_uploads WHERE id = :id"), {"id": upload_id}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        resource_type = "image" if row[1] == "image" else "raw"
        public_id = f"newsletter/{row[0]}"
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
    except Exception:
        pass
    db.execute(text("DELETE FROM newsletter_uploads WHERE id = :id"), {"id": upload_id})
    db.commit()
    return {"message": "File deleted"}
