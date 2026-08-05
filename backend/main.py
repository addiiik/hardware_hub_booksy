from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

import models
import schemas
from database import get_db
from seed import seed_database
from auth import (
    verify_password,
    create_access_token,
    decode_access_token
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    yield

app = FastAPI(title="Booksy Hardware Hub", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db)
):
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    token = access_token.replace("Bearer ", "")
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="Account is deactivated"
        )

    return user

@app.post(
    "/api/auth/login",
    response_model=schemas.UserResponse
)
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
        secure=False,
        samesite="lax",
        max_age=86400
    )

    return user

@app.get(
    "/api/auth/me",
    response_model=schemas.UserResponse
)
def me(user=Depends(get_current_user)):
    return user

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message":"Logged out"}

@app.get(
    "/api/hardware",
    response_model=List[schemas.HardwareItemResponse]
)
def get_hardware_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    items = (
        db.query(models.HardwareItem)
        .filter(models.HardwareItem.rentable == True)
        .all()
    )
    return items

@app.get(
    "/api/admin/hardware",
    response_model=List[schemas.HardwareItemResponse]
)
def get_admin_hardware_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin role required"
        )

    items = db.query(models.HardwareItem).all()
    return items

@app.get(
    "/api/rentals/me",
    response_model=List[schemas.MyRentalResponse]
)
def get_my_rentals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rentals = (
        db.query(models.Rental)
        .filter(models.Rental.user_id == current_user.id)
        .filter(models.Rental.returned_at.is_(None))
        .all()
    )
    return rentals

@app.get(
    "/api/admin/repairs",
    response_model=List[schemas.RepairResponse]
)
def get_admin_repairs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    return db.query(models.Repair).filter(models.Repair.repair_end_date.is_(None)).all()

@app.post(
    "/api/admin/hardware/{hardware_id}/toggle-repair",
    response_model=schemas.HardwareItemResponse
)
def toggle_hardware_repair(
    hardware_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    item = db.query(models.HardwareItem).filter(models.HardwareItem.id == hardware_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hardware item not found")

    if item.status == models.StatusEnum.IN_REPAIR:
        active_repair = db.query(models.Repair).filter(
            models.Repair.item_id == hardware_id,
            models.Repair.repair_end_date.is_(None)
        ).first()

        if active_repair:
            active_repair.repair_end_date = datetime.now(timezone.utc)
        
        item.status = models.StatusEnum.AVAILABLE

    else:
        if item.status == models.StatusEnum.IN_USE:
            raise HTTPException(
                status_code=400, 
                detail="Cannot send item to repair while it is currently in use"
            )

        new_repair = models.Repair(
            item_id=hardware_id,
            repair_start_date=datetime.now(timezone.utc)
        )
        db.add(new_repair)
        item.status = models.StatusEnum.IN_REPAIR

    db.commit()
    db.refresh(item)
    return item


@app.post(
    "/api/hardware/{hardware_id}/toggle-rent",
    response_model=schemas.HardwareItemResponse
)
def toggle_hardware_rent(
    hardware_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.HardwareItem).filter(models.HardwareItem.id == hardware_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hardware item not found")

    if item.status == models.StatusEnum.IN_REPAIR:
        raise HTTPException(status_code=400, detail="Cannot rent an item that is currently in repair")

    active_rental = db.query(models.Rental).filter(
        models.Rental.item_id == hardware_id,
        models.Rental.returned_at.is_(None)
    ).first()

    if item.status == models.StatusEnum.IN_USE:
        if not active_rental:
            raise HTTPException(status_code=400, detail="No active rental found for this item")

        if active_rental.user_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to return this rental")
            
        active_rental.returned_at = datetime.now(timezone.utc)
        item.status = models.StatusEnum.AVAILABLE

    else:
        if not item.rentable:
            raise HTTPException(status_code=400, detail="This item is marked as non-rentable")

        if active_rental:
            raise HTTPException(status_code=400, detail="Item is already rented")

        new_rental = models.Rental(
            user_id=current_user.id,
            item_id=hardware_id,
            rented_at=datetime.now(timezone.utc)
        )
        db.add(new_rental)
        item.status = models.StatusEnum.IN_USE

    db.commit()
    db.refresh(item)
    return item

@app.get(
    "/api/admin/users",
    response_model=List[schemas.UserResponse]
)
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

@app.post(
    "/api/admin/users",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED
)
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

    import bcrypt
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

@app.delete("/api/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
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

@app.post(
    "/api/admin/hardware",
    response_model=schemas.HardwareItemResponse,
    status_code=status.HTTP_201_CREATED
)
def create_hardware_item(
    request: schemas.HardwareCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin role required"
        )

    existing_item = db.query(models.HardwareItem).filter(
        models.HardwareItem.serial_number == request.serial_number
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=400,
            detail=f"Hardware with serial number '{request.serial_number}' already exists"
        )

    new_item = models.HardwareItem(
        name=request.device_name,
        serial_number=request.serial_number,
        brand=request.brand,
        category=request.category,
        status=request.status,
        purchase_date=request.purchase_date,
        rentable=request.rentable
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item

@app.delete("/api/admin/hardware/{hardware_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hardware(
    hardware_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    item = db.query(models.HardwareItem).filter(models.HardwareItem.id == hardware_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hardware item not found")

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)