# PLANNING.md

## Production‑Ready MRP/ERP Roadmap
Comprehensive, module‑by‑module checklist guiding development from prototype to production.

---

### 0. Initialization & Dev Setup
- [x] Confirm tech stack & install dependencies (Vite, React, TypeScript, TailwindCSS, Supabase)
- [x] Configure linting/formatting (ESLint, Prettier)
- [x] Basic testing setup (Jest, react-testing-library)
- [x] Create and maintain `TASK.md`, `ARCHITECTURE.md`, `PLANNING.md`
- [ ] Setup CI pipeline (lint, test, build) in GitHub Actions
- [ ] Add Husky & lint-staged pre-commit hooks
- [ ] Configure environment variables for local, staging, production

### 1. Authentication & Authorization
- [x] Supabase Auth (email/password login)
- [x] Protect routes with `AuthGuard` & redirect unauthorized
- [x] `Unauthorized` page UI
- [x] Basic `UserManagement.tsx` page implemented
- [ ] Role‑Based Access Control (RBAC)
  - [ ] Define roles: **Admin**, **Manager**, **Operator**, **Viewer**
  - [ ] Migration: Tables `roles`, `user_roles`
  - [ ] Hooks: `useRoles()`, `useUserRoles()`
  - [ ] Enhance UI: Role management in `UserManagement.tsx`
  - [ ] Enforce RBAC on pages, components, RPCs
- [ ] Audit login/logout events (Edge Function + `audit_logs` table)

### 2. Core Entities CRUD

#### 2.1 Customer Module
- [x] **Database**: Tables for `customers` already implemented
- [x] **API**: Client-side API integration with Supabase
- [x] **Pages**: `Customers.tsx`, `AddCustomer.tsx`, `EditCustomer.tsx`, `CustomerDetail.tsx` implemented
- [ ] **Validation**: Complete Zod schema for `customerSchema`
- [ ] **Index**: Add index on `name` if not already done
- [ ] **Server-side API**: RPCs or Edge Functions
- [ ] **Tests**:
  - Unit: Validate Zod schema, hooks
  - Integration: CRUD flows UI + API

#### 2.2 Part Library Module
- [x] Database: `parts` table implemented with recent migration for `customer_id`
- [x] Zod: `partSchema` defined in schemas/part.ts
- [x] Hooks: `useParts()`, `usePart(id)`, `usePartSearch()` implemented
- [x] Pages: `Parts.tsx`, `AddPart.tsx`, `EditPart.tsx`, `PartDetail.tsx` implemented
- [ ] Index on `part_number` if not already implemented
- [ ] Server-side RPCs
- [ ] Tests: unit & integration

#### 2.3 Operation Module
- [x] Database: `operations` table implemented
- [x] Zod: `operation.schema.ts` with various operation schemas defined
- [x] Pages: `AddOperation.tsx`, `EditOperation.tsx`, `OperationDetail.tsx` implemented
- [ ] Server-side RPCs
- [ ] Tests

#### 2.4 Work Order Module
- [x] Database: Work order tables implemented
- [x] Zod: `work-order-schema.ts` with workOrderSchema defined
- [x] Pages: `WorkOrders.tsx`, `AddWorkOrder.tsx`, `EditWorkOrder.tsx`, `WorkOrderDetail.tsx` implemented
- [x] Components: `work-order-form.tsx` and other related components 
- [ ] Server-side RPCs
- [ ] Complete time tracking & QC functionality on `WorkOrderDetail.tsx`
- [ ] Tests

### 3. Inventory Management
- [ ] Database: `inventory_transactions` (id, part_id, work_order_id?, quantity, type[in/out], timestamp, user_id)
- [ ] Index on `part_id`, `work_order_id`
- [ ] RPCs: get balance by part, log transaction
- [ ] Zod: `inventoryTxSchema`
- [ ] Hooks: `useInventory()`, `useInventoryTxs(partId)`
- [ ] UI: Inventory dashboard, adjust stock modal
- [ ] Tests

### 4. Purchase Orders & Invoices
- [ ] Database: `purchase_orders`, `invoices` tables with relevant fields
- [ ] RPCs: CRUD + status updates
- [ ] Zod: schemas for PO & Invoice
- [ ] Hooks + Pages
- [ ] PDF Export via Edge Function
- [ ] Email integration (Supabase SMTP)
- [ ] Tests

### 5. Time Tracking & Quality Control
- [ ] Database:
  - `time_entries` (user_id, work_order_id, operation_id, start_time, end_time, notes)
  - `qc_checks` (work_order_id, operation_id, result[pass/fail], remarks, timestamp, user_id)
- [ ] RPCs: log time, fetch entries, log QC
- [ ] Zod: `timeEntrySchema`, `qcCheckSchema`
- [ ] Hooks + UI enhancements on `WorkOrderDetail.tsx`
- [ ] Tests

### 6. KPI Dashboard & Reporting
- [ ] Define KPIs: throughput, cycle time, utilization, on-time delivery %
- [ ] RPCs for metric calculations
- [ ] Dashboard page with charts (e.g., Recharts, Chart.js)
- [ ] CSV/Excel export
- [ ] Tests

### 7. Audit Trail & Traceability
- [ ] Database: `audit_logs` (table, record_id, action, old_data, new_data, user_id, timestamp)
- [ ] Supabase triggers or Edge Functions to populate logs
- [ ] UI: AuditLogViewer component
- [ ] Tests

### 8. Notifications & Alerts
- [ ] In-app: Toasts via React-Toastify or Shadcn UI
- [ ] Email templates & sending
- [ ] User preferences table
- [ ] Tests

### 9. Security & Performance
- [ ] Validate inputs with Zod everywhere
- [ ] Add DB indexes for heavy queries
- [ ] Implement SSR/ISR for list pages
- [ ] Security audit (OWASP checklist)
- [ ] Penetration testing

### 10. Testing & CI/CD
- [x] Basic testing configured (Jest, react-testing-library)
- [x] Initial test file structure (`basic.test.ts`)
- [ ] Unit tests for all hooks, utils, components
- [ ] Integration tests for page workflows
- [ ] End-to-end tests (Cypress)
- [ ] CI: lint, build, test, coverage badge
- [ ] Enforce coverage >=80%

### 11. Documentation & Deployment
- [x] Initial `README.md` with basic information
- [ ] Complete documentation with setup, env vars, scripts
- [ ] API docs (RPCs, Edge Functions) in `/docs` folder
- [ ] Developer on-boarding guide
- [ ] Vercel/Netlify deploy config
- [ ] Supabase migration & edge function deployment scripts

### 12. Maintenance & Iteration
- [ ] CHANGELOG.md for releases
- [ ] Regular dependency updates
- [ ] Bug triage & support process
- [ ] Roadmap for v2 features

---

## Workflow Standards
- Follow TDD: Write test, implement feature, then refactor
- Update `TASK.md` before and after feature implementations
- Refer to `ARCHITECTURE.MD` for coding standards, but note that actual app is using:
  - Vite (not Next.js as referenced in ARCHITECTURE.MD)
  - React
  - TypeScript
  - TailwindCSS
  - Supabase
  - Zod for validation
  - TanStack Query for data fetching
  - shadcn/ui components (not cmdk/Command per architecture note)
