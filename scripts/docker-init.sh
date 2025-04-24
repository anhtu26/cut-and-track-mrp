#!/bin/bash

# Exit on error
set -e

echo "Starting Cut & Track MRP Docker environment..."

# Ensure Docker is running
echo "Checking Docker status..."
docker info >/dev/null 2>&1 || { echo "Docker is not running. Please start Docker Desktop first."; exit 1; }

# Start the Docker Compose services
echo "Starting services with docker-compose..."
docker-compose up -d

echo "Waiting for Supabase database to be ready (30 seconds)..."
sleep 30

# Enable the vector extension (this was mentioned as problematic in the past)
echo "Enabling the vector extension..."
docker-compose exec supabase-db psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Initialize the database with migrations
echo "Running database migrations..."
bash ./init-local-db.sh

echo "============================================="
echo "🚀 Cut & Track MRP is ready!"
echo "============================================="
echo "Web App: http://localhost:8080"
echo "Supabase Studio: http://localhost:54326"
echo "Supabase REST API: http://localhost:54321"
echo "============================================="
echo "To stop the environment: npm run docker:down"
echo "To view logs: npm run docker:logs"
echo "============================================="
