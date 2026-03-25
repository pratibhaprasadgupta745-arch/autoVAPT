from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

# routers
from routers import auth, users, scans, vulnerabilities
from routers import logs
from routers import dashboard
from routers import report
from routers import ai
from routers import scan_ws

# workers
from scan_queue import start_workers

# ---------------- CREATE TABLES ----------------
Base.metadata.create_all(bind=engine)

# ---------------- APP ----------------
app = FastAPI(
    title="AutoVAPT Backend",
    version="1.0.0"
)

# ---------------- CORS ----------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROUTERS ----------------
app.include_router(auth.router)
app.include_router(users.router)   # ✅ USERS ROUTE ACTIVE
app.include_router(scans.router)
app.include_router(vulnerabilities.router)
app.include_router(logs.router)
app.include_router(scan_ws.router)
app.include_router(dashboard.router)
app.include_router(report.router)
app.include_router(ai.router)

# ---------------- DEBUG ROUTE ----------------
@app.get("/routes")
def list_routes():
    return [route.path for route in app.routes]

# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"message": "AutoVAPT Backend Running 🚀"}

# ---------------- STARTUP ----------------
@app.on_event("startup")
def startup_event():
    print("🔥 Starting AutoVAPT Workers...")
    start_workers()

# ---------------- SHUTDOWN ----------------
@app.on_event("shutdown")
def shutdown_event():
    print("🛑 Stopping AutoVAPT Backend...")