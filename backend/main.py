from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

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

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
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

    if not user or not verify_password(
        credentials.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
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
def me(
    user=Depends(get_current_user)
):

    return user


@app.post("/api/auth/logout")
def logout(response: Response):

    response.delete_cookie(
        "access_token"
    )

    return {
        "message":"Logged out"
    }