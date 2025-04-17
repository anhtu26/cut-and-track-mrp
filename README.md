
# MRP System - Updates

## Recent Changes

### Mock Data Removal (2025-04-17)
- Completely removed all mock data from the system
- Dashboard now uses real Supabase queries for KPI metrics and recent work orders
- Improved performance and reliability by connecting directly to Supabase

### Part Library Schema Updates (2025-04-17)
- Added customer_id column to parts table to link parts to preferred customers
- Improved Part form with fully functional material selection
- Fixed database schema to match frontend expectations

### Part Library Cleanup (2025-04-16)
- Removed deprecated "Setup Instructions" and "Machining Methods" fields from Part Detail/Edit views
- These fields have been replaced by the Operation Templates system which provides better workflow management
- Database columns are maintained but marked as deprecated for backward compatibility

### Material Selection Fix
- Fixed an issue with Material dropdown not working in the Part form
- Added multi-select capability for materials with improved UX
- Ensured proper data binding and validation

### Document Upload Feature Added
- Added ITAR-compliant document upload capability for parts
- Files are stored securely with proper validation and access controls
- Supported formats: PDF, JPG, PNG, DXF, STP (max 10MB)

### Work Order Usability Improvements (2025-04-18)
- Enhanced work order creation with operation template integration
- Added explicit "useOperationTemplates" flag for better control
- Implemented searchable Part selection for improved user experience with large catalogs
- Fixed data issues to ensure consistent development and testing experience

## Usage Notes

### Material Selection
1. When creating or editing a part, you can now select multiple materials from the dropdown
2. Type to search for materials or click to select from the list
3. Selected materials appear as badges that can be removed individually

### Document Upload
1. Navigate to a Part Detail page
2. Click on the "Documents" tab
3. Use the file browser to select documents
4. Click "Upload"
5. Files will appear in the documents list after successful upload

### Operation Templates
- Operation Templates have fully replaced the older Setup Instructions and Machining Methods fields
- When creating a work order, operations can be automatically generated from templates
- The "useOperationTemplates" option allows for manual control of this feature

### Work Order Part Search
The new Part selection in the Work Order form now features a searchable interface:
```tsx
<PartSelectSearch field={form} isLoading={isSubmitting} />
```
This component allows users to:
- Type to search for parts by name or part number
- View part descriptions in the dropdown
- Easily handle large part catalogs (999+ parts)
- Filter results in real-time

## Technical Notes

### Database Schema Updates
- Added customer_id column to parts table
- Deprecated fields are maintained for backward compatibility
- Part documents are stored in the part_documents table

### Security Measures
- Document upload includes ITAR-compliant validation
- Access control ensures proper user permissions for document management

### UX Improvements
- Increased button sizes and text for better usability on touch screens
- Added more contrast for better visibility in shop environments
- Simplified navigation and workflows for non-technical users
