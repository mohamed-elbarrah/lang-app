# Backend Refactoring & AI Efficiency Plan

## Overview

Complete refactoring of the lang-app backend addressing all 23 findings from the architecture report, with special focus on AI efficiency, security, and scalability.

## Phases Executed

### Phase 1: Security & Correctness

#### 1.1 Prisma Schema Hardening

**Files:** `apps/api/prisma/schema.prisma`

- Added Prisma enums: `UserRole`, `ExamStatus`, `CorrectionMode`, `QuestionType`, `QuestionBankStatus`
- Added database indexes: `session.userId`, `session.expiresAt`, `Exam.userId`, `Exam.status`, `Exam.completedAt`, `Question.examId`, `QuestionBankItem.lessonId`, `ProviderModel.providerId`
- Added compound unique constraints: `ProviderModel(providerId, modelId)`
- Added new tables: `QuestionBankItem`, `ExamGenerationRequest`, `AnswerEvaluation`
- Added `Question.answerKey` JSON field for separate answer key storage
- Changed string-based status fields to proper enums

#### 1.2 DTOs & Validation

**New files:** `apps/api/src/common/dto/`

All endpoint inputs now use class-validator decorated DTOs:

| DTO | Endpoint |
|-----|----------|
| `SignUpDto` | POST /signup |
| `SignInDto` | POST /signin |
| `CreateExamDto` | POST /exams |
| `SubmitAnswerDto` | POST /exams/:id/answers |
| `UpdateExamModeDto` | PATCH /exams/:id/mode |
| `CreateAiProviderDto` | POST /ai-providers |
| `UpdateAiProviderDto` | PATCH /ai-providers/:id |
| `TestConnectionDto` | POST /ai-providers/test-connection |
| `UpdateProviderModelsDto` | PATCH /ai-providers/:id/models |
| `CreateLessonDto` | POST /lessons |
| `UpdateLessonDto` | PATCH /lessons/:id |
| `UpdateUserDto` | PATCH /users/me |

**Updated controllers:** exams, results, users, lessons, ai-providers — all use DTOs with `@Body()` and `@Query()` typed parameters. Global `ValidationPipe` now validates all inputs.

#### 1.3 Auth Hardening

**Files:** `apps/api/src/auth/auth.controller.ts`, `session.middleware.ts`

- Cookie security: Uses `res.cookie()` instead of `res.setHeader('Set-Cookie', ...)`
- Production-aware: `secure: true` when `NODE_ENV === 'production'`
- Centralized cookie options helper
- Session middleware: Logger added for database failures (no longer silent catch)

#### 1.4 AI Provider Security

**Files:** `apps/api/src/ai-providers/ai-providers.service.ts`

- API keys masked in all responses: first 4 chars + `****` + last 4
- Added `hasApiKey` boolean field to provider responses
- `create()` and `update()` now use Prisma transactions for atomic provider activation
- `delete()` cascade uses Prisma transactions
- `updateModels()` validates model ownership before updating

**Files:** `apps/api/src/ai/providers/openrouter.provider.ts`

- Error responses sanitized (no more raw upstream error text exposure)
- Server errors (5xx) mapped to generic message
- Client errors (4xx) mapped to generic message

### Phase 2: AI Question Contract & Performance

#### 2.1 AnswerKey Separation

**Files:** `apps/api/src/ai/providers/openrouter.provider.ts`

- Prompt updated: AI now returns `answerKey` as a separate field from `content`
- `content` contains only public question data (no correct answers)
- `answerKey` contains `correctAnswer` and is never returned to the client for in-progress exams

#### 2.2 Zod Validation for AI Output

**New file:** `apps/api/src/ai/ai-output.schema.ts`

- Zod schema validates every AI-generated question:
  - Allowed question types
  - Required fields per type
  - Content structure per type
  - Answer key format
  - Order values
  - Text length limits
- Invalid AI responses rejected with clear error message

