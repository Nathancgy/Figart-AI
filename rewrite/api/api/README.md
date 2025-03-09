# Social Media API

A robust, secure, and modern API built with FastAPI and uvloop for high performance.

## Features

- **Fast and Asynchronous**: Built with FastAPI and uvloop for high performance
- **Secure Authentication**: JWT token-based authentication
- **Rate Limiting**: Protects against abuse and DoS attacks
- **Comprehensive Logging**: Request/response logging with performance tracking
- **Database Connection Pooling**: Efficient database connections with SQLAlchemy
- **Error Handling**: Consistent error responses and detailed logging
- **Schema Validation**: Type checking and data validation with Pydantic
- **API Documentation**: Auto-generated with OpenAPI/Swagger

## API Structure

The API follows a modular structure:

```
api/api/
├── __init__.py
├── app.py           # Main FastAPI application
├── middleware.py    # Custom middleware
├── security.py      # Authentication and authorization
├── server.py        # Server entry point
├── routers/         # API routes
│   ├── __init__.py
│   ├── auth.py      # Authentication endpoints
│   ├── users.py     # User management endpoints
│   ├── posts.py     # Post management endpoints
│   └── comments.py  # Comment management endpoints
└── schemas/         # Pydantic models
    ├── __init__.py
    ├── auth.py      # Auth schemas
    ├── users.py     # User schemas
    ├── posts.py     # Post schemas
    └── comments.py  # Comment schemas
```

## Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL or SQLite

### Environment Variables

The API uses environment variables for configuration:

```
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=1800

# API Server
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=1
DEBUG=false

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
ENABLE_RATE_LIMITING=true
RATE_LIMIT_PER_MINUTE=60

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Running the API

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the API server:
   ```
   python -m rewrite.api.api.server
   ```

3. Access the API documentation at:
   ```
   http://localhost:8000/docs
   ```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/token` - OAuth2 compatible token login
- `POST /auth/login` - JSON-based login

### Users

- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `GET /users` - List all users (admin only)
- `GET /users/{user_id}` - Get user by ID (admin only)
- `PUT /users/{user_id}` - Update user by ID (admin only)
- `DELETE /users/{user_id}` - Delete user by ID (admin only)

### Posts

- `POST /posts` - Create a new post
- `GET /posts` - List all posts
- `GET /posts/{post_id}` - Get post by ID
- `GET /posts/by-user/{user_id}` - Get posts by user
- `PUT /posts/{post_id}` - Update post
- `DELETE /posts/{post_id}` - Delete post

### Comments

- `POST /comments` - Create a new comment
- `GET /comments/by-post/{post_id}` - Get comments for a post
- `GET /comments/by-user/{user_id}` - Get comments by user
- `GET /comments/{comment_id}` - Get comment by ID
- `PUT /comments/{comment_id}` - Update comment
- `DELETE /comments/{comment_id}` - Delete comment 