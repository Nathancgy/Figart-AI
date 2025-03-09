"""
Utility functions for database operations.
"""
from datetime import datetime, timezone

def utcnow() -> datetime:
    """Return current UTC datetime with timezone info."""
    return datetime.now(timezone.utc) 