# Legal Assistant Admin Dashboard

Administrative UI for the Legal Assistant platform: manage users, subscriptions & plans, roles, usage analytics, and review user activity (chat, analyses, cases, documents, forms, token logs) plus security audit events.

## ✅ Current Status (Implemented)
Core Platform:
- React 18 + TypeScript + Vite + Tailwind CSS.
- Central `AuthContext` (JWT login via `/auth/jwt/login`).
- Role gate (superuser or `admin`), enforced server-side.
- Global toast notification system (success / error / info / warning) via `ToastContext` + portal.

Plans & Subscriptions:
- Dynamic Plan CRUD UI (create, edit, delete) with portal modal + body scroll lock.
- Auto‑materializes static catalog entries on first edit; merged static + dynamic catalog (prevents disappearing defaults).
- Full marketing + quota fields: key, name, tagline, price, quotas (API calls / tokens), trial days, feature flags.
- Bilingual metadata fields (EN / AR) for name, tagline, description with per‑field fallbacks.
- Feature flag toggles with visual state; persisted via backend PATCH.

Dashboard & Metrics:
- Summary metrics cards (total users, active 24h, tokens 24h, API calls 24h, plan counts) polling every 60s.
- Quick navigation to plan management.

User Management:
- Users list with search (email or id substring) & limit controls.
- Detail page with tabs: Profile, Usage Summary, Token Logs, Chat History, Analyses, Cases, Documents, Forms, Plan & Features, Roles, (plus early Audit exposure where linked).
- Inline plan assignment + per‑user feature override editor.
- Roles editing (comma separated) persisted via `/admin/users/{id}/roles`.

Usage & Analytics:
- Global usage charts (bar / distribution / daily trends) using Recharts.
- Per‑user 30‑day aggregation (token classes + calls) with totals.
- Token logs viewer with filters (days, service, limit) newest first.

Activity History:
- Chat sessions (status, message count, last activity) + expandable messages with adjustable limit.
- Analyses list (snippet + metadata).
- Cases list (type, status, timestamps).
- Documents list (file name, type, size KB, uploaded timestamp).
- Forms list (title, form type, case linkage).

Audit & Security:
- Audit Logs page with filtering (actor, action, days, limit) & pagination offset.
- CSV / JSON export of audit events (graceful 404 handling if backend not yet deployed).

Data Export Utilities:
- Reusable CSV / JSON export helpers (`exportUtils.ts`).
- Integrated export buttons on Audit Logs (extensible to other tables).

UI/UX Enhancements:
- Reusable `<DataTable />` with client‑side sorting, skeleton loaders, zebra stripes, sticky header.
- Reusable `<Card />` for plan & dashboard metrics display.
- Loading skeletons for plans grid & tables.
- Portal modal with high z‑index and animation to avoid stacking issues.

Developer Tooling:
- Centralized Axios API client (auto auth header + 401 redirect).
- React Query for cache + param keying.
- Strict TypeScript build (passing).

Internationalization (Plans):
- EN/AR fields for name, tagline, description stored and surfaced in API responses.
- Frontend inputs for bilingual fields (with RTL input styling for Arabic).

## 🧱 Project Structure (front-end)
Key dirs:
- `src/context` – `AuthContext`, `ToastContext`.
- `src/lib/apiClient.ts` – API layer (admin endpoints) & `exportUtils.ts`.
- `src/components/ui` – shared UI (`Card`, `DataTable`).
- `src/pages/dashboard` – summary metrics.
- `src/pages/plans` – dynamic plan management (`PlansPage.tsx`).
- `src/pages/audit` – audit log viewer.
- `src/pages/users` – user list & detail tabs.
- `src/pages/analytics` – usage charts.

## 🚀 Getting Started
Install dependencies:
```bash
npm install
```
Run development server:
```bash
npm run dev
```
Environment variable (optional):
```
VITE_API_BASE=http://localhost:8000
```
Ensure backend is running with the admin routes enabled and your operator account promoted (see `scripts/make_admin.py` in backend project).

## 🔐 Authentication & Roles
1. Login with existing user credentials (must be active).
2. Promote a user to admin: run the backend promotion script to set `is_superuser` or add `admin` to `roles`.
3. Frontend stores token in `localStorage` under `admin_token`.

## 🖥️ UI / UX Principles
- Compact data-first tables (zebra, hover, sticky headers).
- Progressive disclosure (summary cards → detailed tabs).
- Skeleton loaders & subtle loading indicators instead of spinners.
- Toast feedback for mutations & error states.
- Accessible color contrasts & semantic badges.

## 🗺️ Roadmap / Next Steps
High Priority:
1. Extend CSV / JSON export to: token logs, per-user usage summary, chat transcripts, analyses, documents, forms.
2. Add pagination (offset + prev/next) to all history tabs (parity with audit logs implementation style).
3. Input validation & constraints for plan modal (price pattern, min/max quotas, feature key whitelist enforcement).
4. Language preview toggle (switch between EN/AR preview in plan cards) & potential feature name localization.
5. Global error boundary + fallback UI.

Medium Priority:
6. Advanced filters (date range, status, type filters across history tabs).
7. Drill-down modals (full analysis text, document metadata preview, full chat thread search & scroll).
8. Global cross-entity search (users / sessions / analyses / documents).
9. Dark mode & theme token system.
10. Caching layer or SWR for static/rarely changing data (plan catalog) to reduce network chatter.

Lower Priority / Enhancements:
11. Bulk operations (mass role assignment / plan upgrade).
12. Tagging system (cases, sessions) + filtering by tags.
13. Session analytics mini charts (messages/day, tokens/session distribution).
14. Soft delete + restore flows with audit entries.
15. Optimistic UI for role / feature edits & inline validation hints.

Technical Hygiene / DX:
16. Generate TypeScript types from backend OpenAPI (reduce `any`).
17. Add ESLint + Prettier + CI (format + type + test pipeline).
18. Add test coverage (auth flow, plan CRUD, export utilities) via Vitest & React Testing Library.
19. Env config hardening (production build flags, security headers guidance).
20. Bundle analysis & performance budgets (e.g. `rollup-plugin-visualizer`).

## 📦 Deployment Notes
- Enforce Node >= 18.18 (already specified in `engines`).
- Set `VITE_API_BASE` at build-time for production environment.
- Serve via a static host (Vite build outputs to `dist/`).

## 🧩 Extensibility Hooks
- Adding a new admin endpoint: add API method → create page/tab → leverage `DataTable` / export utilities.
- Feature flags & plan fields are easily extendable; backend merge strategy isolates static vs dynamic concerns.
- Toast system pluggable for future mutation handlers.

## 🛠 Quick Wins (Suggested Near-Term Sequence)
1. Export support to remaining data tables (reuse `exportUtils`).
2. Add validation layer to Plan form (user feedback inline + disabled submit until clean).
3. Pagination reuse (abstract offset/limit state hook) across history tabs.
4. OpenAPI type generation & replacing loose typings.
5. Dark mode implementation.

## 🤝 Contribution Guidelines (Draft)
- Keep components focused; colocate minor hooks.
- Prefer React Query over custom fetch state logic.
- Use semantic naming for query keys: `['user', id, 'analyses']`.
- Avoid premature abstraction; extract only after 2–3 duplications.

---
This README reflects the current implementation snapshot (including dynamic bilingual plan management, dashboard metrics, audit logs, exports, and toast notifications) and an updated roadmap toward production readiness.

