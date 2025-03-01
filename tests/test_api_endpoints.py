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
def test_add_comment_endpoint(test_user, test_post):
    """Test the add comment API endpoint."""
    # Add a comment
    comment_text = f"Test comment {time.time()}"
    response = api_request(
        "POST",
        f"{BASE_URL}/api/posts/{test_post}/comments",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"content": comment_text}
    )
    
    # Check response
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
    data = response.json()
    assert "id" in data, "Response should contain comment ID"
    assert data["content"] == comment_text, "Comment content should match"
    assert data["post_id"] == test_post, "Post ID should match"
    assert data["username"] == test_user["username"], "Username should match"

@pytest.mark.api
def test_get_comments_endpoint(test_user, test_post):
    """Test the get comments API endpoint."""
    # Add a comment
    comment_text = f"Test comment for retrieval {time.time()}"
    add_comment(test_user["token"], test_post, comment_text)
    
    # Get comments
    response = api_request(
        "GET",
        f"{BASE_URL}/api/posts/{test_post}/comments",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    
    # Check response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert isinstance(data, list), "Response should be a list"
    assert len(data) > 0, "Response should contain at least one comment"
    
    # Check if our comment is in the list
    comment_texts = [comment["content"] for comment in data]
    assert comment_text in comment_texts, "Added comment should be in the response"

@pytest.mark.api
def test_delete_comment_endpoint(test_user, test_post):
    """Test the delete comment API endpoint."""
    # Add a comment
    comment_text = f"Test comment for deletion {time.time()}"
    comment_id = add_comment(test_user["token"], test_post, comment_text)
    
    # Delete the comment
    response = api_request(
        "DELETE",
        f"{BASE_URL}/api/comments/{comment_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    
    # Check response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Verify comment is deleted
    comments = get_post_comments(test_user["token"], test_post)
    comment_ids = [comment["id"] for comment in comments]
    assert comment_id not in comment_ids, "Deleted comment should not be in the response"

@pytest.mark.api
def test_delete_post_with_comments(test_user):
    """Test deleting a post with comments."""
    # Create a post
    post_id = create_test_post(test_user["token"])
    
    # Add multiple comments
    comment_ids = []
    for i in range(3):
        comment_text = f"Test comment {i} for post deletion {time.time()}"
        comment_id = add_comment(test_user["token"], post_id, comment_text)
        comment_ids.append(comment_id)
    
    # Verify comments exist
    comments = get_post_comments(test_user["token"], post_id)
    assert len(comments) == 3, f"Expected 3 comments, got {len(comments)}"
    
    # Delete the post
    response = api_request(
        "DELETE",
        f"{BASE_URL}/api/posts/{post_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    
    # Check response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Try to get comments for the deleted post
    response = api_request(
        "GET",
        f"{BASE_URL}/api/posts/{post_id}/comments",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    
    # Should return 404 Not Found
    assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"

@pytest.mark.api
def test_comment_permissions(test_user):
    """Test that users can only delete their own comments."""
    # Create a second user
    username2, password2, token2 = create_user()
    
    # Create a post as the first user
    post_id = create_test_post(test_user["token"])
    
    # Add a comment as the first user
    comment_text = f"Test comment for permissions {time.time()}"
    comment_id = add_comment(test_user["token"], post_id, comment_text)
    
    # Try to delete the comment as the second user
    response = api_request(
        "DELETE",
        f"{BASE_URL}/api/comments/{comment_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    
    # Should return 403 Forbidden
    assert response.status_code == 403, f"Expected status code 403, got {response.status_code}"
    
    # Verify comment still exists
    comments = get_post_comments(test_user["token"], post_id)
    comment_ids = [comment["id"] for comment in comments]
    assert comment_id in comment_ids, "Comment should still exist"
    
    # Delete the comment as the first user
    response = api_request(
        "DELETE",
        f"{BASE_URL}/api/comments/{comment_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    
    # Should return 200 OK
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

@pytest.mark.api
def test_post_deletion_permissions(test_user):
    """Test that only the post owner can delete a post with comments."""
    # Create a second user
    username2, password2, token2 = create_user()
    
    # Create a post as the first user
    post_id = create_test_post(test_user["token"])
    
    # Add a comment as the second user
    comment_text = f"Test comment from second user {time.time()}"
    comment_id = add_comment(token2, post_id, comment_text)
    
    # Try to delete the post as the second user
    response = api_request(
        "DELETE",
        f"{BASE_URL}/api/posts/{post_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    
    # Should return 403 Forbidden
    assert response.status_code == 403, f"Expected status code 403, got {response.status_code}"
    
    # Verify post still exists
    response = api_request(
        "GET",
        f"{BASE_URL}/api/posts/{post_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Delete the post as the first user
    response = api_request(
        "DELETE",
        f"{BASE_URL}/api/posts/{post_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    
    # Should return 200 OK
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

@pytest.mark.api
def test_comment_not_found(test_user):
    """Test that trying to access a non-existent comment returns 404."""
    # Try to delete a non-existent comment
    non_existent_id = 999999
    
    try:
        api_request(
            f"/posts/1/comment/{non_existent_id}/delete/",
            method="POST",
            token=test_user["token"]
        )
        assert False, "Expected exception for non-existent comment"
    except Exception as e:
        assert "404" in str(e), f"Expected 404 error, got: {str(e)}"

@pytest.mark.api
def test_create_post_after_deletion(test_user):
    """Test creating a new post after deleting one with comments."""
    # Create a post
    post1_id = create_test_post(test_user["token"])
    
    # Add a comment
    comment_text = f"Test comment for post1 {time.time()}"
    add_comment(test_user["token"], post1_id, comment_text)
    
    # Delete the post
    delete_post(test_user["token"], post1_id)
    
    # Create a new post
    post2_id = create_test_post(test_user["token"])
    
    # Get comments for the new post
    comments = get_post_comments(post2_id)
    
    # Should be empty
    assert len(comments) == 0, f"Expected 0 comments, got {len(comments)}"
    
    # Add a comment to the new post
    new_comment_text = f"Test comment for post2 {time.time()}"
    add_comment(test_user["token"], post2_id, new_comment_text)
    
    # Get comments again
    comments = get_post_comments(post2_id)
    
    # Should have only the new comment
    assert len(comments) == 1, f"Expected 1 comment, got {len(comments)}"
    assert comments[0]["content"] == new_comment_text, "Comment content should match" 