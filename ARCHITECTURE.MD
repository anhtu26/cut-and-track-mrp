# Architecture & AI Code‑Gen Guidelines

## 1. Project Overview
This MRP/ERP web app is built with:  
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI + Radix  
- **Data Layer**: Supabase (PostgreSQL + Auth + Edge Functions)  
- **Validation**: Zod schemas  
- **State / Fetching**: TanStack Query (client) + Supabase SSR/ISR (server)  
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
- [tailwind.config.ts]
- [vite.config.ts] / [eslint.config.js] – Tooling  

## 2. Objectives & Deliverables for GenCode AI

1. **Performance & Security**  
   - Always use Vite RSC/SSR/ISR for data-critical pages.  
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
   - Optional but important to follow: using only shadcn/ui primitives—absolutely no cmdk/Command aiming for small bundle size and no large scale needed.

5. **State Management & Data Fetching**  
   - Hooks in `hooks/` using TanStack Query; use Supabase realtime for cache invalidation.  
   - Avoid `useEffect` where RSC or fetchers suffice.  

6. **Error Handling & Auth**  
   - Centralize error types; throw custom classes in RPC/edge fn.  
   - Early auth/permission checks in middleware or RSC.  

7. **Testing & Documentation**  
   - Write test, then write function, then test the function until it passes, then write documentation.
   - Jest + React Testing Library unit tests for every component & hook.  
   - Add concise JSDoc for complex logic; comments explain “why,” not “what.”  

## 3. Recommended Next Steps
- Generate Zod schemas and migrations under `supabase/`.  
- Scaffold core pages:  
  - `/login`, `/dashboard`, `/work-orders`, `/inventory`, `/settings`.  
- Build shared components: Form fields, tables, modals.  
- Set up TanStack Query providers & Supabase auth wrapper in `_app.tsx`.  
- Configure CI to run lint, typecheck, tests, and deploy previews.

---

*Use this doc as the single source‑of‑truth “prompt” for GenCode AI when expanding or generating new features.*