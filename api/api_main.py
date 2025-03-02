import uuid
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from backend import (
    session, User, add_user, 
    login, get_post_or_404, Post, Comment,
    utcnow
)
from settings import *
from datetime import timedelta, datetime
import jwt
import os
import os.path
from typing import Optional, List, Dict, Any
import base64
import io
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image

try:
    os.mkdir("uploads")
except:
    pass

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

@app.get("/posts/")
async def get_posts(sort_by: str = "recent", page: int = 0, limit: int = 18):
    """
    Get posts with sorting and pagination
    
    Parameters:
    - sort_by: 'recent' (default) or 'likes'
    - page: Page number (0-indexed)
    - limit: Number of posts per page (default 18)
    """
    # Base query
    query = session.query(Post)
    
    # Apply sorting
    if sort_by == "likes":
        query = query.order_by(Post.thumbs_up.desc(), Post.created_at.desc())
    else:  # Default to recent
        query = query.order_by(Post.created_at.desc())
    
    # Apply pagination
    posts = query.offset(page * limit).limit(limit).all()
    
    # Format posts to include username instead of user_id
    formatted_posts = []
    for post in posts:
        user = session.query(User).filter_by(id=post.user_id).first()
        username = user.username if user else "Unknown User"
        
        # Ensure thumbs_up is never negative
        thumbs_up = max(0, post.thumbs_up)
        
        # If we found a negative value, fix it in the database
        if post.thumbs_up < 0:
            post.thumbs_up = 0
            session.commit()
        
        formatted_posts.append({
            "id": post.id,
            "photo_uuid": post.photo_uuid,
            "user_id": username,  # Use username instead of user_id
            "created_at": post.created_at.isoformat(),
            "thumbs_up": thumbs_up
        })
    
    # Get total count for pagination info
    total_posts = session.query(Post).count()
    
    return {
        "posts": formatted_posts,
        "pagination": {
            "total": total_posts,
            "page": page,
            "limit": limit,
            "pages": (total_posts + limit - 1) // limit  # Ceiling division
        }
    }

# Keep these endpoints for backward compatibility but mark as deprecated
@app.get("/posts/recent/")
async def get_recent_posts():
    """
    DEPRECATED: Use /posts/?sort_by=recent instead
    """
    posts_response = await get_posts(sort_by="recent", page=0, limit=18)
    return {"posts": posts_response["posts"]}

@app.get("/posts/all/{paging}")
async def get_all_posts(paging: int):
    """
    DEPRECATED: Use /posts/?page={paging} instead
    """
    posts_response = await get_posts(sort_by="recent", page=paging, limit=18)
    return {"posts": posts_response["posts"]}

@app.get("/posts/{post_id}/")
async def get_post(post_id: int):
    post = session.query(Post).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post doesn't exist")
    
    # Get the username instead of user_id
    user = session.query(User).filter_by(id=post.user_id).first()
    username = user.username if user else "Unknown User"
    
    # Ensure thumbs_up is never negative
    thumbs_up = max(0, post.thumbs_up)
    
    # If we found a negative value, fix it in the database
    if post.thumbs_up < 0:
        post.thumbs_up = 0
        session.commit()
    
    # Format the post data
    formatted_post = {
        "id": post.id,
        "photo_uuid": post.photo_uuid,
        "user_id": username,  # Use username instead of user_id
        "created_at": post.created_at.isoformat(),
        "thumbs_up": thumbs_up
    }
    
    return {"post": formatted_post}

@app.get("/users/{user_id}/posts/")
async def get_user_posts(user_id: int, current_user: str = Depends(get_current_user)):
    # Get the authenticated user's ID
    auth_user = session.query(User).filter_by(username=current_user).first()
    if not auth_user:
        raise HTTPException(status_code=404, detail="Authenticated user not found")
    
    # Check if the requested user_id matches the authenticated user's ID
    if user_id != auth_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to access this user's posts")
    
    posts = session.query(Post).filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    
    # Format posts to include username instead of user_id
    formatted_posts = []
    for post in posts:
        # Ensure thumbs_up is never negative
        thumbs_up = max(0, post.thumbs_up)
        
        # If we found a negative value, fix it in the database
        if post.thumbs_up < 0:
            post.thumbs_up = 0
            session.commit()
            
        formatted_posts.append({
            "id": post.id,
            "photo_uuid": post.photo_uuid,
            "user_id": auth_user.username,  # Use username instead of user_id
            "created_at": post.created_at.isoformat(),
            "thumbs_up": thumbs_up
        })
    
    return {"posts": formatted_posts}

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
    
    # Update the post's thumbs up count, ensuring it never goes below 0
    post.thumbs_up = max(0, post.thumbs_up - 1)
    
    # Remove the post ID from the user's thumbed posts
    user.thumbed_posts = [p for p in user.thumbed_posts if p != post_id]
    
    session.commit()
    return {"message": "Thumbs up removed successfully"}

