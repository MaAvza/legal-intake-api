import datetime
from sqlalchemy import Column, Integer, String, DateTime, text, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional, List

# Import the Base class from the database configuration file
from app.core.database import Base 
from sqlalchemy.orm import relationship

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
    
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    role: Mapped[str] = mapped_column(String, default="visitor", nullable=False)

    # relations
    messages: Mapped[List["ChatMessage"]] = relationship("ChatMessage", back_populates="user")
    articles: Mapped[List["Article"]] = relationship("Article", back_populates="author")

    # account tracking
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r}, role={self.role!r})"


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
    
    # Client fingerprint and security
    client_fingerprint: Mapped[Optional[str]] = mapped_column(String, nullable=True, index = True)
    priority_score: Mapped[int] = mapped_column(Integer, default = 0)
    is_deleted: Mapped[bool] = mapped_column(default=False)

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
    

class ChatMessage(Base):
    """
    SQLAlchemy Model for chat messages.
    Updated with article reference for context tracking.

    """
    __tablename__ = "chat_messages"

    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Foreign Key to Ticket
    # ticket_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    # Contact Information (for non-registered users)
    client_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    client_email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    client_phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Message Content
    message: Mapped[str] = mapped_column(String, nullable=False)

    # Timestamps
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # link to registered user if logged in
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    # When user clicks "Discuss This Topic", this stores which article prompted the inquiry
    referenced_article_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("articles.id"),
        nullable=True,
        index=True
    )

    user: Mapped[Optional["User"]] = relationship("User", back_populates="chat_messages")
    referenced_article: Mapped[Optional["Article"]] = relationship("Article")

    def repr(self) -> str:
        return f"ChatMessage(id={self.id!r}, ticket_id={self.ticket_id!r}, message={self.message!r})"
    

class Article(Base):
    """
    SQLAlchemy Model for blog articles.
    Admin-only content creation.
    """
    __tablename__ = "articles"

    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Content Fields
    title: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    excerpt: Mapped[str] = mapped_column(String, nullable=False)  # Short summary
    content: Mapped[str] = mapped_column(String, nullable=False)  # Full HTML content
    
    # Categorization
    category: Mapped[str] = mapped_column(String, index=True, nullable=False)
    language: Mapped[str] = mapped_column(String, index=True, nullable=False)  # 'he' or 'ru'
    
    # Publishing Control
    is_published: Mapped[bool] = mapped_column(default=False)
    published_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )
    
    # Analytics 
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    inquiry_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Author (Foreign Key to User)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    author: Mapped["User"] = relationship("User", back_populates="articles")
    
    # Timestamps
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"Article(id={self.id!r}, title={self.title!r}, language={self.language!r})"
