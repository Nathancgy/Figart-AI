import uuid
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend import (
    session, User, add_user, 
    login, get_post_or_404, Photo, Post, Comment,
    save_photo, create_post
)
from datetime import datetime, timedelta
import jwt

app = FastAPI()

from fastapi import File, UploadFile
from fastapi import Depends, Security
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
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
    return {"message": "User created successfully"}

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
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')
        return {"message": "Login successful", "token": token}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/upload/")
async def upload_photo(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File type not supported")
    
    filename = uuid.uuid4().hex + file.filename.split(".")[-1]

    file_location = f"uploads/{filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    photo_id = save_photo(filename, current_user)
    
    return {"message": "Photo uploaded successfully", "photo_id": photo_id}

@app.post("/posts/create/")
async def create_post(photo_id: int, current_user: str = Depends(get_current_user)):
    photo = session.query(Photo).filter_by(id=photo_id, user_id=current_user).first()
    if not photo:
        raise HTTPException(status_code=403, detail="You do not have permission to create a post for this photo")
    post_id = create_post(photo_id, current_user)
    return {"message": "Post created successfully", "post_id": post_id}

@app.get("/posts/recent/")
async def get_recent_posts():
    posts = session.query(Post).order_by(Post.created_at.desc()).limit(20).all()
    return {"posts": posts}

@app.get("/posts/{post_id}/")
async def get_post(post_id: int):
    post = session.query(Post).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post doesn't exist")
    return {"post": post}

@app.get("/posts/all/{paging}")
async def get_all_posts(paging: int):
    posts = session.query(Post).order_by(Post.created_at.desc()).offset(paging * 20).limit(20).all()
    return {"posts": posts}

@app.get("/users/{user_id}/posts/")
async def get_user_posts(user_id: int):
    posts = session.query(Post).filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    return {"posts": posts}

@app.post("/posts/{post_id}/thumbs-up/")
async def thumbs_up_post(post_id: int, current_user: str = Depends(get_current_user)):
    post = get_post_or_404(post_id)
    user = session.query(User).filter_by(username=current_user).first()
    if post_id in user.thumbed_posts:
        raise HTTPException(status_code=400, detail="You already thumbed up this post")
    post.thumbs_up += 1
    user.thumbed_posts.append(post_id)
    session.commit()
    return {"message": "Thumbs up added successfully"}

@app.post("/posts/{post_id}/thumbs-down/")
async def thumbs_down_post(post_id: int, current_user: str = Depends(get_current_user)):
    post = get_post_or_404(post_id)
    user = session.query(User).filter_by(username=current_user).first()
    if post_id not in user.thumbed_posts:
        raise HTTPException(status_code=400, detail="You haven't thumbed up this post")
    post.thumbs_up -= 1
    user.thumbed_posts.pop(post_id)
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
async def comment_post(post_id: int, comment: str, current_user: str = Depends(get_current_user)):
    post = get_post_or_404(post_id)
    comment = Comment(post_id=post_id, comment=comment, user_id=current_user)
    session.add(comment)
    session.commit()
    return {"message": "Comment added successfully", "comment_id": comment.id}

@app.get("/posts/{post_id}/comments/")
async def get_post_comments(post_id: int):
    comments = session.query(Comment).filter_by(post_id=post_id).all()
    return {"comments": comments}

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