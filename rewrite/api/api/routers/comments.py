from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.database import User, Post, Comment
from ..schemas.comments import CommentCreate, CommentResponse, CommentUpdate, CommentDetailResponse
from ..security import get_current_active_user, get_db_session

router = APIRouter()

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Create a new comment on a post.
    """
    # Check if post exists
    post = await session.get(Post, comment_data.post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Create new comment
    comment = Comment(
        content=comment_data.content,
        user_id=current_user.id,
        post_id=comment_data.post_id
    )
    
    session.add(comment)
    await session.commit()
    await session.refresh(comment)
    
    return comment

@router.get("/by-post/{post_id}", response_model=List[CommentDetailResponse])
async def read_post_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get all comments for a specific post.
    """
    # Check if post exists
    post = await session.get(Post, post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Get comments with user information
    stmt = (
        select(Comment)
        .options(joinedload(Comment.user))
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at)
        .offset(skip)
        .limit(limit)
    )
    
    result = await session.execute(stmt)
    comments = result.scalars().all()
    
    return comments

@router.get("/by-user/{user_id}", response_model=List[CommentResponse])
async def read_user_comments(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get all comments by a specific user.
    """
    # Check if user exists
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get comments
    stmt = (
        select(Comment)
        .where(Comment.user_id == user_id)
        .order_by(Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await session.execute(stmt)
    comments = result.scalars().all()
    
    return comments

@router.get("/{comment_id}", response_model=CommentDetailResponse)
async def read_comment(
    comment_id: int,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get a comment by ID.
    """
    # Get comment with user information
    stmt = (
        select(Comment)
        .options(joinedload(Comment.user))
        .where(Comment.id == comment_id)
    )
    
    result = await session.execute(stmt)
    comment = result.scalars().first()
    
    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    return comment

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Update a comment.
    Only the comment owner or a superuser can update the comment.
    """
    comment = await session.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if the user is the owner or a superuser
    if comment.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update comment fields
    if comment_update.content:
        comment.content = comment_update.content
    
    await session.commit()
    await session.refresh(comment)
    
    return comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Delete a comment.
    Only the comment owner, the post owner, or a superuser can delete the comment.
    """
    # Get comment with post information
    stmt = (
        select(Comment)
        .options(joinedload(Comment.post))
        .where(Comment.id == comment_id)
    )
    
    result = await session.execute(stmt)
    comment = result.scalars().first()
    
    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if the user is the comment owner, the post owner, or a superuser
    if (comment.user_id != current_user.id and 
        comment.post.user_id != current_user.id and 
        not current_user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await session.delete(comment)
    await session.commit()
    
    return None 