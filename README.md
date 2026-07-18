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
docker compose up -d

# Generate Prisma client
cd apps/api && npx prisma generate

# Push schema and seed
npx prisma db push && npx prisma db seed

# Start API dev server
cd apps/api && npx nest start --watch
```

### Default Admin

```
Email:    admin@langapp.com
Password: admin123
```

## API Endpoints (Phase 2)

All endpoints are prefixed with `/api`.

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
| GET | `/api/users/:id` | User | Get user by ID |
| DELETE | `/api/users/:id` | Admin | Delete user |

All responses are wrapped in `{ success: true, data: ... }` or `{ success: false, error: ... }`.

## Auth Architecture

Better Auth runs inside NestJS (not as a separate server). Auth actions (signup, signin) use Better Auth's internal API methods (`signUpEmail`, `signInEmail`) which handle password hashing and session creation in the database. Session validation uses direct Prisma queries on the `session` table rather than Better Auth's signed-cookie verification, avoiding compatibility issues with NestJS/Express.

### Key files

- `apps/api/src/auth/better-auth.ts` — Better Auth config (Prisma adapter, email/password)
- `apps/api/src/auth/auth.controller.ts` — Auth routes (signup, signin, signout, session)
- `apps/api/src/auth/session.middleware.ts` — Middleware that sets `req.user` from session cookie
- `apps/api/src/auth/auth.module.ts` — Module wiring
- `apps/api/src/prisma/` — Prisma service and module (global singleton)
- `apps/api/prisma/seed.ts` — Seeds admin user via Better Auth API + default AI provider

## Environment

Copy `apps/api/.env` with:

```
DATABASE_URL=postgresql://langapp:langapp@localhost:5433/langapp
BETTER_AUTH_SECRET=change-me-to-a-random-string-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3001
PORT=3001
```

## Database

PostgreSQL runs on port 5433 (mapped from 5432 inside container). Prisma v6.19.3 is used (v7 requires a config format incompatible with NestJS).
