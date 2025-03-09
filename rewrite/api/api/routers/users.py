from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import User
from ..schemas.users import UserResponse, UserUpdate
from ..security import get_current_active_user, get_current_superuser, get_db_session, get_password_hash

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user information.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Update current user information.
    """
    # Check if email is already taken if it's being updated
    if user_update.email and user_update.email != current_user.email:
        query = select(User).where(User.email == user_update.email)
        result = await session.execute(query)
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    
    # Check if username is already taken if it's being updated
    if user_update.username and user_update.username != current_user.username:
        query = select(User).where(User.username == user_update.username)
        result = await session.execute(query)
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )
    
    # Update user fields
    if user_update.email:
        current_user.email = user_update.email
    if user_update.username:
        current_user.username = user_update.username
    if user_update.password:
        current_user.hashed_password = get_password_hash(user_update.password)
    
    await session.commit()
    await session.refresh(current_user)
    
    return current_user

# Admin endpoints
@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get all users (admin only).
    """
    query = select(User).offset(skip).limit(limit)
    result = await session.execute(query)
    users = result.scalars().all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get user by ID (admin only).
    """
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Update user by ID (admin only).
    """
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if email is already taken if it's being updated
    if user_update.email and user_update.email != user.email:
        query = select(User).where(User.email == user_update.email)
        result = await session.execute(query)
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    
    # Check if username is already taken if it's being updated
    if user_update.username and user_update.username != user.username:
        query = select(User).where(User.username == user_update.username)
        result = await session.execute(query)
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )
    
    # Update user fields
    if user_update.email:
        user.email = user_update.email
    if user_update.username:
        user.username = user_update.username
    if user_update.password:
        user.hashed_password = get_password_hash(user_update.password)
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    await session.commit()
    await session.refresh(user)
    
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_superuser),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Delete user by ID (admin only).
    """
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    await session.delete(user)
    await session.commit()
    
    return None 