# Cut and Track MRP Local Deployment Guide

This guide provides detailed instructions for deploying the Cut and Track MRP application to a local server environment for ITAR compliance.

## Prerequisites

1. **PostgreSQL**: Version 12 or higher installed locally
2. **Node.js**: Version 14 or higher installed
3. **Appropriate file system permissions** for creating and accessing files in the application directories

## Step 1: Environment Setup

### Database Configuration

1. Create a PostgreSQL database:
   ```bash
   # Using the automated setup script
   cd server
   node scripts/db-setup.js
   ```

   Or manually:
   ```bash
   createdb cut_track_mrp
   ```

2. Create a database user with appropriate permissions:
   ```sql
   CREATE USER cut_track_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE cut_track_mrp TO cut_track_user;
   ```

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit the `.env` file with your specific configuration:
   ```
   # Server Configuration
   PORT=3001

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cut_track_mrp
   DB_USER=cut_track_user
   DB_PASSWORD=your_secure_password
   DB_SSL=false

   # JWT Configuration 
   JWT_SECRET=your_secure_random_string

   # File Upload Configuration
   MAX_FILE_SIZE=20971520  # 20MB in bytes
   ```

### File Storage Setup

1. The application automatically creates the necessary directory structure for file storage.
2. Default location: `server/uploads/` with subdirectories for different entity types.

## Step 2: Install Dependencies

The application has two separate dependency sets - one for the frontend and one for the backend.

### Backend Dependencies

```bash
cd server
npm install
```

### Frontend Dependencies

```bash
# From the project root
npm install
```

## Step 3: Data Migration

If migrating from Supabase, use the provided migration script:

```bash
cd server
node migrations/supabase-to-local.js
```

This script will:
1. Import the database schema from your backup
2. Import data from your backup
3. Migrate user authentication data
4. Set up the appropriate database structure for local operation

## Step 4: Starting the Application

### Start the Backend Server

```bash
cd server
node index.js
```

Or use the deployment script for a guided setup:

```bash
cd server
node scripts/local-deploy.js
```

### Start the Frontend Application

```bash
# From the project root
npm run dev
```

## Step 5: Testing

Use the provided test script to verify the server is functioning correctly:

```bash
cd server
node scripts/test-api.js
```

This will test:
- Authentication
- CRUD operations for all entities
- File storage functionality

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Check database existence:
   ```bash
   psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='cut_track_mrp';"
   ```

3. Check user permissions:
   ```bash
   psql -U postgres -c "SELECT rolname, rolsuper FROM pg_roles WHERE rolname='cut_track_user';"
   ```

### File Storage Issues

1. Verify directory permissions:
   ```bash
   ls -la server/uploads
   ```

2. Ensure the server process has write permissions.

### Authentication Issues

1. Check the JWT_SECRET in your .env file is properly set.
2. Verify that user data was migrated correctly by checking the users table.

## Security Considerations

1. **JWT Secret**: Use a secure random string for your JWT_SECRET.
2. **Database Password**: Use a strong password for database access.
3. **Network Security**: Consider restricting access to the server with a firewall.
4. **Regular Backups**: Implement a regular backup schedule for your database and files.

## Maintenance

### Database Backups

```bash
pg_dump -U cut_track_user -d cut_track_mrp > backup_$(date +%Y%m%d).sql
```

### Server Updates

When updating the application, remember to:
1. Backup your database
2. Backup the uploads directory
3. Pull the latest code
4. Run any new migrations
5. Update dependencies for both frontend and backend
6. Restart the server

## ITAR Compliance Notes

This local deployment helps ensure ITAR compliance by:
1. Keeping all data and files on premises
2. Providing full control over data access
3. Eliminating cloud dependencies
4. Enabling secure, isolated operation

For full ITAR compliance, ensure your network and access controls meet the necessary requirements.
