from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Scan, Vulnerability, ScanLog
from pydantic import BaseModel
import subprocess
import asyncio
from datetime import datetime
import requests
import socket
import threading

from core.crawler import crawl
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
        asyncio.run(send_log(scan_id, message))
    except:
        pass


# ---------------- RISK ----------------
def calculate_risk(vulns):
    score = 0
    for v in vulns:
        if v.severity == "Critical":
            score += 15
        elif v.severity == "High":
            score += 10
        elif v.severity == "Medium":
            score += 5
        else:
            score += 2
    return min(score, 100)


# ---------------- LOGIN TEST ----------------
def login_attack_test(target, db, scan_id):
    log_and_save(db, scan_id, "[*] Running Login Test...")

    for payload in ["admin:admin", "admin:password", "test:test"]:
        try:
            u, p = payload.split(":")
            res = requests.post(
                f"{target}/login",
                data={"username": u, "password": p},
                timeout=10
            )

            if res.status_code == 200:
                db.add(Vulnerability(
                    scan_id=scan_id,
                    name="Weak Login Credentials",
                    severity="Critical",
                    path=target + "/login",
                    description=f"Login success with {payload}",
                    fix="Use strong passwords & MFA",
                    cvss_score=9.5
                ))
        except:
            pass


# ---------------- SQLMAP ----------------
def run_sqlmap(url, db, scan_id):
    try:
        log_and_save(db, scan_id, f"[*] SQLMap → {url}")

        sqlmap = r"C:\AutoVAPT\sqlmap\sqlmap.py"

        out = subprocess.getoutput(
            f'python "{sqlmap}" -u "{url}" --batch --level=3 --risk=2 --timeout=15'
        )

        if any(x in out.lower() for x in ["sql injection", "injectable"]):
            db.add(Vulnerability(
                scan_id=scan_id,
                name="SQL Injection",
                severity="Critical",
                path=url,
                description="SQL Injection detected by SQLMap",
                fix="Use prepared statements / ORM",
                cvss_score=9.8
            ))

    except Exception as e:
        log_and_save(db, scan_id, f"[ERROR] SQLMap: {e}")


# ---------------- XSS ----------------
def run_xss(url, db, scan_id):
    try:
        log_and_save(db, scan_id, f"[*] XSS → {url}")

        payloads = [
            "<script>alert(1)</script>",
            "'><img src=x onerror=alert(1)>",
            "<svg/onload=alert(1)>",
            "\" onmouseover=alert(1) x=\"",
        ]

        for payload in payloads:
            try:
                test_url = f"{url}?q={payload}"
                res = requests.get(test_url, timeout=10)

                if payload.lower() in res.text.lower():
                    db.add(Vulnerability(
                        scan_id=scan_id,
                        name="Reflected XSS",
                        severity="High",
                        path=url,
                        description=f"Payload reflected: {payload}",
                        fix="Sanitize user input",
                        cvss_score=7.5
                    ))
                    break

            except:
                continue

    except Exception as e:
        log_and_save(db, scan_id, f"[ERROR] XSS: {e}")


# ---------------- FFUF ----------------
def run_ffuf(base_url, db, scan_id):
    try:
        log_and_save(db, scan_id, "[*] FFUF Scan...")

        ffuf = r"C:\Users\USER\Downloads\ffuf_2.1.0_windows_amd64\ffuf.exe"
        wordlist = r"C:\Users\USER\Downloads\common.txt"

        out = subprocess.getoutput(
            f'"{ffuf}" -u {base_url}/FUZZ -w "{wordlist}" -mc 200 -t 20 -maxtime 60'
        )

        if "Status:" in out:
            db.add(Vulnerability(
                scan_id=scan_id,
                name="Hidden Endpoints (FFUF)",
                severity="Medium",
                path=base_url,
                description=out[:500],
                fix="Restrict endpoints",
                cvss_score=5.0
            ))

        log_and_save(db, scan_id, "[+] FFUF Done")

    except Exception as e:
        log_and_save(db, scan_id, f"[ERROR] FFUF: {e}")


