import unittest
import os
import time
from typing import List, Dict, Any, Tuple

from test_utils import (
    create_user, create_test_image, create_test_post,
    add_comment, get_post_comments, delete_post,
    api_request
)

class TestCommentInheritance(unittest.TestCase):
    """Test suite for ensuring comments don't persist after post deletion."""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment once before all tests."""
        # Create a test image for post creation
        os.makedirs("tests", exist_ok=True)
        create_test_image()
        
        # Create test user
        cls.username, cls.password, cls.token = create_user()
    
    def test_no_comment_inheritance(self):
        """Test that comments from deleted posts don't appear in new posts."""
        # Create first post
        post1_id = create_test_post(self.token)
        
        # Add comments to the first post
        comment_text = f"Test comment {time.time()}"
        add_comment(self.token, post1_id, comment_text)
        
        # Verify comment exists on first post
        comments1 = get_post_comments(post1_id)
        self.assertEqual(len(comments1), 1)
        self.assertEqual(comments1[0]["content"], comment_text)
        
        # Delete the first post
        delete_post(self.token, post1_id)
        
        # Create a second post with the same ID (this simulates the database reusing IDs)
        # We'll need to make direct database calls or mock this behavior
        # For now, we'll just create a new post and check it has no comments
        post2_id = create_test_post(self.token)
        
        # Verify the new post has no comments
        comments2 = get_post_comments(post2_id)
        self.assertEqual(len(comments2), 0)
    
    def test_multiple_posts_with_comments(self):
        """Test that comments are correctly associated with their posts."""
        # Create two posts
        post1_id = create_test_post(self.token)
        post2_id = create_test_post(self.token)
        
        # Add distinct comments to each post
        comment1_text = f"Post 1 comment {time.time()}"
        comment2_text = f"Post 2 comment {time.time()}"
        
        add_comment(self.token, post1_id, comment1_text)
        add_comment(self.token, post2_id, comment2_text)
        
        # Verify comments are correctly associated
        comments1 = get_post_comments(post1_id)
        comments2 = get_post_comments(post2_id)
        
        self.assertEqual(len(comments1), 1)
        self.assertEqual(len(comments2), 1)
        self.assertEqual(comments1[0]["content"], comment1_text)
        self.assertEqual(comments2[0]["content"], comment2_text)
        
        # Delete first post
        delete_post(self.token, post1_id)
        
        # Verify second post still has its comment
        comments2_after = get_post_comments(post2_id)
        self.assertEqual(len(comments2_after), 1)
        self.assertEqual(comments2_after[0]["content"], comment2_text)
        
        # Create a new post
        post3_id = create_test_post(self.token)
        
        # Verify new post has no comments
        comments3 = get_post_comments(post3_id)
        self.assertEqual(len(comments3), 0)
    
    def test_frontend_comment_filtering(self):
        """Test that frontend filtering correctly handles comments."""
        # This test simulates the frontend filtering logic
        
        # Create a post
        post_id = create_test_post(self.token)
        
        # Add a comment with incorrect post_id (simulating a bug)
        # We'll need to make direct database calls to simulate this
        # For now, we'll just add a normal comment
        comment_text = "Test comment"
        comment_id = add_comment(self.token, post_id, comment_text)
        
        # Get all comments
        comments = get_post_comments(post_id)
        
        # Apply frontend filtering (simulating the React component's filter)
        filtered_comments = [c for c in comments if c["post_id"] == post_id]
        
        # Verify filtering works correctly
        self.assertEqual(len(filtered_comments), 1)
        self.assertEqual(filtered_comments[0]["content"], comment_text)

if __name__ == "__main__":
    unittest.main() 