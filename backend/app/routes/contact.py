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
    
    inquiry.admin_reply = reply_data.get("reply")
    inquiry.status = "replied"
    inquiry.replied_at = datetime.utcnow()
    
    db.commit()
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
