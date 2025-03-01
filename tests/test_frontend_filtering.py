import pytest
import os
import time
from typing import List, Dict, Any, Tuple
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

from test_utils import (
    create_user, create_test_image, create_test_post,
    add_comment, get_post_comments, delete_post,
    api_request, BASE_URL
)

# Mark all tests in this file as frontend tests
pytestmark = [pytest.mark.frontend, pytest.mark.slow]

@pytest.mark.frontend
def test_frontend_comment_display(driver, test_user, test_post):
    """Test that the frontend correctly displays comments for a post."""
    # Add a unique comment to the post
    unique_text = f"Unique comment {time.time()}"
    add_comment(test_user["token"], test_post, unique_text)
    
    # Navigate to the post detail page
    driver.get(f"http://localhost:3000/posts/{test_post}")
    
    try:
        # Wait for comments to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "comments-section"))
        )
        
        # Check if the comment is displayed
        comment_elements = driver.find_elements(By.CLASS_NAME, "comment-content")
        comment_texts = [elem.text for elem in comment_elements]
        
        assert unique_text in comment_texts
        
    except TimeoutException:
        pytest.fail("Timed out waiting for comments to load")

@pytest.mark.frontend
def test_frontend_comment_filtering(driver, test_user):
    """Test that the frontend correctly filters comments by post ID."""
    # This test simulates what would happen if there were comments in the database
    # with the wrong post_id. The frontend should filter these out.
    
    # Create two posts
    post1_id = create_test_post(test_user["token"])
    post2_id = create_test_post(test_user["token"])
    
    # Add comments to both posts
    comment1_text = f"Post 1 comment {time.time()}"
    comment2_text = f"Post 2 comment {time.time()}"
    
    add_comment(test_user["token"], post1_id, comment1_text)
    add_comment(test_user["token"], post2_id, comment2_text)
    
    # Navigate to the first post's detail page
    driver.get(f"http://localhost:3000/posts/{post1_id}")
    
    try:
        # Wait for comments to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "comments-section"))
        )
        
        # Check if only the first post's comment is displayed
        comment_elements = driver.find_elements(By.CLASS_NAME, "comment-content")
        comment_texts = [elem.text for elem in comment_elements]
        
        assert comment1_text in comment_texts
        assert comment2_text not in comment_texts
        
    except TimeoutException:
        pytest.fail("Timed out waiting for comments to load")
    
    # Clean up
    delete_post(test_user["token"], post1_id)
    delete_post(test_user["token"], post2_id)

@pytest.mark.frontend
def test_deleted_post_comments(driver, test_user):
    """Test that comments from deleted posts don't appear in the frontend."""
    # Create a post and add a comment
    post1_id = create_test_post(test_user["token"])
    comment1_text = f"Post 1 comment {time.time()}"
    add_comment(test_user["token"], post1_id, comment1_text)
    
    # Delete the post
    delete_post(test_user["token"], post1_id)
    
    # Create a new post
    post2_id = create_test_post(test_user["token"])
    
    # Navigate to the new post's detail page
    driver.get(f"http://localhost:3000/posts/{post2_id}")
    
    try:
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "post-detail"))
        )
        
        # Check if there are no comments
        comment_elements = driver.find_elements(By.CLASS_NAME, "comment-content")
        
        assert len(comment_elements) == 0
        
        # Add a comment to the new post
        if driver.find_elements(By.ID, "comment-input"):
            # Login first if needed
            if driver.find_elements(By.LINK_TEXT, "Log in"):
                driver.find_element(By.LINK_TEXT, "Log in").click()
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "username"))
                )
                driver.find_element(By.ID, "username").send_keys(test_user["username"])
                driver.find_element(By.ID, "password").send_keys(test_user["password"])
                driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]").click()
                
                # Wait to be redirected back to the post
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "post-detail"))
                )
            
            # Add a comment
            comment2_text = f"Post 2 comment {time.time()}"
            driver.find_element(By.ID, "comment-input").send_keys(comment2_text)
            driver.find_element(By.XPATH, "//button[contains(text(), 'Post Comment')]").click()
            
            # Wait for the comment to appear
            WebDriverWait(driver, 10).until(
                EC.text_to_be_present_in_element((By.CLASS_NAME, "comment-content"), comment2_text)
            )
            
            # Verify only the new comment is shown
            comment_elements = driver.find_elements(By.CLASS_NAME, "comment-content")
            comment_texts = [elem.text for elem in comment_elements]
            
            assert len(comment_elements) == 1
            assert comment2_text in comment_texts
            assert comment1_text not in comment_texts
        
    except TimeoutException:
        pytest.fail("Timed out waiting for page to load")
    
    # Clean up
    delete_post(test_user["token"], post2_id)

@pytest.mark.frontend
def test_authenticated_comment_deletion(authenticated_driver, test_user, test_post):
    """Test that authenticated users can delete their own comments in the frontend."""
    driver = authenticated_driver
    
    # Add a comment to the post
    comment_text = f"Comment to delete {time.time()}"
    add_comment(test_user["token"], test_post, comment_text)
    
    # Navigate to the post detail page
    driver.get(f"http://localhost:3000/posts/{test_post}")
    
    try:
        # Wait for comments to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "comments-section"))
        )
        
        # Find the delete button for the comment
        delete_buttons = driver.find_elements(By.XPATH, "//button[contains(@class, 'delete-comment')]")
        
        if delete_buttons:
            # Click the delete button
            delete_buttons[0].click()
            
            # Wait for confirmation modal if it exists
            try:
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'modal')]"))
                )
                
                # Click the confirm delete button
                confirm_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Delete') or contains(text(), 'Confirm')]")
                confirm_button.click()
            except TimeoutException:
                # No modal, continue
                pass
            
            # Wait for the comment to be removed
            time.sleep(2)
            
            # Verify the comment is no longer displayed
            comment_elements = driver.find_elements(By.CLASS_NAME, "comment-content")
            comment_texts = [elem.text for elem in comment_elements]
            
            assert comment_text not in comment_texts
        else:
            pytest.skip("Delete comment button not found - feature may not be implemented yet")
        
    except TimeoutException:
        pytest.fail("Timed out waiting for comments to load")

if __name__ == "__main__":
    pytest.main() 