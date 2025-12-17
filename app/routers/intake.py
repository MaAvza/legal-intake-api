# Public intake endpoint for client submissions (Phase 2 & 3)
import time
from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models import Ticket
from app.schemas import TicketCreate

router = APIRouter(prefix="/intake", tags=["Public Intake"])

def send_notification_email(ticket_id: int, client_email: str):
    """
    Background task that simulates sending email notification to lawyer.
    
    Phase 3 Requirement: Demonstrates background task processing.
    This simulates a long-running operation (email sending) that happens
    asynchronously after the API response is returned to the client.
    
    In production, this would:
    - Connect to an email service (SendGrid, SES, etc.)
    - Send formatted email to lawyer with ticket details
    - Log the notification for audit purposes
    """
    # Simulate long-running email operation (3 seconds)
    time.sleep(3)
    
    # Log notification (in production, this would be actual email sending)
    print(f"[BACKGROUND TASK] New Client Lead Email Sent!")
    print(f"  Ticket ID: {ticket_id}")
    print(f"  Client Email: {client_email}")
    print(f"  Notification completed at: {time.strftime('%Y-%m-%d %H:%M:%S')}")

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_data: TicketCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Public endpoint for potential clients to submit case details (Phase 2 & 3).
    
    Security: UNAUTHENTICATED - Anyone can submit a ticket
    
    Phase 3 Concurrency Requirement:
    - Uses BackgroundTasks to send email notification asynchronously
    - Returns 201 Created IMMEDIATELY, before background task completes
    - Background task simulates 3-second email sending operation
    
    Flow:
    1. Validate input data (Pydantic)
    2. Save ticket to database
    3. Queue background task for email notification
    4. Return response immediately (non-blocking)
    5. Background task executes after response is sent
    """
    # Create new ticket from validated data
    new_ticket = Ticket(
        client_name=ticket_data.client_name,
        client_email=ticket_data.client_email,
        client_phone=ticket_data.client_phone,
        event_summary=ticket_data.event_summary,
        urgency_level=ticket_data.urgency_level,
        status="New"  # All new tickets start with "New" status
    )
    
    # Save to database
    db.add(new_ticket)
    await db.commit()
    await db.refresh(new_ticket)
    
    # Add background task AFTER saving ticket
    # This task will run after the response is returned to client
    background_tasks.add_task(
        send_notification_email,
        ticket_id=new_ticket.id,
        client_email=new_ticket.client_email
    )
    
    # Return immediately (background task runs asynchronously)
    return {
        "message": "Ticket submitted successfully",
        "ticket_id": new_ticket.id,
        "status": new_ticket.status
    }
