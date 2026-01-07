# Legal Intake API - MVP

Secure API system for capturing potential client case details and exposing them to authorized lawyers.

## Features

### Phase 1: Authentication & Security
- ✅ User (Lawyer) registration with bcrypt password hashing
- ✅ JWT-based authentication
- ✅ Protected route dependency for authorization

### Phase 2: Database & Ticketing
- ✅ SQLAlchemy models for User and Ticket
- ✅ Alembic database migrations
- ✅ Public intake endpoint for client submissions
- ✅ Pydantic validation for all inputs

### Phase 3: Concurrency & Performance
- ✅ Background tasks for email notifications
- ✅ Async database operations
- ✅ Protected ticket retrieval endpoint
- ✅ Eager loading documentation for N+1 prevention

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Database
Update `app/core/config.py` with your PostgreSQL connection string:
```python
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/legal_intake"
```

### 3. Run Database Migrations
```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial migration: User and Ticket tables"

# Apply migration
alembic upgrade head
```

### 4. Start the Server
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication (Phase 1)

#### Register Lawyer
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "lawyer@example.com",
  "password": "securepassword123"
}
```

#### Login (Get JWT Token)
```bash
POST /auth/token
Content-Type: application/x-www-form-urlencoded

username=lawyer@example.com&password=securepassword123
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Public Intake (Phase 2 & 3)

#### Submit Ticket (Unauthenticated)
```bash
POST /intake
Content-Type: application/json

{
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "client_phone": "555-0123",
  "event_summary": "Car accident on Main St, need legal advice",
  "urgency_level": "Medium"
}
```

Response (201 Created - immediate):
```json
{
  "message": "Ticket submitted successfully",
  "ticket_id": 1,
  "status": "New"
}
```

**Note**: Background task runs after response (simulates 3-second email sending)

### Lawyer Endpoints (Phase 3)

#### Get All Tickets (Protected)
```bash
GET /tickets
Authorization: Bearer <your_jwt_token>
```

Response:
```json
[
  {
    "id": 1,
    "client_name": "John Doe",
    "client_email": "john@example.com",
    "client_phone": "555-0123",
    "event_summary": "Car accident on Main St, need legal advice",
    "urgency_level": "Medium",
    "status": "New",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

## Security Features

1. **Password Hashing**: Uses bcrypt (slow, salted algorithm) for secure password storage
2. **JWT Authentication**: Stateless authentication with signed tokens
3. **Protected Routes**: Dependency injection validates JWT on protected endpoints
4. **Input Validation**: Pydantic schemas validate all request data

## Concurrency Features

1. **Background Tasks**: Email notifications run asynchronously after response
2. **Async Database**: Non-blocking database operations with asyncpg
3. **Eager Loading Ready**: Documentation for preventing N+1 queries when adding relationships

## Database Schema

### User Table
- `id`: Primary key
- `email`: Unique, indexed
- `hashed_password`: Bcrypt hash

### Ticket Table
- `id`: Primary key
- `client_name`, `client_email`, `client_phone`: Client contact info
- `event_summary`: Case details
- `urgency_level`: Priority level
- `status`: Ticket status (New, Acknowledged, Closed)
- `created_at`, `updated_at`: Timestamps

## Testing the API

### Interactive Documentation
Visit `http://localhost:8000/docs` for Swagger UI with interactive API testing

### Example Workflow
1. Register a lawyer account
2. Login to get JWT token
3. Submit a ticket via public intake (no auth needed)
4. Retrieve tickets using JWT token (protected endpoint)

## Production Considerations

1. Change `SECRET_KEY` in `app/core/config.py`
2. Use environment variables for sensitive configuration
3. Implement actual email service (replace background task simulation)
4. Add rate limiting for public endpoints
5. Enable HTTPS/TLS
6. Add logging and monitoring
7. Implement database connection pooling tuning
