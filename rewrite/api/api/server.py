import uvicorn
import os
import logging

from .app import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

def run_server():
    """Run the FastAPI server with uvicorn."""
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run(
        "api.api.app:app",
        host=host,
        port=port,
        reload=os.getenv("DEBUG", "false").lower() == "true",
        log_level="info",
        workers=int(os.getenv("API_WORKERS", "1"))
    )

if __name__ == "__main__":
    run_server() 