**Files:** `apps/api/src/ai/ai.service.ts`

- `parseAndValidateQuestions()` uses Zod to validate AI output
- Returns typed `AiQuestionsResponse` instead of raw `any`

#### 2.3 Deterministic Answer Evaluation

**Files:** `apps/api/src/exams/exams.service.ts`

- Multiple choice: Direct string comparison
- Fill blank: Normalized comparison with pipe-delimited accepted answers (`answer1|answer2`)
- Error correction: Direct string comparison
- Sentence creation & scenario: AI evaluation (only these go to AI)
- This is the **biggest performance improvement** — most answers no longer wait for AI

#### 2.4 Atomic Answer Submission

- Uses `Prisma.question.updateMany()` with `{ userAnswer: { equals: Prisma.JsonNull } }` as WHERE clause
- Checks `updated.count === 0` to detect race conditions (already answered)
- Prevents concurrent submissions from overwriting each other

#### 2.5 Answer Key Protection

- `findById()`: Strips both `correctAnswer` and `answerKey` from in-progress exam questions
- `getCurrentQuestion()`: Strips both fields from returned question
- `submitAnswer()`: Strips both fields from next question response
- `complete()`: Strips `answerKey` from completed exam response (keeps `correctAnswer` for review)

### Phase 3: Question Bank & Deduplication

#### 3.1 Question Bank Table

**Schema:** `QuestionBankItem` model with:
- `lessonId` — links to source lesson
- `contentHash` — unique SHA-256 for deduplication
- `answerKey` — stored separately from content
- `explanation`, `difficulty`, `promptVersion`, `model`
- `status` — active, deprecated, archived

#### 3.2 Bank Lookup Before AI Generation

**Files:** `apps/api/src/exams/exams.service.ts`

- `findBankQuestions()` checks bank for reusable questions per lesson
- Distributes questions evenly across selected lessons
- Returns up to requested count

#### 3.3 Save Generated Questions to Bank

- `saveToBank()` stores every AI-generated question in the bank
- Uses `contentHash` unique constraint to prevent duplicates
- Silent catch on duplicate hash conflicts

#### 3.4 Deduplication Fingerprints

**Schema:** `ExamGenerationRequest` table with:
- `fingerprint` — unique hash of generation parameters
- `status` — pending, processing, ready, failed
- Used for preventing duplicate generation work

### Phase 4: Infrastructure & Observability

#### 4.1 Environment Validation

**New file:** `apps/api/src/config/env.config.ts`

- Zod schema validates all env vars on startup
- Required: `DATABASE_URL`, `NODE_ENV`
- Defaults: `PORT=3001`, `CORS_ORIGINS=http://localhost:3000`
- Fails fast with descriptive error message

#### 4.2 CORS Configuration

- CORS origins configured from `CORS_ORIGINS` env var (comma-separated)
- No longer hardcoded to `http://localhost:3000`

#### 4.3 Health Check

**Files:** `apps/api/src/app.controller.ts`

- `GET /health` now checks database connectivity via `SELECT 1`
- Returns `{ status, timestamp, database }` metadata

### Phase 5: Domain Cleanup

#### 5.1 Dashboard Optimization

**Files:** `apps/api/src/dashboard/dashboard.service.ts`

- Uses `_avg` and `_max` Prisma aggregates instead of loading all exam records
- Reduces memory usage and latency for users with many exams

#### 5.2 Transational Provider Operations

- Provider activation/deactivation uses Prisma `$transaction`
- Provider deletion cascades model deletion in a transaction
- Model updates validate ownership within the provider

#### 5.3 Repository Pattern Alignment

- Services use Prisma directly (no repository abstraction layer — appropriate for current scale)
- Response DTOs implicitly controlled by Prisma `select` objects

### Phase 6: Frontend Compatibility

**Files:** `apps/web/lib/features/ai-providers-api-slice.ts`

- `AiProvider.apiKey` changed to `string | null`
- Added `AiProvider.hasApiKey: boolean`

