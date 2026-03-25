from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, EmailStr

from database import get_db
from models import User, Scan
from schemas import UserOut, ScanOut

from routers.auth import get_current_user, get_current_admin, get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

# ================= SCHEMA =================
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# ================= CREATE USER =================
@router.post("/")
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)   # ✅ FIX: require login
):

    # 🔒 Only admin can create users
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        email=user_data.email,
        password=get_password_hash(user_data.password),
        role="user",
        is_admin=False,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"detail": "User created", "id": new_user.id}

# ================= GET ALL USERS =================
@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🔥 FIX: better debug + control
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    return db.query(User).all()

# ================= DELETE USER =================
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    db.delete(user)
    db.commit()

    return {"detail": "User deleted"}

# ================= UPDATE ROLE =================
@router.put("/{user_id}/role")
def update_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    db.commit()

    return {"detail": "Role updated"}

# ================= BLOCK / UNBLOCK =================
@router.put("/{user_id}/block")
def block(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()
    return {"detail": "Blocked"}

@router.put("/{user_id}/unblock")
def unblock(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()
    return {"detail": "Unblocked"}

# ================= MAKE ADMIN =================
@router.put("/{user_id}/make-admin")
def make_admin(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = True
    user.role = "admin"
    db.commit()

    return {"detail": "Promoted to admin"}

# ================= REMOVE ADMIN =================
@router.put("/{user_id}/remove-admin")
def remove_admin(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot demote yourself")

    user.is_admin = False
    user.role = "user"
    db.commit()

    return {"detail": "Admin removed"}

# ================= ME =================
@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user

# ================= SCANS =================
@router.get("/{user_id}/scans", response_model=List[ScanOut])
def scans(
    user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    if not user.is_admin and user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return db.query(Scan).filter(Scan.user_id == user_id).all()