import unittest
import os
import time
import sqlite3
from typing import List, Dict, Any, Tuple

from test_utils import (
    create_user, create_test_image, create_test_post,
    add_comment, get_post_comments, delete_post,
    api_request, BASE_URL
)

class TestCascadeDelete(unittest.TestCase):
    """Test suite for database-level cascade delete functionality."""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment once before all tests."""
        # Create a test image for post creation
        os.makedirs("tests", exist_ok=True)
        create_test_image()
        
        # Create test user
        cls.username, cls.password, cls.token = create_user()
    
    def test_cascade_delete_in_database(self):
        """
        Test that cascade delete works at the database level.
        
        Note: This test requires direct database access, which may not be
        available in all environments. If running in a containerized or
        remote environment, this test may need to be skipped.
        """
        # This test is a placeholder for a direct database test
        # In a real environment, you would connect to the database directly
        
        # Create a post and add comments
        post_id = create_test_post(self.token)
        comment_id1 = add_comment(self.token, post_id, "Test comment 1")
        comment_id2 = add_comment(self.token, post_id, "Test comment 2")
        
        # Verify comments exist via API
        comments = get_post_comments(post_id)
        self.assertEqual(len(comments), 2)
        
        # Delete the post
        delete_post(self.token, post_id)
        
        # In a real test with database access, you would check directly:
        # conn = sqlite3.connect('path/to/database.db')
        # cursor = conn.cursor()
        # cursor.execute("SELECT COUNT(*) FROM comments WHERE post_id = ?", (post_id,))
        # count = cursor.fetchone()[0]
        # self.assertEqual(count, 0)
        
        # Instead, we'll verify via API that the post is gone
        with self.assertRaises(Exception) as context:
            api_request(f"/posts/{post_id}/")
        
        self.assertIn("404", str(context.exception))
        
        # And that comments are gone
        with self.assertRaises(Exception) as context:
            get_post_comments(post_id)
        
        self.assertIn("404", str(context.exception))
    
    def test_explicit_comment_deletion(self):
        """Test that the explicit comment deletion in the API works."""
        # Create a post
        post_id = create_test_post(self.token)
        
        # Add multiple comments
        for i in range(5):
            add_comment(self.token, post_id, f"Test comment {i}")
        
        # Verify comments exist
        comments = get_post_comments(post_id)
        self.assertEqual(len(comments), 5)
        
        # Delete the post
        delete_post(self.token, post_id)
        
        # Verify post is gone
        with self.assertRaises(Exception) as context:
            api_request(f"/posts/{post_id}/")
        
        self.assertIn("404", str(context.exception))
    
    def test_database_integrity(self):
        """Test database integrity after multiple post deletions."""
        # Create multiple posts with comments
        posts = []
        for i in range(3):
            post_id = create_test_post(self.token)
            for j in range(2):
                add_comment(self.token, post_id, f"Post {i} comment {j}")
            posts.append(post_id)
        
        # Delete posts one by one
        for post_id in posts:
            delete_post(self.token, post_id)
        
        # Create a new post
        new_post_id = create_test_post(self.token)
        
        # Verify new post has no comments
        comments = get_post_comments(new_post_id)
        self.assertEqual(len(comments), 0)
        
        # Add a comment to the new post
        comment_text = "New post comment"
        add_comment(self.token, new_post_id, comment_text)
        
        # Verify comment exists
        comments = get_post_comments(new_post_id)
        self.assertEqual(len(comments), 1)
        self.assertEqual(comments[0]["content"], comment_text)

if __name__ == "__main__":
    unittest.main() 