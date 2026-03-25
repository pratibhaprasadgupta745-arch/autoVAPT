from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ================== USERS ==================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr 
    role: str
    created_at: datetime

    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


# ================== AUTH TOKEN ==================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ================== SCANS ==================

class ScanCreate(BaseModel):
    target: str
    scan_type: str
    owasp: Optional[List[str]] = []


class ScanOut(BaseModel):
    id: int
    target: str
    scan_type: str
    status: str
    created_at: datetime

    user_id: Optional[int] = None

    # 🔥 NEW
    progress: Optional[int] = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ================== VULNERABILITIES ==================

class VulnerabilityOut(BaseModel):
    id: int
    scan_id: int
    name: str
    severity: str
    path: str

    fix: Optional[str] = ""
    description: Optional[str] = ""
    created_at: Optional[datetime] = None

    # 🔥 ENTERPRISE DATA
    cvss_score: Optional[str] = "0.0"
    reference: Optional[str] = ""
    cve_id: Optional[str] = ""
    owasp_category: Optional[str] = ""
    endpoint: Optional[str] = ""
    status: Optional[str] = "Open"
    risk_score: Optional[int] = 0

    class Config:
        from_attributes = True


class VulnerabilityCreate(BaseModel):
    scan_id: int
    name: str
    severity: str
    path: str

    description: Optional[str] = ""
    fix: Optional[str] = ""

    cvss_score: Optional[str] = "0.0"
    reference: Optional[str] = ""
    cve_id: Optional[str] = ""
    owasp_category: Optional[str] = ""
    endpoint: Optional[str] = ""


class VulnerabilityUpdate(BaseModel):
    status: Optional[str] = None
    risk_score: Optional[int] = None


# ================== SCAN LOGS ==================

class ScanLogOut(BaseModel):
    id: int
    scan_id: int
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True


# ================== SCAN RELATIONS ==================

class ScanWithVulnerabilities(BaseModel):
    id: int
    target: str
    scan_type: str
    status: str
    created_at: datetime

    vulnerabilities: List[VulnerabilityOut] = []

    class Config:
        from_attributes = True


class ScanWithLogs(BaseModel):
    id: int
    target: str
    scan_type: str
    status: str
    created_at: datetime

    logs: List[ScanLogOut] = []

    class Config:
        from_attributes = True


# ================== DASHBOARD / ANALYTICS ==================

class DashboardStats(BaseModel):
    total_scans: int
    total_vulnerabilities: int
    critical: int
    high: int
    medium: int
    low: int


# ================== ALERT SYSTEM ==================

class Alert(BaseModel):
    message: str
    severity: str
    created_at: datetime


# ================== REPORT FILTER ==================

class ReportFilter(BaseModel):
    severity: Optional[str] = None
    target: Optional[str] = None