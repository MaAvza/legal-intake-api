# Dependencies for route protection and authentication
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import User

# OAuth2 scheme for extracting Bearer token from Authorization header
# tokenUrl points to the login endpoint that issues tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency that validates JWT token and returns the authenticated user.
    
    This dependency:
    1. Extracts the JWT from the Authorization header
    2. Decodes and validates the token
    3. Queries the database for the user
    4. Returns the User object or raises 401 Unauthorized
    
    Usage: Add as dependency to protected routes
    Example: @router.get("/protected", dependencies=[Depends(get_current_user)])
    """
    # Define exception for invalid credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token and extract email (sub claim)
    email = decode_access_token(token)
    if email is None:
        raise credentials_exception
    
    # Query database for user with this email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    # If user not found, raise exception
    if user is None:
        raise credentials_exception
    
    return user
