# GoWappily Lead Management System — Frontend

Next.js (App Router) frontend for the GoWappily lead tracking tool, built as a fully **static export** per the deployment constraint in the prompt. Data comes from the Express backend described in `01-API-CONTRACT.md`.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

By default the app runs in **mock mode** (`NEXT_PUBLIC_USE_MOCK_API=true` in `.env.local`) so you can preview the whole UI — dashboard, leads, sources, notifications, users — without a backend running. Log in with any email/password.

## Wiring to the real backend

Edit `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_MOCK_API=false
```

Every API call goes through the single typed client at `src/lib/api-client.ts` — it mirrors the contract's endpoints exactly (paths, methods, bodies, response shapes) and is the only place that needs to change if the contract does.

## Static export build

```bash
npm run build      # outputs to /out, using next.config.mjs (output: "export")
```

`npm run build` produces a static `out/` directory you can host on any static file host (S3, Netlify, Nginx, etc.) — there are no Next.js API routes and no server-side data fetching. Every page fetches its data client-side after mount.

## Routing note (static export)

Because static export can't generate dynamic segments like `/leads/[id]`, detail pages use flat routes with the id passed via query string, read with `useSearchParams()` inside a `<Suspense>` boundary:

- `/leads/detail/?id=<leadId>`
- `/sources/detail/?id=<sourceId>`

## Structure

```
src/
  app/                 routes (login, dashboard, leads, sources, notifications, users)
  components/ui/       Badge, Button, Input, Select, Modal, Skeleton, EmptyState
  components/layout/   Sidebar, Header (notifications bell), AppShell (auth guard), MobileNav
  hooks/useAuth.tsx     auth context, JWT stored in localStorage
  hooks/useToast.tsx    toast notifications for mutations
  lib/types.ts          types mirroring the API contract
  lib/api-client.ts     single typed API client (real + mock implementations)
  lib/mock-data.ts      seed data used when NEXT_PUBLIC_USE_MOCK_API=true
```

## Features implemented

- Login (JWT in localStorage) + route guard redirecting unauthenticated users
- Dashboard: stat cards, status/tag/source breakdowns, 14-day trend, "needs attention" panel (missed/due follow-ups + failed source syncs)
- Leads list: server-side pagination/sorting, filters (status, priority, source, tag, agent, search), tag chips, Add Lead modal
- Lead detail: inline status/priority edit, notes, follow-ups (add/mark done/delete), editable remarks/next action/tags
- Sources: card list with sync status, Sync Now, two-step Add Source flow (paste sheet URL → auto-detected column mapping with sample-row preview → submit), Source detail with pause/resume, editable mapping, delete (with "leads stay" warning)
- Notifications: bell dropdown + full page, all three types, mark-read, deep links
- Users (admin-only) CRUD
- Loading skeletons, empty states, toasts on every mutation, contract's field-level validation error format
