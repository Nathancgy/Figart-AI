# Figart-AI API Summary

## Overview
The Figart-AI API is a FastAPI-based backend that provides endpoints for user authentication, post management, and social interactions like comments and likes.

## Authentication
- **Register**: `POST /users/register/` - Create a new user account
- **Login**: `POST /users/login/` - Authenticate and receive a JWT token
- **Logout**: `POST /users/logout/` - Invalidate the current token

## Posts
### New Consolidated Endpoint
- **Get Posts**: `GET /posts/` - Fetch posts with sorting and pagination
  - Parameters:
    - `sort_by`: 'recent' (default) or 'likes'
    - `page`: Page number (0-indexed)
    - `limit`: Number of posts per page (default 20)
  - Returns:
    - List of posts with user information
    - Pagination metadata (total, page, limit, pages)

### Other Post Endpoints
- **Create Post**: `POST /posts/create/` - Upload a new photo post
- **Get Post**: `GET /posts/{post_id}/` - Get a specific post by ID
- **Like Post**: `POST /posts/{post_id}/thumbs-up/` - Like a post
- **Unlike Post**: `POST /posts/{post_id}/thumbs-down/` - Remove a like from a post
- **Delete Post**: `POST /posts/{post_id}/delete/` - Delete a post (owner only)

## Comments
- **Add Comment**: `POST /posts/{post_id}/comment/add/` - Add a comment to a post
- **Get Comments**: `GET /posts/{post_id}/comments/` - Get all comments for a post
- **Delete Comment**: `POST /posts/{post_id}/comment/{comment_id}/delete/` - Delete a comment (owner only)

## User Data
- **User Posts**: `GET /users/{user_id}/posts/` - Get posts by a specific user (authenticated user only)
- **Liked Posts**: `GET /users/liked-posts/` - Get posts liked by the current user

## Media
- **Get Photo**: `GET /photos/{photoname}` - Retrieve a photo by its UUID filename

## Changes Made

1. **Consolidated Post Fetching**:
   - Created a single `/posts/` endpoint that replaces multiple endpoints
   - Added support for sorting by recency or likes
   - Implemented proper pagination with metadata
   - Maintained backward compatibility with deprecated endpoints

2. **Enhanced Security**:
   - Added authentication checks to user-specific endpoints
   - Ensured users can only access their own data

3. **UI Updates**:
   - Modified the community page to use the new consolidated endpoint
   - Implemented client-side pagination with "Load More" functionality
   - Added proper handling of sort method changes
   - Optimized liked posts handling

## API Response Format

### Posts Endpoint
```json
{
  "posts": [
    {
      "id": 1,
      "photo_uuid": "abc123.jpg",
      "user_id": "username",
      "created_at": "2023-01-01T12:00:00",
      "thumbs_up": 42
    }
  ],
  "pagination": {
    "total": 100,
    "page": 0,
    "limit": 20,
    "pages": 5
  }
}
``` 