# Annotator Platform Documentation

## Structure
- [Architecture](architecture/ARCHITECTURE.md) - System overview and design decisions
- [Frontend](frontend/FRONTEND.md) - Next.js app structure and patterns
- [Backend](backend/BACKEND.md) - NestJS API structure and patterns
- [Database](database/DATABASE.md) - PostgreSQL schema and migrations
- [API](api/API.md) - REST API contract and versioning
- [Deployment](deployment/DEPLOYMENT.md) - Deployment guides
- [Testing](testing/TESTING.md) - Testing strategy

## Quick Start
1. `npm install` at monorepo root
2. `cp .env.example .env` and configure
3. `docker-compose up -d` to start PostgreSQL and Redis
4. `npm run dev` to start both frontend and backend
