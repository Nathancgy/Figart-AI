"""Common schema types to avoid circular imports."""
from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel


class UserBase(BaseModel):
    """Base user information without sensitive data."""
    username: str
    email: str
    is_active: bool = True

    class Config:
        from_attributes = True 