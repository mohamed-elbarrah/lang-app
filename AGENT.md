# AGENT.md

# AI Agent Operating Protocol

This document defines the mandatory implementation rules for every AI agent working on this project.

Its purpose is to keep development focused on delivering a complete MVP as quickly as possible while maintaining a clean and maintainable architecture.

---

# Primary Objective

Your only objective is to complete the MVP.

Every decision must support finishing the MVP faster.

Never prioritize elegance over delivery.

Never implement future features.

---

# Source of Truth

Always follow:

1. PROJECT.md
2. Existing codebase

Do not invent requirements.

Do not assume missing features.

If something is not described inside PROJECT.md, it is considered out of scope.

---

# Development Philosophy

Always prefer:

- Simplicity
- Readability
- Small modules
- Predictable behavior
- Incremental development

Avoid:

- Overengineering
- Generic abstractions
- Enterprise patterns
- Premature optimization
- Complex architectures

---

# MVP Rules

Build only what is required.

If a feature is not necessary for the MVP:

DO NOT IMPLEMENT IT.

Examples:

- No notifications
- No gamification
- No analytics
- No dashboards beyond the required ones
- No advanced permissions
- No caching layers
- No queues
- No event bus
- No plugins
- No feature flags

---

# Architecture Rules

Keep modules small.

Each module should have one responsibility.

Business logic belongs inside the backend.

AI never replaces application logic.

Never duplicate logic between frontend and backend.

---

# AI Rules

AI is responsible only for:

- Question generation
- Answer evaluation
- Feedback generation
- Score calculation
- Lesson recommendation

Never let AI:

- Make authorization decisions.
- Validate permissions.
- Replace backend business rules.
- Invent grammar outside approved lessons.

---

# Authentication

Prefer using **Better Auth** to accelerate MVP development.

Requirements:

- Self-hosted
- Open Source
- Database owned by the application
- No third-party authentication platform dependency

Avoid hosted authentication services.

---

# AI Provider

The application should be designed around an AI Provider abstraction.

The first supported provider is:

- OpenRouter

Future providers should be replaceable without changing the assessment workflow.

Never hardcode provider-specific logic across the application.

---

# Administration

Keep the admin area extremely small.

Only implement:

- Users list
- AI Provider Settings
- API Key Management

Nothing else.

---

# Database

Run PostgreSQL via Docker Compose for local development.

Design only the tables required for MVP.

Avoid creating tables for future features.

Prefer simple relationships.

Avoid unnecessary normalization.

---

# API Design

Use consistent API structure.

Keep endpoints small.

One endpoint should perform one responsibility.

Validate every request.

Return predictable responses.

---

# Frontend Rules

Keep the interface clean and minimal.

Use reusable components.

Avoid unnecessary animations.

Use **Redux Toolkit + RTK Query** for state management and API calls.

Do not optimize for edge cases before they exist.

---

# Code Quality

Write readable code.

Prefer explicit code over clever code.

Remove dead code immediately.

Avoid duplicated logic.

Use meaningful naming.

Keep files reasonably small.

---

# Dependencies

Before adding any dependency:

Ask:

- Does this reduce development time?
- Is it actively maintained?
- Is it open source?
- Does it simplify the MVP?

If not,

Do not install it.

---

# Error Handling

Handle expected failures.

Provide meaningful messages.

Never expose internal errors to users.

---

# Testing

Implement only essential tests required to protect core functionality.

Avoid spending excessive time on exhaustive test coverage during MVP development.

---

# Performance

Do not optimize prematurely.

Measure first.

Optimize only when an actual bottleneck appears.

---

# Decision Rule

Whenever multiple implementation choices exist:

Choose the solution that:

- Finishes faster
- Is easier to understand
- Requires less maintenance
- Produces less code
- Keeps the architecture clean

---

# Absolute Rule

Every pull request, every commit and every implementation should answer one question:

**Does this help complete the MVP faster?**

If the answer is "No",

Do not implement it.
