from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Vulnerability
from schemas import VulnerabilityOut, VulnerabilityCreate
from typing import List

router = APIRouter(prefix="/vulnerabilities", tags=["vulnerabilities"])


# ---------------- DB DEPENDENCY ----------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- GET BY SCAN ----------------

@router.get("/scan/{scan_id}", response_model=List[VulnerabilityOut])
def get_vulnerabilities(scan_id: int, db: Session = Depends(get_db)):
    return db.query(Vulnerability)\
        .filter(Vulnerability.scan_id == scan_id)\
        .order_by(Vulnerability.id.desc())\
        .all()


# ---------------- GET ALL ----------------

@router.get("/", response_model=List[VulnerabilityOut])
def get_all_vulnerabilities(db: Session = Depends(get_db)):
    return db.query(Vulnerability)\
        .order_by(Vulnerability.id.desc())\
        .all()


# ---------------- CREATE ----------------

@router.post("/")
def create_vulnerability(vuln: VulnerabilityCreate, db: Session = Depends(get_db)):

    db_vuln = Vulnerability(
        scan_id=vuln.scan_id,
        name=vuln.name,
        severity=vuln.severity,
        path=vuln.path,
        description=vuln.description or "",
        fix=vuln.fix or "",
    )

    db.add(db_vuln)
    db.commit()
    db.refresh(db_vuln)

    return {
        "message": "Vulnerability saved successfully",
        "vulnerability_id": db_vuln.id
    }


# ---------------- SEVERITY FILTER ----------------

@router.get("/severity/{level}", response_model=List[VulnerabilityOut])
def filter_by_severity(level: str, db: Session = Depends(get_db)):

    return db.query(Vulnerability)\
        .filter(Vulnerability.severity == level)\
        .order_by(Vulnerability.id.desc())\
        .all()


# ---------------- DASHBOARD STATS ----------------

@router.get("/stats")
def get_vulnerability_stats(db: Session = Depends(get_db)):

    total = db.query(Vulnerability).count()

    critical = db.query(Vulnerability).filter(
        Vulnerability.severity == "Critical"
    ).count()

    high = db.query(Vulnerability).filter(
        Vulnerability.severity == "High"
    ).count()

    medium = db.query(Vulnerability).filter(
        Vulnerability.severity == "Medium"
    ).count()

    low = db.query(Vulnerability).filter(
        Vulnerability.severity == "Low"
    ).count()

    return {
        "total": total,
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low
    }


# ---------------- SCAN REPORT ----------------

@router.get("/report/{scan_id}")
def get_scan_report(scan_id: int, db: Session = Depends(get_db)):

    vulns = db.query(Vulnerability).filter(
        Vulnerability.scan_id == scan_id
    ).all()

    report = []

    owasp_map = {
        "SQL Injection": "A03 Injection",
        "Possible SQL Injection": "A03 Injection",
        "Possible Reflected XSS": "A03 Injection",
        "XSS": "A03 Injection",

        "Missing Security Header": "A05 Security Misconfiguration",
        "Open Port": "A05 Security Misconfiguration",
        "FTP Port Open": "A05 Security Misconfiguration",
        "SSH Port Exposed": "A05 Security Misconfiguration",
        "Telnet Port Open": "A05 Security Misconfiguration",
        "MySQL Database Exposed": "A05 Security Misconfiguration",
        "RDP Port Exposed": "A05 Security Misconfiguration"
    }

    severity_cvss = {
        "Critical": "9.0–10",
        "High": "7.0–8.9",
        "Medium": "4.0–6.9",
        "Low": "0.0–3.9"
    }

    for v in vulns:

        report.append({
            "id": v.id,
            "name": v.name,
            "severity": v.severity,
            "cvss_score": severity_cvss.get(v.severity, "N/A"),
            "owasp": owasp_map.get(v.name, "N/A"),
            "path": v.path,
            "description": v.description,
            "fix": v.fix
        })

    return report