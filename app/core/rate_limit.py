"""
Rate limiting middleware to prevent abuse of public endpoints.
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio

class RateLimiter:
    """
    Simple in-memory rate limiter.
    // later replace with fastapi limiter
    """
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = defaultdict(list)
        self.cleanup_interval = 60  # Clean up old entries every 60 seconds
        
        # Start background cleanup task
        asyncio.create_task(self._cleanup_old_entries())
    
    async def _cleanup_old_entries(self):
        """
        Background task to clean up expired entries.
        Prevents memory bloat from storing old timestamps.
        """
        while True:
            await asyncio.sleep(self.cleanup_interval)
            
            current_time = datetime.now()
            cutoff_time = current_time - timedelta(minutes=1)
            
            # Remove old entries
            for ip in list(self.requests.keys()):
                self.requests[ip] = [
                    timestamp for timestamp in self.requests[ip]
                    if timestamp > cutoff_time
                ]
                
                # Remove IP entirely if no recent requests
                if not self.requests[ip]:
                    del self.requests[ip]
    
    def _get_client_ip(self, request: Request) -> str:
        """
        Extract client IP address from request.
        
        Handles X-Forwarded-For header for proxied requests.
        """
        # Check for proxy headers first
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        # Fallback to direct connection IP
        return request.client.host if request.client else "unknown"
    
    async def check_rate_limit(self, request: Request) -> Tuple[bool, int, int]:
        """
        Check if request exceeds rate limit.
        
        Returns:
        - allowed: bool (True if request is allowed)
        - remaining: int (requests remaining in current window)
        - reset_time: int (seconds until rate limit resets)
        """
        client_ip = self._get_client_ip(request)
        current_time = datetime.now()
        
        # Get requests from last minute
        one_minute_ago = current_time - timedelta(minutes=1)
        recent_requests = [
            timestamp for timestamp in self.requests[client_ip]
            if timestamp > one_minute_ago
        ]
        
        # Update stored requests
        self.requests[client_ip] = recent_requests
        
        # Check if limit exceeded
        request_count = len(recent_requests)
        allowed = request_count < self.requests_per_minute
        remaining = max(0, self.requests_per_minute - request_count - 1)
        
        # Calculate reset time
        if recent_requests:
            oldest_request = min(recent_requests)
            reset_time = int((oldest_request + timedelta(minutes=1) - current_time).total_seconds())
        else:
            reset_time = 60
        
        # Add current request if allowed
        if allowed:
            self.requests[client_ip].append(current_time)
        
        return allowed, remaining, reset_time
    
    async def __call__(self, request: Request):
        """
        Middleware function to check rate limits.
        """
        allowed, remaining, reset_time = await self.check_rate_limit(request)
        
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {reset_time} seconds.",
                    "retry_after": reset_time
                },
                headers={
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_time),
                    "Retry-After": str(reset_time)
                }
            )
        
        # Add rate limit headers to response
        request.state.rate_limit_remaining = remaining
        request.state.rate_limit_reset = reset_time
        
        return None  # Allow request to proceed


# Dependency for protecting specific routes
async def rate_limit_dependency(request: Request, limiter: RateLimiter):
    """
    FastAPI dependency for route-specific rate limiting.
    
    Usage:
    @router.post("/contact", dependencies=[Depends(rate_limit_dependency)])
    """
    allowed, remaining, reset_time = await limiter.check_rate_limit(request)
    
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {reset_time} seconds.",
            headers={
                "X-RateLimit-Limit": str(limiter.requests_per_minute),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
                "Retry-After": str(reset_time)
            }
        )
    
    return True