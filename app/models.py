import datetime
from sqlalchemy import Column, Integer, String, DateTime, text, func
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

# Import the Base class from the database configuration file
from app.core.database import Base 

class User(Base):
    """
    SQLAlchemy Model for the Lawyer/Authenticated User.
    (Phase 1 Focus: Security)
    """
    __tablename__ = "users"

    # Primary Key - auto-incrementing integer
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Required for login (must be unique)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    
    # Hashed password (Phase 1) - Stores the bcrypt hash string.
    # Note: Hashing logic lives in the CRUD layer, not here.
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    
    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r})"


class Ticket(Base):
    """
    SQLAlchemy Model for client case submissions.
    (Phase 2 Focus: Persistence)
    """
    __tablename__ = "tickets"

    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Client Contact Details
    client_name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    client_email: Mapped[str] = mapped_column(String, index=True, nullable=False)
    client_phone: Mapped[str] = mapped_column(String, index=True, nullable=False)

    # Case Details
    event_summary: Mapped[str] = mapped_column(String, nullable=False)
    urgency_level: Mapped[str] = mapped_column(String, default="Low") # e.g., 'Low', 'Court Date Soon'
    status: Mapped[str] = mapped_column(String, default="New") # e.g., 'New', 'Acknowledged'

    # Timestamps - Important for tracking submissions
    # Use func.now() for server_default as a cross-database compatible approach,
    # though text("CURRENT_TIMESTAMP") is also valid for Postgres.
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        onupdate=datetime.datetime.utcnow, 
        nullable=False,
        server_default=func.now() # Use func.now() for consistency
    )
    
    def __repr__(self) -> str:
        return f"Ticket(id={self.id!r}, status={self.status!r}, client_email={self.client_email!r})"