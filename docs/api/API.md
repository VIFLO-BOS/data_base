# API Documentation

## Base URL
`/api/v1/`

## Authentication
All endpoints (except auth) require Bearer token:
```
Authorization: Bearer <access_token>
```

## Swagger UI
Available at `/api/docs` when backend is running.

## Versioning
Current: `v1`
Future versions will use `/api/v2/` with deprecation headers.

## Response Format
```json
{
  "data": {},
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Pagination
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
