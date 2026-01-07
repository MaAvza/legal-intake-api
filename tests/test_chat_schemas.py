"""
Test file for ChatMessage schemas.
Run from project root: python -m pytest tests/test_chat_schemas.py
"""
import sys
from pathlib import Path

# Ensure project root is in path (for running directly with python)
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from app.schemas import ChatMessageCreate, ChatMessageResponse
from datetime import datetime


def test_chat_message_create():
    """Test creating a ChatMessageCreate schema."""
    msg = ChatMessageCreate(
        message_content="שלום, יש לי שאלה",  # Hebrew: "Hello, I have a legal question"
        client_fingerprint="test-fingerprint-123"
    )
    
    print("✓ ChatMessageCreate schema works!")
    print(f"  Message: {msg.message_content}")
    print(f"  Fingerprint: {msg.client_fingerprint}")
    print(f"  Model dump: {msg.model_dump()}")
    

def test_chat_message_response():
    """Test creating a ChatMessageResponse schema."""
    msg = ChatMessageResponse(
        id=1,
        message_content="Test message",
        created_at=datetime.now(),
        is_from_user=False
    )
    
    print("✓ ChatMessageResponse schema works!")
    print(f"  ID: {msg.id}")
    print(f"  From user: {msg.is_from_user}")


if __name__ == "__main__":
    print("Testing ChatMessage Schemas\n" + "="*50)
    test_chat_message_create()
    print()
    test_chat_message_response()
    print("\n" + "="*50)
    print("All tests passed!")