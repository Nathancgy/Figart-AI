from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    thumbed_posts = Column(JSON, default=[]) # List of integers for thumbed post IDs

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Photo(Base):
    __tablename__ = 'photos'

    id = Column(Integer, primary_key=True)
    internal_filename = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True)
    photo_id = Column(Integer, ForeignKey('photos.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    thumbs_up = Column(Integer, default=0)

    def __repr__(self):
        return f"<Post(id={self.id}, photo_id={self.photo_id}, user_id={self.user_id}, created_at={self.created_at}, thumbs_up={self.thumbs_up})>"

class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(String, nullable=False, max_length=255)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Comment(id={self.id}, post_id={self.post_id}, user_id={self.user_id}, content={self.content}, created_at={self.created_at})>"

# Database setup
engine = create_engine('sqlite:///users.db')
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

def save_photo(file_name, user_id):
    photo = Photo(internal_filename=file_name, user_id=user_id)
    session.add(photo)
    session.commit()
    return photo.id

def get_photo_loc(photo_id):
    return session.query(Photo).filter_by(id=photo_id).first().internal_filename

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