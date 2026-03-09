import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Admin, ContactInquiry
from app.services.auth_service import get_current_admin
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/api/contact", tags=["Contact"])

class ContactInquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str

class ContactInquiryResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    subject: Optional[str]
    category: Optional[str]
    message: str
    status: str
    admin_reply: Optional[str]
    created_at: datetime
    replied_at: Optional[datetime]

    class Config:
        from_attributes = True

# ── Public Route ───────────────────────────────────
@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_inquiry(
    inquiry: ContactInquiryCreate,
    db: Session = Depends(get_db),
):
    contact = ContactInquiry(
        name=inquiry.name,
        email=inquiry.email,
        phone=inquiry.phone,
        subject=inquiry.subject,  # This now stores the category
        message=inquiry.message,
        status="new"
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return {"message": "Thank you for contacting us! We'll get back to you soon."}

# ── Admin Routes ───────────────────────────────────
@router.get("", response_model=list[ContactInquiryResponse])
def get_inquiries(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    inquiries = db.query(ContactInquiry).order_by(ContactInquiry.created_at.desc()).all()
    return [
        ContactInquiryResponse(
            id=inq.id,
            name=inq.name,
            email=inq.email,
            phone=inq.phone,
            subject=inq.subject,
            category=inq.subject,  # Map subject to category
            message=inq.message,
            status=inq.status,
            admin_reply=inq.admin_reply,
            created_at=inq.created_at,
            replied_at=inq.replied_at,
        )
        for inq in inquiries
    ]

@router.patch("/{inquiry_id}/reply")
def reply_to_inquiry(
    inquiry_id: int,
    reply_data: dict,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    inquiry = db.query(ContactInquiry).filter(ContactInquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    
    reply_text = reply_data.get("reply")
    inquiry.admin_reply = reply_text
    inquiry.status = "replied"
    inquiry.replied_at = datetime.utcnow()
    db.commit()

    # Send email via Resend
    try:
        resend_api_key = os.getenv("RESEND_API_KEY")
        if resend_api_key:
            import httpx as _httpx
            _httpx.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"},
                json={
                    "from": "onboarding@resend.dev",
                    "to": [inquiry.email],
                    "subject": f"Re: {inquiry.subject or 'Your Inquiry'} - Luton Friendship Homecarers",
                    "html": f"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: #2563EB; padding: 24px; border-radius: 8px 8px 0 0;">
                                <h2 style="color: white; margin: 0;">Luton Friendship Homecarers</h2>
                            </div>
                            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                                <p>Dear {inquiry.name},</p>
                                <p>Thank you for contacting us. Here is our response to your inquiry:</p>
                                <div style="background: #f8fafc; padding: 16px; border-left: 4px solid #2563EB; border-radius: 4px; margin: 16px 0;">
                                    {reply_text}
                                </div>
                                <p style="color: #64748b; font-size: 0.875rem;">Your original message: <em>{inquiry.message}</em></p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                                <p style="color: #64748b; font-size: 0.8rem;">Luton Friendship Homecarers | info@lutonfhc.org.uk</p>
                            </div>
                        </div>
                    """
                },
                timeout=10
            )
    except Exception as e:
        print(f"Email send error: {e}")

    return {"message": "Reply sent successfully"}

@router.delete("/{inquiry_id}")
def delete_inquiry(
    inquiry_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    inquiry = db.query(ContactInquiry).filter(ContactInquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    
    db.delete(inquiry)
    db.commit()
    return {"message": "Inquiry deleted successfully"}

@router.patch("/{inquiry_id}/read")
def mark_as_read(
    inquiry_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    inquiry = db.query(ContactInquiry).filter(ContactInquiry.id == inquiry_id).first()
    if inquiry and inquiry.status == "new":
        inquiry.status = "read"
        db.commit()
    return {"message": "Marked as read"}
