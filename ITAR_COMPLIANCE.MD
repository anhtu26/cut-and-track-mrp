# Cut-and-Track MRP ITAR Compliance Documentation

## Overview

This document outlines the ITAR (International Traffic in Arms Regulations) compliance measures implemented in the Cut-and-Track MRP application for aerospace CNC machine shops. The application has been migrated from cloud-based services to a fully local hosting solution to ensure all data remains within the controlled local environment.

## ITAR Compliance Requirements

1. **Data Isolation**: All data must remain on local servers with no external transmission
2. **Local Authentication**: User authentication must be handled locally
3. **Local Storage**: All files and documents must be stored locally
4. **No External APIs**: No external API services can be used
5. **No Cloud Services**: No cloud-based services can be used for any part of the application

## Implementation Details

### Local Database

The application uses PostgreSQL running in a local Docker container:
- All data is stored in a local volume
- No external database connections are established
- Database credentials are stored locally in environment variables
- Regular backups can be scheduled to local storage

### Local Authentication

The authentication system has been implemented using:
- JWT (JSON Web Tokens) for secure authentication
- Argon2 for password hashing (NIST recommended)
- Local user management with role-based access control
- No external identity providers or OAuth services

### Local File Storage

Files are stored in a local directory structure:
- All uploads are saved to the local filesystem
- File metadata is tracked in the local database
- No cloud storage services are used

### Local API Server

The API server runs locally and provides:
- RESTful endpoints for all data operations
- Secure file upload/download functionality
- Authentication and authorization services
- No external API calls

### Frontend Application

The frontend application is configured to:
- Connect only to the local API server
- Store no data in browser storage
- Make no external API calls
- Use only locally hosted assets

## Deployment Instructions

For detailed deployment instructions, refer to the following documents:
- [MIGRATION_COMPLETION.MD](./MIGRATION_COMPLETION.MD) - Step-by-step guide for deployment
- [MIGRATION_TASKS.MD](./MIGRATION_TASKS.MD) - Comprehensive migration task list

## Verification Process

To verify ITAR compliance:

1. **Network Isolation Check**:
   - Run `docker-compose exec api-server netstat -tuna` to verify no external connections
   - Inspect Docker network configuration with `docker network inspect cut-and-track-mrp_mrp-network`

2. **Data Storage Check**:
   - Verify all data is stored in the PostgreSQL container
   - Confirm file uploads are saved to the local filesystem

3. **Authentication Check**:
   - Verify JWT tokens are generated and validated locally
   - Confirm password hashing is performed using Argon2

4. **Code Inspection**:
   - Review the codebase to ensure no external API calls
   - Verify no cloud service dependencies in package.json

## Maintenance Procedures

### Backup Procedure

1. Database backup:
   ```bash
   docker-compose exec postgres pg_dump -U postgres mrp_db > backup_$(date +%Y%m%d).sql
   ```

2. File storage backup:
   ```bash
   tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./uploads
   ```

### Recovery Procedure

1. Database restore:
   ```bash
   cat backup_YYYYMMDD.sql | docker-compose exec -T postgres psql -U postgres mrp_db
   ```

2. File storage restore:
   ```bash
   tar -xzf uploads_backup_YYYYMMDD.tar.gz
   ```

## Security Considerations

- All sensitive data is encrypted at rest using database encryption
- JWT tokens have a limited lifespan (24 hours)
- Password hashing uses Argon2id with appropriate memory and time cost parameters
- Regular security audits should be performed to ensure continued compliance

## Contact Information

For questions regarding ITAR compliance, contact:
- Compliance Officer: [Name]
- Email: [Email]
- Phone: [Phone]
