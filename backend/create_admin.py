from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import Admin
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(Admin).filter(Admin.email == "admin@lutonfhc.com").first()
        if existing_admin:
            print("Admin already exists!")
            print(f"Email: {existing_admin.email}")
            print(f"Is Active: {existing_admin.is_active}")
            return
        
        # Create new admin
        hashed_password = pwd_context.hash("admin123")
        admin = Admin(
            name="Admin",
            email="admin@lutonfhc.com",
            password_hash=hashed_password,
            role="super_admin",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(admin)
        db.commit()
        print("✅ Admin created successfully!")
        print(f"Email: admin@lutonfhc.com")
        print(f"Password: admin123")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
