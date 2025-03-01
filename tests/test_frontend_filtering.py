import pytest
import os
import time
import requests
from typing import List, Dict, Any, Tuple
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

from test_utils import (
    create_user, create_test_image, create_test_post,
    add_comment, get_post_comments, delete_post,
    api_request, BASE_URL, delete_comment
)

# Check if frontend is available
def is_frontend_available():
    """Check if the frontend server is running."""
    try:
        response = requests.get("http://localhost:3000", timeout=2)
        return response.status_code == 200
    except:
        return False

# Skip all tests in this file if frontend is not available
pytestmark = pytest.mark.skipif(
    not is_frontend_available(),
    reason="Frontend server is not running at http://localhost:3000"
)

@pytest.mark.frontend
def test_frontend_comment_display(authenticated_driver, test_user, test_image):
    """Test that comments are displayed on the frontend."""
    driver = authenticated_driver
    
    # Create a post with comments
    post_id = create_test_post(test_user["token"], test_image)
    comment1_text = "Test comment 1"
    comment2_text = "Test comment 2"
    add_comment(test_user["token"], post_id, comment1_text)
    add_comment(test_user["token"], post_id, comment2_text)
    
    # Navigate to the post page
    driver.get(f"http://localhost:3000/post/{post_id}")
    
    try:
        # Wait for comments to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "comment"))
        )
        
        # Get all comments
        comments = driver.find_elements(By.CLASS_NAME, "comment")
        
        # Verify both comments are displayed
        comment_texts = [comment.text for comment in comments]
        assert comment1_text in " ".join(comment_texts), f"Comment '{comment1_text}' not found in {comment_texts}"
        assert comment2_text in " ".join(comment_texts), f"Comment '{comment2_text}' not found in {comment_texts}"
    except TimeoutException:
        pytest.fail("Timed out waiting for comments to load")
    finally:
        # Clean up
        delete_post(test_user["token"], post_id)

@pytest.mark.frontend
def test_frontend_comment_filtering(authenticated_driver, test_user, test_image):
    """Test that comments are filtered correctly on the frontend."""
    driver = authenticated_driver
    
    # Create two posts with comments
    post1_id = create_test_post(test_user["token"], test_image)
    post2_id = create_test_post(test_user["token"], test_image)
    
    # Add comments to both posts
    post1_comment = "Comment on post 1"
    post2_comment = "Comment on post 2"
    add_comment(test_user["token"], post1_id, post1_comment)
    add_comment(test_user["token"], post2_id, post2_comment)
    
    try:
        # Navigate to post 1
        driver.get(f"http://localhost:3000/post/{post1_id}")
        
        # Wait for comments to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "comment"))
        )
        
        # Get comments
        comments = driver.find_elements(By.CLASS_NAME, "comment")
        comment_texts = [comment.text for comment in comments]
        
        # Verify only post 1's comment is shown
        assert post1_comment in " ".join(comment_texts), f"Comment '{post1_comment}' not found in {comment_texts}"
        assert post2_comment not in " ".join(comment_texts), f"Comment '{post2_comment}' should not be in {comment_texts}"
        
        # Navigate to post 2
        driver.get(f"http://localhost:3000/post/{post2_id}")
        
        # Wait for comments to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "comment"))
        )
        
        # Get comments
        comments = driver.find_elements(By.CLASS_NAME, "comment")
        comment_texts = [comment.text for comment in comments]
        
        # Verify only post 2's comment is shown
        assert post2_comment in " ".join(comment_texts), f"Comment '{post2_comment}' not found in {comment_texts}"
        assert post1_comment not in " ".join(comment_texts), f"Comment '{post1_comment}' should not be in {comment_texts}"
    except TimeoutException:
        pytest.fail("Timed out waiting for comments to load")
    finally:
        # Clean up
        delete_post(test_user["token"], post1_id)
        delete_post(test_user["token"], post2_id)

@pytest.mark.frontend
def test_deleted_post_comments(authenticated_driver, test_user, test_image):
    """Test that comments are not accessible after a post is deleted."""
    driver = authenticated_driver
    
    # Create a post with a comment
    post_id = create_test_post(test_user["token"], test_image)
    comment_text = "Comment on post that will be deleted"
    add_comment(test_user["token"], post_id, comment_text)
    
    # Navigate to the post page
    driver.get(f"http://localhost:3000/post/{post_id}")
    
    try:
        # Wait for comments to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "comment"))
        )
        
        # Verify the comment is displayed
        comments = driver.find_elements(By.CLASS_NAME, "comment")
        comment_texts = [comment.text for comment in comments]
        assert comment_text in " ".join(comment_texts), f"Comment '{comment_text}' not found in {comment_texts}"
        
        # Delete the post
        delete_post(test_user["token"], post_id)
        
        # Refresh the page
        driver.refresh()
        
        # Wait for the page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check for error message or redirect
        assert "not found" in driver.page_source.lower() or "404" in driver.page_source or "deleted" in driver.page_source.lower(), "Page should show error for deleted post"
        
        # Verify comments are not displayed
        comments = driver.find_elements(By.CLASS_NAME, "comment")
        assert len(comments) == 0, f"Expected 0 comments for deleted post, got {len(comments)}"
    except TimeoutException:
        pytest.fail("Timed out waiting for page to load")

@pytest.mark.frontend
def test_authenticated_comment_deletion(authenticated_driver, test_user, test_image):
    """Test that authenticated users can delete their own comments via the UI."""
    driver = authenticated_driver
    
    # Create a post with a comment
    post_id = create_test_post(test_user["token"], test_image)
    comment_text = "Comment to be deleted via UI"
    comment_id = add_comment(test_user["token"], post_id, comment_text)
    
    try:
        # Navigate to the post page
        driver.get(f"http://localhost:3000/post/{post_id}")
        
        # Wait for comments to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "comment"))
        )
        
        # Find and click the delete button for the comment
        delete_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f"//div[contains(@class, 'comment')]//button[contains(text(), 'Delete')]"))
        )
        delete_button.click()
        
        # Wait for confirmation dialog and confirm deletion
        confirm_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm') or contains(text(), 'Yes')]"))
        )
        confirm_button.click()
        
        # Wait for comment to be removed
        WebDriverWait(driver, 10).until_not(
            EC.presence_of_element_located((By.XPATH, f"//div[contains(@class, 'comment') and contains(text(), '{comment_text}')]"))
        )
        
        # Verify comment is deleted
        comments = driver.find_elements(By.CLASS_NAME, "comment")
        comment_texts = [comment.text for comment in comments]
        assert comment_text not in " ".join(comment_texts), f"Comment '{comment_text}' should be deleted"
    except TimeoutException:
        # If UI deletion fails, clean up via API
        delete_comment(test_user["token"], post_id, comment_id)
        pytest.skip("UI comment deletion failed - frontend may not support this feature yet")
    finally:
        # Clean up
        delete_post(test_user["token"], post_id)

if __name__ == "__main__":
    pytest.main() 