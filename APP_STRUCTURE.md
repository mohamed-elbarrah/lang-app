# APP_STRUCTURE.md

# Application Structure

This document defines every page in the application.

Its purpose is to ensure that every AI agent follows the same application structure and never invents new pages or duplicate functionality.

---

# Application Areas

The application is divided into three areas.

- Public
- User
- Administration

---

# Public Area

Accessible without authentication.

## Landing Page

Purpose

Introduce the platform.

Contains

- Hero Section
- Features
- How It Works
- Call To Action
- Footer

Components

- Hero
- FeatureCard
- SectionTitle
- CTASection
- Footer

---

## Login

Purpose

Authenticate users.

Contains

- Login Form

Components

- AuthCard
- EmailField
- PasswordField
- SubmitButton

---

## Register

Purpose

Create a new account.

Contains

- Registration Form

Components

- AuthCard
- NameField
- EmailField
- PasswordField
- ConfirmPasswordField

---

# User Area

Accessible only after authentication.

---

## Dashboard

Purpose

Main entry point.

Contains

- Welcome Card
- Start Test Card
- Recent Results
- Quick Statistics

Components

- PageHeader
- WelcomeCard
- StartTestCard
- ResultCard
- StatCard

---

## New Test

Purpose

Configure and start a new exam.

Contains

- Question Count
- Correction Mode
- Start Button

Components

- TestConfigurationCard
- QuestionCountSelector
- CorrectionModeSelector
- PrimaryButton

---

## Test

Purpose

Display one question at a time.

Contains

- Progress
- Current Question
- Answer Area
- Navigation

Components

- QuestionHeader
- QuestionProgress
- QuestionCard
- AnswerArea
- QuestionNavigation

Question Components

- MultipleChoiceQuestion
- FillBlankQuestion
- SentenceQuestion
- ErrorCorrectionQuestion
- ScenarioQuestion

---

## Test Result

Purpose

Display exam outcome.

Contains

- Final Score
- Statistics
- Answer Review
- Explanations
- Lesson Recommendations

Components

- ScoreCard
- StatisticsCard
- AnswerReview
- ExplanationCard
- LessonRecommendationCard

---

## Results History

Purpose

Display previous exams.

Contains

- Results List
- Search
- Filters

Components

- DataTable
- SearchInput
- FilterBar
- ResultCard

---

## Profile

Purpose

Manage account.

Contains

- Personal Information
- Change Password

Components

- ProfileCard
- UserForm
- PasswordForm

---

# Administration

Only administrators.

---

## Admin Dashboard

Purpose

Quick overview.

Contains

- Users Count
- AI Provider Status

Components

- StatCard
- StatusCard

---

## Users

Purpose

Manage users.

Contains

- Search
- Users Table

Components

- DataTable
- SearchInput
- UserRow
- Pagination

---

## AI Provider Settings

Purpose

Configure AI integration.

Contains

- Active Provider
- API Credentials
- Default Model
- Connection Status
- Test Connection

Components

- ProviderCard
- ProviderSelector
- CredentialForm
- ModelSelector
- StatusBadge

---

# Shared Components

The following components must never be duplicated.

## Layout

- DashboardLayout
- AdminLayout
- AuthLayout
- PageContainer
- Section

---

## Navigation

- Sidebar
- Topbar
- Breadcrumb
- UserMenu

---

## Headers

- PageHeader
- CardHeader
- SectionHeader

---

## Cards

- Card
- StatCard
- SettingCard
- ResultCard
- WelcomeCard

---

## Forms

- FormField
- TextInput
- PasswordInput
- Select
- RadioGroup
- Switch
- Checkbox

---

## Feedback

- Skeleton
- LoadingState
- EmptyState
- ErrorState
- Alert
- Toast

---

## Tables

- DataTable
- TableToolbar
- Pagination

---

# Routing

Public

/

login

register

---

User

/dashboard

/dashboard/new-test

/dashboard/test/:id

/dashboard/results

/dashboard/results/:id

/dashboard/profile

---

Admin

/admin

/admin/users

/admin/ai-provider

---

# Component Rule

Before creating any new component:

1. Search for an existing reusable component.
2. Extend it if appropriate.
3. Create a new component only if no reusable solution exists.

---

# Page Rule

Every page should have:

- Page Header
- Clear Title
- Optional Description
- Main Content
- Consistent Spacing

No page should invent a different structure.

---

# Final Rule

Every new feature must fit into an existing page.

If a new page is proposed, it must have a clear responsibility and must not duplicate another page.
