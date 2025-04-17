
# MRP System - Development Guidelines

## Core Principles

### Production-First Approach
- 🚨 **No Mock Data**: This application is built on real, actionable data from Supabase.
- 🔍 **Workflow Integrity**: Every feature directly supports machine shop operational efficiency.
- 📊 Real-time data and clear user interactions are our priority.

## Recent Changes

### User Management & PDF Viewer Enhancements (2025-04-19)
- Added comprehensive user management system with roles and permissions
- Implemented PDF viewer integration with Supabase Storage
- Improved document handling with signed URLs for secure access
- Added roles-based access controls for system features
- Created admin interface for managing users, roles, and permissions

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

## PDF Viewer Integration
The MRP system now includes a fully integrated PDF viewer that connects directly to Supabase Storage. Key features include:

- Secure document storage in Supabase buckets
- Automatic generation of signed URLs for document access
- Support for PDF, image, DXF, and STP file formats
- Comprehensive error handling and logging
- Touch-friendly document controls for shop floor use

To view documents:
1. Navigate to the Parts detail page
2. Click the "Documents" tab
3. Select "View" on any document to open it in a new tab

## User Management System

### Database Schema
The user management system uses the following database structure:

- **profiles**: Stores user profile information linked to Supabase Auth
- **roles**: Defines system roles (Admin, Manager, Machinist)
- **permissions**: Granular permissions for system resources
- **user_roles**: Maps users to roles
- **role_permissions**: Maps roles to permissions
- **user_groups**: Logical groupings of users
- **user_group_members**: Maps users to groups
- **group_roles**: Maps groups to roles

### Permission Model
The system implements a comprehensive permission model:

- **Resource-based**: Permissions are tied to specific resources (parts, work orders, etc.)
- **Action-based**: Each resource has read/write permissions
- **Role-based**: Users inherit permissions from assigned roles
- **Group-based**: Users can inherit permissions from group memberships
- **Hierarchical**: Managers can manage permissions for their direct reports

### Admin Interface
The settings page provides administrators with:

- User management (create, edit, delete users)
- Role configuration (create, edit roles and assign permissions)
- Group management (create groups, assign users and roles)
- System settings (configure application-wide settings)

## Error Handling Philosophy
- Gracefully handle undefined or missing Supabase data
- Log meaningful context without breaking user experience
- Prioritize real-time, actionable information

## Testing
To run tests for the PDF viewer and user management system:

```bash
npm run test:pdf
npm run test:users
```

For comprehensive system tests:
```bash
npm test
```

## Logging
The system implements extensive logging for critical operations:

- Document access logs: `console.log("[DOCUMENT] Accessing document: <filename>")`
- Permission checks: `console.log("[PERMISSION] Checking <permission> for user <id>")`
- User management events: `console.log("[USER] <action> for user <id>")`

Logs can be viewed in the browser console or collected by your logging service.
