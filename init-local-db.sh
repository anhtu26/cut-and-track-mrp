#!/bin/bash

# Exit on error
set -e

echo "Waiting for Supabase services to be ready..."
sleep 10

# Run Supabase migrations
echo "Running Supabase migrations..."
npx supabase db push

echo "Supabase database initialized successfully!"
