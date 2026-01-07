# API Flow Visualization

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAWYER SETUP (One-time)                       │
└─────────────────────────────────────────────────────────────────┘

1. Register Account
   POST /auth/register
   {
     "email": "lawyer@firm.com",
     "password": "SecurePass123"
   }
   ↓
   [Bcrypt Hash Password]
   ↓
   [Save to Database]
   ↓
   Response: {"message": "User registered successfully"}

2. Login
   POST /auth/token
   username=lawyer@firm.com&password=SecurePass123
   ↓
   [Verify Password with Bcrypt]
   ↓
   [Generate JWT Token]
   ↓
   Response: {
     "access_token": "eyJhbGc...",
     "token_type": "bearer"
   }

┌─────────────────────────────────────────────────────────────────┐
│              CLIENT SUBMISSION (Public - No Auth)                │
└─────────────────────────────────────────────────────────────────┘

3. Submit Case Details
   POST /intake
   {
     "client_name": "John Doe",
     "client_email": "john@example.com",
     "client_phone": "555-0123",
     "event_summary": "Car accident, need legal help",
     "urgency_level": "Medium"
   }
   ↓
   [Validate with Pydantic]
   ↓
   [Save to Database]
   ↓
   [Queue Background Task] ──────┐
   ↓                             │
   Response: 201 Created         │
   {                             │
     "message": "Ticket submitted",  │
     "ticket_id": 1,             │
     "status": "New"             │
   }                             │
                                 │
   [Client receives response]   │
                                 │
                                 ↓
                    [Background Task Executes]
                                 ↓
                         [Sleep 3 seconds]
                                 ↓
                    [Print: "Email sent!"]

┌─────────────────────────────────────────────────────────────────┐
│           LAWYER RETRIEVAL (Protected - Requires JWT)            │
└─────────────────────────────────────────────────────────────────┘

4. View All Tickets
   GET /tickets
   Authorization: Bearer eyJhbGc...
   ↓
   [Extract JWT from Header]
   ↓
   [Decode & Verify Token]
   ↓
   [Check Expiration]
   ↓
   [Lookup User in Database]
   ↓
   [Query All Tickets]
   ↓
   Response: 200 OK
   [
     {
       "id": 1,
       "client_name": "John Doe",
       "client_email": "john@example.com",
       "client_phone": "555-0123",
       "event_summary": "Car accident, need legal help",
       "urgency_level": "Medium",
       "status": "New",
       "created_at": "2024-01-15T10:30:00Z",
       "updated_at": "2024-01-15T10:30:00Z"
     }
   ]
```

## Security Flow Detail

```
┌──────────────────────────────────────────────────────────────┐
│                    PASSWORD HASHING FLOW                      │
└──────────────────────────────────────────────────────────────┘

Registration:
  Plain Password: "SecurePass123"
       ↓
  [Bcrypt Generate Salt]
       ↓
  [Hash with Salt + Cost Factor]
       ↓
  Stored Hash: "$2b$12$KIXxKj..."
       ↓
  [Save to Database]

Login:
  Input Password: "SecurePass123"
       ↓
  [Retrieve Stored Hash from DB]
       ↓
  [Bcrypt Verify: Compare Input with Hash]
       ↓
  Match? → Generate JWT
  No Match? → 401 Unauthorized

┌──────────────────────────────────────────────────────────────┐
│                    JWT TOKEN FLOW                             │
└──────────────────────────────────────────────────────────────┘

Token Creation:
  User Email: "lawyer@firm.com"
       ↓
  Payload: {
    "sub": "lawyer@firm.com",
    "exp": 1234567890
  }
       ↓
  [Sign with SECRET_KEY using HS256]
       ↓
  JWT Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       ↓
  [Return to Client]

Token Validation:
  Request Header: "Authorization: Bearer eyJ..."
       ↓
  [Extract Token]
       ↓
  [Verify Signature with SECRET_KEY]
       ↓
  [Check Expiration]
       ↓
  [Extract 'sub' Claim]
       ↓
  [Query User from Database]
       ↓
  Valid? → Allow Access
  Invalid? → 401 Unauthorized
```

## Background Task Flow

```
┌──────────────────────────────────────────────────────────────┐
│              BACKGROUND TASK EXECUTION                        │
└──────────────────────────────────────────────────────────────┘

