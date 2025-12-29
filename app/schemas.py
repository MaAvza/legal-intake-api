# Pydantic schemas for request/response validation
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ===== Authentication Schemas =====

class UserRegister(BaseModel):
    """Schema for user registration request"""
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """Schema for login request (OAuth2 compatible)"""
    username: EmailStr  # OAuth2 spec uses 'username' field
    password: str

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for decoded JWT payload"""
    email: Optional[str] = None

# ===== Ticket Schemas =====

class TicketCreate(BaseModel):
    """Schema for creating a new ticket (public intake)"""
    client_name: str
    client_email: EmailStr
    client_phone: str
    event_summary: str
    urgency_level: str = "Low"  # Default to Low

class TicketResponse(BaseModel):
    """Schema for ticket response"""
    id: int
    client_name: str
    client_email: str
    client_phone: str
    event_summary: str
    urgency_level: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enables ORM mode for SQLAlchemy models


# ==== Chat Schemas ====

class ChatMessageCreate(BaseModel):
    message_content: str
    client_fingerprint: str

class ChatMessageResponse(BaseModel):
    id: int
    message_content: str
    created_at: datetime
    is_from_user: bool  # True if associated with registered user
    
    class Config:
        from_attributes = True

