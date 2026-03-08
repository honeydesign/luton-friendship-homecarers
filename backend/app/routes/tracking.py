from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.services.auth_service import get_current_admin
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/tracking", tags=["Tracking"])

class TrackRequest(BaseModel):
    page: str
    referrer: Optional[str] = None
    session_id: str
    landing_page: Optional[str] = None

def detect_device(user_agent: str) -> str:
    ua = user_agent.lower()
    if any(x in ua for x in ['mobile', 'android', 'iphone']):
        return 'mobile'
    if 'tablet' in ua or 'ipad' in ua:
        return 'tablet'
    return 'desktop'

def detect_browser(user_agent: str) -> str:
    ua = user_agent.lower()
    if 'chrome' in ua and 'edg' not in ua:
        return 'Chrome'
    if 'firefox' in ua:
        return 'Firefox'
    if 'safari' in ua and 'chrome' not in ua:
        return 'Safari'
    if 'edg' in ua:
        return 'Edge'
    return 'Other'

def detect_source(referrer: str) -> str:
    if not referrer:
        return 'Direct'
    r = referrer.lower()
    if 'google' in r or 'bing' in r or 'yahoo' in r:
        return 'Google Search'
    if 'facebook' in r or 'instagram' in r or 'twitter' in r or 'linkedin' in r:
        return 'Social Media'
    return 'Referral'

@router.post("/track")
async def track_visit(data: TrackRequest, request: Request, db: Session = Depends(get_db)):
    user_agent = request.headers.get("user-agent", "")
    device = detect_device(user_agent)
    browser = detect_browser(user_agent)
    source = detect_source(data.referrer or "")

    # Record page view
    db.execute(
        text("INSERT INTO page_views (page, referrer, device, browser, session_id) VALUES (:page, :referrer, :device, :browser, :session_id)"),
        {"page": data.page, "referrer": data.referrer or "", "device": device, "browser": browser, "session_id": data.session_id}
    )

    # Record unique visit (ignore if session already exists)
    db.execute(
        text("""INSERT INTO site_visits (session_id, device, browser, referrer, landing_page)
                VALUES (:session_id, :device, :browser, :referrer, :landing_page)
                ON CONFLICT (session_id) DO NOTHING"""),
        {"session_id": data.session_id, "device": device, "browser": browser, "referrer": source, "landing_page": data.landing_page or data.page}
    )
    db.commit()
    return {"ok": True}

@router.get("/stats", dependencies=[Depends(get_current_admin)])
def get_stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # Total counts
    total_visitors = db.execute(text("SELECT COUNT(*) FROM site_visits")).scalar()
    total_pageviews = db.execute(text("SELECT COUNT(*) FROM page_views")).scalar()

    # Last 7 days
    weekly_visitors = db.execute(text("SELECT COUNT(*) FROM site_visits WHERE visited_at >= :w"), {"w": week_ago}).scalar()
    weekly_pageviews = db.execute(text("SELECT COUNT(*) FROM page_views WHERE viewed_at >= :w"), {"w": week_ago}).scalar()

    # Daily page views for last 7 days
    daily = db.execute(text("""
        SELECT DATE(viewed_at) as day, COUNT(*) as views
        FROM page_views WHERE viewed_at >= :w
        GROUP BY DATE(viewed_at) ORDER BY day
    """), {"w": week_ago}).fetchall()

    # Traffic sources
    sources = db.execute(text("""
        SELECT referrer, COUNT(*) as count FROM site_visits
        WHERE visited_at >= :w GROUP BY referrer ORDER BY count DESC
    """), {"w": week_ago}).fetchall()

    # Device breakdown
    devices = db.execute(text("""
        SELECT device, COUNT(*) as count FROM site_visits
        WHERE visited_at >= :w GROUP BY device ORDER BY count DESC
    """), {"w": week_ago}).fetchall()

    # Top pages
    top_pages = db.execute(text("""
        SELECT page, COUNT(*) as views FROM page_views
        WHERE viewed_at >= :w GROUP BY page ORDER BY views DESC LIMIT 5
    """), {"w": week_ago}).fetchall()

    total_source = sum(r[1] for r in sources) or 1
    total_device = sum(r[1] for r in devices) or 1

    return {
        "total_visitors": total_visitors,
        "total_pageviews": total_pageviews,
        "weekly_visitors": weekly_visitors,
        "weekly_pageviews": weekly_pageviews,
        "daily_views": [{"day": str(r[0]), "views": r[1]} for r in daily],
        "traffic_sources": [{"source": r[0], "count": r[1], "percent": round(r[1]/total_source*100)} for r in sources],
        "devices": [{"device": r[0], "count": r[1], "percent": round(r[1]/total_device*100)} for r in devices],
        "top_pages": [{"page": r[0], "views": r[1]} for r in top_pages]
    }
