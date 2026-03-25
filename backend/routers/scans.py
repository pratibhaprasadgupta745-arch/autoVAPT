from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Scan, Vulnerability, ScanLog
from typing import List
from pydantic import BaseModel
import subprocess
import asyncio
from datetime import datetime
import requests
import socket
import threading

from core.crawler import crawl
from scan_queue import add_scan
from routers.scan_ws import send_log

router = APIRouter(prefix="/scans", tags=["scans"])

# ---------------- DB ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- LOG ----------------
def log_and_save(db, scan_id, message):
    try:
        db.add(ScanLog(scan_id=scan_id, message=message))
        db.commit()
    except:
        db.rollback()

    try:
        loop = asyncio.get_event_loop()
        loop.create_task(send_log(scan_id, message))
    except:
        pass

# ---------------- RISK ----------------
def calculate_risk(vulns):
    score = 0

    for v in vulns:
        if v.severity == "Critical":
            score += 10
        elif v.severity == "High":
            score += 7
        elif v.severity == "Medium":
            score += 4
        else:
            score += 1

    return min(score, 100)

# ---------------- LOGIN TEST ----------------
def login_attack_test(target, db, scan_id):
    log_and_save(db, scan_id, "[*] Running Login Attack Test...")

    test_payloads = ["admin:admin", "admin:password", "test:test"]

    for payload in test_payloads:
        try:
            username, password = payload.split(":")

            res = requests.post(
                f"{target}/login",
                data={"username": username, "password": password},
                timeout=5
            )

            if res.status_code == 200:
                db.add(Vulnerability(
                    scan_id=scan_id,
                    name="Weak Login Credentials",
                    severity="Critical",
                    path=target + "/login",
                    description=f"Login success with {payload}",
                    fix="Use strong passwords & MFA",
                    cvss_score=9.5,
                    owasp_category="A07: Auth Failures"
                ))
        except:
            continue

# ---------------- SCAN ENGINE ----------------
def run_scan(scan_id, target):
    db = SessionLocal()

    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return

        scan.status = "Running"
        db.commit()

        base_url = target if target.startswith("http") else f"http://{target}"

        log_and_save(db, scan_id, "[*] Starting Scan")

        urls = crawl(base_url)
        log_and_save(db, scan_id, f"[+] Found {len(urls)} URLs")

        # NMAP
        try:
            host = target.replace("http://", "").replace("https://", "")
            ip = socket.gethostbyname(host)

            output = subprocess.getoutput(f"nmap -F {ip}")

            if "open" in output:
                db.add(Vulnerability(
                    scan_id=scan_id,
                    name="Open Ports Detected",
                    severity="Medium",
                    path=host,
                    description=output,
                    fix="Close unnecessary ports",
                    cvss_score=5.5
                ))
        except:
            pass

        db.commit()

        # HEADERS
        try:
            res = requests.get(base_url, timeout=5)

            if "X-Frame-Options" not in res.headers:
                db.add(Vulnerability(
                    scan_id=scan_id,
                    name="Missing X-Frame-Options",
                    severity="Medium",
                    path=base_url,
                    description="Clickjacking risk",
                    fix="Add security headers",
                    cvss_score=5.5
                ))
        except:
            pass

        db.commit()

        login_attack_test(base_url, db, scan_id)
        db.commit()

        vulns = db.query(Vulnerability).filter(
            Vulnerability.scan_id == scan_id
        ).all()

        risk = calculate_risk(vulns)

        scan.risk_score = risk
        scan.total_vulns = len(vulns)
        scan.status = "Completed"
        scan.completed_at = datetime.utcnow()

        db.commit()

        log_and_save(db, scan_id, f"[DONE] Scan Completed | Risk Score: {risk}")

    except Exception as e:
        scan.status = "Failed"
        db.commit()
        log_and_save(db, scan_id, f"[ERROR] {str(e)}")

    finally:
        db.close()

# ---------------- API ----------------
class ScanRequest(BaseModel):
    target: str

@router.post("/")
def start_scan(req: ScanRequest, db: Session = Depends(get_db)):

    scan = Scan(
        target=req.target,
        scan_type="single",
        status="Queued",
        started_at=datetime.utcnow()
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    threading.Thread(target=run_scan, args=(scan.id, req.target)).start()

    return {"message": "Scan started", "scan_id": scan.id}

@router.get("/{scan_id}/status")
def get_scan_status(scan_id: int, db: Session = Depends(get_db)):

    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        return {"error": "Scan not found"}

    return {
        "status": scan.status,
        "risk_score": scan.risk_score,
        "total_vulns": scan.total_vulns
    }

@router.post("/multi")
def multi_target_scan(targets: List[str], db: Session = Depends(get_db)):

    scan_ids = []

    for target in targets:
        scan = Scan(
            target=target,
            scan_type="multi",
            status="Queued",
            started_at=datetime.utcnow()
        )

        db.add(scan)
        db.commit()
        db.refresh(scan)

        add_scan(scan.id, target)
        scan_ids.append(scan.id)

    return {
        "message": "Multi-target scan started",
        "scan_ids": scan_ids
    }

@router.get("/")
def get_scans(db: Session = Depends(get_db)):
    return db.query(Scan).order_by(Scan.created_at.desc()).all()