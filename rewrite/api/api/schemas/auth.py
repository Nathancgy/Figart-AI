from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """JWT token payload schema."""
    user_id: Optional[int] = None

class LoginCredentials(BaseModel):
    """Schema for login credentials."""
    username: str
    password: str 