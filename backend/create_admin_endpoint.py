# Temporary file - we'll add this as an endpoint
from fastapi import APIRouter
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Admin
from app.services.auth_service import get_password_hash
from datetime import datetime

def create_admin_user():
    db = SessionLocal()
    try:
        # Delete existing admin
        db.query(Admin).filter(Admin.email == "admin@lutonfhc.com").delete()
        
        # Create new admin with properly hashed password
        admin = Admin(
            email="admin@lutonfhc.com",
            password_hash=get_password_hash("Admin123!"),
            name="Admin",
            role="super_admin",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"✅ Admin created!")
        print(f"Email: {admin.email}")
        print(f"Hash: {admin.password_hash}")
        print(f"Is Active: {admin.is_active}")
        
        return admin
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
