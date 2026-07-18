# MVP Implementation Plan

> AI English Grammar Test Platform — Tracking document for phased delivery.

---

## Architecture

| Layer | Stack |
|-------|-------|
| **Backend** | NestJS 11 (Express) — port 3001 |
| **Frontend** | Next.js 16 (App Router) — port 3000 |
| **Database** | PostgreSQL (Docker Compose) + Prisma ORM |
| **Auth** | Better Auth (self-hosted, integrated in NestJS) |
| **State/API** | Redux Toolkit + RTK Query |
| **AI** | Provider abstraction → OpenRouter first |
| **UI** | Tailwind CSS 4 + shadcn/ui + Lucide React |
| **Monorepo** | Turborepo + pnpm workspaces |

---

## Phases

### Phase 1: Foundation — Infrastructure & Database ❏

- [ ] Docker Compose for PostgreSQL
- [ ] Prisma schema (users, lessons, exams, questions, ai_providers, provider_models)
- [ ] Prisma migration & seed setup
- [ ] NestJS module structure (auth, users, lessons, ai, ai-providers, exams, results, common)
- [ ] Prisma service (singleton module)

### Phase 2: Authentication & User Backend ❏

- [ ] Better Auth integration into NestJS
- [ ] Auth endpoints: register, login, logout, session
- [ ] Auth guards, decorators, session validation
- [ ] Users CRUD API (admin)
- [ ] Seed admin user

### Phase 3: Frontend Auth & Layout ❏

- [ ] Install Redux Toolkit + RTK Query
- [ ] Create API base query + store configuration
- [ ] Auth API slice (login, register, logout, session)
- [ ] Auth context/provider with Redux
- [ ] Wire Login page
- [ ] Wire Register page
- [ ] Protected route guards (layout-level)
- [ ] Wire Profile page
- [ ] Logout flow

### Phase 4: AI Provider System ❏

- [ ] AI provider abstraction interface
- [ ] OpenRouter provider implementation
- [ ] AI providers CRUD API
- [ ] Model fetching from OpenRouter API
- [ ] Test connection endpoint
- [ ] Admin AI Provider page (wire to API)
- [ ] Model selector with enable/disable
- [ ] AI providers API slice (RTK Query)

### Phase 5: Lessons & Exam Generation ❏

- [ ] Lessons CRUD API
- [ ] Lesson seed data mechanism
- [ ] Exam generation prompt (based on lessons, 5 question types)
- [ ] POST /exams endpoint (generation + persistence)
- [ ] Ensure uniqueness across generated exams

### Phase 6: Exam Taking & Correction ❏

- [ ] GET /exams/:id/current-question
- [ ] POST /exams/:id/answers
- [ ] Instant correction mode (AI evaluates per answer)
- [ ] Final review mode (evaluate at complete)
- [ ] POST /exams/:id/complete (score, recommendations)
- [ ] Exam API slice (RTK Query)
- [ ] Wire Test page (one question at a time, progress, nav)
- [ ] Correction mode switching

### Phase 7: Results & Dashboard ❏

- [ ] GET /exams/:id/result (full detail)
- [ ] GET /exams (history with pagination)
- [ ] GET /dashboard/stats
- [ ] Dashboard API slice (RTK Query)
- [ ] Wire Dashboard page (real stats, recent results)
- [ ] Wire Results History page
- [ ] Wire Result Detail page (answers, explanations, recommendations)

### Phase 8: Admin Area Completion ❏

- [ ] Admin Dashboard (real stats)
- [ ] Admin Users (real API, search, delete)
- [ ] Admin AI Provider (real CRUD, model selection, test)
- [ ] Admin-only role guard
- [ ] Admin API slices (RTK Query)

### Phase 9: Hardening & Polish ❏

- [ ] Empty states for all list pages
- [ ] Skeleton loading states
- [ ] Error boundaries + toast notifications
- [ ] Graceful API error handling
- [ ] Frontend form validation
- [ ] Consistent spacing/layout audit
- [ ] Responsive check (desktop, tablet, mobile)
- [ ] Remove all mock data and dead code

---

## Database Schema (MVP)

