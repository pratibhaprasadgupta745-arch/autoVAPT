# database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

# ---------------- DATABASE CONFIG ----------------

# Environment variables (default values set)
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "autovapt")

# ---------------- SWITCH (AUTO FALLBACK) ----------------
# 👉 If you want SQLite, just set USE_SQLITE=True

USE_SQLITE = True   # 🔥 CHANGE THIS ONLY 

if USE_SQLITE:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./autovapt.db"
else:
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"

# ---------------- ENGINE ----------------

if USE_SQLITE:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        echo=True,
        pool_pre_ping=True
    )

# ---------------- SESSION ----------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ---------------- BASE MODEL ----------------

Base = declarative_base()

# ---------------- DEPENDENCY ----------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()