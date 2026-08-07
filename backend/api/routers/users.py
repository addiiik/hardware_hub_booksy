from typing import List
from datetime import datetime, timezone
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
import models
import schemas
from core.database import get_db
from api.deps import get_current_user

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])

@router.get("", response_model=List[schemas.UserResponse])
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin role required"
        )
        
    return db.query(models.User).filter(models.User.is_active == True).all()

@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    request: schemas.UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin role required"
        )

    existing_user = db.query(models.User).filter(models.User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail=f"User with email {request.email} already exists"
        )

    pwd_bytes = request.password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

    new_user = models.User(
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        password=hashed_password,
        role=request.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user or not target_user.is_active:
        raise HTTPException(status_code=404, detail="User not found")

    active_rentals = db.query(models.Rental).filter(
        models.Rental.user_id == user_id,
        models.Rental.returned_at.is_(None)
    ).all()

    now = datetime.now(timezone.utc)
    for rental in active_rentals:
        rental.returned_at = now
        rental.item.status = models.StatusEnum.AVAILABLE

    target_user.is_active = False
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)