# 📋 Master Project Todo — Implementation Tracker

> **Architecture:** Next.js (Netlify) ↔ NestJS (API Server) ↔ Supabase (Database + Auth)  
> **Current Phase:** Phase 1 — Admin Dashboard Only  
> **RBAC Scope:** Admin role only (login + signup)  
> **Last Updated:** 2026-05-07

---

## How to Use This Guide

Each checkbox below links to a **tutorial file** with full instructions and code.  
Work through them **in order** — each tutorial builds on the previous one.

> **Convention:** ✅ = Done | ⬜ = Todo | 🔄 = In Progress

---

## Phase 1: Backend — Supabase + NestJS Setup

### 1.1 Supabase Project Setup
- ⬜ [**B-01:** Create Supabase Project & Configure Environment](./backend/01-supabase-project-setup.md)

### 1.2 Database Schema
- ⬜ [**B-02:** Run SQL Schemas & Verify Tables in Supabase](./backend/02-database-schema-setup.md)

### 1.3 NestJS Foundation
- ⬜ [**B-03:** Configure NestJS — Database, CORS, Swagger, Guards](./backend/03-nestjs-foundation.md)

### 1.4 Authentication Module
- ⬜ [**B-04:** Build the Auth Module — Register, Login, JWT, Guards](./backend/04-auth-module.md)

### 1.5 Users & Profiles Module
- ⬜ [**B-05:** Build Users & Profiles — Entities, CRUD, DTOs](./backend/05-users-profiles-module.md)

### 1.6 Projects Module
- ⬜ [**B-06:** Build Projects — CRUD, Tasker Assignment, Filtering](./backend/06-projects-module.md)

### 1.7 Taskers Module
- ⬜ [**B-07:** Build Taskers — CRUD, Assignment, Performance Metrics](./backend/07-taskers-module.md)

### 1.8 Accounts Module
- ⬜ [**B-08:** Build Accounts — CRUD, Organization Management](./backend/08-accounts-module.md)

### 1.9 Timesheets Module
- ⬜ [**B-09:** Build Timesheets — Submit, Approve, Reject Workflow](./backend/09-timesheets-module.md)

### 1.10 Roles & Permissions Module
- ⬜ [**B-10:** Build Roles & Permissions — RBAC Management Endpoints](./backend/10-roles-permissions-module.md)

### 1.11 Dashboard Analytics
- ⬜ [**B-11:** Build Analytics — Aggregated Stats, Chart Data, Date Filters](./backend/11-analytics-module.md)

### 1.12 Notifications Module
- ⬜ [**B-12:** Build Notifications — CRUD, Mark Read, Batch Operations](./backend/12-notifications-module.md)

### 1.13 Audit Logs Module
- ⬜ [**B-13:** Build Audit Logs — Auto-logging Interceptor, Query Filters](./backend/13-audit-logs-module.md)

### 1.14 Reports & Exports Module
- ⬜ [**B-14:** Build Reports & Exports — PDF/CSV Generation, Async Jobs](./backend/14-reports-exports-module.md)

### 1.15 Backend Testing
- ⬜ [**B-15:** Testing Strategy — Unit Tests, Integration Tests, E2E](./backend/15-testing.md)

---

## Phase 2: Frontend — Wire Up to Backend

### 2.1 Supabase Client Setup
- ⬜ [**F-01:** Initialize Supabase Client in the Frontend](./frontend/01-supabase-client-setup.md)

### 2.2 Auth Pages
- ⬜ [**F-02:** Build Login, Register, Forgot/Reset Password Pages](./frontend/02-auth-pages.md)

### 2.3 Zustand Stores
- ⬜ [**F-03:** Implement Auth, UI, Notification, Filter Stores](./frontend/03-zustand-stores.md)

### 2.4 API Service Layer
- ⬜ [**F-04:** Build Axios API Client & All Service Files](./frontend/04-api-services.md)

### 2.5 Custom Hooks
- ⬜ [**F-05:** Build React Query Hooks & Utility Hooks](./frontend/05-custom-hooks.md)

### 2.6 Protected Routes & RBAC
- ⬜ [**F-06:** Implement ProtectedRoute, RoleGate, PermissionGate](./frontend/06-protected-routes-rbac.md)

### 2.7 UI Polish
- ⬜ [**F-07:** Loading States, Empty States, Animations, Accessibility](./frontend/07-ui-polish.md)

### 2.8 Netlify Deployment
- ⬜ [**F-08:** Deploy Frontend to Netlify — Config, Env Vars, Domain](./frontend/08-netlify-deployment.md)

---

## Phase 3: Client Dashboard (Future)

- ⬜ [**C-01:** Client Dashboard — Route Setup & Layout](./client-dashboard/01-setup-routes.md)
- ⬜ [**C-02:** Client Dashboard — Main Dashboard Page](./client-dashboard/02-dashboard-page.md)
- ⬜ [**C-03:** Client Dashboard — Projects & Reports Pages](./client-dashboard/03-projects-reports.md)
- ⬜ [**C-04:** Client Dashboard — Billing & Profile Pages](./client-dashboard/04-billing-profile.md)

---

## Phase 4: Tasker Dashboard (Future)

- ⬜ [**T-01:** Tasker Dashboard — Route Setup & Layout](./tasker-dashboard/01-setup-routes.md)
- ⬜ [**T-02:** Tasker Dashboard — Main Dashboard Page](./tasker-dashboard/02-dashboard-page.md)
- ⬜ [**T-03:** Tasker Dashboard — Tasks & Timesheets Pages](./tasker-dashboard/03-tasks-timesheets.md)
- ⬜ [**T-04:** Tasker Dashboard — Performance & Profile Pages](./tasker-dashboard/04-performance-profile.md)

---

## Progress Summary

| Section | Total | Done | Remaining |
|---------|-------|------|-----------|
| Backend (B-01 → B-15) | 15 | 0 | 15 |
| Frontend (F-01 → F-08) | 8 | 0 | 8 |
| Client Dashboard (C-01 → C-04) | 4 | 0 | 4 |
| Tasker Dashboard (T-01 → T-04) | 4 | 0 | 4 |
| **Total** | **31** | **0** | **31** |
