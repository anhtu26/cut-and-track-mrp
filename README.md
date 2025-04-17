
# MRP System - Development Guidelines

## Core Principles

### Production-First Approach
- 🚨 **No Mock Data**: This application is built on real, actionable data from Supabase.
- 🔍 **Workflow Integrity**: Every feature directly supports machine shop operational efficiency.
- 📊 Real-time data and clear user interactions are our priority.

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
