import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend import (
    session, User, add_user, 
    login, get_post_or_404, Post, Comment,
    utcnow
)
from settings import *
from datetime import timedelta
import jwt
import os
import os.path

app = FastAPI()

# Token blacklist set to store invalidated tokens
token_blacklist = set()

app.add_middleware(
    CORSMiddleware,
    allow_origins=HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import File, UploadFile
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi import Request

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    # Check if token is blacklisted
    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token has been invalidated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/users/register/")
def create_user(user: UserCreate):
    if session.query(User).filter_by(username=user.username).first():
        raise HTTPException(status_code=409, detail="Username already registered")
    add_user(user.username, user.password)
    token = jwt.encode({
        'sub': user.username,
        'exp': utcnow() + timedelta(minutes=30)
        }, SECRET_KEY, algorithm='HS256')
    return {"message": "User created successfully", "token": token}

class UserLogin(BaseModel):
    username: str
    password: str

SECRET_KEY = "your_secret_key"  # Change this to a secure key

@app.post("/users/login/")
def login_user(user: UserLogin):
    if login(user.username, user.password):
        # Generate a token
        token = jwt.encode({
            'sub': user.username,
            'exp': utcnow() + timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')
        return {"message": "Login successful", "token": token}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/posts/create/")
async def create_post(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File type not supported")
    
    # Get the user ID from the username
    user = session.query(User).filter_by(username=current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    filename = uuid.uuid4().hex + "." + file.filename.split(".")[-1]
    file_location = f"uploads/{filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    p = Post(photo_uuid=filename, user_id=user.id)
    session.add(p)
    session.commit()
    return {"message": "Post created successfully", "post_id": p.id}

@app.get("/posts/recent/")
async def get_recent_posts():
    posts = session.query(Post).order_by(Post.created_at.desc()).limit(20).all()
    
    # Format posts to include username instead of user_id
    formatted_posts = []
    for post in posts:
        user = session.query(User).filter_by(id=post.user_id).first()
        username = user.username if user else "Unknown User"
        
        formatted_posts.append({
            "id": post.id,
            "photo_uuid": post.photo_uuid,
            "user_id": username,  # Use username instead of user_id
            "created_at": post.created_at.isoformat(),
            "thumbs_up": post.thumbs_up
        })
    
    return {"posts": formatted_posts}

@app.get("/posts/{post_id}/")
async def get_post(post_id: int):
    post = session.query(Post).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post doesn't exist")
    
    # Get the username instead of user_id
    user = session.query(User).filter_by(id=post.user_id).first()
    username = user.username if user else "Unknown User"
    
    # Format the post data
    formatted_post = {
        "id": post.id,
        "photo_uuid": post.photo_uuid,
        "user_id": username,  # Use username instead of user_id
        "created_at": post.created_at.isoformat(),
        "thumbs_up": post.thumbs_up
    }
    
    return {"post": formatted_post}

@app.get("/posts/all/{paging}")
async def get_all_posts(paging: int):
    posts = session.query(Post).order_by(Post.created_at.desc()).offset(paging * 20).limit(20).all()
    
    # Format posts to include username instead of user_id
    formatted_posts = []
    for post in posts:
        user = session.query(User).filter_by(id=post.user_id).first()
        username = user.username if user else "Unknown User"
        
        formatted_posts.append({
            "id": post.id,
            "photo_uuid": post.photo_uuid,
            "user_id": username,  # Use username instead of user_id
            "created_at": post.created_at.isoformat(),
            "thumbs_up": post.thumbs_up
        })
    
    return {"posts": formatted_posts}

@app.get("/users/{user_id}/posts/")
async def get_user_posts(user_id: int):
    posts = session.query(Post).filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    return {"posts": posts}

@app.post("/posts/{post_id}/thumbs-up/")
async def thumbs_up_post(post_id: int, current_user: str = Depends(get_current_user)):
    post = get_post_or_404(post_id)
    user = session.query(User).filter_by(username=current_user).first()
    
    # Check if the post is already in the user's thumbed posts
    if post_id in user.thumbed_posts:
        raise HTTPException(status_code=400, detail="You already thumbed up this post")
    
    # Update the post's thumbs up count
    post.thumbs_up += 1
    
    # Create a new list with the post ID added (SQLAlchemy detects this as a change)
    user.thumbed_posts = user.thumbed_posts + [post_id]
    
    session.commit()
    return {"message": "Thumbs up added successfully"}

@app.post("/posts/{post_id}/thumbs-down/")
async def thumbs_down_post(post_id: int, current_user: str = Depends(get_current_user)):
    post = get_post_or_404(post_id)
    user = session.query(User).filter_by(username=current_user).first()
    
    # Check if the post is in the user's thumbed posts
    if post_id not in user.thumbed_posts:
        raise HTTPException(status_code=400, detail="You haven't thumbed up this post")
    
    # Update the post's thumbs up count
    post.thumbs_up -= 1
    
    # Remove the post ID from the user's thumbed posts
    user.thumbed_posts = [p for p in user.thumbed_posts if p != post_id]
    
    session.commit()
    return {"message": "Thumbs up removed successfully"}

@app.post("/posts/{post_id}/delete/")
async def delete_post(post_id: int, current_user: str = Depends(get_current_user)):
    post = get_post_or_404(post_id)
    if post.user_id != current_user:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this post")
    session.delete(post)
    session.commit()
    return {"message": "Post deleted successfully"}

@app.post("/posts/{post_id}/comment/add/")
async def comment_post(post_id: int, request: Request, current_user: str = Depends(get_current_user)):
    try:
        body = await request.json()
        comment = body.get("comment")
    except:
        comment = None
    
    if not comment:
        raise HTTPException(status_code=400, detail="Comment text is required")
    
    # Get user ID from username
    user = session.query(User).filter_by(username=current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    post = get_post_or_404(post_id)
    comment_obj = Comment(post_id=post_id, content=comment, user_id=user.id)
    session.add(comment_obj)
    session.commit()
    return {"message": "Comment added successfully", "comment_id": comment_obj.id}

@app.get("/posts/{post_id}/comments/")
async def get_post_comments(post_id: int):
    comments = session.query(Comment).filter_by(post_id=post_id).order_by(Comment.created_at.desc()).all()
    
    # Format comments to include username instead of user_id
    formatted_comments = []
    for comment in comments:
        user = session.query(User).filter_by(id=comment.user_id).first()
        username = user.username if user else "Unknown User"
        
        formatted_comments.append({
            "id": comment.id,
            "post_id": comment.post_id,
            "user_id": username,  # Use username instead of user_id
            "content": comment.content,
            "created_at": comment.created_at.isoformat()
        })
    
    return {"comments": formatted_comments}

@app.post("/posts/{post_id}/comment/{comment_id}/delete/")
async def delete_comment(post_id: int, comment_id: int, current_user: str = Depends(get_current_user)):
    comment = session.query(Comment).filter_by(id=comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment doesn't exist")
    if comment.user_id != current_user:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this comment")
    session.delete(comment)
    session.commit()
    return {"message": "Comment deleted successfully"}

@app.post("/users/logout/")
async def logout_user(current_user: str = Depends(get_current_user), token: str = Depends(oauth2_scheme)):
    # Add the token to the blacklist
    token_blacklist.add(token)
    return {"message": "Successfully logged out"}

def inside(photoname):
    abspath = os.path.abspath(os.path.join("./uploads/", photoname))
    return os.path.commonprefix([abspath, os.path.abspath("./uploads/")]) == os.path.abspath("./uploads/")

@app.get("/photos/{photoname}")
async def get_photo(photoname: str):
    if not inside(photoname):
        raise HTTPException(status_code=403, detail="Unauthorized")
    if not os.path.exists(f"uploads/{photoname}"):
        raise HTTPException(status_code=404, detail="Photo doesn't exist")

    return FileResponse(f"uploads/{photoname}")

@app.get("/users/liked-posts/")
async def get_user_liked_posts(current_user: str = Depends(get_current_user)):
    user = session.query(User).filter_by(username=current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"liked_posts": user.thumbed_posts}
