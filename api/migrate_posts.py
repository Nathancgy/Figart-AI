#!/usr/bin/env python3
"""
Migration script to add updated_at column to existing posts.

This script should be run after updating the Post model to include the updated_at field.
It will add the updated_at column to the posts table and set its value to match created_at
for existing posts.
"""

import sys
import os
from sqlalchemy import Column, DateTime, text
from sqlalchemy.sql import func
from datetime import datetime

# Add the parent directory to the path so we can import from the api package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.backend import session, Post, Base, engine, utcnow

def migrate_posts():
    """Add updated_at column to posts table and set initial values."""
    print("Starting migration to add updated_at column to posts table...")
    
    # Check if the column already exists
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('posts')]
    
    if 'updated_at' in columns:
        print("Column 'updated_at' already exists in posts table. No migration needed.")
        return
    
    try:
        # Add the column
        print("Adding 'updated_at' column to posts table...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP"))
        
        # Update existing posts to set updated_at = created_at
        print("Setting initial values for 'updated_at' column...")
        with engine.begin() as conn:
            conn.execute(text("UPDATE posts SET updated_at = created_at"))
        
        print("Migration completed successfully!")
    except Exception as e:
        print(f"Error during migration: {e}")
        print("Migration failed.")

if __name__ == "__main__":
    # Import inspect here to avoid circular imports
    from sqlalchemy import inspect
    
    migrate_posts() 