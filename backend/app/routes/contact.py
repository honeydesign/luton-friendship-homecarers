from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, ContactInquiry
from app.services.auth_service import get_current_admin
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/contact", tags=["Contact"])


# ── Schemas ────────────────────────────────────────
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
    message: str
    status: str
    admin_reply: Optional[str]
    created_at: datetime
    replied_at: Optional[datetime]

    class Config:
        from_attributes = True


class ReplyRequest(BaseModel):
    reply: str


# ── Public (no auth) ───────────────────────────────
@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_inquiry(
    inquiry: ContactInquiryCreate,
    db: Session = Depends(get_db),
):
    contact = ContactInquiry(
        name=inquiry.name,
        email=inquiry.email,
        phone=inquiry.phone,
        subject=inquiry.subject,
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
    status_filter: Optional[str] = None,
):
    query = db.query(ContactInquiry)
    if status_filter:
        query = query.filter(ContactInquiry.status == status_filter)
    inquiries = query.order_by(ContactInquiry.created_at.desc()).all()
    return inquiries


@router.get("/{inquiry_id}", response_model=ContactInquiryResponse)
def get_inquiry(
    inquiry_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    inquiry = db.query(ContactInquiry).filter(ContactInquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    
    # Mark as read if it's new
    if inquiry.status == "new":
        inquiry.status = "read"
        db.commit()
    
    return inquiry


@router.patch("/{inquiry_id}/reply")
def reply_to_inquiry(
    inquiry_id: int,
    reply_data: ReplyRequest,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    inquiry = db.query(ContactInquiry).filter(ContactInquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    
    inquiry.admin_reply = reply_data.reply
    inquiry.status = "replied"
    inquiry.replied_at = datetime.utcnow()
    db.commit()
    db.refresh(inquiry)
    
    # TODO: Send email to user with the reply
    
    return {"message": "Reply sent successfully"}


@router.patch("/{inquiry_id}/status")
def update_inquiry_status(
    inquiry_id: int,
    status: str,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    inquiry = db.query(ContactInquiry).filter(ContactInquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    
    inquiry.status = status
    db.commit()
    return {"message": "Status updated"}


@router.delete("/{inquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
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
