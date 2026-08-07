from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import models
import schemas
from core.database import get_db
from core.security import verify_password, create_access_token
from api.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=schemas.UserResponse)
def login(
    credentials: schemas.LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    user = (
        db.query(models.User)
        .filter(models.User.email == credentials.email)
        .first()
    )

    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="Account is deactivated"
        )

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role
    })

    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        secure=True,
        samesite="none",
        max_age=86400
    )

    return user

@router.get("/me", response_model=schemas.UserResponse)
def me(user=Depends(get_current_user)):
    return user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}