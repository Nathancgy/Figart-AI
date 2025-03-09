from datetime import datetime
from typing import List, TYPE_CHECKING, Optional
from sqlalchemy import ForeignKey, DateTime, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .utils import utcnow

# Use TYPE_CHECKING to avoid circular imports
if TYPE_CHECKING:
    from .user import User
    from .comment import Comment

class Post(Base):
    __tablename__ = "posts"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    photo_uuid: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, index=True)
    photo: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    thumbs_up: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="posts")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Post {self.photo_uuid} by User {self.user_id}>" 