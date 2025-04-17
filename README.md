
# MRP System - Updates

## Recent Changes

### Part Library Cleanup (2025-04-17)
- Removed deprecated "Setup Instructions" and "Machining Methods" fields from Part Detail/Edit views
- These fields have been replaced by the Operation Templates system which provides better workflow management
- Database columns are maintained but marked as deprecated for backward compatibility

### Material Selection Fix
- Fixed an issue with Material dropdown not working in the Part form
- Ensured proper data binding and validation

### Document Upload Feature Added
- Added ITAR-compliant document upload capability for parts
- Files are stored securely with proper validation and access controls
- Supported formats: PDF, JPG, PNG, DXF, STP (max 10MB)

### Work Order Usability Improvements
- Enhanced work order creation with operation template integration
- Added explicit "useOperationTemplates" flag for better control

## Usage Notes

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

## Technical Notes

### Database Schema Updates
- Deprecated fields are maintained for backward compatibility
- New part_documents table for storing document metadata

### Security Measures
- Document upload includes ITAR-compliant validation
- Access control ensures proper user permissions for document management
