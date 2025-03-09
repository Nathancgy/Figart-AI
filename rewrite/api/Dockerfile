FROM python:3.9-slim

# Set work directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libpcre3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .

# Add uWSGI to requirements
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir uwsgi \
    && pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Run with uWSGI
CMD ["uwsgi", "--ini", "uwsgi.ini"] 