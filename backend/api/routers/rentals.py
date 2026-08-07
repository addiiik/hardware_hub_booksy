from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
import schemas
from core.database import get_db
from api.deps import get_current_user

router = APIRouter(prefix="/api/rentals", tags=["rentals"])

@router.get("/me", response_model=List[schemas.MyRentalResponse])
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