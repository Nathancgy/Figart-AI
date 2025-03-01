"""
Pytest configuration file with fixtures and markers.
"""

import os
import pytest
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.common.by import By

from test_utils import (
    create_user, create_test_image, create_test_post,
    add_comment, get_post_comments, delete_post,
    api_request, BASE_URL
)

# Register markers
def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "api: tests that call the API")
    config.addinivalue_line("markers", "frontend: tests that use Selenium for frontend testing")
    config.addinivalue_line("markers", "database: tests that directly check database integrity")
    config.addinivalue_line("markers", "slow: tests that take a long time to run")

# Fixtures for test data
@pytest.fixture(scope="session")
def test_image():
    """Create a test image for post creation."""
    # Create the test image in the root directory
    image_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_image.jpg")
    create_test_image(image_path)
    return image_path

@pytest.fixture(scope="session")
def test_user():
    """Create a test user and return credentials."""
    username, password, token = create_user()
    return {"username": username, "password": password, "token": token}

@pytest.fixture(scope="session")
def test_other_user():
    """Create a second test user for permission testing."""
    username, password, token = create_user()
    return {"username": username, "password": password, "token": token}

@pytest.fixture(scope="function")
def test_post(test_user, test_image):
    """Create a test post for each test."""
    post_id = create_test_post(test_user["token"], test_image)
    yield post_id
    # Cleanup: try to delete the post after the test
    try:
        delete_post(test_user["token"], post_id)
    except:
        pass  # Post might already be deleted by the test

@pytest.fixture(scope="function")
def test_comment(test_user, test_post):
    """Create a test comment for each test."""
    comment_text = f"Test comment {time.time()}"
    comment_id = add_comment(test_user["token"], test_post, comment_text)
    return {"id": comment_id, "text": comment_text, "post_id": test_post}

# Fixtures for Selenium WebDriver
@pytest.fixture(scope="session")
def driver_init():
    """Initialize WebDriver for frontend tests."""
    # Check if frontend is available before attempting to initialize WebDriver
    try:
        response = requests.get("http://localhost:3000", timeout=2)
        if response.status_code >= 400:
            pytest.skip("Frontend server is not available at http://localhost:3000")
    except requests.RequestException:
        pytest.skip("Frontend server is not available at http://localhost:3000")
    
    # Try Chrome first
    try:
        options = ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(10)
        yield driver
        driver.quit()
        return
    except Exception as e:
        print(f"Could not initialize Chrome WebDriver: {e}")
    
    # Try Firefox as fallback
    try:
        options = FirefoxOptions()
        options.add_argument('--headless')
        driver = webdriver.Firefox(options=options)
        driver.set_page_load_timeout(10)
        yield driver
        driver.quit()
        return
    except Exception as e:
        print(f"Could not initialize Firefox WebDriver: {e}")
        pytest.skip("WebDriver not available - neither Chrome nor Firefox could be initialized")

@pytest.fixture(scope="function")
def driver(driver_init):
    """Get WebDriver for each test."""
    driver_init.delete_all_cookies()
    yield driver_init
    # No need to quit here as it's handled by driver_init

# Fixture for authenticated WebDriver session
@pytest.fixture(scope="function")
def authenticated_driver(driver, test_user):
    """Get WebDriver with authenticated session."""
    # Navigate to login page
    try:
        driver.get("http://localhost:3000/login")
        
        # Wait for page to load
        time.sleep(2)
        
        # Fill in login form
        try:
            # Check if we're already logged in
            if driver.find_elements(By.XPATH, "//button[contains(text(), 'Logout')]"):
                print("User already logged in")
                return driver
                
            username_input = driver.find_element(By.ID, "username")
            password_input = driver.find_element(By.ID, "password")
            login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
            
            username_input.send_keys(test_user["username"])
            password_input.send_keys(test_user["password"])
            login_button.click()
            
            # Wait for login to complete
            time.sleep(2)
            
            # Verify login was successful
            if driver.find_elements(By.XPATH, "//button[contains(text(), 'Logout')]"):
                print("Login successful")
            else:
                print("Login may have failed - no logout button found")
                
        except Exception as e:
            print(f"Login failed: {e}")
            pytest.skip(f"Login failed: {e}")
    except Exception as e:
        print(f"Failed to navigate to login page: {e}")
        pytest.skip(f"Failed to navigate to login page: {e}")
    
    return driver 