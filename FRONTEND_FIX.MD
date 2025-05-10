# Frontend Fix Plan for Cut-and-Track MRP

> **IMPORTANT NOTICE:** All frontend tasks have been consolidated into the [MIGRATION_TASKS.MD](./MIGRATION_TASKS.MD) document as part of Phase 6 for better centralized planning.
> 
> Please refer to that document for the most up-to-date status of all migration tasks, including frontend fixes.

## Original Root Cause Analysis

After analyzing the error logs and code, I've identified the following issues that are breaking the UI after migrating from cloud to local development:

### 1. CSS/Tailwind Configuration Issues
- Error: `Cannot apply unknown utility class: bg-background`
- The Tailwind CSS configuration is properly set up in `tailwind.config.ts` with custom theme colors, but the CSS variables in `index.css` may not be properly loaded or there's an issue with the PostCSS processing.

### 2. DOM Nesting Violations
- Error: `In HTML, <div> cannot be a descendant of <p>` in Progress component usage 
- Error: `<p> cannot contain a nested <div>` in CardStats component
- These invalid HTML nesting patterns cause hydration errors in React

### 3. Component Accessibility Issues
- Warning: `DialogContent requires a DialogTitle` for accessibility in the Sheet component
- Warning: `Missing Description or aria-describedby` for DialogContent

### 4. Backend Connectivity Issues
- Error: `GET http://localhost:54321/rest/v1/work_orders... net::ERR_CONNECTION_REFUSED`
- Supabase client is configured to connect to http://localhost:54321 but the service isn't running or accessible

## Comprehensive Fix Plan

### Phase 1: Fix CSS & Tailwind Configuration

1. **Verify CSS Variables Loading**
   - Ensure index.css is properly imported in main.tsx
   - Check PostCSS plugins configuration

2. **Fix Tailwind Configuration**
   - Validate tailwind.config.ts setup
   - Ensure proper content paths are configured
   - Fix class naming conflicts

### Phase 2: Fix DOM Nesting Issues

1. **Fix CardStats Component**
   - Update the component to avoid nesting `<div>` inside `<p>`
   - Replace `<p>` tags with appropriate elements that can contain blocks

2. **Fix Progress Component Usage**
   - Modify components using Progress to follow proper HTML nesting rules
   - Update KPI-metrics.tsx to prevent invalid nesting

### Phase 3: Fix Accessibility Issues

1. **Fix Sheet Component**
   - Add required DialogTitle to DialogContent
   - Add aria-describedby or Description component

### Phase 4: Backend Connectivity Setup

1. **Setup Local Supabase**
   - Ensure Supabase is properly running locally
   - Configure environment variables for local development

2. **Update API Configuration**
   - Modify Supabase client initialization to use correct URL/Key

## Detailed Tasks

### Phase 1: CSS & Tailwind Configuration Fixes

#### Task 1.1: Fix Tailwind Configuration ✅
- ✅ Verify PostCSS configuration in project - Fixed incorrect plugin name from '@tailwindcss/postcss' to 'tailwindcss'
- ✅ Check if tailwind.config.ts is correctly loaded
- ✅ Ensure CSS variables in index.css are properly defined

#### Task 1.2: Fix CSS Variable Loading
- Validate import of index.css in main.tsx
- Check for any CSS preprocessing issues

### Phase 2: DOM Nesting Fixes

#### Task 2.1: Fix CardStats Component ✅
- ✅ Update the description property to use appropriate HTML structure
- ✅ Replace `<p>` tags with `<div>` or other block-level elements where needed
- ✅ Ensure proper nesting of elements

#### Task 2.2: Fix KPI-metrics Component ✅
- ✅ Update the Progress component usage to avoid invalid nesting
- ✅ Restructure how the description property is used - Moved Progress component outside of the CardStats description

### Phase 3: Accessibility Fixes

#### Task 3.1: Update Sheet Component ✅
- ✅ Add required DialogTitle to Sheet component usage
- ✅ Add proper description or aria attributes for accessibility - Added aria-describedby and SR-only description

### Phase 4: ITAR-Compliant Local Backend Implementation

#### Task 4.1: Setup Local PostgreSQL Database
- Configure the PostgreSQL container from docker-compose.yml
- Initialize database schema and tables
- Create seed data for testing
- Ensure database is properly secured for local access only

#### Task 4.2: Implement Local Authentication Service
- Replace Supabase authentication with a local authentication system
- Create secure user management endpoints
- Implement JWT token generation and validation
- Update frontend authentication hooks

#### Task 4.3: Implement Local API Services ✅
- ✅ Create REST endpoints for all required data operations - Created local API client with all necessary endpoints
- ✅ Replace Supabase client calls with local API calls - Updated Dashboard component to use local API
- ✅ Implement proper error handling - Added comprehensive error handling in API client
- ✅ Add offline capability for critical functions - Implemented mock data functions for development

#### Task 4.4: Configure Local File Storage
- Set up local file system storage for documents and files
- Implement secure file upload/download functionality
- Create backup/recovery mechanisms

## Implementation Plan

1. Start with CSS/Tailwind fixes as they affect the entire UI
2. Fix component structure issues to resolve DOM nesting violations
3. Address accessibility warnings
4. Set up local backend services

## Testing Plan

1. Verify CSS classes load correctly
2. Test component rendering in different scenarios
3. Check accessibility with screen readers
4. Validate backend connectivity
