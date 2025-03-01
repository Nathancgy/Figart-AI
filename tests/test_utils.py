import requests
import json
import time
import random
import string
from typing import Dict, Any, Optional, List, Tuple

# Base URL for API requests
BASE_URL = "http://localhost:8000"

def random_string(length: int = 10) -> str:
    """Generate a random string of fixed length."""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))

def create_user() -> Tuple[str, str, str]:
    """Create a random user and return username, password, and token."""
    username = f"testuser_{random_string(8)}"
    password = f"password_{random_string(8)}"
    
    response = requests.post(
        f"{BASE_URL}/users/register/",
        json={"username": username, "password": password}
    )
    
    if response.status_code != 200:
        raise Exception(f"Failed to create user: {response.text}")
    
    return username, password, response.json()["token"]

def login_user(username: str, password: str) -> str:
    """Login a user and return the token."""
    response = requests.post(
        f"{BASE_URL}/users/login/",
        json={"username": username, "password": password}
    )
    
    if response.status_code != 200:
        raise Exception(f"Failed to login: {response.text}")
    
    return response.json()["token"]

def api_request(
    endpoint: str, 
    method: str = "GET", 
    token: Optional[str] = None, 
    data: Optional[Dict[str, Any]] = None,
    files: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Make an API request with optional authentication and data."""
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    if method == "GET":
        response = requests.get(url, headers=headers)
    elif method == "POST":
        if files:
            # For multipart/form-data requests (file uploads)
            response = requests.post(url, headers=headers, files=files, data=data)
        else:
            # For JSON requests
            response = requests.post(url, headers=headers, json=data)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")
    
    if response.status_code >= 400:
        raise Exception(f"API request failed: {response.text}")
    
    return response.json()

def create_test_post(token: str, image_path: str = "test_image.jpg") -> int:
    """Create a test post and return its ID."""
    with open(image_path, "rb") as img:
        files = {"file": ("test_image.jpg", img, "image/jpeg")}
        response = requests.post(
            f"{BASE_URL}/posts/create/",
            headers={"Authorization": f"Bearer {token}"},
            files=files
        )
    
    if response.status_code != 200:
        raise Exception(f"Failed to create post: {response.text}")
    
    return response.json()["post_id"]

def add_comment(token: str, post_id: int, comment_text: str) -> int:
    """Add a comment to a post and return the comment ID."""
    response = api_request(
        f"/posts/{post_id}/comment/add/",
        method="POST",
        token=token,
        data={"comment": comment_text}
    )
    
    return response["comment_id"]

def get_post_comments(post_id: int) -> List[Dict[str, Any]]:
    """Get all comments for a post."""
    response = api_request(f"/posts/{post_id}/comments/")
    return response["comments"]

def delete_post(token: str, post_id: int) -> None:
    """Delete a post."""
    api_request(f"/posts/{post_id}/delete/", method="POST", token=token)

def delete_comment(token: str, post_id: int, comment_id: int) -> None:
    """Delete a comment."""
    api_request(f"/posts/{post_id}/comment/{comment_id}/delete/", method="POST", token=token)

def create_test_image(path: str = "tests/test_image.jpg") -> None:
    """Create a simple test image for uploads."""
    from PIL import Image
    
    # Create a 100x100 red image
    img = Image.new('RGB', (100, 100), color='red')
    img.save(path) 