@app.post("/posts/{post_id}/delete/")
async def delete_post(post_id: int, current_user: str = Depends(get_current_user)):
    post = get_post_or_404(post_id)
    user = session.query(User).filter_by(id=post.user_id).first()
    if user.username != current_user:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this post")
    
    # Delete associated comments first (as a backup measure)
    session.query(Comment).filter_by(post_id=post_id).delete()
    
    # Then delete the post
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
    user = session.query(User).filter_by(id=comment.user_id).first()
    if user.username != current_user:
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

@app.get("/posts/changed")
async def check_posts_changed(since: str = Query(..., description="ISO format timestamp (e.g., '2023-04-01T12:00:00.000Z')")):
    """
    Check if any posts have been created or modified since the specified timestamp.
    
    This endpoint checks for:
    - New posts created after the timestamp
    - Existing posts that have had their thumbs_up count or other fields updated
    
    It does not track changes to comments.
    
    Parameters:
    - since: ISO format timestamp (e.g., '2023-04-01T12:00:00.000Z')
    
    Returns:
    - changed: Boolean indicating if any posts have changed
    - new_posts: List of IDs of new posts created since the timestamp
    - updated_posts: List of IDs of existing posts that have been updated since the timestamp
    - since: The parsed timestamp used for comparison
    """
    try:
        # Parse the timestamp, ensuring proper timezone handling
        if since.endswith('Z'):
            # Convert from UTC to local time by adding 8 hours (for Asia/Shanghai)
            since_datetime = datetime.fromisoformat(since.replace('Z', '+00:00'))
            # Make it timezone-naive for comparison with database timestamps
            since_datetime_local = since_datetime.replace(tzinfo=None)
            print(f"Parsed UTC timestamp: {since_datetime}, converted to local: {since_datetime_local}")
        else:
            # If no timezone specified, assume it's already in local time
            since_datetime_local = datetime.fromisoformat(since)
            print(f"Parsed local timestamp: {since_datetime_local}")
        
        # Get the current time (already in local timezone)
        current_time = utcnow()
        # Make sure current_time is timezone-naive for comparison
        if current_time.tzinfo is not None:
            current_time = current_time.replace(tzinfo=None)
        print(f"Current time: {current_time}")
        
        # Ensure the timestamp is not in the future
        if since_datetime_local > current_time:
            print(f"Warning: Provided timestamp {since_datetime_local} is in the future. Using current time {current_time} instead.")
            since_datetime_local = current_time
        
        print(f"Using timestamp for query: {since_datetime_local}")
        
        # For debugging, let's print all posts in the database
        all_posts = session.query(Post).all()
        print(f"Total posts in database: {len(all_posts)}")
        for post in all_posts:
            print(f"Post {post.id}: created_at={post.created_at}, updated_at={post.updated_at}, thumbs_up={post.thumbs_up}")
        
        # Get all posts that might have changed since the timestamp
        all_posts_query = session.query(Post).filter(
            # Either created after the timestamp
            (Post.created_at > since_datetime_local) |
            # Or updated after the timestamp (and created before or at the timestamp)
            ((Post.updated_at > since_datetime_local) & (Post.created_at <= since_datetime_local))
        )
        
        all_changed_posts = all_posts_query.all()
        print(f"Total changed posts: {len(all_changed_posts)}")
        
        # Identify new posts (created after the timestamp)
        new_posts = [post for post in all_changed_posts if post.created_at > since_datetime_local]
        new_post_ids = [post.id for post in new_posts]
        
        # Identify updated posts (updated after the timestamp but created before or at the timestamp)
        updated_posts = [post for post in all_changed_posts if post.updated_at > since_datetime_local and post.created_at <= since_datetime_local]
        updated_post_ids = [post.id for post in updated_posts]
        
        # For debugging
        if new_posts:
            for post in new_posts:
                print(f"New post: id={post.id}, created_at={post.created_at}, updated_at={post.updated_at}")
        else:
            print("No new posts found")
        
        if updated_posts:
            for post in updated_posts:
                print(f"Updated post: id={post.id}, created_at={post.created_at}, updated_at={post.updated_at}")
        else:
            print("No updated posts found")
        
        # Determine if anything has changed
        changed = len(new_post_ids) > 0 or len(updated_post_ids) > 0
        
        return {
            "changed": changed,
            "new_posts": new_post_ids,
            "updated_posts": updated_post_ids,
            "since": since_datetime_local.isoformat()
        }
    except Exception as e:
        # Log the error for debugging
        print(f"Error in check_posts_changed: {str(e)}")
        # Return a default response instead of an error
        return {
            "changed": False,
            "new_posts": [],
            "updated_posts": [],
            "error": str(e)
        }

# Initialize YOLOv8 model with better error handling
try:
    print("Initializing YOLOv8 model...")
    yolo_model = YOLO("yolov8n.pt")  # Using the nano model for faster processing
    print("YOLOv8 model initialized successfully")
