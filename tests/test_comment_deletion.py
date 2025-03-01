import unittest
import os
import time
from typing import List, Dict, Any, Tuple

from test_utils import (
    create_user, create_test_image, create_test_post,
    add_comment, get_post_comments, delete_post,
    delete_comment, api_request
)

class TestCommentDeletion(unittest.TestCase):
    """Test suite for comment deletion functionality."""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment once before all tests."""
        # Create a test image for post creation
        os.makedirs("tests", exist_ok=True)
        create_test_image()
        
        # Create test users
        cls.user1_username, cls.user1_password, cls.user1_token = create_user()
        cls.user2_username, cls.user2_password, cls.user2_token = create_user()
    
    def setUp(self):
        """Set up before each test."""
        # Create a test post for each test
        self.post_id = create_test_post(self.user1_token)
    
    def test_comment_deletion_with_post(self):
        """Test that comments are deleted when a post is deleted."""
        # Add comments to the post
        comment_id1 = add_comment(self.user1_token, self.post_id, "Test comment 1")
        comment_id2 = add_comment(self.user2_token, self.post_id, "Test comment 2")
        
        # Verify comments exist
        comments = get_post_comments(self.post_id)
        self.assertEqual(len(comments), 2)
        
        # Delete the post
        delete_post(self.user1_token, self.post_id)
        
        # Try to get the deleted post
        # This should fail with a 404 error
        with self.assertRaises(Exception) as context:
            api_request(f"/posts/{self.post_id}/")
        
        self.assertIn("Post doesn't exist", str(context.exception))
    
    def test_comment_deletion_individually(self):
        """Test that comments can be deleted individually."""
        # Add comments to the post
        comment_id1 = add_comment(self.user1_token, self.post_id, "Test comment 1")
        comment_id2 = add_comment(self.user2_token, self.post_id, "Test comment 2")
        
        # Verify comments exist
        comments = get_post_comments(self.post_id)
        self.assertEqual(len(comments), 2)
        
        # Delete one comment
        delete_comment(self.user1_token, self.post_id, comment_id1)
        
        # Verify only one comment remains
        comments = get_post_comments(self.post_id)
        self.assertEqual(len(comments), 1)
        self.assertEqual(comments[0]["id"], comment_id2)
    
    def test_comment_permissions(self):
        """Test that users can only delete their own comments."""
        # User 1 adds a comment
        comment_id = add_comment(self.user1_token, self.post_id, "Test comment")
        
        # User 2 tries to delete User 1's comment
        with self.assertRaises(Exception) as context:
            delete_comment(self.user2_token, self.post_id, comment_id)
        
        self.assertIn("You do not have permission to delete this comment", str(context.exception))
        
        # Verify comment still exists
        comments = get_post_comments(self.post_id)
        self.assertEqual(len(comments), 1)
    
    def test_post_deletion_permissions(self):
        """Test that only the post owner can delete a post with comments."""
        # Add a comment to the post
        add_comment(self.user2_token, self.post_id, "Test comment")
        
        # User 2 tries to delete User 1's post
        with self.assertRaises(Exception) as context:
            delete_post(self.user2_token, self.post_id)
        
        self.assertIn("You do not have permission to delete this post", str(context.exception))
        
        # Verify post and comment still exist
        comments = get_post_comments(self.post_id)
        self.assertEqual(len(comments), 1)

if __name__ == "__main__":
    unittest.main() 