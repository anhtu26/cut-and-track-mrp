
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

### Work Order Usability Improvements (2025-04-18)
- Enhanced work order creation with operation template integration
- Added explicit "useOperationTemplates" flag for better control
- Implemented searchable Part selection for improved user experience with large catalogs
- Fixed mock data issues to ensure consistent development and testing experience

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
- Deprecated fields are maintained for backward compatibility
- New part_documents table for storing document metadata

### Security Measures
- Document upload includes ITAR-compliant validation
- Access control ensures proper user permissions for document management

### Dev Mode Mock Data
- Fixed missing mockKpiData to ensure dashboard renders correctly in dev mode
- Updated mock data structure to match WorkOrder type requirements
- Cast mock data to ensure type safety across the application

