# Testing Strategy

## Frontend Tests
- **Unit**: Jest + React Testing Library
- **Integration**: React Testing Library + MSW
- **E2E**: Playwright

## Backend Tests
- **Unit**: Jest ( NestJS testing utilities )
- **E2E**: Jest with supertest

## Running Tests
```bash
npm run test          # All tests
npm run test:frontend # Frontend only
npm run test:backend  # Backend only
```

## Coverage Targets
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%
