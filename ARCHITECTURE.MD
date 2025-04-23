# Architecture & AI Code‑Gen Guidelines

## 1. Project Overview
This MRP/ERP web app is built with:  
- **Framework**: Next.js (React + Server Components)  
- **Styling**: Tailwind CSS + Shadcn UI + Radix  
- **Data Layer**: Supabase (PostgreSQL + Auth + Edge Functions)  
- **Validation**: Zod schemas  
- **State / Fetching**: TanStack Query (client) + Next.js SSR/ISR (server)  
- **Language**: TypeScript  

### Key Directories
- `components/` – Reusable, presentational UI  
- `hooks/` – Data‑fetch & state hooks (useWorkOrderQuery, etc.)  
- `lib/supabase.ts` – Supabase client initialization  
- `schemas/` – Zod definitions per table / API  
- `types/` – `z.infer<>` TS types (auto‑generated)  
- `src/pages/` – Route components (Next.js file system routing)  
- `supabase/` – SQL migrations, RPC or edge functions  
- `public/` – Static assets  
- [tailwind.config.ts](cci:7://file:///c:/Users/anhtu/CascadeProjects/cut-and-track-mrp/cut-and-track-mrp/tailwind.config.ts:0:0-0:0) – Design tokens, breakpoints (mobile‑first)  
- [vite.config.ts](cci:7://file:///c:/Users/anhtu/CascadeProjects/cut-and-track-mrp/cut-and-track-mrp/vite.config.ts:0:0-0:0) / [eslint.config.js](cci:7://file:///c:/Users/anhtu/CascadeProjects/cut-and-track-mrp/cut-and-track-mrp/eslint.config.js:0:0-0:0) – Tooling  

## 2. Objectives & Deliverables for GenCode AI

1. **Performance & Security**  
   - Always use Next.js RSC/SSR/ISR for data-critical pages.  
   - Source data via Supabase RPC or edge functions; never embed raw SQL.  
   - Sanitize & validate all inputs/outputs with Zod.  

2. **Type Safety**  
   - Import Zod schemas in every hook/route.  
   - Derive TS types via `z.infer<>`; no hand‑written types.  
   - Enforce guard clauses (early returns) on invalid data.  

3. **Component & File Structure**  
   - Functional, declarative TS only.  
   - Kebab‑case dirs: e.g. `components/order-form/`  
   - Descriptive naming: `isSubmitting`, `orderItems`, `useWorkOrderQuery`.  

4. **Responsive UI**  
   - Mobile‑first design; leverage Tailwind breakpoints.  
   - Lazy‑load images with `<Image>` and WebP.  
   - Dynamically import heavy components via `next/dynamic`.  

5. **State Management & Data Fetching**  
   - Hooks in `hooks/` using TanStack Query; use Supabase realtime for cache invalidation.  
   - Avoid `useEffect` where RSC or fetchers suffice.  

6. **Error Handling & Auth**  
   - Centralize error types; throw custom classes in RPC/edge fn.  
   - Early auth/permission checks in middleware or RSC.  

7. **Testing & Documentation**  
   - Jest + React Testing Library unit tests for every component & hook.  
   - Add concise JSDoc for complex logic; comments explain “why,” not “what.”  

## 3. Recommended Next Steps
- Generate Zod schemas and migrations under `supabase/`.  
- Scaffold core pages:  
  - `/login`, `/dashboard`, `/work-orders`, `/inventory`, `/settings`.  
- Build shared components: Form fields, tables, modals.  
- Set up TanStack Query providers & Supabase auth wrapper in `_app.tsx`.  
- Write initial unit tests alongside each component.  
- Configure CI to run lint, typecheck, tests, and deploy previews.

---

*Use this doc as the single source‑of‑truth “prompt” for GenCode AI when expanding or generating new features.*