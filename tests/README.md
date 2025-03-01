# Comment Deletion Tests

This directory contains tests to verify the proper handling of comments in the application, particularly focusing on ensuring that comments are properly deleted when posts are deleted.

## Test Files

- `test_utils.py`: Utility functions for testing, including API request helpers and test data generation.
- `test_comment_deletion.py`: Tests for comment deletion functionality.
- `test_comment_inheritance.py`: Tests to ensure comments from deleted posts don't appear in new posts.
- `test_cascade_delete.py`: Tests for database-level cascade delete functionality.
- `test_frontend_filtering.py`: Tests for frontend filtering of comments using Selenium WebDriver.

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Make sure your backend server is running on http://localhost:8000 and your frontend is running on http://localhost:3000.

3. For the Selenium tests, you need to have either Chrome or Firefox installed, along with the appropriate WebDriver.

## Running the Tests

You can run all tests using:

```bash
python -m unittest discover -s tests
```

Or run individual test files:

```bash
python -m unittest tests/test_comment_deletion.py
python -m unittest tests/test_comment_inheritance.py
python -m unittest tests/test_cascade_delete.py
python -m unittest tests/test_frontend_filtering.py
```

## Using pytest (recommended)

For better test reporting, you can use pytest:

```bash
pytest tests/ -v
```

Generate an HTML report:

```bash
pytest tests/ --html=report.html
```

Run tests in parallel:

```bash
pytest tests/ -n auto
```

## Test Strategy

These tests cover multiple aspects of comment handling:

1. **API-level testing**: Verifying that the API correctly handles comment deletion.
2. **Database integrity**: Ensuring that comments are properly deleted from the database when posts are deleted.
3. **Frontend behavior**: Testing that the frontend correctly displays comments and handles deleted posts.
4. **Permission checks**: Verifying that only authorized users can delete comments and posts.

## Troubleshooting

- If Selenium tests fail, make sure you have the appropriate WebDriver installed and that it's in your PATH.
- If API tests fail, check that your backend server is running on the correct port.
- If you encounter database-related issues, you might need to reset your database to a clean state. 