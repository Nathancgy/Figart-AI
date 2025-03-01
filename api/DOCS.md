# API Documentation

## Overview
This API allows users to register, log in, and upload photos. It uses JWT for authentication and supports image uploads.

## Base URL

## Endpoints

### 1. User Registration

- **Endpoint**: `/register/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - **201 Created**: User created successfully.
  - **400 Bad Request**: Username already registered.

### 2. User Login

- **Endpoint**: `/login/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - **200 OK**: Login successful.
    ```json
    {
      "message": "Login successful",
      "token": "string"
    }
    ```
  - **401 Unauthorized**: Invalid username or password.

### 3. Upload Photo

- **Endpoint**: `/upload/`
- **Method**: `POST`
- **Request Body**: Form-data with file
- **Responses**:
  - **200 OK**: Photo uploaded successfully.
    ```json
    {
      "message": "Photo uploaded successfully",
      "file_location": "string",
      "file_type": "string"
    }
    ```
  - **400 Bad Request**: File type not supported.

## Authentication
- Use the JWT token received from the login endpoint in the `Authorization` header for protected routes.

## Error Handling
- All endpoints return appropriate HTTP status codes and error messages for invalid requests.

## Notes
- Ensure to replace `<your-server>` with the actual server address where the API is hosted.
