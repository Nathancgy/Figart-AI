# uWSGI Setup for FigArt AI

This document explains how the uWSGI setup is configured for the FigArt AI application.

## Architecture

The application uses the following architecture:

```
Client Request → Nginx (Web Server) → uWSGI (Application Server) → Python FastAPI Application
```

## Components

### 1. Nginx (Frontend)

Nginx serves as the front-facing web server that:
- Serves static content (HTML, CSS, JS, images)
- Forwards API requests to the uWSGI backend using the uWSGI protocol
- Handles SSL termination (if configured)
- Provides load balancing capabilities

### 2. uWSGI (Backend)

uWSGI serves as the application server that:
- Manages Python worker processes
- Communicates with the Nginx server
- Handles the execution of the Python FastAPI application

### 3. FastAPI Application

The Python application that processes API requests.

## Configuration Files

### 1. uwsgi.ini

Located in `api/uwsgi.ini`, this file configures uWSGI settings:
- Process and threading settings
- Socket configuration
- Performance optimizations
- Logging settings

### 2. Nginx Configuration

Located in `frontend/nginx.conf`, this configuration:
- Serves static files
- Forwards API requests to uWSGI using the uWSGI protocol
- Handles error pages

### 3. Dockerfiles

- `api/Dockerfile`: Sets up the Python environment with uWSGI
- `frontend/Dockerfile`: Sets up Nginx with the uWSGI module

### 4. docker-compose.yml

Orchestrates the frontend and backend services, providing:
- Networking between containers
- Volume mapping
- Environment variable configuration

## How It Works

1. A client request arrives at the Nginx server
2. For static content, Nginx serves the files directly
3. For API requests (/api/*), Nginx forwards the request to uWSGI
4. uWSGI processes the request through the Python application
5. The response follows the reverse path back to the client

## Benefits of This Setup

- **Performance**: Nginx is optimized for serving static content, while uWSGI efficiently manages Python processes.
- **Scalability**: Can be scaled by adjusting the number of uWSGI workers.
- **Reliability**: Separation of concerns makes the system more robust.
- **Security**: The Python application is not directly exposed to the internet.

## Troubleshooting

If you encounter issues with the uWSGI setup:

1. Check uWSGI logs: `docker-compose logs backend`
2. Check Nginx logs: `docker-compose logs frontend`
3. Ensure the uWSGI protocol is properly configured in Nginx
4. Verify that the uWSGI module is installed in the Nginx container 