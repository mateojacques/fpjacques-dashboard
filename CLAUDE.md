# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` holds the full coding conventions (component/API/query/form patterns, import order, file naming, commit format), the API endpoint reference and the import tools pipeline. Follow it. If it ever disagrees with the code, the code wins; update AGENTS.md when that happens.

## Commands

```bash
npm run dev         # Vite dev server on :5173 (opens browser)
npm run build       # tsc -b && vite build. Type errors fail the build
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint 9 flat config (eslint.config.js)
npm run lint:fix
npx shadcn@latest add <component>   # adds to src/components/ui/
```

There is no test runner or test suite. To verify a change, run `npm run typecheck` and `npm run lint`. `tsconfig.app.json` turns on `strict`, `noUnusedLocals` and `noUnusedParameters`. Unused vars or args fail unless they are prefixed with `_`.

The backend is a separate REST API (`VITE_API_URL`, default `http://localhost:3000`). Swagger docs are at `/api/docs`. The UI is all in Spanish (labels, toasts, validation messages), and numbers use the `es-AR` locale.

## Architecture

- **Entry flow:** `main.tsx` → `app/App.tsx` → `app/providers.tsx` → `app/routes.tsx`. The providers are QueryClient, BrowserRouter, TooltipProvider and Sonner `Toaster`. QueryClient defaults are a 5-minute `staleTime`, 1 retry, no retry on 401, and no refetch on window focus.
- **Routing:** `routes.tsx` holds every route. `ProtectedRoute` wraps `MainLayout` (and all its nested pages), and `PublicRoute` wraps `/login`. Sidebar entries come from `components/layout/navigation.ts`, not from `Sidebar.tsx`. Tool routes use Spanish paths under `/herramientas/...` and are listed in the `ROUTES` constant (`lib/constants.ts`). Products are labelled "Catálogo" (`/products`) and the publication review is "Estado de publicación" (`/publicacion`; `/catalogo` redirects there). The retired CSV import, DBF→CSV and tools index routes redirect to the 1-click import.
- **Feature modules:** each `src/features/<name>/` has `api/<name>.api.ts` (an object of axios calls), `api/<name>.queries.ts` (a query-key factory plus `useQuery`/`useMutation` hooks that invalidate keys), `components/`, `pages/` and `types.ts`. The Zod schemas live centrally in `src/lib/validations/`, not inside the features. Features: auth, dashboard (metrics), products, categories, carousels, orders, storefront-config, content (FAQ/Terms), tools, branding (logo + panel theme).
- **Auth:** the token is stored twice, in `localStorage['token']` (read by the axios request interceptor) and in the Zustand persisted store `auth-storage` (`features/auth/store.ts`). Keep them in sync through the store's `login`/`logout`/`setToken`, and never write `localStorage` directly. On a 401, the axios response interceptor (`lib/axios.ts`) calls `useAuthStore.getState().logout()` and then `window.location.replace('/login')`, skipping the redirect if already on `/login`. This guards against a redirect loop that was fixed earlier. Use `hooks/useAuth.ts` in components; it adds `isAdmin`/`isOwner`.
- **API response shapes:** single items come back as `{ data: T }`. Paginated list shapes **differ per endpoint**: products return `{ data: [], total, page, limit, totalPages }`, orders return `{ data: [], meta: {...} }`, and imports return `{ data: { items, ... } }`. Check the feature's `types.ts`. `PaginatedResponse` in `types/api.ts` is unused.
- **Storefront config API:** it strips `null`/`undefined` values before sending (`removeNullValues*` in `storefront-config.api.ts`) because the backend rejects nulls in PATCH bodies. Section updates are `PATCH /api/storefront/config/<section>` (branding, colors, banners, faq, contact, seo, legal). The FAQ and Terms pages in `features/content` also go through this config.
- **Tools / import pipeline:**
  - This repo has no DBF parsing. All DBF knowledge (reader, field mapping, CSV format) lives in `sanpablo-api-v2/src/modules/imports/dbf/`.
  - The 1-click import (`OneClickImporter.tsx`) uploads the dropped `.dbf` (100MB max) as-is to `POST /api/imports/dbf`, which converts it and creates a CSV import job. `useImportJob` then polls every 2s while the job status is `pending`/`processing`.
  - `GET /api/imports/:id/file` serves the file a job imported; the "Archivo importado" panel fetches it on demand.
  - Bulk image updates upload a JSON file to `POST /api/imports/bulk-images`. The default payload is imported from `src/product-images/*.json`.
- **Tables:** there is no generic `DataTable`. Each feature has its own table component (e.g. `ProductsTable.tsx`) built on `components/ui/table` plus `common/Pagination.tsx`, with filters and pagination kept in the URL via `useSearchParams`.
- **Branding and panel theme (`features/branding/`):** the sidebar/login logo is the store's own `branding.headerLogoUrl` (`footerLogoUrl` on dark surfaces), with the store name as a wordmark fallback, never an icon. `PanelThemeSync` (mounted in `providers.tsx`) derives every color token from the store palette (`buildTheme` in `theme.ts`, OKLCH with contrast checks) and writes them on `<html>`. Per-device preferences (light/dark/system, which store color drives the panel, neutral or brand sidebar) live in the persisted Zustand store `panel-theme`, which also caches the last branding to avoid a flash on load. The values in `globals.css` are only the first-paint fallback, generated from `buildTheme`.
- **Deploy:** `public/_redirects` sends `/* → /index.html 200` (SPA fallback for Netlify/Cloudflare Pages style hosting).
