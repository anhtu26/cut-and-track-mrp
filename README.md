
# Manufacturing Resource Planning System

## Features

- Part Management: Create, edit, and archive parts with operation templates
- Work Order Management: Create and track work orders through the manufacturing process
- Customer Management: Track customer information and orders
- Document Storage: Upload and view PDF drawings and specifications  
- User Management: Control access with roles and permissions
- Responsive Design: Works on desktop, tablet, and mobile devices

## Technology Stack

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, Storage)
- State Management: TanStack Query, Zustand
- Routing: React Router

## PDF Document Storage and Viewing

Documents are stored securely in Supabase Storage. The system:

1. Uploads files to a structured path: `documents/{part_id}/{timestamp}-{filename}`
2. Generates signed URLs for secure access
3. Validates document structure via Zod
4. Enforces proper permissions through Supabase RLS
5. Tracks document access attempts in logs
6. Shows error messaging when access is denied

### Document Naming Convention

Documents follow this naming pattern:
- Storage path: `documents/{part_id}/{timestamp}-{filename}`  
- Database records include metadata like type, size, and upload date

## User Management System

### Database Schema

The user system uses the following tables:

- `profiles`: Extends Supabase Auth with user profile information
- `roles`: Defines user roles (Admin, Manager, Machinist, etc.)
- `permissions`: Individual access permissions for system resources
- `user_roles`: Maps users to their assigned roles
- `role_permissions`: Maps roles to their permissions
- `user_groups`: Groups of users for organizational purposes
- `user_group_members`: Maps users to groups
- `group_roles`: Maps groups to roles for group-based permissions

### Role-Based Access Control

The system implements RBAC with:

- **Admin Role**: Full system access
- **Manager Role**: Can manage their team and create/edit work orders
- **Machinist Role**: Can view work orders and track operation time

### Row-Level Security Policies

Supabase RLS policies enforce:

1. Users can only see resources they have permission to access
2. Managers can only manage users in their team
3. Role permissions control read/write access to system tables
4. Most sensitive operations require Admin role

## Debugging and Logging

The system implements comprehensive logging:

1. Debug mode toggle in settings (Admin only)
2. Consistent console logging format: `[AREA] Message`
3. Document access attempts are tracked
4. User management actions are logged
5. Logs can be cleared from settings
6. Errors are consistently formatted and displayed to users

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Supabase connection in `.env` file
4. Start the development server: `npm run dev`
5. Login with credentials:
   - Admin: admin@example.com / admin
   - Manager: manager@example.com / manager
   - Machinist: machinist@example.com / machinist

## Testing

Run tests:
```
npm test
```

The test suite includes:
- PDF access validation across roles
- User management workflow tests
- Permission enforcement tests

## Error Handling

The application implements consistent error handling:
1. Client validation with Zod
2. Detailed server-side error messages
3. Error boundary for UI component failures
4. Console logging for debugging
5. User-friendly error messages

## License

This project is proprietary and confidential.
