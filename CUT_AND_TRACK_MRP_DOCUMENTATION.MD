# Cut-and-Track MRP System Documentation

## Overview

This document provides comprehensive documentation for the Cut-and-Track MRP system, a fully ITAR-compliant manufacturing resource planning application designed specifically for aerospace CNC machine shops. The system has been migrated from cloud-based services to a fully local hosting solution to ensure all data remains within the controlled local environment.

## Table of Contents

1. [ITAR Compliance](#itar-compliance)
2. [System Architecture](#system-architecture)
3. [Migration Process](#migration-process)
4. [Deployment Instructions](#deployment-instructions)
5. [Verification Procedures](#verification-procedures)
6. [Maintenance Procedures](#maintenance-procedures)
7. [Troubleshooting Guide](#troubleshooting-guide)

## ITAR Compliance

### Requirements

1. **Data Isolation**: All data must remain on local servers with no external transmission
2. **Local Authentication**: User authentication must be handled locally
3. **Local Storage**: All files and documents must be stored locally
4. **No External APIs**: No external API services can be used
5. **No Cloud Services**: No cloud-based services can be used for any part of the application

### Implementation Details

#### Local Database

The application uses PostgreSQL running in a local Docker container:
- All data is stored in a local volume
- No external database connections are established
- Database credentials are stored locally in environment variables
- Regular backups can be scheduled to local storage

#### Local Authentication

The authentication system has been implemented using:
- JWT (JSON Web Tokens) for secure authentication
- Argon2 for password hashing (NIST recommended)
- Local user management with role-based access control
- No external identity providers or OAuth services

#### Local File Storage

Files are stored in a local directory structure:
- All uploads are saved to the local filesystem
- File metadata is tracked in the local database
- No cloud storage services are used

#### Local API Server

The API server runs locally and provides:
- RESTful endpoints for all data operations
- Secure file upload/download functionality
- Authentication and authorization services
- No external API calls

#### Frontend Application

The frontend application is configured to:
- Connect only to the local API server
- Store no data in browser storage
- Make no external API calls
- Use only locally hosted assets

## System Architecture

### Components

1. **Frontend Client**
   - React-based SPA with Vite
   - Tailwind CSS for styling
   - Communicates only with local API server

2. **API Server**
   - Node.js Express server
   - JWT authentication
   - RESTful API endpoints
   - File handling capabilities

3. **Database**
   - PostgreSQL database
   - Local volume storage
   - Initialized with schema and seed data

4. **Docker Infrastructure**
   - Docker Compose for orchestration
   - Isolated network for inter-service communication
   - Volume mapping for persistent data

### Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT, Argon2
- **Containerization**: Docker, Docker Compose

## Migration Process

### Completed Migration Tasks

#### Phase 1: Initial Assessment and Planning
- [x] Audit current Supabase dependencies
- [x] Document data structures and API endpoints
- [x] Create migration plan
- [x] Set up local development environment

#### Phase 2: Database Migration
- [x] Set up local PostgreSQL database
- [x] Create database schema matching Supabase
- [x] Migrate data from Supabase to local PostgreSQL
- [x] Verify data integrity after migration

#### Phase 3: Authentication System
- [x] Implement local JWT authentication
- [x] Replace Supabase auth with local auth system
- [x] Migrate user accounts and credentials
- [x] Test authentication flows

#### Phase 4: Storage Migration
- [x] Set up local file storage system
- [x] Migrate files from Supabase storage
- [x] Update file references in database
- [x] Test file upload/download functionality

#### Phase 5: API Server Implementation
- [x] Create local Express API server
- [x] Implement all required endpoints
- [x] Add proper error handling and logging
- [x] Test API functionality

#### Phase 6: Frontend Adaptation
- [x] Update API endpoint references
- [x] Replace Supabase client with direct API calls
- [x] Update authentication flows in UI
- [x] Test frontend against local services

#### Phase 7: Testing and Validation
- [x] Perform integration testing
- [x] Conduct user acceptance testing
- [x] Verify all data remains local (ITAR compliance check)
- [x] Ensure proper error handling throughout the application
- [ ] Test backup and recovery procedures
- [ ] Conduct performance testing of the local system

#### Phase 8: Deployment & Documentation
- [x] Configure production environment
- [x] Deploy application to local server
- [x] Set up monitoring and backups
- [x] Document new architecture
- [x] Create maintenance procedures
- [x] Update user documentation as needed
- [x] Document ITAR compliance measures

## Deployment Instructions

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB of RAM available
- At least 10GB of disk space
- Network ports 8081, 3002, and 5432 available

### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-organization/cut-and-track-mrp.git
   cd cut-and-track-mrp
   ```

2. **Run the deployment script**
   ```bash
   # On Windows
   .\deploy-local.bat
   
   # On Linux/Mac
   ./deploy-local.sh
   ```

   This script will:
   - Stop any running containers
   - Rebuild all containers with latest changes
   - Start the application stack
   - Verify the deployment

3. **Verify Docker Services**
   ```bash
   # Check container status
   docker-compose ps
   
   # Check logs if needed
   docker-compose logs -f
   ```

### Docker Networking Checklist
- [ ] Verify API server container can connect to Postgres container
- [ ] Ensure the frontend container can reach the API server
- [ ] Check that local file storage is properly mounted

### Database Verification
```bash
# Check database logs during startup
docker-compose logs postgres

# Connect to the database and verify tables
docker-compose exec postgres psql -U postgres -d mrp_db -c "\dt"

# Verify seed data
docker-compose exec postgres psql -U postgres -d mrp_db -c "SELECT COUNT(*) FROM users"
```

## Verification Procedures

### ITAR Compliance Verification

1. **Network Isolation Check**:
   ```bash
   docker-compose exec api-server netstat -tuna
   docker network inspect cut-and-track-mrp_mrp-network
   ```

2. **Data Storage Check**:
   - Verify all data is stored in the PostgreSQL container
   - Confirm file uploads are saved to the local filesystem

3. **Authentication Check**:
   - Verify JWT tokens are generated and validated locally
   - Confirm password hashing is performed using Argon2

4. **Code Inspection**:
   - Review the codebase to ensure no external API calls
   - Verify no cloud service dependencies in package.json

### Functional Verification

1. **User Authentication**:
   - Test login with admin user (admin@example.com / admin123)
   - Test user registration
   - Test password reset functionality

2. **Data Operations**:
   - Create, read, update, and delete operations for:
     - Customers
     - Parts
     - Work Orders
     - Operations

3. **File Operations**:
   - Test file upload
   - Test file download
   - Test file deletion

## Maintenance Procedures

### Backup Procedure

1. **Database backup**:
   ```bash
   docker-compose exec postgres pg_dump -U postgres mrp_db > backup_$(date +%Y%m%d).sql
   ```

2. **File storage backup**:
   ```bash
   tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./uploads
   ```

### Recovery Procedure

1. **Database restore**:
   ```bash
   cat backup_YYYYMMDD.sql | docker-compose exec -T postgres psql -U postgres mrp_db
   ```

2. **File storage restore**:
   ```bash
   tar -xzf uploads_backup_YYYYMMDD.tar.gz
   ```

### System Updates

1. **Pull latest code**:
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart containers**:
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

## Troubleshooting Guide

### Common Issues and Solutions

#### Database Connection Issues

**Issue**: API server cannot connect to the database
**Solution**:
1. Check if the PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```
2. Verify database environment variables in docker-compose.yml
3. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

#### Authentication Issues

**Issue**: Cannot log in with correct credentials
**Solution**:
1. Check if the API server is running:
   ```bash
   docker-compose ps api-server
   ```
2. Verify JWT_SECRET in environment variables
3. Check API server logs:
   ```bash
   docker-compose logs api-server
   ```

#### Frontend Connection Issues

**Issue**: Frontend cannot connect to API server
**Solution**:
1. Verify the VITE_API_URL environment variable in docker-compose.yml
2. Check if API server is accessible from the frontend container
3. Check frontend logs:
   ```bash
   docker-compose logs app
   ```

#### Module Not Found Errors

**Issue**: "Cannot find module 'argon2'" or similar errors
**Solution**:
1. Rebuild the API server container:
   ```bash
   docker-compose build api-server
   ```
2. Ensure the Dockerfile properly installs all dependencies
3. Check if the container has the necessary build tools

#### Invalid UUID Format

**Issue**: Database errors about invalid UUID format
**Solution**:
1. Check the seed data SQL files for proper UUID format
2. Ensure all UUIDs follow the standard format (8-4-4-4-12 hexadecimal digits)
3. Recreate the database container:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Contact Information

For questions regarding the system or ITAR compliance, contact:
- Technical Support: [Your Technical Contact]
- Compliance Officer: [Your Compliance Contact]
