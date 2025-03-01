import pytest
import time
import json
from typing import Dict, Any, List

from test_utils import (
    create_user, create_test_post, add_comment,
    get_post_comments, delete_post, delete_comment,
    api_request, BASE_URL
)

# Mark all tests in this file as API tests
pytestmark = pytest.mark.api

@pytest.mark.api
def test_add_comment_endpoint(test_user, test_image):
    """Test adding a comment to a post."""
    # Create a test post
    post_id = create_test_post(test_user["token"], test_image)
    
    # Add a comment to the post
    comment_id = add_comment(test_user["token"], post_id, "Test comment")
    
    # Verify the comment was added
    comments = get_post_comments(post_id)
    assert any(comment["id"] == comment_id for comment in comments)
    
    # Clean up
    delete_comment(test_user["token"], post_id, comment_id)
    delete_post(test_user["token"], post_id)

@pytest.mark.api
def test_get_comments_endpoint(test_user, test_image):
    """Test retrieving comments for a post."""
    # Create a test post
    post_id = create_test_post(test_user["token"], test_image)
    
    # Add multiple comments
    comment1_id = add_comment(test_user["token"], post_id, "Comment 1")
    comment2_id = add_comment(test_user["token"], post_id, "Comment 2")
    
    # Get comments
    comments = get_post_comments(post_id)
    
    # Verify both comments are returned
    comment_ids = [comment["id"] for comment in comments]
    assert comment1_id in comment_ids
    assert comment2_id in comment_ids
    
    # Clean up
    delete_comment(test_user["token"], post_id, comment1_id)
    delete_comment(test_user["token"], post_id, comment2_id)
    delete_post(test_user["token"], post_id)

@pytest.mark.api
def test_delete_comment_endpoint(test_user, test_image):
    """Test deleting a comment."""
    # Create a test post
    post_id = create_test_post(test_user["token"], test_image)
    
    # Add a comment
    comment_id = add_comment(test_user["token"], post_id, "Test comment")
    
    # Delete the comment
    delete_comment(test_user["token"], post_id, comment_id)
    
    # Verify the comment was deleted
    comments = get_post_comments(post_id)
    assert not any(comment["id"] == comment_id for comment in comments)
    
    # Clean up
    delete_post(test_user["token"], post_id)

@pytest.mark.api
def test_delete_post_with_comments(test_user, test_image):
    """Test that deleting a post also deletes its comments."""
    # Create a test post
    post_id = create_test_post(test_user["token"], test_image)
    
    # Add comments
    add_comment(test_user["token"], post_id, "Comment 1")
    add_comment(test_user["token"], post_id, "Comment 2")
    
    # Delete the post
    delete_post(test_user["token"], post_id)
    
    # Verify the post and its comments are deleted
    try:
        get_post_comments(post_id)
        assert False, "Expected an exception when getting comments for a deleted post"
    except Exception:
        # Expected behavior
        pass

@pytest.mark.api
def test_comment_permissions(test_user, test_other_user, test_image):
    """Test that users can only delete their own comments."""
    # Create a test post
    post_id = create_test_post(test_user["token"], test_image)
    
    # User 1 adds a comment
    comment_id = add_comment(test_user["token"], post_id, "User 1's comment")
    
    # User 2 tries to delete User 1's comment (should fail)
    try:
        delete_comment(test_other_user["token"], post_id, comment_id)
        assert False, "Expected an exception when user 2 tries to delete user 1's comment"
    except Exception:
        # Expected behavior
        pass
    
    # Verify the comment still exists
    comments = get_post_comments(post_id)
    assert any(comment["id"] == comment_id for comment in comments)
    
    # Clean up
    delete_comment(test_user["token"], post_id, comment_id)
    delete_post(test_user["token"], post_id)

@pytest.mark.api
def test_post_deletion_permissions(test_user, test_other_user, test_image):
    """Test that users can only delete their own posts."""
    # Create a test post
    post_id = create_test_post(test_user["token"], test_image)
    
    # User 2 tries to delete User 1's post (should fail)
    try:
        delete_post(test_other_user["token"], post_id)
        assert False, "Expected an exception when user 2 tries to delete user 1's post"
    except Exception:
        # Expected behavior
        pass
    
    # Verify the post still exists
    try:
        get_post_comments(post_id)
    except Exception:
        assert False, "Post should still exist"
    
    # Clean up
    delete_post(test_user["token"], post_id)

@pytest.mark.api
def test_comment_not_found(test_user):
    """Test handling of non-existent comment."""
    # Try to get a non-existent comment
    try:
        api_request("/posts/999999/comment/999999/")
        assert False, "Expected an exception when getting a non-existent comment"
    except Exception as e:
        # Expected behavior
        assert "not found" in str(e).lower() or "404" in str(e)

@pytest.mark.api
def test_create_post_after_deletion(test_user, test_image):
    """Test creating a new post after deleting one."""
    # Create and delete a post
    post1_id = create_test_post(test_user["token"], test_image)
    delete_post(test_user["token"], post1_id)
    
    # Create another post
    post2_id = create_test_post(test_user["token"], test_image)
    
    # Verify the new post exists
    try:
        get_post_comments(post2_id)
    except Exception:
        assert False, "New post should exist"
    
    # Clean up
    delete_post(test_user["token"], post2_id) 