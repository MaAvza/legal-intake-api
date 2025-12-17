# Main FastAPI application entry point
from fastapi import FastAPI
from app.routers import auth, intake, tickets

# Initialize FastAPI application
app = FastAPI(
    title="Legal Intake API",
    description="Secure API for capturing client case details and lawyer management",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router)      # Phase 1: Authentication endpoints
app.include_router(intake.router)    # Phase 2 & 3: Public intake with background tasks
app.include_router(tickets.router)   # Phase 3: Protected ticket retrieval

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Legal Intake API",
        "status": "running",
        "endpoints": {
            "auth": "/auth/register, /auth/token",
            "intake": "/intake (POST)",
            "tickets": "/tickets (GET - Protected)"
        }
    }
