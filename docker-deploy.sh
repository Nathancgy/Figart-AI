#!/bin/bash

# Docker deployment script for Figart AI

# Exit on error
set -e

echo "🚀 Starting Figart AI Docker deployment..."

# Check if .env file exists, if not create from template
if [ ! -f .env ]; then
  echo "📝 Creating .env file from template..."
  cp .env.docker .env
  echo "⚠️ Please edit the .env file with your specific configuration values before continuing."
  exit 1
fi

# Try to pull the base image first
echo "📥 Pulling the base Node.js image..."
docker pull node:20-alpine || {
  echo "❌ Failed to pull node:20-alpine image. Please check your Docker configuration and internet connection."
  exit 1
}

# Build the Next.js application
echo "🏗️ Building the Next.js application Docker image..."
docker build --network=host -t figart-ai-nextjs .

# Start the Docker Compose stack
echo "🚀 Starting the Docker Compose stack..."
docker-compose up -d

echo "✅ Deployment complete! The application should be available at http://localhost:3000"
echo "📊 To view logs, run: docker-compose logs -f"
echo "🛑 To stop the application, run: docker-compose down" 