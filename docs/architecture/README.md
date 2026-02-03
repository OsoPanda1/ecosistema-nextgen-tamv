# TAMV Architecture

## Overview

TAMV follows a clean layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         Frontend Layer              │
│    (React/Next.js Application)      │
└─────────────────────────────────────┘
                 │
                 │ HTTP/REST
                 ▼
┌─────────────────────────────────────┐
│          API Layer                  │
│    (Express.js REST API)            │
└─────────────────────────────────────┘
                 │
                 │
                 ▼
┌─────────────────────────────────────┐
│       Business Logic Layer          │
│    (Services & Domain Logic)        │
└─────────────────────────────────────┘
                 │
                 │
                 ▼
┌─────────────────────────────────────┐
│        Data Access Layer            │
│    (Database & Repositories)        │
└─────────────────────────────────────┘
```

## Core Components

### Frontend

- User interface and user experience
- Client-side state management
- API communication

### Backend API

- RESTful endpoints
- Authentication & authorization
- Request validation
- Rate limiting

### Business Logic

- User management
- Social wall functionality
- Content moderation
- Feed generation

### Data Layer

- PostgreSQL database
- Data models and schemas
- Migrations and seeds

## Security Architecture

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting per endpoint
- HTTPS enforcement
- CORS configuration

## Deployment Architecture

- Docker containerization
- Docker Compose for local development
- Health check endpoints
- Environment-based configuration

## Related Documentation

- [C4 Diagrams](./c4-diagrams.md)
- [API Documentation](../api/README.md)
- [Database Schema](../../database/README.md)
