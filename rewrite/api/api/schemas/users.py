from datetime import datetime
from typing import Optional, List
from pydantic import EmailStr, Field, validator

from .common import UserBase


# Schema for creating a user
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def password_complexity(cls, v):
        # Simple validation for password complexity
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v

# Schema for updating a user
class UserUpdate(UserBase):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None
    
    @validator('password')
    def password_complexity(cls, v):
        if v is None:
            return v
        # Simple validation for password complexity
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v

# Schema for displaying user information
class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Extended user schema for internal use
class UserInDB(UserResponse):
    hashed_password: str
    is_superuser: bool = False
    
    class Config:
        from_attributes = True 