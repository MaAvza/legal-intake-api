# Legal Intake API - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Public Clients          │         Lawyer (Authenticated)        │
│  (No Auth Required)      │         (JWT Required)                │
└──────────┬───────────────┴────────────────┬─────────────────────┘
           │                                 │
           │ POST /intake                    │ GET /tickets
           │ POST /auth/register             │ (Protected)
           │ POST /auth/token                │
           │                                 │
┌──────────▼─────────────────────────────────▼─────────────────────┐
│                      FASTAPI APPLICATION                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    ROUTERS LAYER                         │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  auth.py        │  intake.py      │  tickets.py         │    │
│  │  - register     │  - create       │  - get_all          │    │
│  │  - login        │    ticket       │    (protected)      │    │
│  └────┬────────────┴────┬────────────┴────┬────────────────┘    │
│       │                 │                 │                      │
│  ┌────▼─────────────────▼─────────────────▼────────────────┐    │
│  │              DEPENDENCIES LAYER                          │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  get_db()           │  get_current_user()               │    │
│  │  - Session mgmt     │  - JWT validation                 │    │
│  │  - Auto cleanup     │  - User lookup                    │    │
│  └────┬─────────────────┴───────────────┬──────────────────┘    │
│       │                                 │                        │
│  ┌────▼─────────────────────────────────▼──────────────────┐    │
│  │                 CORE LAYER                               │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  security.py        │  database.py    │  config.py      │    │
│  │  - hash_password    │  - AsyncEngine  │  - DB_URL       │    │
│  │  - verify_password  │  - SessionLocal │  - SECRET_KEY   │    │
│  │  - create_token     │  - Base         │  - JWT config   │    │
│  │  - decode_token     │                 │                 │    │
│  └────┬─────────────────┴─────────────────┴─────────────────┘    │
│       │                                                           │
└───────┼───────────────────────────────────────────────────────────┘
        │
┌───────▼───────────────────────────────────────────────────────────┐
│                    DATA LAYER                                     │
├───────────────────────────────────────────────────────────────────┤
│  models.py                │  schemas.py                           │
│  - User (SQLAlchemy)      │  - UserRegister (Pydantic)           │
│  - Ticket (SQLAlchemy)    │  - TicketCreate (Pydantic)           │
│                           │  - TicketResponse (Pydantic)          │
└───────────┬───────────────┴───────────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                          │
├───────────────────────────────────────────────────────────────────┤
│  Tables:                                                          │
│  - users (id, email, hashed_password)                            │
│  - tickets (id, client_*, event_summary, urgency, status, ...)  │
└───────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagrams

### Phase 1: Authentication Flow

```
┌──────────┐                                    ┌──────────────┐
│  Client  │                                    │   Database   │
└─────┬────┘                                    └──────┬───────┘
      │                                                │
      │ 1. POST /auth/register                        │
      │    {email, password}                          │
      ├──────────────────────────────────────────────►│
      │                                                │
      │ 2. hash_password(password)                    │
      │    using bcrypt                               │
      │                                                │
      │ 3. INSERT INTO users                          │
      │    (email, hashed_password)                   │
      │◄───────────────────────────────────────────────┤
      │                                                │
      │ 4. {message: "success"}                       │
      │◄───────────────────────────────────────────────┤
      │                                                │
      │ 5. POST /auth/token                           │
      │    {username, password}                       │
      ├──────────────────────────────────────────────►│
      │                                                │
      │ 6. SELECT * FROM users WHERE email=?          │
      │◄───────────────────────────────────────────────┤
      │                                                │
      │ 7. verify_password(input, stored_hash)        │
      │    using bcrypt                               │
      │                                                │
      │ 8. create_access_token({sub: email})          │
      │    JWT with HS256                             │
      │                                                │
      │ 9. {access_token, token_type}                 │
      │◄───────────────────────────────────────────────┤
      │                                                │
```

### Phase 2 & 3: Ticket Submission with Background Task

```
┌──────────┐                                    ┌──────────────┐
│  Client  │                                    │   Database   │
└─────┬────┘                                    └──────┬───────┘
      │                                                │
      │ 1. POST /intake                               │
      │    {client_name, email, phone, summary}       │
      ├──────────────────────────────────────────────►│
      │                                                │
      │ 2. Validate with Pydantic schema              │
      │                                                │
      │ 3. INSERT INTO tickets                        │
      │    (client_*, event_summary, ...)             │
      │◄───────────────────────────────────────────────┤
      │                                                │
      │ 4. Queue background task                      │
      │    send_notification_email()                  │
      │                                                │
      │ 5. Return 201 Created IMMEDIATELY             │
      │    {message, ticket_id, status}               │
      │◄───────────────────────────────────────────────┤
      │                                                │
      │                                                │
      │ [Background Task Executes After Response]     │
      │                                                │
      │ 6. time.sleep(3)  # Simulate email sending    │
      │                                                │
      │ 7. print("Email sent notification")           │
      │                                                │
```

