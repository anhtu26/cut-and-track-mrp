# Cut-and-Track MRP Docker Setup Guide

This guide describes how to set up and run the Cut-and-Track MRP system using Docker for an ITAR-compliant local deployment.

## Prerequisites

- Docker and Docker Compose installed on your system
- Port 3002 (API) and 8081 (Web UI) available on your machine

## Authentication Information

The system comes configured with three default users:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Administrator |
| manager@example.com | admin123 | Manager |
| operator@example.com | admin123 | Operator |

**IMPORTANT**: After initial setup, please change the default passwords through the User Management section.

## Starting the Application

1. Clone the repository to your local machine
2. Open a terminal in the project root directory
3. Run the following command:

```bash
# On Linux/Mac
docker-compose up -d

# On Windows PowerShell
docker-compose up -d
```

This will:
- Create and start the PostgreSQL database container
- Initialize the database with required tables and user accounts
- Start the API server
- Start the React web application

## Accessing the Application

- Web Interface: http://localhost:8081
- API Endpoints: http://localhost:3002

## Troubleshooting

### Testing Authentication

Run the authentication test script to verify the system is properly configured:

```bash
# On Linux/Mac
node server/scripts/docker-auth-test-clean.js

# On Windows PowerShell
node server/scripts/docker-auth-test-clean.js
```

### Database Issues

If you experience database connection issues:

1. Check that the PostgreSQL container is running:
   ```bash
   docker ps
   ```

2. If needed, you can reset the database:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

3. The database migration scripts are in the `database/migrations` folder and are run automatically when the container starts.

## ITAR Compliance

This setup is designed for ITAR compliance with all data stored locally on your server. No data is transmitted to external services.

- Data is stored in a local volume (`postgres-data`)
- All services run within your network perimeter
- No external dependencies are required for operation

## Stopping the Application

```bash
# On Linux/Mac
docker-compose down

# On Windows PowerShell
docker-compose down
```

Add `-v` flag to also remove persistent volumes (will delete all data).