Main Request Thread:              Background Thread:
      │                                 │
      ├─ POST /intake                   │
      │                                 │
      ├─ Validate Data                  │
      │                                 │
      ├─ Save to Database               │
      │                                 │
      ├─ Queue Task ──────────────────► │
      │                                 │
      ├─ Return 201 Created             │
      │   (Immediate Response)          │
      │                                 │
      ▼                                 ├─ Wait for Queue
   [Client Receives                     │
    Response in ~100ms]                 ├─ Execute Task
                                        │
                                        ├─ time.sleep(3)
                                        │   (Simulate Email)
                                        │
                                        ├─ Print Notification
                                        │
                                        ▼
                                   [Task Complete]

Timeline:
0ms    ─── Request Received
50ms   ─── Data Validated
100ms  ─── Saved to DB
150ms  ─── Task Queued
200ms  ─── Response Sent ← Client gets response here
3200ms ─── Background Task Completes
```

## Database Query Flow

```
┌──────────────────────────────────────────────────────────────┐
│                 ASYNC DATABASE OPERATIONS                     │
└──────────────────────────────────────────────────────────────┘

Synchronous (Blocking):
  Request 1 → [Wait for DB] → Response 1
  Request 2 →                 [Wait for DB] → Response 2
  Request 3 →                                 [Wait for DB] → Response 3
  
  Total Time: 300ms (100ms × 3)

Asynchronous (Non-blocking):
  Request 1 → [DB Query] ─┐
  Request 2 → [DB Query] ─┼→ [All Complete] → Responses
  Request 3 → [DB Query] ─┘
  
  Total Time: 100ms (Concurrent)

Implementation:
  async with AsyncSessionLocal() as session:
      result = await session.execute(query)
      # Other requests can execute while waiting
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                            │
└──────────────────────────────────────────────────────────────┘

1. Invalid Input Data
   POST /intake {"client_name": ""}
   ↓
   [Pydantic Validation Fails]
   ↓
   422 Unprocessable Entity
   {
     "detail": [
       {
         "loc": ["body", "client_name"],
         "msg": "field required",
         "type": "value_error.missing"
       }
     ]
   }

2. Invalid Credentials
   POST /auth/token (wrong password)
   ↓
   [Bcrypt Verify Returns False]
   ↓
   401 Unauthorized
   {
     "detail": "Incorrect email or password"
   }

3. Missing/Invalid JWT
   GET /tickets (no Authorization header)
   ↓
   [OAuth2 Scheme Fails]
   ↓
   401 Unauthorized
   {
     "detail": "Not authenticated"
   }

4. Expired JWT
   GET /tickets (expired token)
   ↓
   [JWT Decode Checks Expiration]
   ↓
   401 Unauthorized
   {
     "detail": "Could not validate credentials"
   }

5. Duplicate Email
   POST /auth/register (existing email)
   ↓
   [Database Unique Constraint]
   ↓
   400 Bad Request
   {
     "detail": "Email already registered"
   }
```

## Performance Optimization

```
┌──────────────────────────────────────────────────────────────┐
│              N+1 QUERY PREVENTION (Future)                    │
└──────────────────────────────────────────────────────────────┘

Without Eager Loading:
  GET /tickets
  ↓
  SELECT * FROM tickets;              # 1 query
  ↓
  For each ticket:
    SELECT * FROM comments            # N queries
    WHERE ticket_id = ?;
  ↓
  Total: 1 + N queries (SLOW)

With Eager Loading:
  GET /tickets
  ↓
  SELECT * FROM tickets;              # 1 query
  ↓
  SELECT * FROM comments              # 1 query
  WHERE ticket_id IN (1,2,3...);
  ↓
  Total: 2 queries (FAST)

Implementation:
  from sqlalchemy.orm import selectinload
  
  stmt = select(Ticket).options(
      selectinload(Ticket.comments)
  )
  result = await session.execute(stmt)
```

## Deployment Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT STEPS                           │
└──────────────────────────────────────────────────────────────┘

1. Setup Environment
   ├─ Install Python 3.11+
   ├─ Install PostgreSQL
   └─ Clone repository

2. Configure
   ├─ Set DATABASE_URL
   ├─ Set SECRET_KEY
   └─ Set environment variables

3. Install Dependencies
   └─ pip install -r requirements.txt

4. Database Setup
   ├─ Create database
   └─ alembic upgrade head

5. Start Server
   └─ uvicorn app.main:app --host 0.0.0.0 --port 8000

6. Verify
   ├─ Check health endpoint
   ├─ Run test script
   └─ Check API docs at /docs
```

This visualization shows the complete flow of data through the system, from user registration to ticket submission and retrieval, with all security and concurrency features highlighted.
