
# MRP System - Development Guidelines

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


## Recent Changes

### Schema Fixes (2025-04-18)
- Added `customer_id` column to the `parts` table to link parts to preferred customers
- Fixed the Dashboard TypeScript errors with proper typing and null handling
- Enhanced error handling for undefined data from Supabase
- Updated Build process to properly validate TypeScript types

### Development Focus Reset (2025-04-17)
- Removed all references to mock data
- Committed to production-ready, Supabase-driven workflows
- Emphasized error handling that preserves user experience

### Previous Updates
### Icon Fix (2025-04-17)
- Fixed invalid lucide-react icon import in part-detail-tabs.tsx
- Replaced non-existent `FilePdf` with valid `File` icon
- Ensured consistent icon usage across the document viewer

### Material Input Update (2025-04-17)
- Simplified Material input from multi-select to text field
- Fixed "undefined is not iterable" error in the material selection component
- Materials are still stored as an array in the database (comma-separated input gets converted)
- Enhanced validation and error handling

### Document Storage Enhancement (2025-04-17)
- Integrated Supabase Storage for document management
- Documents uploaded to Supabase with proper URLs
- Improved document list UI with document type icons
- Added file preview capability for PDFs and images

### Mock Data Removal (2025-04-17)
- Completely removed all mock data from the system
- Dashboard now uses real Supabase queries for KPI metrics and recent work orders
- Improved performance and reliability by connecting directly to Supabase

### Part Library Schema Updates (2025-04-17)
- Added customer_id column to parts table to link parts to preferred customers
- Improved Part form with simplified material input
- Fixed database schema to match frontend expectations

### Part Library Cleanup (2025-04-16)
- Removed deprecated "Setup Instructions" and "Machining Methods" fields from Part Detail/Edit views
- These fields have been replaced by the Operation Templates system which provides better workflow management
- Database columns are maintained but marked as deprecated for backward compatibility

### Work Order Usability Improvements (2025-04-18)
- Enhanced work order creation with operation template integration
- Added explicit "useOperationTemplates" flag for better control
- Implemented searchable Part selection for improved user experience with large catalogs
- Fixed data issues to ensure consistent development and testing experience

## Error Handling Philosophy
- Gracefully handle undefined or missing Supabase data
- Log meaningful context without breaking user experience
- Prioritize real-time, actionable information
