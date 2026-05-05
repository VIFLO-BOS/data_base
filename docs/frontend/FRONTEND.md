# Frontend Architecture

## Stack
- Next.js 15 App Router
- TypeScript 5.4
- Tailwind CSS 3.4
- shadcn/ui + Radix UI primitives
- Recharts for charts
- TanStack Table for tables
- Zustand for state management
- React Hook Form + Zod for forms
- React Query for server state

## Route Groups
- `(auth)` - Login, register, forgot/reset password
- `(dashboard)/admin` - Admin dashboard pages
- `(dashboard)/client` - Future client dashboard
- `(dashboard)/tasker` - Future tasker dashboard

## Component Architecture
- `ui/` - shadcn/ui primitives
- `layout/` - Dashboard shell, sidebar, mobile drawer
- `shared/` - Reusable cross-cutting components
- `forms/` - Business form components
- `modals/` - Modal dialog components
- `tables/` - Responsive table components
- `cards/` - Card components for dashboards
- `charts/` - Chart wrapper components
- `empty-states/` - Empty state illustrations

## Mobile-First Strategy
1. Base styles target mobile (320px+)
2. `md:` and `lg:` breakpoints enhance for tablet/desktop
3. Sidebar becomes drawer on mobile
4. Tables transform to card lists on mobile
5. Modals are full-screen on mobile
