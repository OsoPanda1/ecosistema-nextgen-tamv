# Multi-Tenant Task Management SaaS

A simple example demonstrating SaaS Builder patterns for a task management application.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: AWS Lambda functions with Node.js
- **Database**: DynamoDB with tenant isolation
- **Auth**: JWT with tenant context
- **Billing**: Usage-based pricing per task created

## Key Features

- Complete tenant isolation (Company A cannot see Company B's tasks)
- Role-based access (admin, user roles)
- Usage tracking for billing
- Responsive design
- RESTful API design

## Project Structure

```
saas-example/
├── frontend/          # React application
├── backend/           # Lambda functions
├── schema/            # API contracts
└── README.md
```

## Getting Started

1. Review the code structure
2. Deploy backend infrastructure
3. Configure authentication
4. Run frontend locally
5. Test multi-tenant isolation