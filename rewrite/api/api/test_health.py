"""
Test script to check health endpoint behavior with different DEBUG settings.
"""
import os
import asyncio
from api.database import AsyncDatabase
import json

async def simulate_health_check(debug_value):
    """Simulate the health endpoint with a specific debug value."""
    os.environ["DEBUG"] = debug_value
    
    # This is the same logic as the health endpoint
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

async def main():
    """Run tests with different DEBUG values."""
    print("With DEBUG=true:")
    result_true = await simulate_health_check("true")
    print(json.dumps(result_true, indent=2))
    
    print("\nWith DEBUG=false:")
    result_false = await simulate_health_check("false")
    print(json.dumps(result_false, indent=2))

if __name__ == "__main__":
    asyncio.run(main()) 