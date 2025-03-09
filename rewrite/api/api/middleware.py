import time
import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests and tracking response time."""
    
    async def dispatch(self, request: Request, call_next: Callable):
        """Process the request and log response time."""
        start_time = time.time()
        
        # Extract request info for logging
        client_host = request.client.host if request.client else "unknown"
        request_id = request.headers.get("X-Request-Id", "")
        
        # Start request log
        logger.info(
            f"Request started: {request.method} {request.url.path} "
            f"from {client_host} [request_id: {request_id}]"
        )
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Add custom header with processing time
            response.headers["X-Process-Time"] = str(process_time)
            
            # Log request completion
            logger.info(
                f"Request completed: {request.method} {request.url.path} "
                f"[status: {response.status_code}] [time: {process_time:.4f}s] "
                f"[request_id: {request_id}]"
            )
            
            return response
            
        except Exception as e:
            # Log exception
            process_time = time.time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path} "
                f"[time: {process_time:.4f}s] [request_id: {request_id}] "
                f"Error: {str(e)}"
            )
            
            # Return JSON error response
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error"}
            )

class RateLimitingMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting middleware."""
    
    def __init__(self, app, rate_limit_per_minute=60):
        super().__init__(app)
        self.rate_limit = rate_limit_per_minute
        self.requests = {}  # IP -> list of timestamps
        
    async def dispatch(self, request: Request, call_next: Callable):
        """Check rate limit and process request if allowed."""
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Initialize tracking for this IP if not exists
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Clean up old requests (older than 1 minute)
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] 
            if current_time - t < 60
        ]
        
        # Check if rate limit is exceeded
        if len(self.requests[client_ip]) >= self.rate_limit:
            logger.warning(f"Rate limit exceeded for {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests, please try again later."}
            )
        
        # Track this request
        self.requests[client_ip].append(current_time)
        
        # Process the request
        return await call_next(request) 