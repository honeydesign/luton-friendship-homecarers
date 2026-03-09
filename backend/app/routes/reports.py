from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models import Admin, NotificationPreference, Application, Job
from datetime import datetime, timedelta
import os, httpx

router = APIRouter(prefix="/api/reports", tags=["Reports"])

SECRET = os.getenv("REPORTS_SECRET", "luton-reports-secret")

def send_email(to: str, subject: str, html: str):
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        return
    httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"},
        json={"from": "onboarding@resend.dev", "to": [to], "subject": subject, "html": html}
    )

@router.post("/send")
def send_report(report_type: str = Query(..., description="weekly or monthly"), secret: str = Query(...), db: Session = Depends(get_db)):
    if secret != SECRET:
        return {"error": "Unauthorized"}

    admin = db.query(Admin).first()
    if not admin:
        return {"error": "No admin found"}

    prefs = db.query(NotificationPreference).filter(NotificationPreference.admin_id == admin.id).first()

    now = datetime.utcnow()
    if report_type == "weekly":
        if prefs and not prefs.email_weekly_report:
            return {"message": "Weekly report disabled"}
        since = now - timedelta(days=7)
        period_label = "Weekly"
    else:
        if prefs and not prefs.email_monthly_report:
            return {"message": "Monthly report disabled"}
        since = now - timedelta(days=30)
        period_label = "Monthly"

    # Gather stats
    new_apps = db.execute(text("SELECT COUNT(*) FROM applications"), }).scalar() or 0
    total_apps = db.execute(text("SELECT COUNT(*) FROM applications")).scalar() or 0
    new_contacts = db.execute(text("SELECT COUNT(*) FROM contact_inquiries WHERE created_at >= :s"), {"s": since}).scalar() or 0
    visitors = db.execute(text("SELECT COUNT(*) FROM site_visits WHERE visited_at >= :s"), {"s": since}).scalar() or 0
    page_views = db.execute(text("SELECT COUNT(*) FROM page_views WHERE viewed_at >= :s"), {"s": since}).scalar() or 0
    active_jobs = db.execute(text("SELECT COUNT(*) FROM jobs WHERE is_active = true")).scalar() or 0

    # Top pages
    top_pages = db.execute(text(
        "SELECT page, COUNT(*) as views FROM page_views WHERE viewed_at >= :s GROUP BY page ORDER BY views DESC LIMIT 5"
    ), {"s": since}).fetchall()
    top_pages_html = "".join([f"<tr><td>{r[0]}</td><td>{r[1]}</td></tr>" for r in top_pages])

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563EB; padding: 2rem; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">{period_label} Report</h1>
            <p style="color: #bfdbfe; margin: 0.5rem 0 0;">{since.strftime('%d %b %Y')} – {now.strftime('%d %b %Y')}</p>
        </div>
        <div style="background: #f8fafc; padding: 2rem; border-radius: 0 0 8px 8px;">
            <h2 style="color: #0f172a;">Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: white;">
                    <td style="padding: 1rem; border: 1px solid #e2e8f0;">🧑 Site Visitors</td>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0; font-weight: bold;">{visitors}</td>
                </tr>
                <tr>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0;">📄 Page Views</td>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0; font-weight: bold;">{page_views}</td>
                </tr>
                <tr style="background: white;">
                    <td style="padding: 1rem; border: 1px solid #e2e8f0;">📝 New Applications</td>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0; font-weight: bold;">{new_apps}</td>
                </tr>
                <tr>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0;">📬 New Contact Inquiries</td>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0; font-weight: bold;">{new_contacts}</td>
                </tr>
                <tr style="background: white;">
                    <td style="padding: 1rem; border: 1px solid #e2e8f0;">💼 Active Jobs</td>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0; font-weight: bold;">{active_jobs}</td>
                </tr>
                <tr>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0;">📋 Total Applications (All Time)</td>
                    <td style="padding: 1rem; border: 1px solid #e2e8f0; font-weight: bold;">{total_apps}</td>
                </tr>
            </table>

            <h2 style="color: #0f172a; margin-top: 2rem;">Top Pages</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #2563EB; color: white;">
                    <th style="padding: 0.75rem; text-align: left;">Page</th>
                    <th style="padding: 0.75rem; text-align: left;">Views</th>
                </tr>
                {top_pages_html}
            </table>

            <div style="margin-top: 2rem; text-align: center;">
                <a href="https://test.lutonfhc.org.uk/admin" style="background: #2563EB; color: white; padding: 0.75rem 2rem; border-radius: 6px; text-decoration: none;">View Admin Dashboard</a>
            </div>
        </div>
    </div>
    """

    send_email(admin.email, f"Luton Friendship Homecarers — {period_label} Report", html)
    return {"message": f"{period_label} report sent to {admin.email}"}
