from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr

from database import get_db
from models import User

router = APIRouter(prefix="/auth", tags=["Auth"])

# ================= CONFIG =================
SECRET_KEY = "CHANGE_THIS_TO_ENV_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# 🔥 SUPER ADMIN EMAIL (IMPORTANT)
SUPER_ADMIN_EMAIL = "iamadmin@gmail.com"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# ================= PASSWORD =================
def verify_password(plain_password: str, hashed_password: str):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str):
    if not password:
        raise HTTPException(status_code=400, detail="Password required")
    if len(password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password too long")
    return pwd_context.hash(password)

# ================= JWT =================
def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ================= SCHEMAS =================
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class ResetPassword(BaseModel):
    email: EmailStr
    new_password: str

# ================= CURRENT USER =================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User disabled")

    return user

# ================= ADMIN =================
def get_current_admin(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ================= REGISTER =================
@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    is_first_user = db.query(User).count() == 0
    is_super_admin = user.email == SUPER_ADMIN_EMAIL

    new_user = User(
        email=user.email,
        password=get_password_hash(user.password),
        role="admin" if is_first_user or is_super_admin else "user",
        is_active=True,
        is_admin=True if is_first_user or is_super_admin else False,
        last_login=None
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "is_admin": new_user.is_admin
    }

# ================= LOGIN =================
@router.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    # 🔥 FORCE ADMIN IF SUPER ADMIN EMAIL
    if user.email == SUPER_ADMIN_EMAIL and not user.is_admin:
        user.is_admin = True
        user.role = "admin"
        db.commit()

    # update last login
    user.last_login = datetime.utcnow()
    db.commit()

    token = create_token({
        "sub": user.email,
        "role": user.role,
        "is_admin": user.is_admin
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# ================= RESET PASSWORD =================
@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = get_password_hash(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}