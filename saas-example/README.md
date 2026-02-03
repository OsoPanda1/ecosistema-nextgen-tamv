# Multi-Tenant Task Manager Example

A minimal SaaS application demonstrating the saas-builder power patterns.

## Architecture

- **Frontend**: React + TypeScript + Tailwind
- **Backend**: Node.js Lambda functions
- **Database**: DynamoDB with tenant isolation
- **Auth**: JWT with tenant context

## Key Features

- Multi-tenant data isolation (tenant ID prefix on all keys)
- Lambda authorizer injects tenant context
- Role-based access control (RBAC)
- RESTful API with OpenAPI spec
- Usage tracking for billing

## Project Structure

```
saas-example/
├── frontend/          # React app
├── backend/           # Lambda functions
├── schema/            # OpenAPI spec
└── README.md
```

## Getting Started

1. Review the OpenAPI spec in `schema/openapi.yaml`
2. Check the Lambda authorizer in `backend/functions/authorizer/`
3. See the multi-tenant API handler in `backend/functions/api/tasks.js`
4. Explore the React frontend in `frontend/src/`

## Multi-Tenant Pattern

Every request follows this flow:
1. API Gateway receives request with JWT token
2. Lambda authorizer validates JWT and extracts tenant ID
3. Authorizer injects tenant context into request
4. API handler uses tenant ID to scope all database operations
5. Response contains only tenant-scoped data

## Next Steps

- Deploy with AWS SAM or CDK
- Add Stripe integration for billing
- Implement usage metering
- Add more CRUD endpoints
