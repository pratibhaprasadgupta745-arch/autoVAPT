from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ScanLog, Scan
from schemas import ScanLogOut
from typing import List

router = APIRouter(prefix="/logs", tags=["logs"])


# ---------------- DB DEPENDENCY ----------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- GET LOGS BY SCAN ID ----------------

@router.get("/{scan_id}", response_model=List[ScanLogOut])
def get_logs(scan_id: int, db: Session = Depends(get_db)):

    # check scan exists
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    logs = db.query(ScanLog)\
        .filter(ScanLog.scan_id == scan_id)\
        .order_by(ScanLog.timestamp.asc())\
        .all()

    return logs


# ---------------- OPTIONAL: CLEAR LOGS ----------------

@router.delete("/{scan_id}")
def delete_logs(scan_id: int, db: Session = Depends(get_db)):

    db.query(ScanLog).filter(ScanLog.scan_id == scan_id).delete()
    db.commit()

    return {"message": "Logs deleted successfully"}