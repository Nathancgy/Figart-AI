import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.database import User, Post, Comment
from ..schemas.posts import PostCreate, PostResponse, PostUpdate, PostDetailResponse
from ..security import get_current_active_user, get_db_session

router = APIRouter()

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Create a new post with an uploaded photo.
    """
    # Read the file content
    photo_content = await file.read()
    
    # Create a unique UUID for the photo
    photo_uuid = str(uuid.uuid4())
    
    # Create new post
    post = Post(
        user_id=current_user.id,
        photo_uuid=photo_uuid,
        photo=photo_content,
        thumbs_up=0
    )
    
    session.add(post)
    await session.commit()
    await session.refresh(post)
    
    return post

@router.get("/", response_model=List[PostResponse])
async def read_posts(
    skip: int = 0,
    limit: int = 20,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get all posts with pagination.
    """
    # Query to get posts and comment count
    stmt = (
        select(Post, func.count(Comment.id).label("comment_count"))
        .outerjoin(Comment, Post.id == Comment.post_id)
        .group_by(Post.id)
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await session.execute(stmt)
    posts_with_counts = result.all()
    
    # Format the response
    posts = []
    for post, comment_count in posts_with_counts:
        post_dict = PostResponse.model_validate(post)
        post_dict.comment_count = comment_count
        posts.append(post_dict)
    
    return posts

@router.get("/{post_id}", response_model=PostDetailResponse)
async def read_post(
    post_id: int,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get a post by ID with details including comments.
    """
    # Get post with user and comments
    stmt = (
        select(Post)
        .options(
            joinedload(Post.user),
            joinedload(Post.comments).joinedload(Comment.user)
        )
        .where(Post.id == post_id)
    )
    
    result = await session.execute(stmt)
    post = result.scalars().first()
    
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return post

@router.get("/by-user/{user_id}", response_model=List[PostResponse])
async def read_user_posts(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get all posts by a specific user.
    """
    # Check if user exists
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Query to get posts and comment count for a specific user
    stmt = (
        select(Post, func.count(Comment.id).label("comment_count"))
        .outerjoin(Comment, Post.id == Comment.post_id)
        .where(Post.user_id == user_id)
        .group_by(Post.id)
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await session.execute(stmt)
    posts_with_counts = result.all()
    
    # Format the response
    posts = []
    for post, comment_count in posts_with_counts:
        post_dict = PostResponse.model_validate(post)
        post_dict.comment_count = comment_count
        posts.append(post_dict)
    
    return posts

@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Update a post (currently only supports updating thumbs_up).
    Only the post owner or a superuser can update the post.
    """
    post = await session.get(Post, post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if the user is the owner or a superuser
    if post.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update post fields
    if post_update.thumbs_up is not None:
        post.thumbs_up = post_update.thumbs_up
    
    await session.commit()
    await session.refresh(post)
    
    return post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Delete a post.
    Only the post owner or a superuser can delete the post.
    """
    post = await session.get(Post, post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if the user is the owner or a superuser
    if post.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await session.delete(post)
    await session.commit()
    
    return None 