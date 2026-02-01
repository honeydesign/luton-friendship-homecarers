import sys, os, argparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.database import SessionLocal, engine, Base
from app.models import Admin, NotificationPreference, SystemSetting
from app.services.auth_service import get_password_hash


def seed(email: str, password: str):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.email == email).first()
        if existing:
            print(f"[seed] Admin with email '{email}' already exists. Skipping.")
            return

        admin = Admin(
            email=email,
            password_hash=get_password_hash(password),
            name="Admin User",
            role="super-admin",
            is_active=True,
        )
        db.add(admin)
        db.flush()

        db.add(NotificationPreference(
            admin_id=admin.id,
            email_new_application=True,
            email_new_message=True,
            email_weekly_report=False,
            email_monthly_report=True,
            push_new_application=True,
            push_new_message=False,
        ))

        db.add(SystemSetting(
            admin_id=admin.id,
            site_name="Luton Friendship Homecarers",
            site_email="info@lutonfhc.org.uk",
            site_phone="+44 1582 000000",
            site_address="Luton, Bedfordshire, UK",
            maintenance_mode=False,
            allow_registrations=True,
            social_facebook="https://facebook.com/lutonfhc",
            social_twitter="https://twitter.com/lutonfhc",
            social_linkedin="https://linkedin.com/company/lutonfhc",
            social_instagram="https://instagram.com/lutonfhc",
        ))

        db.commit()
        print(f"[seed] Super-admin created: {email}")
        print("[seed] Default notification preferences and system settings created.")
    except Exception as e:
        db.rollback()
        print(f"[seed] Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the initial super-admin account")
    parser.add_argument("--email", required=True, help="Admin email address")
    parser.add_argument("--password", required=True, help="Admin password (will be hashed)")
    args = parser.parse_args()
    seed(email=args.email, password=args.password)
