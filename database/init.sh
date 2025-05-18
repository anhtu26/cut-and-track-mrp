#!/bin/bash
set -e

# This script is executed when the PostgreSQL container is started
# It initializes the database schema and seed data for ITAR-compliant local hosting

echo "Starting database initialization..."

# Run initialization SQL scripts directly - Docker will handle PostgreSQL readiness
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \i /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql
    \i /docker-entrypoint-initdb.d/migrations/002_seed_data.sql
    \i /docker-entrypoint-initdb.d/migrations/003_update_password_hashes.sql
EOSQL

echo "Database initialized successfully - ITAR-compliant local environment is ready"