```
User
  id          String @id @default(uuid())
  name        String
  email       String @unique
  passwordHash String
  role        String @default("user") // user | admin
  createdAt   DateTime
  exams       Exam[]

Lesson
  id          String @id @default(uuid())
  title       String
  content     String
  topic       String
  createdAt   DateTime

Exam
  id            String @id @default(uuid())
  userId        String
  user          User @relation
  questionCount Int
  correctionMode String // instant | final
  status        String @default("in_progress") // in_progress | completed
  score         Int?
  createdAt     DateTime
  completedAt   DateTime?
  questions     Question[]

Question
  id            String @id @default(uuid())
  examId         String
  exam           Exam @relation
  type          String // multiple_choice | fill_blank | error_correction | sentence_creation | scenario
  content       Json
  userAnswer    Json?
  correctAnswer String?
  isCorrect     Boolean?
  explanation   String?
  order         Int
  lessonTopic   String?

AiProvider
  id           String @id @default(uuid())
  name         String
  providerType String @default("openrouter")
  apiKey       String
  baseUrl      String?
  isActive     Boolean @default(false)
  defaultModel String?
  models       ProviderModel[]

ProviderModel
  id          String @id @default(uuid())
  providerId  String
  provider    AiProvider @relation
  modelId     String
  modelName   String
  isEnabled   Boolean @default(false)
```

---

## Module Structure (NestJS)

```
apps/api/src/
├── auth/              # Better Auth config, guards, decorators
├── users/             # User controller, service, DTOs
├── lessons/           # Lessons controller, service
├── ai/                # AI abstraction (interface + OpenRouter impl)
├── ai-providers/      # Provider config CRUD, model management
├── exams/             # Exam generation, question flow, submission
├── results/           # Scoring, correction, recommendations
├── prisma/            # Prisma service module
└── common/            # Shared pipes, filters, interceptors, DTOs
```

---

## API Endpoints

**Auth** (Better Auth routes)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/session

**Users**
- GET /api/users — admin list
- GET /api/users/:id
- PATCH /api/users/:id
- DELETE /api/users/:id (admin)

**Lessons**
- GET /api/lessons — list all
- GET /api/lessons/:id
- POST /api/lessons (admin)
- PATCH /api/lessons/:id (admin)
- DELETE /api/lessons/:id (admin)

**AI Providers**
- GET /api/ai-providers
- POST /api/ai-providers
- GET /api/ai-providers/:id
- PATCH /api/ai-providers/:id
- DELETE /api/ai-providers/:id
- POST /api/ai-providers/test-connection
- GET /api/ai-providers/:id/models
- PATCH /api/ai-providers/:id/models

**Exams**
- POST /api/exams — create
- GET /api/exams — user's list
- GET /api/exams/:id
- GET /api/exams/:id/current-question
- POST /api/exams/:id/answers
- PATCH /api/exams/:id/mode — switch correction mode
- POST /api/exams/:id/complete

**Results**
- GET /api/results — user's results (with stats)
- GET /api/results/:examId — detailed result

**Dashboard**
- GET /api/dashboard/stats — user stats
- GET /api/admin/stats — admin stats

---

## Frontend Route Map

```
/                       → Landing (public)
/login                  → Login (public)
/register               → Register (public)

/dashboard              → User Dashboard (auth)
/dashboard/new-test     → Configure & Start Exam (auth)
/dashboard/test/[id]    → Take Exam (auth)
/dashboard/results      → Results History (auth)
/dashboard/results/[id] → Result Detail (auth)
/dashboard/profile      → Profile (auth)

/admin                  → Admin Dashboard (admin)
/admin/users            → Users Management (admin)
/admin/ai-provider      → AI Provider Settings (admin)
```

---

## RTK Query Slices

- authApi — register, login, logout, session
- usersApi — list, get, update, delete
- lessonsApi — list, get, create, update, delete
- aiProvidersApi — CRUD, test, models
- examsApi — create, list, get, current question, submit answer, complete, switch mode
- resultsApi — list, get detail, stats

---

## Success Criteria

The MVP is complete when:

1. A learner can sign up, log in, start an exam, answer questions one by one, receive AI correction (instant or at end), and review their score with explanations.
2. An admin can view users, configure the AI provider, manage API keys, select models, and see platform stats.
3. Every exam is unique and generated from approved lessons only.
4. No dead code, no mock data, no broken states.
