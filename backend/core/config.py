import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hardware_hub.db")