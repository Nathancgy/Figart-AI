from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import uuid

from .common import UserBase

# Base post schema
class PostBase(BaseModel):
    photo_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()))

# Schema for creating a post
class PostCreate(BaseModel):
    photo: bytes

# Schema for updating a post
class PostUpdate(BaseModel):
    thumbs_up: Optional[int] = None

# Schema for displaying post information
class PostResponse(PostBase):
    id: int
    user_id: int
    thumbs_up: int
    created_at: datetime
    comment_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# Comment response for use in PostDetailResponse
class CommentResponseForPost(BaseModel):
    id: int
    content: str
    user_id: int
    post_id: int
    created_at: datetime
    user: UserBase
    
    class Config:
        from_attributes = True

# Schema for detailed post information
class PostDetailResponse(PostResponse):
    user: UserBase
    comments: List[CommentResponseForPost] = []
    
    class Config:
        from_attributes = True 