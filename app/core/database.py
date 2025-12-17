# Database configuration using SQLAlchemy async engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import DATABASE_URL

# Create async engine for PostgreSQL with asyncpg driver
engine = create_async_engine(DATABASE_URL, echo=True)

# Session factory for creating database sessions
AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Base class for all SQLAlchemy models
Base = declarative_base()

# Dependency to get database session in route handlers
async def get_db():
    """
    Async generator that yields a database session.
    Ensures session is closed after request completes.
    """
    async with AsyncSessionLocal() as session:
        yield session
