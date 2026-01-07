# Quick Start Guide

## 1. Install Dependencies
```bash
pip install fastapi uvicorn sqlalchemy asyncpg alembic passlib[bcrypt] python-jose[cryptography] python-multipart pydantic[email]
```

## 2. Setup Database
```bash
# Create PostgreSQL database
createdb legal_intake

# Run migrations
alembic upgrade head
```

## 3. Start Server
```bash
uvicorn app.main:app --reload
```

## 4. Test API
```bash
# Run test script
python test_api.py

# Or use interactive docs
open http://localhost:8000/docs
```

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | No | Register lawyer account |
| `/auth/token` | POST | No | Login (get JWT) |
| `/intake` | POST | No | Submit client ticket |
| `/tickets` | GET | Yes | Get all tickets |

## Example Usage

### Register & Login
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"lawyer@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:8000/auth/token \
  -d "username=lawyer@test.com&password=pass123"
```

### Submit Ticket (Public)
```bash
curl -X POST http://localhost:8000/intake \
  -H "Content-Type: application/json" \
  -d '{
    "client_name":"John Doe",
    "client_email":"john@test.com",
    "client_phone":"555-0123",
    "event_summary":"Need legal help",
    "urgency_level":"Medium"
  }'
```

### Get Tickets (Protected)
```bash
curl -X GET http://localhost:8000/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Key Features Implemented

✅ **Phase 1: Security**
- Bcrypt password hashing
- JWT authentication
- Protected routes

✅ **Phase 2: Database**
- SQLAlchemy async models
- Alembic migrations
- Pydantic validation

✅ **Phase 3: Concurrency**
- Background tasks
- Async operations
- Eager loading docs

## File Structure

```
app/
├── core/           # Configuration & utilities
├── routers/        # API endpoints
├── models.py       # Database models
├── schemas.py      # Request/response schemas
└── main.py         # App entry point
```

## Documentation

- Full setup: `SETUP.md`
- API docs: `README.md`
- Interactive: `http://localhost:8000/docs`
