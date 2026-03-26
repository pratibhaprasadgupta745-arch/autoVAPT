from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base


# ------------------ USERS ------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(191), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)

    role = Column(String(50), default="user", index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ADMIN CONTROL
    is_active = Column(Boolean, default=True, index=True)
    is_admin = Column(Boolean, default=False, index=True)
    last_login = Column(DateTime, nullable=True)

    # 🔥 SECURITY (safe defaults)
    failed_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

    # relationships
    scans = relationship("Scan", back_populates="user", cascade="all, delete")
    assets = relationship("Asset", back_populates="user", cascade="all, delete")


# ------------------ ASSETS ------------------

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)

    name = Column(String(255), nullable=False)
    target = Column(String(255), nullable=False, index=True)

    type = Column(String(50), default="web")

    created_at = Column(DateTime, server_default=func.now())

    # relationships
    user = relationship("User", back_populates="assets")
    scans = relationship("Scan", back_populates="asset", cascade="all, delete")


# ------------------ SCANS ------------------

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)

    target = Column(String(255), nullable=False, index=True)

    # ✅ FIX: default value added
    scan_type = Column(String(50), nullable=False, default="full", index=True)

    status = Column(String(50), default="Pending", index=True)

    owasp = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)

    # progress tracking
    progress = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # risk metrics
    risk_score = Column(Integer, default=0, index=True)
    total_vulns = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)

    result = Column(Text)

    # relationships
    user = relationship("User", back_populates="scans")
    asset = relationship("Asset", back_populates="scans")
    vulnerabilities = relationship("Vulnerability", back_populates="scan", cascade="all, delete")
    logs = relationship("ScanLog", back_populates="scan", cascade="all, delete")


# ------------------ VULNERABILITIES ------------------

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)

    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False, index=True)
    severity = Column(String(50), nullable=False, index=True)

    path = Column(String(255), nullable=False)

    description = Column(Text, default="")
    fix = Column(Text, default="")

    created_at = Column(DateTime, server_default=func.now(), index=True)

    scan = relationship("Scan", back_populates="vulnerabilities")

    cvss_score = Column(String(10), default="0.0")
    reference = Column(Text, default="")
    status = Column(String(50), default="Open", index=True)
    cve_id = Column(String(50), default="", index=True)
    owasp_category = Column(String(100), default="", index=True)
    endpoint = Column(String(255), default="/")

    risk_score = Column(Integer, default=0, index=True)
    exploit_available = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)


# ------------------ SCAN LOGS ------------------

class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)

    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)

    message = Column(Text, nullable=False)

    timestamp = Column(DateTime, server_default=func.now(), index=True)

    scan = relationship("Scan", back_populates="logs")


# ------------------ ALERTS ------------------

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    message = Column(Text)
    severity = Column(String(50))

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())


# ------------------ AUDIT LOG ------------------

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    action = Column(String(255))
    target = Column(String(255))

    timestamp = Column(DateTime, server_default=func.now())