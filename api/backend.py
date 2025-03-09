from sqlalchemy import DateTime, create_engine, Column, Integer, String, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, scoped_session
from fastapi import HTTPException
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
import logging

from settings import *

logger = logging.getLogger(__name__)

Base = declarative_base()

def utcnow():
    """Return current UTC datetime with timezone info."""
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(24), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    thumbed_posts = Column(JSON, default=[]) # List of integers for thumbed post IDs

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True)
    photo_uuid = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    thumbs_up = Column(Integer, default=0)
    
    # Add relationship to comments with cascade delete
    comments = relationship("Comment", cascade="all, delete-orphan", backref="post")

    def __repr__(self):
        return f"<Post(id={self.id}, photo_id={self.photo_uuid}, user_id={self.user_id}, created_at={self.created_at.isoformat()}, updated_at={self.updated_at.isoformat()}, thumbs_up={self.thumbs_up})>"

class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(String(60), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    def __repr__(self):
        return f"<Comment(id={self.id}, post_id={self.post_id}, user_id={self.user_id}, content={self.content}, created_at={self.created_at})>"

# Database setup
if RUN_TESTS:
    DB = "sqlite:///test.db"

try:
    engine = create_engine(DB)
    Base.metadata.create_all(engine)
    
    # Use scoped_session to ensure thread safety
    Session = scoped_session(sessionmaker(bind=engine))
    
    logger.info(f"Database initialized successfully: {DB}")
except Exception as e:
    logger.error(f"Failed to initialize database: {str(e)}")
    raise

# Database operation functions with proper error handling
def add_user(username, password):
    """Add a new user to the database with error handling."""
    try:
        session = Session()
        new_user = User(username=username)
        new_user.set_password(password)
        session.add(new_user)
        session.commit()
        return new_user.id
    except Exception as e:
        session.rollback()
        logger.error(f"Error adding user {username}: {str(e)}")
        raise
    finally:
        session.close()

def login(username, password):
    """Login user with error handling."""
    try:
        session = Session()
        user = session.query(User).filter_by(username=username).first()
        if user and user.check_password(password):
            return True
        return False
    except Exception as e:
        logger.error(f"Error during login for user {username}: {str(e)}")
        return False
    finally:
        session.close()

def create_post(photo_uuid, user_id):
    """Create a new post using the correct photo_uuid parameter."""
    try:
        session = Session()
        post = Post(photo_uuid=photo_uuid, user_id=user_id)
        session.add(post)
        session.commit()
        return post.id
    except Exception as e:
        session.rollback()
        logger.error(f"Error creating post for user {user_id}: {str(e)}")
        raise
    finally:
        session.close()

def get_post_or_404(post_id):
    """Get a post or raise 404 error with proper error handling."""
    try:
        session = Session()
        post = session.query(Post).filter_by(id=post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post doesn't exist")
        return post
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving post {post_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        session.close()