**Files:** `apps/web/app/admin/ai-provider/page.tsx`

- API key field no longer pre-filled with masked value
- Placeholder shows "Key configured (enter to replace)" when provider has a key
- Only sends `apiKey` in update payload when user explicitly types a new value
- Tracks `keyDirty` state to differentiate between unchanged and new key

## Remaining AI Efficiency Improvements

### Question Bank Warm-up

Add a background job (BullMQ) that generates question bank items when new lessons are added:
- `POST /lessons` → enqueue bank generation job
- Generates questions for all types and difficulties
- Stores in bank for immediate reuse

### Asynchronous Exam Generation

For a full non-blocking experience:
- `POST /exams` → returns `{ id, status: "generating" }` immediately
- Background job generates questions, creates exam
- Frontend polls `GET /exams/:id/status` or receives SSE/WebSocket
- When status is "ready", frontend navigates to exam

### Evaluation Cache

For open-ended answers that still need AI:
- `AnswerEvaluation` table stores evaluation by fingerprint
- Same answer from same question → cache hit (no AI call)
- Prevents re-evaluation on retry or double-submit

## File Change Summary

### Backend (apps/api)

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Enums, indexes, QuestionBankItem, ExamGenerationRequest, AnswerEvaluation |
| `src/exams/exams.service.ts` | Deterministic evaluation, atomic answers, question bank, answer key protection |
| `src/exams/exams.controller.ts` | DTO integration |
| `src/ai/ai.service.ts` | Zod validation for AI output |
| `src/ai/ai-output.schema.ts` | NEW — Zod schemas for AI question validation |
| `src/ai/providers/openrouter.provider.ts` | answerKey separation, error sanitization, response_format |
| `src/ai/interfaces/ai-provider.interface.ts` | Unchanged (interface still valid) |
| `src/ai/ai.module.ts` | Unchanged |
| `src/ai-providers/ai-providers.service.ts` | API key masking, transactions, ownership validation |
| `src/ai-providers/ai-providers.controller.ts` | DTO integration |
| `src/auth/auth.controller.ts` | Cookie security, DTO integration |
| `src/auth/session.middleware.ts` | Logger for DB failures |
| `src/auth/better-auth.ts` | Comment about separate client |
| `src/common/dto/` | 12 NEW DTO files |
| `src/dashboard/dashboard.service.ts` | Database aggregates |
| `src/results/results.controller.ts` | PaginationDto integration |
| `src/lessons/lessons.controller.ts` | DTO integration |
| `src/users/users.controller.ts` | DTO integration |
| `src/app.controller.ts` | Health check with DB connectivity |
| `src/main.ts` | Env validation, CORS from env |
| `src/config/env.config.ts` | NEW — Zod env validation schema |
| `prisma/seed.ts` | Env-based admin password |

### Frontend (apps/web)

| File | Change |
|------|--------|
| `lib/features/ai-providers-api-slice.ts` | hasApiKey field, nullable apiKey |
| `app/admin/ai-provider/page.tsx` | No key pre-fill, keyDirty tracking |

## Testing

### Current Test Coverage
- Backend: Basic `GET /health` endpoint test in e2e spec
- Frontend: No tests

### Recommended Test Additions
- Unit tests for deterministic evaluation logic
- Unit tests for Zod AI output validation
- E2E test for health endpoint
- Integration test for exam creation flow

## Architecture Principles Applied

1. **Defense in depth** — Input validation (DTOs + Zod), output sanitization (answer key stripping), and operational safety (transactions)
2. **Separation of concerns** — answerKey separated from content, AI generation from exam creation, evaluation from answer submission
3. **Fail fast** — Env validation on startup, Zod validation on AI output, atomic write checks on answer submission
4. **Least privilege** — API keys masked in responses, answer keys not returned to client during exam
5. **Idempotency** — Atomic updates prevent double-submit, contentHash prevents duplicate exams