# ---------------- DIRSEARCH ----------------
def run_dirsearch(base_url, db, scan_id):
    try:
        log_and_save(db, scan_id, "[*] Dirsearch Scan...")

        dirsearch = r"C:\AutoVAPT\dirsearch\dirsearch.py"

        out = subprocess.getoutput(
            f'python "{dirsearch}" -u {base_url} --timeout=10'
        )

        if "200" in out:
            db.add(Vulnerability(
                scan_id=scan_id,
                name="Directory Exposure",
                severity="Medium",
                path=base_url,
                description="Sensitive directories found",
                fix="Restrict access",
                cvss_score=5.5
            ))

    except Exception as e:
        log_and_save(db, scan_id, f"[ERROR] Dirsearch: {e}")


# ---------------- SUBDOMAIN ----------------
def run_subdomain_scan(domain, db, scan_id):
    try:
        log_and_save(db, scan_id, "[*] Subdomain Scan...")

        subs = ["admin", "api", "dev", "test"]

        for sub in subs:
            full = f"{sub}.{domain}"
            try:
                socket.gethostbyname(full)
                db.add(Vulnerability(
                    scan_id=scan_id,
                    name="Subdomain Found",
                    severity="Low",
                    path=full,
                    description=f"Active subdomain: {full}",
                    fix="Restrict unused subdomains",
                    cvss_score=3.5
                ))
            except:
                pass

    except Exception as e:
        log_and_save(db, scan_id, f"[ERROR] Subdomain: {e}")


# ---------------- API FUZZ ----------------
def run_api_fuzz(base_url, db, scan_id):
    try:
        log_and_save(db, scan_id, "[*] API Fuzzing...")

        endpoints = ["api", "admin", "login", "users", "v1", "debug"]

        for ep in endpoints:
            try:
                url = f"{base_url}/{ep}"
                res = requests.get(url, timeout=10)

                if res.status_code in [200, 401, 403]:
                    db.add(Vulnerability(
                        scan_id=scan_id,
                        name="Exposed API Endpoint",
                        severity="Low",
                        path=url,
                        description=f"Accessible endpoint ({res.status_code})",
                        fix="Restrict API access",
                        cvss_score=3.5
                    ))

            except:
                continue

    except Exception as e:
        log_and_save(db, scan_id, f"[ERROR] API Fuzz: {e}")


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

        log_and_save(db, scan_id, "[*] Scan Started")

        urls = crawl(base_url)
        log_and_save(db, scan_id, f"[+] URLs Found: {len(urls)}")

        # -------- TOOLS --------
        run_sqlmap(base_url, db, scan_id)

        for url in urls[:3]:
            run_sqlmap(url, db, scan_id)

        run_xss(base_url, db, scan_id)
        for url in urls[:2]:
            run_xss(url, db, scan_id)

        run_ffuf(base_url, db, scan_id)
        run_dirsearch(base_url, db, scan_id)

        domain = base_url.replace("http://", "").replace("https://", "")
        run_subdomain_scan(domain, db, scan_id)
        run_api_fuzz(base_url, db, scan_id)

        # -------- FINAL --------
        vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == scan_id).all()

        scan.risk_score = calculate_risk(vulns)
        scan.total_vulns = len(vulns)
        scan.status = "Completed"
        scan.completed_at = datetime.utcnow()

        db.commit()

        log_and_save(db, scan_id, f"[DONE] Scan Finished | Risk: {scan.risk_score}")

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
        scan_type="full",
        status="Queued",
        started_at=datetime.utcnow()
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    threading.Thread(target=run_scan, args=(scan.id, req.target)).start()

    return {"scan_id": scan.id}


@router.get("/{scan_id}/status")
def get_status(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    return {
        "status": scan.status,
        "risk_score": scan.risk_score,
        "total_vulns": scan.total_vulns
    }