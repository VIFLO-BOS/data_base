# System Architecture

## Overview
Monorepo containing:
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript + TypeORM + PostgreSQL
- **Database**: PostgreSQL via Supabase (managed) or self-hosted
- **Auth**: JWT + OAuth + RBAC

## Design Principles
1. **Mobile-first responsive design** - All UI components built for mobile, scaled up
2. **Role-based access control** - Route guards, API guards, permission decorators
3. **Modular backend** - Feature modules with clear boundaries
4. **Shared packages** - Types, constants, validation, RBAC, utilities
5. **API-first** - REST API with versioning, Swagger docs
