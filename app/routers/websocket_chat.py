"""
WebSocket endpoints for real-time chat functionality.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.websocket import manager
from app.models import ChatMessage, User
from datetime import datetime
import json

router = APIRouter(tags=["WebSocket Chat"])


@router.websocket("/ws/chat")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    token: str = Query(None),  # JWT token for authentication
    client_email: str = Query(None)  # For non-authenticated users
):
    """
    WebSocket endpoint for real-time chat.
    
    Authentication:
    - Admin (lawyer): Must provide valid JWT token
    - Clients: Can provide email or be anonymous (session-based)
    
    Message Format:
    {
        "type": "message" | "read_receipt" | "typing",
        "content": "message text",
        "message_id": 123,
        "referenced_article_id": 456  // optional
    }
    """
    # Determine user identity and role
    is_admin = False
    user_id = None
    
    if token:
        # Validate JWT and check if admin
        # TODO: Implement JWT validation
        # For now, simplified version:
        user_id = "admin"  # Replace with actual user from token
        is_admin = True
    elif client_email:
        user_id = client_email
    else:
        # Anonymous user, generate session ID
        user_id = f"anon_{datetime.utcnow().timestamp()}"
    
    # Accept connection
    await manager.connect(websocket, user_id, is_admin)
    
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            
            if message_type == "message":
                # New message received
                await handle_new_message(
                    websocket,
                    message_data,
                    user_id,
                    is_admin
                )
            
            elif message_type == "read_receipt":
                # Message was read
                await handle_read_receipt(
                    message_data.get("message_id"),
                    user_id,
                    is_admin
                )
            
            elif message_type == "typing":
                # Typing indicator
                await manager.send_typing_indicator(
                    user_id,
                    message_data.get("is_typing", False),
                    is_admin
                )
            
            elif message_type == "ping":
                # Keepalive ping
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(user_id, is_admin)
        print(f"[WebSocket] Client disconnected: {user_id}")
    
    except Exception as e:
        print(f"[WebSocket] Error: {e}")
        manager.disconnect(user_id, is_admin)


async def handle_new_message(
    websocket: WebSocket,
    message_data: dict,
    user_id: str,
    is_admin: bool
):
    """
    Handle new message from WebSocket.
    Save to database and broadcast to appropriate recipients.
    """
    # TODO: Add database session injection
    # For now, this is the structure
    
    content = message_data.get("content")
    referenced_article_id = message_data.get("referenced_article_id")
    recipient_id = message_data.get("recipient_id")  # For admin replying to specific client
    
    # Create message in database
    # new_message = ChatMessage(
    #     message=content,
    #     client_email=user_id if not is_admin else recipient_id,
    #     is_from_admin=is_admin,
    #     referenced_article_id=referenced_article_id,
    #     status="sent"
    # )
    # db.add(new_message)
    # await db.commit()
    
    # Broadcast message
    message_payload = {
        "type": "new_message",
        "message_id": 123,  # new_message.id from database
        "content": content,
        "from": user_id,
        "is_from_admin": is_admin,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "sent",
        "referenced_article_id": referenced_article_id
    }
    
    if is_admin:
        # Admin sending to client
        delivered = await manager.send_personal_message(message_payload, recipient_id)
        
        if delivered:
            # Update status to delivered
            # await db.execute(
            #     update(ChatMessage)
            #     .where(ChatMessage.id == message_id)
            #     .values(status="delivered")
            # )
            pass
        else:
            # Client offline, send email notification
            # TODO: Trigger email sending
            pass
    else:
        # Client sending to admin
        await manager.broadcast_to_admins(message_payload)
        
        # Also save for admin to see when they come online
        # (already saved in database above)


async def handle_read_receipt(message_id: int, user_id: str, is_admin: bool):
    """
    Mark message as read and notify sender.
    """
    # Update database
    # await db.execute(
    #     update(ChatMessage)
    #     .where(ChatMessage.id == message_id)
    #     .values(status="read", read_at=datetime.utcnow())
    # )
    # await db.commit()
    
    # Notify sender
    await manager.notify_message_read(message_id, "admin" if is_admin else user_id)


@router.get("/ws/chat/online-status")
async def get_online_status():
    """
    Check if admin (lawyer) is currently online.
    Public endpoint - helps clients know if they'll get instant response.
    """
    return {
        "admin_online": manager.is_admin_online(),
        "online_clients": len(manager.get_online_clients()),
        "message": "Admin is available" if manager.is_admin_online() else "Leave a message and we'll respond via email"
    }