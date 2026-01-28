# Updated app/main.py with all new features

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import auth, intake, tickets, blog, privacy, chat
from app.core.config import settings
from app.core.rate_limit import RateLimiter

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Secure API for legal practice management with client intake and article blog",
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# CORS Configuration (allow frontend to communicate with backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize rate limiter
rate_limiter = RateLimiter(requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)

# Rate limiting middleware (applied to all requests)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    Apply rate limiting to all endpoints.
    
    Protects against abuse while allowing legitimate traffic.
    """
    if settings.RATE_LIMIT_ENABLED:
        # Check rate limit
        result = await rate_limiter(request)
        
        # If rate limit exceeded, return error response
        if result is not None:
            return result
    
    # Process request normally
    response = await call_next(request)
    
    # Add rate limit headers to response
    if hasattr(request.state, 'rate_limit_remaining'):
        response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_PER_MINUTE)
        response.headers["X-RateLimit-Remaining"] = str(request.state.rate_limit_remaining)
        response.headers["X-RateLimit-Reset"] = str(request.state.rate_limit_reset)
    
    return response

# Include routers
app.include_router(auth.router)      # Authentication (register, login)
app.include_router(intake.router)    # Public intake form
app.include_router(tickets.router)   # Protected ticket management
app.include_router(blog.router)      # Blog/articles (public + admin)
app.include_router(privacy.router)   # Privacy & data management
app.include_router(chat.router)      # Contact messages with article reference

@app.get("/")
async def root():
    """
    Health check and API information endpoint.
    """
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "endpoints": {
            "auth": "/auth/register, /auth/token",
            "intake": "/intake (POST - public)",
            "tickets": "/tickets (GET - protected)",
            "blog": {
                "public": "/blog/articles, /blog/articles/{slug}",
                "admin": "/blog/admin/articles (CRUD)"
            },
            "chat": {
                "public": "/chat/messages (POST)",
                "admin": "/chat/messages (GET)"
            },
            "privacy": "/privacy/my-data, /privacy/delete-account"
        },
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    """
    Simple health check for monitoring.
    """
    return {
        "status": "healthy",
        "timestamp": "2026-01-16T12:00:00Z"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler for unexpected errors.
    
    In production, log to monitoring service (Sentry, etc.).
    """
    if settings.DEBUG:
        # In debug mode, show full error
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "detail": str(exc),
                "type": type(exc).__name__
            }
        )
    else:
        # In production, hide error details
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "message": "Something went wrong. Please contact support."
            }
        )