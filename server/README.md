# Cut and Track MRP - Local Server

## Overview

This is the local server implementation for the Cut and Track MRP application. It replaces the Supabase backend with a fully local solution that includes:

- PostgreSQL database for data storage
- Express.js API server for handling requests
- Local file storage for document management
- JWT-based authentication system

This migration was done to meet ITAR compliance requirements by keeping all data on-premises.

## Folder Structure

```
cut-and-track-mrp/
├── server/             # Backend server code
│   ├── db/            # Database connection and schema
│   ├── routes/        # API routes
│   ├── migrations/    # Database migration scripts
│   ├── scripts/       # Utility scripts for setup
│   ├── uploads/       # Local file storage directory
│   └── index.js       # Main server file
├── src/               # Frontend React application
│   ├── lib/
│   │   └── services/  # Frontend services for API communication
│   ├── hooks/         # React hooks
│   └── ...
└── ...
```

## Dependencies Note

This project has two separate dependency management systems:

1. **Root-level dependencies** (`package.json` in the project root):
   - These are for the frontend React application
   - Managed with npm
   - Include UI frameworks, React, and client-side libraries

2. **Server dependencies** (`server/package.json`):
   - These are for the backend Express server
   - Also managed with npm
   - Include database drivers, authentication libraries, and server frameworks

When developing, be aware of which part of the application you're working on and use the appropriate package.json file for adding dependencies.

This server provides a local backend for the Cut and Track MRP application, migrating from Supabase to a fully local implementation for ITAR compliance.

## Features

- Local PostgreSQL database integration
- JWT-based authentication
- Local file storage for document management
- REST API endpoints for all application data
- Secure middleware for access control

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- NPM or Yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure PostgreSQL:
   - Create a database named `cut_track_mrp`
   - Configure database connection in `.env` file

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update values with your local configuration

4. Initialize the database:
   - Import schema from backup:
     ```bash
     psql -U postgres -d cut_track_mrp -f ../local/schema_backup.sql
     ```
   - Import data from backup:
     ```bash
     psql -U postgres -d cut_track_mrp -f ../local/data_backup.sql
     ```
   - Create required tables for local auth and storage:
     ```bash
     psql -U postgres -d cut_track_mrp -f db/schema.sql
     ```

## Starting the Server

To start the server in development mode:
```bash
npm run dev
```

For production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin only)
- `POST /api/auth/register` - Create new user (Admin only)
- `PUT /api/auth/users/:id` - Update user (Admin only)
- `DELETE /api/auth/users/:id` - Delete user (Admin only)

### Storage
- `POST /api/storage/upload` - Upload file
- `GET /api/storage/documents/:parentType/:parentId` - Get documents
- `DELETE /api/storage/documents/:id` - Delete document

### Parts
- `GET /api/parts` - Get all parts
- `GET /api/parts/:id` - Get part by ID
- `POST /api/parts` - Create new part
- `PUT /api/parts/:id` - Update part
- `DELETE /api/parts/:id` - Delete part

### Work Orders
- `GET /api/workorders` - Get all work orders
- `GET /api/workorders/:id` - Get work order by ID
- `POST /api/workorders` - Create new work order
- `PUT /api/workorders/:id` - Update work order
- `DELETE /api/workorders/:id` - Delete work order

## Security Notes

- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt
- File uploads are restricted by type and size
- Role-based access control for sensitive operations
