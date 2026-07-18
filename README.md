# Lang App

AI-powered English Grammar Test Platform.

## Stack

- **Monorepo:** Turborepo + pnpm
- **Backend:** NestJS (apps/api)
- **Frontend:** Next.js 16 (apps/web)
- **Database:** PostgreSQL 16 + Prisma ORM v6
- **Auth:** Better Auth v1 (self-hosted in NestJS)
- **UI:** Tailwind CSS 4 + shadcn/ui

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm
- Docker (for PostgreSQL)

### Setup

```sh
# Install dependencies
pnpm install

# Start PostgreSQL
pnpm db:up

# Generate Prisma client + run migration + seed
pnpm --filter api db:migrate

# Start both API + Frontend dev servers
pnpm dev
```

`pnpm dev` starts both servers in parallel:
- **API:** `http://localhost:3001`
- **Frontend:** `http://localhost:3000`

Frontend API calls to `/api/*` are proxied to the backend via Next.js rewrites.

### Default Admin

```
Email:    admin@langapp.com
Password: admin123
```

## API Endpoints (Phase 3)

All endpoints are prefixed with `/api`. Responses are wrapped in `{ success: true, data: ... }` or `{ success: false, error: ... }`.

### Health

```
GET /api/health
```

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/signup` | Create account + set session cookie |
| POST | `/api/signin` | Sign in + set session cookie |
| POST | `/api/signout` | Sign out + clear session cookie |
| GET | `/api/session` | Get current user + session from cookie |

**Signup body:** `{ email, password, name? }`
**Signin body:** `{ email, password }`

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | Admin | List users (paginated, searchable) |
| GET | `/api/users/me` | User | Get current user profile |
| PATCH | `/api/users/me` | User | Update own profile (name) |
| GET | `/api/users/:id` | Admin | Get user by ID |
| DELETE | `/api/users/:id` | Admin | Delete user |

## Auth Architecture

Better Auth runs inside NestJS (not as a separate server). Auth actions (signup, signin) use Better Auth's internal API methods which handle password hashing and session creation in the database. Session validation uses direct Prisma queries on the `session` table.

### Backend

- `apps/api/src/auth/better-auth.ts` — Better Auth config (Prisma adapter, email/password)
- `apps/api/src/auth/auth.controller.ts` — Auth routes (signup, signin, signout, session)
- `apps/api/src/auth/session.middleware.ts` — Middleware that sets `req.user` from session cookie
- `apps/api/src/auth/auth.module.ts` — Module wiring
- `apps/api/src/prisma/` — Prisma service and module (global singleton)
- `apps/api/prisma/seed.ts` — Seeds admin user + default AI provider

### Frontend

Auth state is managed via Redux Toolkit + RTK Query:

| File | Purpose |
|------|---------|
| `lib/store.ts` | Redux store config |
| `lib/hooks.ts` | Typed dispatch/selector hooks |
| `lib/redux-provider.tsx` | Client-side Redux Provider (root layout) |
| `lib/features/auth-api-slice.ts` | RTK Query mutations/queries for auth |
| `lib/features/auth-slice.ts` | Client auth state slice |
| `components/auth/session-provider.tsx` | Restores session on page refresh |
| `components/auth/auth-guard.tsx` | Protects routes — redirects to /login |
| `components/auth/admin-guard.tsx` | Protects admin routes — checks role |

### Flow

1. User submits login/register form (react-hook-form + zod validation)
2. API call returns user → dispatched to Redux store immediately
3. Client-side redirect to role-based dashboard (`/dashboard` or `/admin`)
4. On page refresh: `SessionProvider` fetches `GET /api/session` to restore auth state
5. `AuthGuard`/`AdminGuard` check Redux store and redirect if unauthorized

## Environment

### Backend (`apps/api/.env`)

```
DATABASE_URL=postgresql://langapp:langapp@localhost:5433/langapp
BETTER_AUTH_SECRET=change-me-to-a-random-string-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3001
PORT=3001
```

API calls from the frontend are proxied via Next.js rewrites (`apps/web/next.config.js`), so no frontend `.env` is needed for development.

## Database

PostgreSQL runs on port 5433 (mapped from 5432 inside container). Prisma v6.19.3.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm db:up` | Start PostgreSQL |
| `pnpm db:down` | Stop PostgreSQL |
| `pnpm db:reset` | Destroy + restart PostgreSQL (loses all data) |
| `pnpm --filter api db:migrate` | Run pending Prisma migrations + seed |
| `pnpm --filter api db:generate` | Regenerate Prisma client |
| `pnpm --filter api db:studio` | Open Prisma Studio
