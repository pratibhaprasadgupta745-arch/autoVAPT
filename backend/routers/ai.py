from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Vulnerability

router = APIRouter(prefix="/ai", tags=["AI"])


# ---------------- DB ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- AI EXPLOIT GENERATOR ----------------
def generate_exploit(vuln):
    name = vuln.name.lower()

    if "sql" in name:
        return "Try payload: ' OR 1=1 --"

    elif "xss" in name:
        return "<script>alert('XSS')</script>"

    elif "login" in name or "auth" in name:
        return "Try brute-force or credential stuffing attack"

    elif "header" in name:
        return "Exploit via clickjacking or CSP bypass"

    elif "port" in name:
        return "Try service exploitation using Metasploit"

    return "Manual testing required"


# ---------------- API ----------------
@router.get("/exploit/{scan_id}")
def get_exploits(scan_id: int, db: Session = Depends(get_db)):

    vulns = db.query(Vulnerability).filter(
        Vulnerability.scan_id == scan_id
    ).all()

    result = []

    for v in vulns:
        result.append({
            "name": v.name,
            "severity": v.severity,
            "exploit": generate_exploit(v)
        })

    return result