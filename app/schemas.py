# Pydantic schemas for request/response validation
from pydantic import BaseModel, EmailStr, field_validator
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

# ==== Article Schemas ====

class ArticleCreate(BaseModel):
    """Schema for creating a new article (admin only)"""
    title: str
    slug: str
    excerpt: str
    content: str  # Raw HTML from editor
    category: str
    language: str
    is_published: bool = False  # Default to draft
    
    @field_validator('language')
    def validate_language(cls, v):
        if v not in ['he', 'ru']:
            raise ValueError('Language must be "he" or "ru"')
        return v
    
    @field_validator('category')
    def validate_category(cls, v):
        valid_categories = [
            "Labor Law",
            "Family Law", 
            "Immigration",
            "Real Estate",
            "General"
        ]
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {", ".join(valid_categories)}')
        return v
    
    @field_validator('slug')
    def validate_slug(cls, v):
        # Ensure slug is URL-safe (lowercase, hyphens only)
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Slug must contain only letters, numbers, hyphens, and underscores')
        return v.lower()


class ArticleUpdate(BaseModel):
    """Schema for updating an existing article"""
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    is_published: Optional[bool] = None
    
    @field_validator('language')
    def validate_language(cls, v):
        if v is not None and v not in ['he', 'ru']:
            raise ValueError('Language must be "he" or "ru"')
        return v
    
    @field_validator('slug')
    def validate_slug(cls, v):
        if v is not None and not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Slug must contain only letters, numbers, hyphens, and underscores')
        return v.lower() if v else None


class ArticleResponse(BaseModel):
    """Schema for article response (public and admin)"""
    id: int
    title: str
    slug: str
    excerpt: str
    content: str
    category: str
    language: str
    is_published: bool
    published_at: Optional[datetime]
    view_count: int
    inquiry_count: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ArticleListItem(BaseModel):
    """Lightweight schema for article list/feed (without full content)"""
    id: int
    title: str
    slug: str
    excerpt: str
    category: str
    language: str
    published_at: Optional[datetime]
    view_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True