"""
WebSocket connection manager for real-time chat.
Handles connections, message broadcasting, and read receipts.
"""

from typing import Dict, List, Set
from fastapi import WebSocket
from datetime import datetime
import json


class ConnectionManager:
    """
    Manages WebSocket connections for real-time chat.
    
    Architecture:
    - Each user has a unique connection identified by user_id or session_id
    - Admin (lawyer) connects and receives all messages
    - Clients connect and only see their own conversation
    """
    
    def __init__(self):
        # Active connections: {user_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}
        
        # Allow multiple open tabs
        self.admin_connections: List[WebSocket] = []
        
        # Track which messages have been read by admin
        self.admin_read_messages: Set[int] = set()
    
    async def connect(self, websocket: WebSocket, user_id: str, is_admin: bool = False):
        """
        Accept new WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            user_id: Unique identifier (email or session ID)
            is_admin: True if this is the lawyer's connection
        """
        await websocket.accept()
        
        if is_admin:
            self.admin_connections.append(websocket)
            print(f"[WebSocket] Admin connected. Total admin connections: {len(self.admin_connections)}")
        else:
            self.active_connections[user_id] = websocket
            print(f"[WebSocket] Client connected: {user_id}. Total clients: {len(self.active_connections)}")
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "user_id": user_id,
            "is_admin": is_admin,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def disconnect(self, user_id: str, is_admin: bool = False):
        """
        Remove WebSocket connection.
        """
        if is_admin:
            # Remove from admin connections (need to track which one)
            # For simplicity, we'll clear all admin connections on disconnect
            # In production, track specific connections
            print(f"[WebSocket] Admin disconnected")
        else:
            if user_id in self.active_connections:
                del self.active_connections[user_id]
                print(f"[WebSocket] Client disconnected: {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """
        Send message to specific user.
        
        Args:
            message: Dictionary containing message data
            user_id: Recipient's user ID
        """
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_json(message)
                return True
            except Exception as e:
                print(f"[WebSocket] Error sending to {user_id}: {e}")
                # Connection is dead, remove it
                self.disconnect(user_id)
                return False
        return False
    
    async def broadcast_to_admins(self, message: dict):
        """
        Send message to all connected admins (lawyer).
        
        Used when a new client message arrives.
        """
        dead_connections = []
        
        for websocket in self.admin_connections:
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"[WebSocket] Error broadcasting to admin: {e}")
                dead_connections.append(websocket)
        
        # Clean up dead connections
        for dead in dead_connections:
            self.admin_connections.remove(dead)
    
    async def send_message_to_client(
        self,
        client_id: str,
        message_content: str,
        message_id: int,
        from_admin: bool = True
    ):
        """
        Send message from lawyer to client.
        
        Args:
            client_id: Client's user ID or email
            message_content: The message text
            message_id: Database message ID
            from_admin: True if message is from lawyer
        """
        message = {
            "type": "new_message",
            "message_id": message_id,
            "content": message_content,
            "from_admin": from_admin,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "delivered"
        }
        
        delivered = await self.send_personal_message(message, client_id)
        
        if not delivered:
            # Client is offline, mark for email notification
            return {"status": "offline", "will_email": True}
        
        return {"status": "delivered", "will_email": False}
    
    async def notify_message_read(self, message_id: int, read_by: str):
        """
        Notify sender that their message was read.
        
        Args:
            message_id: Database message ID
            read_by: "admin" or client user_id
        """
        if read_by == "admin":
            self.admin_read_messages.add(message_id)
        
        read_receipt = {
            "type": "message_read",
            "message_id": message_id,
            "read_by": read_by,
            "read_at": datetime.utcnow().isoformat()
        }
        
        # Notify the other party
        if read_by == "admin":
            # Find which client sent this message and notify them
            # This requires looking up message in database
            pass  # Implement based on your needs
        else:
            # Client read admin's message, notify admin
            await self.broadcast_to_admins(read_receipt)
    
    async def send_typing_indicator(self, user_id: str, is_typing: bool, is_admin: bool = False):
        """
        Send typing indicator.
        
        Args:
            user_id: Who is typing
            is_typing: True if started typing, False if stopped
            is_admin: True if admin is typing
        """
        typing_message = {
            "type": "typing_indicator",
            "user_id": user_id,
            "is_admin": is_admin,
            "is_typing": is_typing,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if is_admin:
            # Admin is typing, notify the client
            await self.send_personal_message(typing_message, user_id)
        else:
            # Client is typing, notify all admins
            await self.broadcast_to_admins(typing_message)
    
    def get_online_clients(self) -> List[str]:
        """
        Get list of currently connected client IDs.
        """
        return list(self.active_connections.keys())
    
    def is_admin_online(self) -> bool:
        """
        Check if any admin is currently connected.
        """
        return len(self.admin_connections) > 0


# Global connection manager instance
manager = ConnectionManager()