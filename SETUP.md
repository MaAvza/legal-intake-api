# Legal Intake API - Complete Setup Guide

## Project Structure

```
legal-intake-api/
├── app/
│   ├── core/
│   │   ├── config.py          # Configuration (DB URL, JWT settings)
│   │   ├── database.py        # SQLAlchemy async engine setup
│   │   ├── security.py        # Password hashing & JWT functions
│   │   └── dependencies.py    # Auth dependency (get_current_user)
│   ├── routers/
│   │   ├── auth.py            # Phase 1: Register & Login
│   │   ├── intake.py          # Phase 2 & 3: Public intake + background tasks
│   │   └── tickets.py         # Phase 3: Protected ticket retrieval
│   ├── models.py              # SQLAlchemy models (User, Ticket)
│   ├── schemas.py             # Pydantic validation schemas
│   └── main.py                # FastAPI app entry point
├── alembic/
│   ├── versions/
│   │   └── 001_initial_migration.py  # Database schema migration
│   └── env.py                 # Alembic configuration
├── requirements.txt           # Python dependencies
└── README.md                  # API documentation
```

## Installation Steps

### 1. Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy asyncpg alembic passlib[bcrypt] python-jose[cryptography] python-multipart pydantic[email]
```

Or use requirements.txt:
```bash
pip install -r requirements.txt
```

### 2. Configure Database

Edit `app/core/config.py` or set environment variable:

```bash
export DATABASE_URL="postgresql+asyncpg://user:password@localhost/legal_intake"
```

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE legal_intake;
```

### 4. Run Migrations

```bash
# Apply migration to create tables
alembic upgrade head

# Verify tables were created
psql -U postgres -d legal_intake -c "\dt"
```

Expected output:
```
         List of relations
 Schema |  Name   | Type  |  Owner
--------+---------+-------+---------
 public | tickets | table | user
 public | users   | table | user
```

### 5. Start the Server

```bash
uvicorn app.main:app --reload
```

Server runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

## Testing the API

### Step 1: Register a Lawyer

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@example.com",
    "password": "SecurePass123"
  }'
```

### Step 2: Login to Get JWT Token

```bash
curl -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=lawyer@example.com&password=SecurePass123"
```

Save the `access_token` from response.

### Step 3: Submit a Ticket (Public - No Auth)

```bash
curl -X POST http://localhost:8000/intake \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "John Doe",
    "client_email": "john@example.com",
    "client_phone": "555-0123",
    "event_summary": "Car accident on Main St, need legal advice",
    "urgency_level": "Medium"
  }'
```

**Note**: Response returns immediately (201 Created), but background task runs for 3 seconds after.

### Step 4: Retrieve Tickets (Protected - Requires JWT)

```bash
curl -X GET http://localhost:8000/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Key Implementation Details

### Phase 1: Security
- **Password Hashing**: Uses bcrypt with automatic salting
- **JWT Tokens**: HS256 algorithm with 30-minute expiration
- **Protected Routes**: `get_current_user` dependency validates JWT

### Phase 2: Database
- **Async Operations**: Uses asyncpg for non-blocking DB queries
- **Migrations**: Alembic manages schema changes
- **Models**: SQLAlchemy ORM with proper typing

### Phase 3: Concurrency
- **Background Tasks**: Email notification runs after response
- **Eager Loading**: Documented for N+1 prevention (see tickets.py)
- **Async/Await**: All route handlers are async

## Code Documentation

Every file includes detailed comments explaining:
- Security implementations (bcrypt, JWT)
- Database operations (async queries, transactions)
- Concurrency patterns (background tasks, eager loading)
- API design decisions

## Troubleshooting

### Database Connection Error
```
Check DATABASE_URL in app/core/config.py
Verify PostgreSQL is running: sudo systemctl status postgresql
```

### Migration Fails
```
Check alembic/env.py imports
Verify models are imported in env.py
Run: alembic current (shows current revision)
```

### JWT Token Invalid
```
Check SECRET_KEY in config.py
Verify token hasn't expired (30 min default)
Ensure Authorization header format: "Bearer <token>"
```

## Next Steps for Production

1. **Environment Variables**: Move secrets to .env file
2. **Email Service**: Replace background task simulation with real email (SendGrid, SES)
3. **Rate Limiting**: Add throttling to public endpoints
4. **CORS**: Configure allowed origins
5. **Logging**: Add structured logging (JSON format)
6. **Monitoring**: Integrate APM (DataDog, New Relic)
7. **Testing**: Add pytest test suite
8. **Docker**: Containerize application
9. **CI/CD**: Automate deployment pipeline

## Architecture Highlights

- **Layered Design**: Routers → Dependencies → Security → Database
- **Dependency Injection**: FastAPI's DI system for clean code
- **Type Safety**: Full type hints with Pydantic validation
- **Async First**: Non-blocking I/O throughout
- **Security Best Practices**: Bcrypt, JWT, input validation
