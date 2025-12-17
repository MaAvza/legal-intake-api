# Protected ticket retrieval for lawyers (Phase 3)
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Ticket, User
from app.schemas import TicketResponse

router = APIRouter(prefix="/tickets", tags=["Lawyer Tickets"])

@router.get("", response_model=List[TicketResponse])
async def get_all_tickets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all tickets for the authenticated lawyer (Phase 3).
    
    Security: PROTECTED - Requires valid JWT token
    - Uses get_current_user dependency to validate JWT
    - Only authenticated lawyers can access this endpoint
    
    Phase 3 Performance Optimization:
    - Currently uses simple query (no relationships yet)
    - CRITICAL: When adding relationships (e.g., comments, assignments),
      MUST use eager loading to prevent N+1 query problem
    
    Example of eager loading (when relationships are added):
    ```python
    from sqlalchemy.orm import selectinload
    
    stmt = select(Ticket).options(
        selectinload(Ticket.comments),  # Eager load comments
        selectinload(Ticket.assigned_lawyer)  # Eager load assignments
    )
    ```
    
    Eager Loading Strategies:
    - selectinload: Separate SELECT for related data (good for collections)
    - joinedload: Single query with JOIN (good for single relationships)
    - Both prevent N+1 by loading all related data upfront
    
    N+1 Problem Explanation:
    Without eager loading, accessing ticket.comments in a loop would trigger
    1 query for tickets + N queries for each ticket's comments = N+1 queries
    With eager loading: 2 queries total (1 for tickets, 1 for all comments)
    """
    # Query all tickets from database
    # Order by created_at descending (newest first)
    result = await db.execute(
        select(Ticket).order_by(Ticket.created_at.desc())
    )
    tickets = result.scalars().all()
    
    return tickets
