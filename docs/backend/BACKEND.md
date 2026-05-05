# Backend Architecture

## Stack
- NestJS 10 + TypeScript
- TypeORM 0.3 + PostgreSQL
- Passport + JWT + OAuth
- class-validator + class-transformer
- Swagger/OpenAPI

## Module Structure
Each module contains:
- `{module}.module.ts` - Module definition
- `{module}.controller.ts` - API route handlers
- `{module}.service.ts` - Business logic
- `dto/*.dto.ts` - Request/response DTOs
- `entities/*.entity.ts` - TypeORM entities
- `*.spec.ts` - Unit tests

## Global Middleware Stack
1. RequestIdMiddleware
2. CORS
3. Helmet
4. Compression
5. Rate Limiting
6. Cookie Parser

## Guards (Execution Order)
1. JwtAuthGuard - Validates JWT token
2. RolesGuard - Checks role requirements
3. PermissionsGuard - Checks permission requirements
