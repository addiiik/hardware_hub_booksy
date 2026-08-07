from fastapi import Depends, HTTPException, Cookie
from sqlalchemy.orm import Session
import models
from core.database import get_db
from core.security import decode_access_token

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