### Phase 3: Protected Ticket Retrieval

```
┌──────────┐                                    ┌──────────────┐
│  Lawyer  │                                    │   Database   │
└─────┬────┘                                    └──────┬───────┘
      │                                                │
      │ 1. GET /tickets                               │
      │    Authorization: Bearer <JWT>                │
      ├──────────────────────────────────────────────►│
      │                                                │
      │ 2. Extract JWT from header                    │
      │    (OAuth2PasswordBearer)                     │
      │                                                │
      │ 3. decode_access_token(jwt)                   │
      │    Verify signature & expiration              │
      │                                                │
      │ 4. SELECT * FROM users WHERE email=?          │
      │    (from JWT 'sub' claim)                     │
      │◄───────────────────────────────────────────────┤
      │                                                │
      │ 5. If user not found → 401 Unauthorized       │
      │                                                │
      │ 6. SELECT * FROM tickets                      │
      │    ORDER BY created_at DESC                   │
      │◄───────────────────────────────────────────────┤
      │                                                │
      │ 7. Serialize with Pydantic                    │
      │    TicketResponse schema                      │
      │                                                │
      │ 8. Return list of tickets                     │
      │◄───────────────────────────────────────────────┤
      │                                                │
```

## Security Architecture

### Password Security (Phase 1)
```
Plain Password → bcrypt.hash() → Stored Hash
                 ↓
              - Auto salt generation
              - Slow hashing (cost factor)
              - One-way function

Verification:
Plain Password + Stored Hash → bcrypt.verify() → True/False
```

### JWT Token Structure
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "lawyer@example.com",  # User identifier
  "exp": 1234567890             # Expiration timestamp
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  SECRET_KEY
)
```

## Database Schema

```sql
-- Phase 1: Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL
);
CREATE INDEX ix_users_email ON users(email);

-- Phase 2: Tickets table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR NOT NULL,
    client_email VARCHAR NOT NULL,
    client_phone VARCHAR NOT NULL,
    event_summary VARCHAR NOT NULL,
    urgency_level VARCHAR DEFAULT 'Low',
    status VARCHAR DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX ix_tickets_client_name ON tickets(client_name);
CREATE INDEX ix_tickets_client_email ON tickets(client_email);
```

## Concurrency Model (Phase 3)

### Background Tasks
```
Main Thread:                    Background Thread:
    │                               │
    ├─ Receive request              │
    ├─ Validate data                │
    ├─ Save to DB                   │
    ├─ Queue task ──────────────────┤
    ├─ Return response              │
    │                               ├─ Wait for main thread
    │                               ├─ Execute task
    │                               ├─ time.sleep(3)
    │                               └─ Print notification
    │
```

### Async Database Operations
```
Async Engine (asyncpg):
- Non-blocking I/O
- Connection pooling
- Concurrent query execution

Benefits:
- Handle multiple requests simultaneously
- No thread blocking on DB queries
- Better resource utilization
```

### N+1 Query Prevention (Future Enhancement)
```
Without Eager Loading:
SELECT * FROM tickets;           # 1 query
for ticket in tickets:
    SELECT * FROM comments       # N queries
    WHERE ticket_id = ticket.id;
Total: N+1 queries

With Eager Loading:
SELECT * FROM tickets;           # 1 query
SELECT * FROM comments           # 1 query
WHERE ticket_id IN (...);
Total: 2 queries

Implementation:
stmt = select(Ticket).options(
    selectinload(Ticket.comments)
)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Web Framework | FastAPI | Async API with auto docs |
| Database | PostgreSQL | Relational data storage |
| ORM | SQLAlchemy | Async database operations |
| Migrations | Alembic | Schema version control |
| Validation | Pydantic | Request/response validation |
| Auth | JWT (python-jose) | Stateless authentication |
| Password | bcrypt (passlib) | Secure password hashing |
| Server | Uvicorn | ASGI server |

## Design Patterns

1. **Dependency Injection**: FastAPI's DI for database sessions and auth
2. **Repository Pattern**: Models separate from business logic
3. **DTO Pattern**: Pydantic schemas for data transfer
4. **Middleware Pattern**: OAuth2 scheme for token extraction
5. **Background Tasks**: Async task execution pattern

## Performance Considerations

1. **Async Operations**: All I/O is non-blocking
2. **Connection Pooling**: SQLAlchemy manages DB connections
3. **Eager Loading**: Prevents N+1 queries (documented for future use)
4. **Background Tasks**: Long operations don't block responses
5. **Indexed Columns**: Email and client fields are indexed

## Security Best Practices

1. ✅ Passwords never stored in plain text
2. ✅ Bcrypt with automatic salting
3. ✅ JWT tokens with expiration
4. ✅ Protected routes require authentication
5. ✅ Input validation on all endpoints
6. ✅ SQL injection prevention (ORM parameterization)
7. ✅ CORS can be configured
8. ✅ Rate limiting ready (add middleware)
