# TASK.md

## Purpose
Tracks current tasks, backlog, and sub-tasks for the CNC machine shop MRP/ERP web app prototype.
Utilize `scripts/task-scanner.js` to automatically update this file.

## Completed (✅)
- Project setup: Vite, React, TypeScript, TailwindCSS, Supabase config & migrations
- Authentication: Login, AuthGuard, Unauthorized page
- Dashboard page
- User management (UserManagement page)
- CRUD functionality with UI:
  - Customers (Customers, AddCustomer, EditCustomer, CustomerDetail)
  - Parts (Parts, AddPart, EditPart, PartDetail)
  - Operations (Operations, AddOperation, EditOperation, OperationDetail)
  - Work Orders (WorkOrders, AddWorkOrder, EditWorkOrder, WorkOrderDetail)
- Basic testing configured (vitest, jest, react-testing-library, basic.test.ts)
- Refactoring operation template management: Modularized forms, removed redundant save-as-template button, ensured document handling

## In Progress (🚧)
- WorkOrderDetail enhancements: time tracking & quality control UI
- KPI calculation logic & dashboard integration
- Refactoring common CRUD patterns into reusable components/hooks
- Fix save operation detail to template error and remove redundant sync checkbox (2025-04-23)

## Backlog (🗒️)
- Inventory management module
- Purchase Orders & Invoices module
- Audit trail/history view for traceability
- PDF export & reporting (invoices, work orders)
- Notifications & email integration
- Supabase edge functions for server-side logic
- Role-based access control & permissions
- Unit and integration tests for all modules

## Discovered During Development
- Supabase/functions folder initialized but no edge functions implemented
- Code duplication in pages; opportunity to abstract CRUD patterns
- Missing tests for specific components and API calls
- Implement unit tests for ModularOperationForm component
- Implement unit tests for OperationTemplateForm component
- Add integration tests for template saving and document syncing

## Workflow & Automation
1. Use this `TASK.md` to track tasks; update before/after PRs.
2. PR template must reference relevant tasks and update checklist statuses.
3. Implement a code-scanning script (e.g., Node.js) to detect new pages/hooks/entities and auto-suggest tasks.
4. Integrate a pre-commit hook (Husky) to run the scanner and prompt devs to update `TASK.md`.
5. Enforce test coverage threshold (e.g., >80%) in CI pipeline.
