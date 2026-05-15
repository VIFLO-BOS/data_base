 # Database

**Enterprise-grade Staff & Tasker Management System**

_Monorepo · Full-Stack TypeScript · Role-Based Dashboards_

**Tech:** Next.js 15 · NestJS 10 · TypeScript 5.4 · PostgreSQL 16 · Tailwind CSS 3.4 · Private License

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Workspaces](#workspaces)
- [Backend Modules](#backend-modules)
- [Frontend Route Map](#frontend-route-map)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Shared Packages](#shared-packages)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Database** is a full-stack staff and tasker management system built as a scalable TypeScript monorepo. It is designed to manage the end-to-end lifecycle of annotation projects — from assigning taskers to client projects, tracking their work through timesheets, generating performance reports, and providing role-based dashboards for every stakeholder.

The platform supports **three distinct user roles**, each with its own dashboard experience:

| Role       | Dashboard               | Capabilities                                                                                |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| **Admin**  | Full operations control | Manage users, projects, taskers, accounts, timesheets, reports, audit logs, system settings |
| **Client** | Project oversight       | View assigned projects, review reports, manage billing and profile                          |
| **Tasker** | Task execution          | View assigned tasks, submit timesheets, track performance, manage work history              |

Development is structured in three phases:

- **Phase 1** (Current Focus): Admin Dashboard — full CRUD, analytics, and management
- **Phase 2**: Client Dashboard — project visibility and reporting
- **Phase 3**: Tasker Dashboard — task assignment, timesheets, and performance tracking

---z

## Key Features

### Core Platform

- **Role-Based Access Control (RBAC)** — Layered guards: JWT → Roles → Permissions on every route
- **Multi-Dashboard Architecture** — Separate UIs for Admin, Client, and Tasker roles
- **Mobile-First Responsive Design** — Fully usable from 320px mobile to 1440px+ desktop
- **Real-Time Notifications** — In-app notification system with read/unread states
- **Audit Logging** — Complete trail of user actions for compliance and debugging

### Admin Dashboard

- **Analytics Dashboard** — Stat cards, charts, and filters (day/week/month/year)
- **Project Management** — Create, assign, track, and archive projects
- **Tasker Management** — Onboard taskers, assign to projects, monitor performance
- **Account Management** — Manage client accounts and organizational structure
- **Timesheet Approval** — Review and approve weekly timesheet submissions
- **Report Generation** — Generate PDF/Excel reports with filtering
- **Data Export** — Async CSV/Excel export jobs with download links

### Technical

- **API-First Design** — Versioned REST API (`/api/v1/*`) with Swagger/OpenAPI documentation
- **Shared Type Safety** — TypeScript interfaces shared across frontend and backend via workspace packages
- **Validation on Both Sides** — Zod schemas (frontend) + class-validator (backend) from shared definitions
- **Optimistic State Management** — Zustand for client state, React Query for server state with cache invalidation

---

## Technology Stack

| Layer              | Technology                          | Purpose                                                    |
| ------------------ | ----------------------------------- | ---------------------------------------------------------- |
| **Monorepo**       | npm Workspaces + Turborepo          | Workspace management, task orchestration, build caching    |
| **Frontend**       | Next.js 15 (App Router)             | Server/client components, file-based routing, SSR/SSG      |
| **UI Framework**   | Tailwind CSS + shadcn/ui            | Utility-first styling + accessible Radix UI primitives     |
| **Icons**          | Lucide React                        | Consistent, tree-shakeable icon set                        |
| **State (Client)** | Zustand                             | Lightweight client-side state management                   |
| **State (Server)** | React Query                         | Server state caching, mutations, and background refetching |
| **Forms**          | React Hook Form + Zod               | Performant forms with schema-based validation              |
| **Charts**         | Recharts                            | Composable chart components for analytics                  |
| **Tables**         | TanStack Table v8                   | Headless, sortable, filterable data tables                 |
| **Backend**        | NestJS 10                           | Modular Node.js framework with decorators and DI           |
| **ORM**            | TypeORM                             | Database entity management, migrations, and query building |
| **Database**       | PostgreSQL 16                       | Primary data store (via Supabase or self-hosted)           |
| **Auth**           | JWT (Access + Refresh)              | Stateless authentication with token rotation               |
| **OAuth**          | Passport.js (Google, GitHub)        | Third-party social login                                   |
| **Validation**     | class-validator + class-transformer | DTO validation and transformation on the backend           |
| **API Docs**       | Swagger / OpenAPI                   | Auto-generated API documentation at `/api/docs`            |
| **Caching**        | Redis                               | Session storage, API caching, rate limiting (optional)     |
| **Testing**        | Jest + Playwright + RTL             | Unit, integration, and end-to-end testing                  |
| **Scripting**      | Python 3                            | Bulk data operations, CSV/PDF exports, report generation   |

---

## Architecture

### System Architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────────┐
│                 │ ──────────────► │                      │
│   Browser /     │                │   Next.js 15         │
│   Mobile        │ ◄────────────── │   (Frontend)         │
│                 │     HTML/JSON  │   Port 3000           │
└─────────────────┘                └──────────┬───────────┘
                                              │
                                         API Calls
                                      /api/v1/*
                                              │
                                   ┌──────────▼───────────┐
                                   │                      │
                                   │   NestJS 10          │
                                   │   (Backend API)      │
                                   │   Port 3001          │
                                   │                      │
                                   └──┬──────────────┬────┘
                                      │              │
                              ┌───────▼──────┐ ┌─────▼──────┐
                              │              │ │            │
                              │  PostgreSQL  │ │   Redis    │
                              │  (Supabase)  │ │  (Cache)   │
                              │  Port 5432   │ │  Port 6379 │
                              │              │ │            │
                              └──────────────┘ └────────────┘
```

### Authentication Flow

```
1. User submits credentials (email/password or OAuth)
2. Backend validates via Passport strategy
3. JWT access token (15min) + refresh token (7d) issued
4. Frontend stores tokens in httpOnly cookies
5. Every API request includes Bearer token in Authorization header
6. Guards validate: Token → Roles → Permissions (layered)
7. Refresh token rotates automatically on access token expiry
```

### Data Flow

```
Frontend (React)  →  API Service Layer  →  Axios HTTP Client
                                                    │
                                              /api/v1/*
                                                    │
NestJS Controller  →  Service (Business Logic)  →  TypeORM Repository  →  PostgreSQL
       │
  DTO Validation (class-validator)
  Auth Guard (JWT)
  Role Guard (RBAC)
  Permission Guard (Granular)
```

---

## Project Structure

```
database/
│
├── apps/
│   ├── frontend/                     # Next.js 15 Application
│   │   ├── app/                      # App Router pages
│   │   │   ├── (auth)/               # Auth pages (no dashboard shell)
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── forgot-password/
│   │   │   │   └── reset-password/
│   │   │   └── (dashboard)/          # Dashboard pages (with shell)
│   │   │       ├── admin/            # Phase 1 — Admin routes
│   │   │       ├── client/           # Phase 2 — Client routes
│   │   │       └── tasker/           # Phase 3 — Tasker routes
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui primitives (Button, Input, etc.)
│   │   │   ├── layout/              # DashboardShell, Sidebar, MobileDrawer, TopBar
│   │   │   ├── shared/              # ProtectedRoute, ThemeProvider, RoleGate
│   │   │   ├── forms/               # Business forms (ProjectForm, TaskerForm)
│   │   │   ├── modals/              # Modal dialogs (CreateProject, ConfirmDelete)
│   │   │   ├── tables/              # DataTable, ResponsiveTable, CardList
│   │   │   ├── cards/               # StatCard, ProjectCard, EmptyStateCard
│   │   │   ├── charts/              # AnalyticsChart, Recharts wrappers
│   │   │   └── empty-states/        # Empty state illustrations
│   │   ├── hooks/                   # Custom React hooks (useAuth, useProjects, etc.)
│   │   ├── stores/                  # Zustand stores (auth, ui, notifications)
│   │   ├── services/                # API service layer (axios-based)
│   │   ├── lib/                     # Core utilities (cn, api client, supabase)
│   │   ├── types/                   # Frontend-specific types
│   │   ├── constants/               # Frontend constants
│   │   ├── utils/                   # Helper utilities
│   │   └── validations/             # Zod schemas for form validation
│   │
│   └── backend/                      # NestJS 10 API Server
│       └── src/
│           ├── modules/              # 18 Feature modules (see Backend Modules)
│           ├── common/               # Cross-cutting concerns
│           │   ├── decorators/       # @Roles, @Permissions, @CurrentUser, @Public
│           │   ├── filters/          # Global exception filters
│           │   ├── guards/           # RolesGuard, PermissionsGuard
│           │   ├── interceptors/     # Response transform, logging
│           │   ├── middleware/       # RequestId, RateLimit
│           │   ├── pipes/            # Validation pipes
│           │   └── utils/            # Password hashing, JWT utilities
│           ├── config/               # App, database, JWT, Supabase configs
│           ├── database/             # TypeORM data source and seeds
│           ├── app.module.ts         # Root module (imports all feature modules)
│           └── main.ts               # Application bootstrap
│
├── packages/                         # Shared workspace packages
│   ├── shared-types/                 # TypeScript interfaces (User, Project, Auth, etc.)
│   ├── shared-constants/             # Roles, permissions, routes, HTTP status codes
│   ├── shared-validation/            # Zod schemas used on both frontend and backend
│   ├── shared-rbac/                  # Role hierarchy, permission grants, access checks
│   └── shared-utils/                 # Date, string, number, and array utilities
│
├── database/
│   ├── schemas/                      # Raw SQL schema files (6 files)
│   ├── migrations/                   # TypeORM migration files
│   ├── seeds/                        # Seed data (roles, admin user, test data)
│   └── supabase/                     # Supabase-specific configuration
│
├── scripts/
│   ├── python/                       # Python automation scripts
│   │   ├── exports/                  # CSV export utilities
│   │   ├── imports/                  # CSV import utilities
│   │   ├── reports/                  # PDF/Excel report generation
│   │   ├── bulk-ops/                 # Bulk tasker creation
│   │   └── cleanup/                  # Data cleanup scripts
│   └── bash/                         # Shell scripts (backup, restore)
│
├── docker/                           # Docker configurations (optional)
│   ├── frontend/Dockerfile
│   ├── backend/Dockerfile
│   ├── database/init/
│   └── nginx/nginx.conf
│
├── docs/                             # Documentation
│   ├── architecture/                 # System diagrams and architecture docs
│   ├── api/                          # API contracts and endpoint docs
│   ├── frontend/                     # Frontend patterns and conventions
│   ├── backend/                      # Backend patterns and conventions
│   ├── database/                     # Schema documentation
│   ├── deployment/                   # Deployment guides
│   ├── testing/                      # Testing strategy
│   └── design/                       # Design system documentation
│
├── package.json                      # Root workspace configuration
├── turbo.json                        # Turborepo pipeline config
├── docker-compose.yml                # Local infrastructure (optional)
├── .env.example                      # Environment variable template
├── .eslintrc.json                    # Root ESLint configuration
├── .prettierrc                       # Prettier configuration
└── ARCHITECTURE.md                   # Detailed architecture document
```

---

## Getting Started

### Prerequisites

| Tool        | Minimum Version                | Check              |
| ----------- | ------------------------------ | ------------------ |
| **Node.js** | ≥ 20.0.0                       | `node -v`          |
| **npm**     | ≥ 10.0.0                       | `npm -v`           |
| **Python**  | ≥ 3.10 (optional, for scripts) | `python --version` |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/database.git
cd database

# 2. Install all dependencies (root + all workspaces)
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# 4. Start development servers (frontend + backend concurrently)
npm run dev
```

> **Note:** This project uses [Supabase](https://supabase.com) (free tier) for PostgreSQL. Create a free project at supabase.com, then add your `SUPABASE_URL` and keys to `.env`.

### Development URLs

| Service                     | URL                            |
| --------------------------- | ------------------------------ |
| Frontend (Next.js)          | http://localhost:3000          |
| Backend API (NestJS)        | http://localhost:3001          |
| API Documentation (Swagger) | http://localhost:3001/api/docs |

---

## Available Scripts

All scripts are run from the **monorepo root** (`database/`).

### Development

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start both frontend and backend in development mode |
| `npm run dev:frontend` | Start only the Next.js frontend                     |
| `npm run dev:backend`  | Start only the NestJS backend                       |

### Build

| Command                  | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `npm run build`          | Build all packages + backend + frontend for production |
| `npm run build:shared`   | Build only shared workspace packages                   |
| `npm run build:frontend` | Build only the Next.js frontend                        |
| `npm run build:backend`  | Build only the NestJS backend                          |

### Quality

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run lint`         | Run ESLint across all workspaces         |
| `npm run lint:fix`     | Run ESLint with automatic fixes          |
| `npm run format`       | Format all files with Prettier           |
| `npm run format:check` | Check formatting without modifying files |
| `npm run typecheck`    | Run TypeScript type checking (no emit)   |

### Testing

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm run test`          | Run all tests (shared + backend + frontend) |
| `npm run test:backend`  | Run backend unit and integration tests      |
| `npm run test:frontend` | Run frontend unit tests                     |

### Database

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run db:migrate` | Run pending TypeORM migrations      |
| `npm run db:seed`    | Seed the database with initial data |

### Docker (Optional)

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run docker:up`   | Start PostgreSQL + Redis containers |
| `npm run docker:down` | Stop and remove containers          |

---

## Workspaces

This monorepo uses [npm Workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) to manage multiple packages within a single repository. Dependencies are hoisted to the root `node_modules/` to avoid duplication.

| Workspace                      | Path                         | Description                                         |
| ------------------------------ | ---------------------------- | --------------------------------------------------- |
| `@annotator/frontend`          | `apps/frontend`              | Next.js 15 application with App Router              |
| `@annotator/backend`           | `apps/backend`               | NestJS 10 REST API server                           |
| `@annotator/shared-types`      | `packages/shared-types`      | TypeScript interfaces shared across apps            |
| `@annotator/shared-constants`  | `packages/shared-constants`  | Constants: roles, permissions, routes, status codes |
| `@annotator/shared-validation` | `packages/shared-validation` | Zod validation schemas for forms and API            |
| `@annotator/shared-rbac`       | `packages/shared-rbac`       | Role hierarchy and permission checking logic        |
| `@annotator/shared-utils`      | `packages/shared-utils`      | Pure utility functions (dates, strings, arrays)     |

### How Sharing Works

Shared packages are imported by both frontend and backend using their package names:

```typescript
// In frontend or backend
import { User, UserProfile } from '@annotator/shared-types';
import { ROLES, PERMISSIONS } from '@annotator/shared-constants';
import { userSchema } from '@annotator/shared-validation';
import { canAccess } from '@annotator/shared-rbac';
import { formatDate } from '@annotator/shared-utils';
```

---

## Backend Modules

The NestJS backend is organized into **18 feature modules**, each following a consistent structure:

```
module-name/
├── module-name.module.ts            # NestJS module definition
├── module-name.controller.ts        # HTTP route handlers + Swagger decorators
├── module-name.service.ts           # Business logic + database interactions
├── module-name.controller.spec.ts   # Controller unit tests
├── module-name.service.spec.ts      # Service unit tests
├── dto/                             # Request/response data transfer objects
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
└── entities/                        # TypeORM entity classes
    └── *.entity.ts
```

| Module                  | API Prefix              | Purpose                                       |
| ----------------------- | ----------------------- | --------------------------------------------- |
| **auth**                | `/api/v1/auth`          | Login, register, refresh token, logout, OAuth |
| **users**               | `/api/v1/users`         | User CRUD, status management                  |
| **profiles**            | `/api/v1/profiles`      | Extended user profile management              |
| **admins**              | `/api/v1/admins`        | Admin-specific records and actions            |
| **clients**             | `/api/v1/clients`       | Client organization management                |
| **taskers**             | `/api/v1/taskers`       | Tasker/annotator management and assignment    |
| **projects**            | `/api/v1/projects`      | Project lifecycle management                  |
| **accounts**            | `/api/v1/accounts`      | Account/organization management               |
| **timesheets**          | `/api/v1/timesheets`    | Weekly timesheet submission and approval      |
| **dashboard-analytics** | `/api/v1/analytics`     | Aggregated dashboard statistics               |
| **reports**             | `/api/v1/reports`       | Report generation (PDF/Excel)                 |
| **exports**             | `/api/v1/exports`       | Async data export jobs                        |
| **notifications**       | `/api/v1/notifications` | In-app notification system                    |
| **audit-logs**          | `/api/v1/audit-logs`    | System-wide audit trail                       |
| **roles**               | `/api/v1/roles`         | Role definition and management                |
| **permissions**         | `/api/v1/permissions`   | Permission definition and assignment          |
| **supabase**            | —                       | Supabase client integration service           |
| **health**              | `/api/v1/health`        | Health check and readiness probes             |

---

## Frontend Route Map

### Auth Pages (No Dashboard Shell)

| Route              | Page               | Description                  |
| ------------------ | ------------------ | ---------------------------- |
| `/login`           | LoginPage          | Email/password + OAuth login |
| `/register`        | RegisterPage       | New account registration     |
| `/forgot-password` | ForgotPasswordPage | Password reset request       |
| `/reset-password`  | ResetPasswordPage  | Set new password via token   |

### Admin Dashboard (Phase 1)

| Route                             | Page                | Description                              |
| --------------------------------- | ------------------- | ---------------------------------------- |
| `/admin/dashboard`                | AdminDashboardPage  | Analytics cards, charts, activity feed   |
| `/admin/projects`                 | ProjectsListPage    | All projects with filters and search     |
| `/admin/projects/[projectId]`     | ProjectDetailPage   | Single project detail + assigned taskers |
| `/admin/accounts`                 | AccountsListPage    | Client accounts list                     |
| `/admin/accounts/[accountId]`     | AccountDetailPage   | Account detail + associated projects     |
| `/admin/taskers`                  | TaskersListPage     | All taskers with performance metrics     |
| `/admin/taskers/[taskerId]`       | TaskerDetailPage    | Tasker profile + assignment history      |
| `/admin/users/[userId]`           | UserDetailPage      | User profile and role management         |
| `/admin/timesheets`               | TimesheetsListPage  | Pending/approved timesheet list          |
| `/admin/timesheets/[timesheetId]` | TimesheetDetailPage | Timesheet review and approval            |
| `/admin/reports`                  | ReportsPage         | Report generation and download           |
| `/admin/notifications`            | NotificationsPage   | Notification center                      |
| `/admin/audit-logs`               | AuditLogsPage       | System audit trail viewer                |
| `/admin/profile`                  | AdminProfilePage    | Admin's own profile settings             |
| `/admin/settings`                 | SettingsPage        | System-wide settings                     |

### Client Dashboard (Phase 2) & Tasker Dashboard (Phase 3)

Routes are scaffolded under `/client/*` and `/tasker/*` respectively. Implementation will follow Phases 2 and 3.

---

## Database Schema

The PostgreSQL database consists of the following core tables:

| Table               | Purpose                                            | Key Relationships                        |
| ------------------- | -------------------------------------------------- | ---------------------------------------- |
| `users`             | Core authentication (email, password hash, status) | 1:1 → profiles, sessions, oauth_accounts |
| `profiles`          | Extended user info (name, avatar, phone, timezone) | Belongs to users                         |
| `roles`             | Role definitions (admin, client, tasker)           | N:M → users via `user_roles`             |
| `permissions`       | Granular permission definitions                    | N:M → roles via `role_permissions`       |
| `admins`            | Admin-specific metadata                            | 1:1 → users                              |
| `clients`           | Client organization data                           | 1:1 → users, 1:N → projects              |
| `taskers`           | Tasker/annotator data                              | 1:1 → users, N:M → projects              |
| `projects`          | Project definitions and lifecycle                  | N:M → taskers via `project_taskers`      |
| `accounts`          | Organizational accounts                            | 1:1 → owner (user)                       |
| `timesheets`        | Weekly timesheet headers                           | 1:N → timesheet_entries, 1:1 → tasker    |
| `timesheet_entries` | Daily time entries within a timesheet              | Belongs to timesheets                    |
| `notifications`     | User notification records                          | Belongs to users                         |
| `audit_logs`        | System-wide audit trail                            | References users                         |
| `reports`           | Generated report metadata                          | References users (generated_by)          |
| `export_jobs`       | Async export job tracking                          | References users (requested_by)          |
| `sessions`          | Active JWT session records                         | Belongs to users                         |
| `oauth_accounts`    | OAuth provider linkage                             | Belongs to users                         |

Schema SQL files are located in `database/schemas/`.

---

## Authentication & Authorization

### Authentication Strategy

The platform uses a **dual-token JWT authentication** system:

- **Access Token** — Short-lived (15 minutes), sent as Bearer token in `Authorization` header
- **Refresh Token** — Long-lived (7 days), used to rotate access tokens without re-login
- **OAuth** — Google and GitHub login via Passport.js strategies

### Authorization (RBAC)

Authorization is enforced through **three layered guards** applied globally:

```
Request → JwtAuthGuard → RolesGuard → PermissionsGuard → Controller
```

1. **JwtAuthGuard** — Validates the JWT token is present and not expired
2. **RolesGuard** — Checks user has the required role (e.g., `admin`, `client`, `tasker`)
3. **PermissionsGuard** — Checks user has granular permission (e.g., `projects:create`, `timesheets:approve`)

### Role Hierarchy

```
super_admin  →  Full system access, can manage other admins
admin        →  Manage projects, taskers, accounts, timesheets, reports
client       →  View own projects, reports, and billing
tasker       →  View assigned tasks, submit timesheets
```

### Usage in Code

```typescript
// Backend: Protect an endpoint
@Roles('admin')
@Permissions('projects:create')
@Post()
createProject(@Body() dto: CreateProjectDto) { ... }

// Frontend: Conditionally render UI
<RoleGate allowedRoles={['admin']}>
  <CreateProjectButton />
</RoleGate>
```

---

## Shared Packages

### `@annotator/shared-types`

TypeScript interfaces used across the entire stack:

- `User`, `UserProfile`, `Role`
- `JwtPayload`, `TokenPair`, `AuthSession`
- `Project`, `Tasker`, `Timesheet`, `TimesheetEntry`
- `ApiResponse`, `PaginatedResponse`, `Permission`

### `@annotator/shared-constants`

Centralized constants to prevent magic strings:

- Role names, permission strings
- Route paths, API endpoints
- HTTP status codes, error messages

### `@annotator/shared-validation`

Zod schemas for consistent validation:

- Login/register form validation (frontend)
- API request body validation (backend, via Zod-to-class-validator bridge)

### `@annotator/shared-rbac`

Role-based access control logic:

- Role hierarchy definitions
- Permission grant mappings
- `canAccess()` utility for both frontend and backend

### `@annotator/shared-utils`

Pure utility functions:

- Date formatting and manipulation
- String helpers (slugify, truncate, capitalize)
- Number formatting (currency, percentages)
- Array utilities (chunk, unique, groupBy)

---

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Application
NODE_ENV=development
PORT=3001                                    # Backend API port
FRONTEND_URL=http://localhost:3000           # CORS origin

# Database (Supabase or self-hosted PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/annotator_platform
DB_HOST=localhost
DB_PORT=5432
DB_USER=annotator
DB_PASSWORD=your_password
DB_NAME=annotator_platform

# JWT Secrets
JWT_SECRET=your-secure-random-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Supabase (free tier)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth (optional)
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_GITHUB_CLIENT_ID=your-github-client-id
OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

# Redis (optional — for caching and rate limiting)
REDIS_URL=redis://localhost:6379

# Email / SMTP (optional — for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
```

---

## Deployment

### Option 1: Supabase + Vercel (Recommended for small teams)

| Component | Platform         | Notes                            |
| --------- | ---------------- | -------------------------------- |
| Frontend  | Vercel           | Zero-config Next.js deployment   |
| Backend   | Railway / Render | Free tier NestJS hosting         |
| Database  | Supabase         | Free PostgreSQL + Auth + Storage |

### Option 2: Docker (Self-hosted)

```bash
# Start all services
docker-compose up -d

# Services:
# - Frontend:  http://localhost:3000
# - Backend:   http://localhost:3001
# - Postgres:  localhost:5432
# - Redis:     localhost:6379
```

### Option 3: Cloud VPS

Deploy to any Linux VPS (DigitalOcean, AWS EC2, etc.) using the Docker setup or PM2 for process management.

---

## Contributing

### Branch Naming Convention

```
feature/auth-login-page
bugfix/jwt-token-refresh
hotfix/cors-production
chore/update-dependencies
```

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): implement JWT login endpoint
fix(frontend): resolve sidebar collapse on mobile
docs(readme): update getting started section
chore(deps): bump next.js to 15.1.0
```

### Development Workflow

1. Create a feature branch from `main`
2. Make changes following the existing patterns and conventions
3. Run `npm run lint && npm run typecheck && npm run test`
4. Submit a pull request with a clear description

---

## License

This project is **private and proprietary**. All rights reserved.

---

<p align="center">
  Built with TypeScript · Powered by Next.js & NestJS
</p>
