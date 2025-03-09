from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from .common import UserBase

# Base comment schema
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=160)

# Schema for creating a comment
class CommentCreate(CommentBase):
    post_id: int

# Schema for updating a comment
class CommentUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=160)

# Schema for displaying comment information
class CommentResponse(CommentBase):
    id: int
    user_id: int
    post_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schema for detailed comment information
class CommentDetailResponse(CommentResponse):
    user: UserBase
    
    class Config:
        from_attributes = True 