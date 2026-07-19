# Backend-Frontend Compatibility & Exam Generation Fix

**Goal:** Fix frontend-backend compatibility issues, eliminate "No questions available" error, add logging, support 3/5 question exams.

**Architecture:** Made exam generation synchronous (removed fire-and-forget pattern), removed response wrapper interceptor that caused data access inconsistencies, fixed error shapes, and added structured logging on both sides.

**Tech Stack:** NestJS 11, Next.js 16, RTK Query, Prisma, PostgreSQL

---

## Changes Made

### Backend

1. **Prisma schema** (`apps/api/prisma/schema.prisma`): Removed `@unique` from `Exam.contentHash` to prevent unique constraint crashes when identical exams are generated.

2. **Response Transform Interceptor** (`apps/api/src/common/common.module.ts`): Removed `ResponseTransformInterceptor`. All API responses now return raw objects instead of `{ success: true, data }`. This eliminates the need for defensive `(raw as any).data` patterns in the frontend.

3. **Exam creation** (`apps/api/src/exams/exams.service.ts`): Made `create()` fully synchronous by awaiting `generateExamContent()`. No more fire-and-forget. The frontend now shows a "Generating Your Exam" spinner while the backend creates questions. Returns the full exam object with questions. Added structured logging throughout.

4. **Exam controller** (`apps/api/src/exams/exams.controller.ts`): Removed `@Throttle` (10/min) on POST endpoint since exam generation is now a long-running synchronous request.

5. **Users service** (`apps/api/src/users/users.service.ts`): Added `image` field to `findAll()` response. `update()` now returns full user profile with `image`, `testsTaken`, `joinedAt`.

6. **AI service** (`apps/api/src/ai/ai.service.ts`): Added structured logging with provider info, question count, and duration.

### Frontend

1. **Exams API slice** (`apps/web/lib/features/exams-api-slice.ts`): Added `'generating'` to `Exam.status` type union.

2. **Test page** (`apps/web/app/dashboard/test/[id]/page.tsx`):
   - Added full "Generating Your Exam" state with polling (3s interval)
   - Removed all `(raw as any).data` defensive unwrapping
   - Fixed error message extraction to match `error.data.error.message`
   - Fixed hook ordering (handleNext before handleSubmit)

3. **New test page** (`apps/web/app/dashboard/new-test/page.tsx`):
   - Added 3 (Quick) and 5 (Mini) question options
   - Added "Generating Your Exam" full-screen overlay during creation
   - Removed `(raw as any).data` unwrapping
   - Fixed error message extraction
   - Minimum question count changed from 1 to 3

4. **Results pages** (`apps/web/app/dashboard/results/page.tsx`, `[id]/page.tsx`): Removed all `(raw as any).data` patterns.

5. **Dashboard page** (`apps/web/app/dashboard/page.tsx`): Removed `(raw as any).data` pattern.

6. **Login/Register pages** (`apps/web/app/login/page.tsx`, `register/page.tsx`): Removed `(raw as any).data` patterns, fixed error handling to match `error.data.error.message`.

7. **AI Provider page** (`apps/web/app/admin/ai-provider/page.tsx`): Removed `(raw as any).data` pattern.

8. **Logging** (`apps/web/lib/logging-base-query.ts`): Created custom RTK Query base query that logs all API calls with method, URL, status, and duration to the browser console. Applied to all API slices.
