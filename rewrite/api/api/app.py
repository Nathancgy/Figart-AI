import uvloop
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parents[2] / '.env'  # api/api/app.py -> api/.env
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"Loaded environment from {env_path}")

from api.database import AsyncDatabase
from .middleware import RequestLoggingMiddleware, RateLimitingMiddleware

# Use uvloop for better performance
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    Handles startup and shutdown events.
    """
    # Startup: Connect to the database
    db = AsyncDatabase.get_instance()
    await db.wait_for_database()
    
    yield
    
    # Shutdown: Close the database connection
    await db.close()

# Create FastAPI app
app = FastAPI(
    title="API for FigArt AI",
    description="让摄影小白也能拍出好图",
    version="1.0.0",
    lifespan=lifespan,
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS", "*")],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)

# Add custom middleware for logging and rate limiting
app.add_middleware(RequestLoggingMiddleware)
if os.getenv("ENABLE_RATE_LIMITING", "false").lower() == "true":
    rate_limit = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    app.add_middleware(RateLimitingMiddleware, rate_limit_per_minute=rate_limit)

# Import and include routers
from .routers import users, posts, comments, auth

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])
app.include_router(comments.router, prefix="/comments", tags=["Comments"])

@app.get("/health")
async def health_check():
    """API health check endpoint"""
    db = AsyncDatabase.get_instance()
    db_healthy = await db.ping()
    
    # Basic response for all environments
    response = {
        "status": "ok" if db_healthy else "error"
    }
    
    # Include detailed diagnostics only in development mode
    if os.getenv("DEBUG", "false").lower() == "true":
        response["diagnostics"] = {
            "database": db_healthy
        }
    
    return response 