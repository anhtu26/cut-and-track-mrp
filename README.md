
# MRP System - Updates

## Recent Changes

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

## Usage Notes

### Material Input
1. When creating or editing a part, you can now enter materials as a comma-separated list
2. Examples: "Aluminum, Steel, Plastic" or "Titanium Grade 5, Stainless Steel 304"
3. Each material will be stored as a separate item in the database array

### Document Upload
1. Navigate to a Part Detail page
2. Click on the "Documents" tab
3. Use the file browser to select documents
4. Click "Upload"
5. Files will be stored in Supabase Storage and appear in the documents list after successful upload
6. Click "View" to open the document in a new tab

### Technical Notes

#### Storage Configuration
- Documents are stored in Supabase Storage in the `documents` bucket
- Files are organized in folders by part ID: `parts/{partId}/{filename}`
- Public URLs are used for document viewing
- MIME type validation ensures only allowed file types can be uploaded

#### Material Handling
- Materials are input as a comma-separated string in the UI
- Before saving to Supabase, the string is split into an array
- When displaying materials, the array items are converted to tags
- This approach simplifies the UI while maintaining the array structure in the database
