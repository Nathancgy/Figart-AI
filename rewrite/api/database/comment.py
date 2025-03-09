from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, DateTime, String, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .utils import utcnow

# Use TYPE_CHECKING to avoid circular imports
if TYPE_CHECKING:
    from .user import User
    from .post import Post

class Comment(Base):
    __tablename__ = "comments"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(
        String(160), 
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="comments")
    post: Mapped["Post"] = relationship("Post", back_populates="comments")

    # Add check constraint to ensure content length <= 160
    __table_args__ = (
        CheckConstraint('LENGTH(content) <= 160', name='check_content_length'),
    )

    def __repr__(self) -> str:
        return f"<Comment {self.id} by User {self.user_id} on Post {self.post_id}>" 