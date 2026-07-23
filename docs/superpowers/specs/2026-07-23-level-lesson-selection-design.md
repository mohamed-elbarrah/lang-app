# Level System + Lesson Selection + Correction UX

## Overview
Add difficulty levels (Beginner/Intermediate/Advanced), replace part-based lesson selection with individual lesson search+multi-select, and refine instant correction mode UX.

## Changes

### Database
- Add `DifficultyLevel` enum: `beginner | intermediate | advanced`
- Add `level` field to `Exam` model (required, default beginner)

### Backend API
- `POST /api/exams` DTO: replace `partIds[]` with `level` + `lessonIds[]`
- `GET /api/lessons`: unchanged (frontend flattens client-side)
- AI prompt includes level-based difficulty instruction
- Exam stores `level` for results display

### Frontend — New Test Page
- 3-step layout: Difficulty → Lessons → Settings
- `DifficultySelector`: radio group with per-level descriptions
- `LessonSearchSelect`: search input + checkbox list + selected count
- Client-side search/flatten (27 lessons, no backend search needed)

### Frontend — Test Page (Instant Mode)
- State machine: unanswered → answered (feedback shown) → acknowledged → next
- New "Got it" button after feedback in instant mode
- Final mode keeps current auto-advance behavior

### Frontend — Results
- Show `level` badge in results list and detail

## No Changes
- Auth, guards, rate limiting, evaluation logic, seed data
