# Legal Assistant Admin Dashboard

Central administrative interface for the Legal Assistant platform: manage users, subscriptions, roles, usage analytics, and review user activity (chat, analyses, cases, documents, forms, token logs).

## ✅ Current Status (Implemented)
Core Platform:
- Modern stack: React 18 + TypeScript + Vite + Tailwind CSS.
- Central `AuthContext` with JWT login against backend (`/auth/jwt/login`).
- Role-based access (requires superuser or `admin` role; backend enforces via `ensure_admin`).

User Management:
- Users list with search (email or id substring) & pagination controls.
- User detail page with tabbed layout (Profile, Usage Summary, Token Logs, Chat History, Analyses, Cases, Documents, Forms, Plan & Features, Roles).
- Inline plan selection + feature flag override editor (reads plan catalog from `/admin/plans`).
- Roles editor (comma separated, persists via PATCH to `/admin/users/{id}/roles`).

Usage & Analytics:
- Global usage charts (per-service bar, distribution pie, daily token trends) using Recharts.
- Per-user 30‑day usage aggregation (token class + calls) with totals.
- Token logs viewer (filter by days, service, limit) sorted newest first.

User Activity History:
- Chat sessions table (status, message count, last activity) with expandable message viewer & adjustable message limit.
- Analyses list (snippet, case id, timestamp).
- Cases list (type, status, timestamps).
- Documents list (file name, type, size KB, uploaded timestamp).
- Forms list (title, form type, case linkage).

Backend Admin API Coverage (consumed):
- Plans: `GET /admin/plans`
- Users: list/detail/plan/features/roles updates
- Usage: per-user summary & logs, global by-service & daily
- History: chat sessions, chat messages, analyses, cases, documents, forms

Developer Tooling:
- Centralized Axios API client with auth interceptor + auto redirect on 401.
- React Query caching keyed per tab/state (supports refetch + param changes).
- TypeScript 5 strict build (tsc passes).

## 🧱 Project Structure (front-end)
Key dirs:
- `src/context` – authentication context
- `src/lib/apiClient.ts` – lightweight hand-written API client methods
- `src/pages` – route-level components (users, analytics, auth)
- `src/pages/users/UserDetailPage.tsx` – multi-tab detail hub
- `src/pages/analytics/UsageAnalyticsPage.tsx` – global charts

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

## 🖥️ UI / UX Principles Implemented
- Consistent compact tables with zebra/hover & sticky headers where useful.
- Low-noise, data-first layouts (emphasis on time, counts, status badges).
- Incremental loading & refetch indicators (lightweight status badges).
- Separation of summary (aggregates) vs detail (logs/history) via tabs.

## 🗺️ Remaining Roadmap
High Priority:
1. Pagination (offset/next/prev) controls for history tabs (currently limit only).
2. CSV / JSON export for: token logs, usage summaries, chat transcripts, analyses, documents listing.
3. Per-user visualizations (mini charts on Usage and maybe Chat activity timeline).
4. Toast notification system (success/error) & global error boundary.
5. Loading skeleton components (improve perceived performance).

Medium Priority:
6. Advanced filters (date range pickers, status filters, case type, file type).
7. Drill-down modals (full analysis text, document metadata preview, full chat thread with scroll & search).
8. Audit Logs module (backend model + endpoints + UI viewer) – not yet started.
9. Global search across users / sessions / analyses.
10. Dark mode toggle + theming tokens.

Lower Priority / Enhancements:
11. Bulk operations (plan upgrade, role assignment to multiple users).
12. Tagging / labeling system for cases or sessions.
13. Session metrics charts (messages/day, average tokens per call).
14. Access revocation / soft delete flows.
15. Optimistic updates & inline validation for forms.

Technical Hygiene / DX:
16. Generate TypeScript types from backend OpenAPI spec (replace `any`).
17. Add ESLint + Prettier config and CI check.
18. Add Vitest / React Testing Library for critical components (auth flow, analytics charts).
19. Implement environment-based config & safe defaults for production build.
20. Bundle analysis & performance budgets.

## 📦 Deployment Notes
- Enforce Node >= 18.18 (already specified in `engines`).
- Set `VITE_API_BASE` at build-time for production environment.
- Serve via a static host (Vite build outputs to `dist/`).

## 🧩 Extensibility Hooks
- API methods are modular; adding a new admin endpoint requires only one addition in `apiClient.ts` and a tab/component.
- Tables can be abstracted later into a reusable `<DataTable />` with sorting & export.

## 🛠 Quick Dev Tasks (Suggested Order)
1. Add pagination state (offset + next/prev) for history tables.
2. Introduce toast system (simple context + portal) and wrap mutations.
3. Export helpers (convert arrays to CSV, trigger download).
4. Add OpenAPI types generation (e.g. `openapi-typescript`) and refactor API responses.
5. Add dark mode (class-based toggle + Tailwind `dark:` variants).

## 🤝 Contribution Guidelines (Draft)
- Keep components focused; colocate minor hooks.
- Prefer React Query over custom fetch state logic.
- Use semantic naming for query keys: `['user', id, 'analyses']`.
- Avoid premature abstraction; extract only after 2–3 duplications.

---
This README reflects the current implementation snapshot and an actionable roadmap to reach a polished, production-ready admin experience.

