import os
from datetime import timedelta

# Database connection string (async driver for PostgreSQL)
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://mayaave:PSQEaven97@localhost/legal_intake"
)

# JWT Configuration
SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
