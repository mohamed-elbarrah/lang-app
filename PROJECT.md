# PROJECT.md

# AI English Grammar Test Platform

> An AI-powered English grammar assessment platform that generates unlimited grammar exams from approved study lessons and evaluates learner answers using configurable AI providers.

---

# Vision

Build a lightweight platform focused on one objective:

**Help learners improve their English grammar through unlimited AI-generated exams based only on approved lessons.**

This project is intentionally designed as an assessment platform, not a complete learning management system (LMS).

Every feature should contribute directly to creating, taking, or evaluating grammar exams.

The first milestone is a functional MVP that is simple, fast, and easy to extend later.

---

# Core Principles

- Keep the product simple.
- Focus on assessment, not teaching.
- Every generated question must come from approved lessons only.
- AI assists the learning process but never replaces business logic.
- Build only what is required for the MVP.
- Avoid unnecessary complexity and premature optimization.

---

# MVP Goals

The MVP should allow a learner to:

- Create a new grammar exam.
- Receive a unique AI-generated exam.
- Answer questions one by one.
- Receive AI-powered correction.
- Choose between instant correction or correction at the end.
- Review detailed feedback and the final score.
- Repeat the process with a different exam every time.

---

# Knowledge Source

The platform has one official knowledge source.

Approved English grammar lessons.

Every generated question, correction and explanation must be based only on these lessons.

AI is never allowed to introduce grammar topics that do not exist in the approved material.

---

# Question Types

The MVP supports only:

- Multiple Choice
- Fill in the Blank
- Error Correction
- Sentence Creation
- Scenario Questions

No additional question types should be implemented during the MVP phase.

---

# User Flow

User signs in

↓

Starts a new exam

↓

System selects lesson content

↓

AI generates a unique exam

↓

Questions appear one by one

↓

User answers

↓

Immediate correction
OR

Final correction

↓

Final report

↓

User starts another unique exam

---

# Exam Rules

Each exam contains:

- Minimum 10 questions
- Maximum 20 questions

Questions are displayed individually.

Users cannot skip ahead to future questions.

Each generated exam should be different whenever possible.

---

# Correction Modes

The platform supports two correction modes.

## Instant Correction

The learner receives feedback immediately after each answer.

---

## Final Review

The learner receives all corrections after completing the entire exam.

The learner may switch between these modes before starting or during an exam.

---

# AI Integration

Artificial Intelligence is a core component of the platform.

AI is responsible for:

- Generating grammar questions.
- Evaluating answers.
- Explaining mistakes.
- Calculating scores.
- Suggesting which lesson should be reviewed.

Business rules, permissions, validation and application logic always remain inside the application itself.

---

# AI Provider Management

The platform includes a very small administration area.

Its purpose is not system management.

Its only responsibility is configuring the AI provider used by the application.

The administrator can:

- View registered users.
- Configure the active AI provider.
- Add or update API Keys.
- Show models of AI provider and allow user to select one or many or deselect all models with search for best UX.
- Enable or disable an AI provider.
- Test provider connectivity.

The initial implementation focuses on **OpenRouter** as the primary AI gateway.

The architecture should allow adding additional providers in the future without changing the application workflow.

---

# Administration

The administration panel should remain intentionally minimal.

Only include features required for operating the platform.

Examples:

- Users list
- AI Provider Settings
- API Key Management

Nothing else belongs to the MVP.

---

# Out of Scope

The following features are intentionally excluded from the MVP.

- Vocabulary learning
- Reading lessons
- Listening
- Speaking
- Essay writing
- Flashcards
- Gamification
- Achievements
- Badges
- Rankings
- Notifications
- Teacher accounts
- Classroom management
- Advanced analytics
- Reports
- Payment systems
- Mobile application
- Offline mode
- Multi-language interface

These features may be considered only after the MVP is completed.

---

# Architecture Principles

The project should always follow these principles.

- Simplicity over complexity.
- One responsibility per module.
- Small reusable components.
- Predictable application flow.
- Clear separation between business logic and AI.
- Easy future extensibility.
- Fast iteration during MVP development.

---

# MVP Success Criteria

The MVP is considered complete when a learner can:

- Create an account.
- Start a new grammar exam.
- Receive unique AI-generated questions.
- Answer every question.
- Receive AI correction.
- View the final score with explanations.
- Start another completely different exam.

An administrator can:

- View registered users.
- Configure the AI provider.
- Manage API keys.
- Use OpenRouter as the primary AI gateway.

No additional functionality should delay the completion of these objectives.
