# DESIGN_SYSTEM.md

# Design System & UI Guidelines

This document defines the visual structure of the application.

Its purpose is to keep every page consistent, predictable and reusable.

Every screen must follow these guidelines.

---

# Design Principles

The interface should be:

- Clean
- Minimal
- Spacious
- Modern
- Easy to scan
- Consistent

Avoid visual noise.

Every element should have a purpose.

---

# Layout Structure

Every page should follow the same structure.

```
Page

├── Header
│
├── Page Title
│
├── Page Description (optional)
│
├── Main Content
│
└── Footer Actions (optional)
```

Never invent different layouts for similar pages.

---

# Page Width

Use a consistent content width.

Avoid full-width layouts unless absolutely necessary.

---

# Spacing

Use consistent spacing everywhere.

Large spacing between sections.

Medium spacing between cards.

Small spacing between related controls.

Never mix random spacing values.

---

# Cards

Cards are the primary layout component.

Each card should contain:

- Title
- Optional description
- Content
- Optional footer actions

Avoid nested cards whenever possible.

---

# Buttons

Button hierarchy:

Primary

- Main action

Secondary

- Alternative action

Ghost

- Low priority actions

Destructive

- Delete / dangerous actions

Never create unnecessary button styles.

---

# Forms

Every form should use the same layout.

Order:

Label

↓

Input

↓

Description (optional)

↓

Validation Error

Keep forms vertically aligned.

---

# Tables

All tables should share the same structure.

Required:

- Search
- Empty state
- Loading state

Optional:

- Pagination

---

# Empty States

Every page without data should display:

- Illustration or icon
- Short message
- Primary action

Never leave blank pages.

---

# Loading States

Always use skeletons.

Avoid loading spinners for page content.

---

# Dialogs

Dialogs should be used only for:

- Confirmation
- Small forms
- Quick editing

Avoid placing large workflows inside dialogs.

---

# Navigation

Navigation should remain simple.

Admin

- Dashboard
- Users
- AI Provider

User

- Dashboard
- New Test
- Results
- Profile

Nothing else during MVP.

---

# Reusable Components

The following components should be shared across the application.

## Layout

- PageLayout
- DashboardLayout
- PageHeader
- Section
- ContentContainer

---

## Navigation

- Sidebar
- Topbar
- NavigationItem
- UserMenu
- Breadcrumb

---

## Buttons

- PrimaryButton
- SecondaryButton
- GhostButton
- DangerButton
- IconButton

---

## Forms

- TextField
- PasswordField
- TextArea
- Select
- Checkbox
- RadioGroup
- Switch
- SearchInput

---

## Feedback

- Alert
- EmptyState
- ErrorState
- LoadingState
- Skeleton
- Toast

---

## Cards

- Card
- StatCard
- SettingCard
- ResultCard

---

## Tables

- DataTable
- TableToolbar
- Pagination

---

## AI Components

- AIProviderCard
- ModelSelector
- ConnectionStatus
- APIKeyField

---

## Test Components

- QuestionCard
- QuestionHeader
- QuestionProgress
- QuestionNavigation
- AnswerArea
- MultipleChoice
- FillBlank
- ErrorCorrection
- SentenceBuilder
- ScenarioQuestion

---

## Result Components

- ScoreCard
- AnswerReview
- ExplanationCard
- LessonRecommendation

---

# Pages

## Authentication

### Login

Contains:

- Email
- Password
- Login Button

---

### Register

Contains:

- Name
- Email
- Password
- Confirm Password

---

## User Dashboard

Contains:

- Welcome Card
- Start New Test
- Recent Results

---

## New Test

Contains:

- Number of Questions
- Correction Mode
- Start Button

---

## Test

Contains:

- Progress
- Question
- Answer Area
- Navigation
- Timer (optional)

One question per screen.

---

## Test Result

Contains:

- Final Score
- Summary
- Correct Answers
- Wrong Answers
- Explanations
- Lessons to Review

---

## Profile

Contains:

- Personal Information
- Change Password

---

# Admin

## Dashboard

Simple overview only.

---

## Users

Contains:

- Search
- Users Table

---

## AI Provider

Contains:

- Provider
- API Credentials
- Default Model
- Connection Status
- Test Connection

---

# Icons

Use one icon style only.

Never mix icon libraries.

---

# Animations

Animations should be subtle.

Avoid unnecessary motion.

No animated backgrounds.

No heavy transitions.

---

# Responsiveness

Desktop first.

Tablet supported.

Mobile supported.

Never build separate layouts.

---

# Accessibility

Use semantic HTML.

Keyboard accessible.

Visible focus states.

Readable contrast.

---

# Reusability Rule

Before creating a new component ask:

Can this component be reused?

If yes,

Create it once.

Reuse it everywhere.

Never duplicate UI.

---

# Final Rule

Consistency is more important than creativity.

Every page should feel like part of the same application.
