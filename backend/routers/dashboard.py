from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Vulnerability, Scan, Asset

# 🔥 IMPORT RISK ENGINE
from utils.risk_engine import calculate_risk_score

router = APIRouter()

# ================= DASHBOARD STATS =================
@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):

    vulns = db.query(Vulnerability).all()

    # 🔥 SAFE NULL HANDLING (FIX ADDED)
    vuln_list = [
        {"severity": v.severity or "low"} for v in vulns
    ]

    risk_score = calculate_risk_score(vuln_list)

    return {
        "score": risk_score,

        "assets": db.query(Asset).count(),
        "vulns": len(vulns),
        "scans": db.query(Scan).count(),

        "severity": {
            "critical": len([v for v in vulns if v.severity == "critical"]),
            "high": len([v for v in vulns if v.severity == "high"]),
            "medium": len([v for v in vulns if v.severity == "medium"]),
            "low": len([v for v in vulns if v.severity == "low"])
        }
    }

# ================= FIX 1: RECENT SCANS (MISSING ENDPOINT) =================
@router.get("/dashboard/recent-scans")
def get_recent_scans(db: Session = Depends(get_db)):

    scans = db.query(Scan).order_by(Scan.id.desc()).limit(10).all()

    return [
        {
            "id": s.id,
            "status": getattr(s, "status", "unknown"),
            "created_at": getattr(s, "created_at", None)
        }
        for s in scans
    ]

# ================= FIX 2: ALERTS (MISSING ENDPOINT) =================
@router.get("/dashboard/alerts")
def get_alerts(db: Session = Depends(get_db)):

    vulns = db.query(Vulnerability).order_by(Vulnerability.id.desc()).limit(10).all()

    return [
        {
            "id": v.id,
            "severity": v.severity,
            "message": getattr(v, "title", "Vulnerability detected")
        }
        for v in vulns
    ]