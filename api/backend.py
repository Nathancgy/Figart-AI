from sqlalchemy import DateTime, create_engine, Column, Integer, String, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from fastapi import HTTPException
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

from settings import *

Base = declarative_base()

def utcnow():
    tz = datetime.now().astimezone().tzinfo
    return datetime.now(tz)

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
    thumbs_up = Column(Integer, default=0)
    
    # Add relationship to comments with cascade delete
    comments = relationship("Comment", cascade="all, delete-orphan", backref="post")

    def __repr__(self):
        return f"<Post(id={self.id}, photo_id={self.photo_id}, user_id={self.user_id}, created_at={self.created_at}, thumbs_up={self.thumbs_up})>"

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
engine = create_engine(DB)
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

# Example of adding a new user
def add_user(username, password):
    new_user = User(username=username)
    new_user.set_password(password)
    session.add(new_user)
    session.commit()

# Example of user login
def login(username, password):
    user = session.query(User).filter_by(username=username).first()
    if user and user.check_password(password):
        return True
    return False

def create_post(photo_id, user_id):
    post = Post(photo_id=photo_id, user_id=user_id)
    session.add(post)
    session.commit()
    return post.id

def get_post_or_404(post_id):
    post = session.query(Post).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post doesn't exist")
    return post