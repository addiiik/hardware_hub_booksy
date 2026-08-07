import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, hardware, notifications, rentals, users
from core.config import FRONTEND_URL
from scripts.seed import seed_database
from services.background_tasks import startup_index_unindexed_items


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    threading.Thread(target=startup_index_unindexed_items, daemon=True).start()
    yield


app = FastAPI(title="Booksy Hardware Hub", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(hardware.router)
app.include_router(rentals.router)
app.include_router(notifications.router)