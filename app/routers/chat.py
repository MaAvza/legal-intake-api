"""
Chat and contact message endpoints.
Supports article-referenced conversations.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user
from app.models import ChatMessage, User, Article
from app.schemas import ChatMessageCreate, ChatMessageResponse
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/chat", tags=["Chat & Contact"])


def send_notification_email(
    lawyer_email: str,
    client_name: str,
    client_email: str,
    message: str,
    article_title: Optional[str] = None
):
    """
    Background task to send email notification to lawyer.
    
    In production, use proper SMTP settings from environment variables.
    For MVP, this simulates email sending.
    """
    print(f"\n{'='*50}")
    print(f"NEW MESSAGE NOTIFICATION")
    print(f"{'='*50}")
    print(f"To: {lawyer_email}")
    print(f"From: {client_name} <{client_email}>")
    
    if article_title:
        print(f"Regarding Article: {article_title}")
    
    print(f"\nMessage:")
    print(f"{message}")
    print(f"{'='*50}\n")
    
    # In production, replace with actual SMTP:
    # msg = MIMEMultipart()
    # msg['From'] = "noreply@yourlaw.com"
    # msg['To'] = lawyer_email
    # msg['Subject'] = f"New Inquiry from {client_name}"
    # 
    # body = f"""
    # New message from: {client_name} ({client_email})
    # {f'Regarding article: {article_title}' if article_title else ''}
    # 
    # Message:
    # {message}
    # """
    # 
    # msg.attach(MIMEText(body, 'plain'))
    # 
    # with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
    #     server.starttls()
    #     server.login(SMTP_USERNAME, SMTP_PASSWORD)
    #     server.send_message(msg)


@router.post("/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: ChatMessageCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a contact message (PUBLIC - no auth required).
    
    Can optionally reference an article to provide context.
    Sends email notification to lawyer in background.
    
    Args:
    - client_name: Sender's name
    - client_email: Sender's email
    - client_phone: Sender's phone (optional)
    - message: Message content
    - referenced_article_id: Optional article ID this message is about
    """
    # Validate referenced article exists (if provided)
    referenced_article = None
    if message_data.referenced_article_id:
        result = await db.execute(
            select(Article).where(Article.id == message_data.referenced_article_id)
        )
        referenced_article = result.scalar_one_or_none()
        
        if not referenced_article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Article with ID {message_data.referenced_article_id} not found"
            )
        
        # Increment article inquiry count
        referenced_article.inquiry_count += 1
    
    # Create message
    new_message = ChatMessage(
        client_name=message_data.client_name,
        client_email=message_data.client_email,
        client_phone=message_data.client_phone,
        message=message_data.message,
        referenced_article_id=message_data.referenced_article_id,
        user_id=None  # Not linked to registered user (public submission)
    )
    
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)
    
    # Send email notification to lawyer (background task)
    background_tasks.add_task(
        send_notification_email,
        lawyer_email="lawyer@example.com",  # TODO: Get from settings
        client_name=message_data.client_name,
        client_email=message_data.client_email,
        message=message_data.message,
        article_title=referenced_article.title if referenced_article else None
    )
    
    return new_message


@router.get("/messages", response_model=List[ChatMessageResponse])
async def get_all_messages(
    current_user: User = Depends(get_admin_user),  # Admin only
    referenced_article_id: Optional[int] = None,
    limit: int = 50,
    skip: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all contact messages (ADMIN ONLY).
    
    Lawyer can view all messages, optionally filtered by article.
    """
    query = select(ChatMessage)
    
    if referenced_article_id:
        query = query.where(ChatMessage.referenced_article_id == referenced_article_id)
    
    query = query.order_by(desc(ChatMessage.created_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    return messages


@router.get("/messages/{message_id}", response_model=ChatMessageResponse)
async def get_message_by_id(
    message_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get single message by ID (ADMIN ONLY).
    """
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.id == message_id)
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return message


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a message (ADMIN ONLY).
    
    Used to clean up spam or resolved inquiries.
    """
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.id == message_id)
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    await db.delete(message)
    await db.commit()
    
    return None


@router.get("/messages/article/{article_id}/count")
async def get_article_message_count(
    article_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get count of messages referencing a specific article (ADMIN ONLY).
    
    Useful for analytics - which articles drive most engagement?
    """
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.referenced_article_id == article_id)
    )
    messages = result.scalars().all()
    
    return {
        "article_id": article_id,
        "message_count": len(messages),
        "messages": [
            {
                "id": msg.id,
                "client_email": msg.client_email,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    }