except Exception as e:
    print(f"Error initializing YOLOv8 model: {str(e)}")
    # We'll initialize it as None and check for it in the endpoint
    yolo_model = None

@app.post("/api/detect-objects/")
async def detect_objects(file: UploadFile = File(...)):
    """
    Analyze an image with YOLO to detect objects and suggest an optimal frame.
    Returns boxes of detected objects and a suggested frame.
    """
    try:
        # Check if model was successfully initialized
        if yolo_model is None:
            raise HTTPException(status_code=500, detail="YOLOv8 model could not be initialized. Please try again later.")
            
        # Validate file type
        print(f"Processing file: {file.filename}, content_type: {file.content_type}")
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are accepted")
            
        # Supported image formats
        supported_formats = ['image/jpeg', 'image/jpg', 'image/png']
        if file.content_type not in supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported image format: {file.content_type}. Please use JPEG or PNG images."
            )
            
        # Read the uploaded image
        contents = await file.read()
        print(f"Read {len(contents)} bytes of data")
        
        # Convert to numpy array
        nparr = np.frombuffer(contents, np.uint8)
        print(f"Converted to numpy array of shape: {nparr.shape}")
        
        # Check for empty image
        if len(nparr) == 0:
            raise HTTPException(status_code=400, detail="Empty image file received")
            
        # Decode image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            print("Failed to decode image")
            raise HTTPException(status_code=400, detail="Could not decode image. Please try a different image format.")
        
        print(f"Decoded image of shape: {img.shape}")
        
        # Keep a copy of the original image for frame suggestion
        original_img = img.copy()
        
        # Run YOLOv8 inference on the image
        print("Running YOLOv8 inference...")
        try:
            results = yolo_model(img)
            print(f"YOLOv8 inference completed successfully")
        except Exception as yolo_err:
            print(f"YOLOv8 inference error: {str(yolo_err)}")
            raise HTTPException(status_code=500, detail=f"YOLOv8 processing error: {str(yolo_err)}")
        
        # Get the detection results
        detections = []
        for r in results:
            print(f"Processing detection results: {len(r.boxes)} boxes found")
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence = float(box.conf[0])
                cls = int(box.cls[0])
                class_name = r.names[cls]
                
                detections.append({
                    "box": [x1, y1, x2, y2],
                    "confidence": confidence,
                    "class": class_name
                })
        
        print(f"Processed {len(detections)} detections")
        
        # Draw boxes on the image for visualization
        for det in detections:
            x1, y1, x2, y2 = det["box"]
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img, f"{det['class']} {det['confidence']:.2f}", 
                       (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Calculate a suggested frame based on detected objects
        print("Calculating suggested frame")
        suggested_frame = calculate_suggested_frame(detections, original_img)
        print(f"Suggested frame: {suggested_frame}")
        
        # Convert the processed image to base64 for response
        print("Encoding image to base64")
        try:
            _, buffer = cv2.imencode('.jpg', img)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            print(f"Encoded image to base64, length: {len(img_base64)}")
        except Exception as enc_err:
            print(f"Error encoding image to base64: {str(enc_err)}")
            raise HTTPException(status_code=500, detail=f"Image encoding error: {str(enc_err)}")
        
        # Prepare and return response
        response_data = {
            "detected_objects": detections,
            "boxed_image": img_base64,
            "suggested_frame": suggested_frame
        }
        print("Returning successful response")
        return JSONResponse(response_data)
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        print(f"HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        # Log the full error and traceback
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Unexpected error in detect_objects: {str(e)}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")


def calculate_suggested_frame(detections: List[Dict], image: np.ndarray) -> Dict[str, int]:
    """
    Calculate the optimal frame based on detected objects.
    """
    height, width = image.shape[:2]
    
    # Default frame dimensions (mobile aspect ratio)
    frame_width = 375
    frame_height = 667
    
    # If no objects detected, center the frame
    if not detections:
        frame_x = max(0, (width - frame_width) // 2)
        frame_y = max(0, (height - frame_height) // 2)
        return {"x": frame_x, "y": frame_y, "width": frame_width, "height": frame_height}
    
    # Calculate bounding box that contains all detected objects
    # (with some margin)
    margin = 50  # pixels of margin
    
    all_boxes = [d["box"] for d in detections]
    min_x = max(0, min([box[0] for box in all_boxes]) - margin)
    min_y = max(0, min([box[1] for box in all_boxes]) - margin)
    max_x = min(width, max([box[2] for box in all_boxes]) + margin)
    max_y = min(height, max([box[3] for box in all_boxes]) + margin)
    
    # Calculate center of this bounding box
    center_x = (min_x + max_x) // 2
    center_y = (min_y + max_y) // 2
    
    # Calculate frame position to center around the objects
    frame_x = max(0, min(width - frame_width, center_x - frame_width // 2))
    frame_y = max(0, min(height - frame_height, center_y - frame_height // 2))
    
    return {
        "x": frame_x,
        "y": frame_y,
        "width": frame_width,
        "height": frame_height
    }
