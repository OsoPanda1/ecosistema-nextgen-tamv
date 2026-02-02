# Deployment Guide

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Node.js 18+** installed
3. **Serverless Framework** installed globally: `npm install -g serverless`

## Backend Deployment

```bash
cd backend
npm install
serverless deploy --stage dev
```

This will create:
- Lambda functions (authorizer + task API)
- DynamoDB table with tenant isolation
- API Gateway with CORS
- IAM roles and policies

## Frontend Setup

```bash
cd frontend
npm install

# Create environment file
echo "REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/dev" > .env.local

# Start development server
npm start
```

## Testing Multi-Tenant Isolation

### 1. Create Test JWTs

Use the JWT debugger at jwt.io to create test tokens:

**Tenant A User:**
```json
{
  "sub": "user-123",
  "email": "alice@companyA.com",
  "tenantId": "tenant-A",
  "roles": ["user", "admin"],
  "iat": 1709553600,
  "exp": 1709640000
}
```

**Tenant B User:**
```json
{
  "sub": "user-456", 
  "email": "bob@companyB.com",
  "tenantId": "tenant-B",
  "roles": ["user"],
  "iat": 1709553600,
  "exp": 1709640000
}
```

### 2. Test API Endpoints

```bash
# Create task for Tenant A
curl -X POST https://your-api.amazonaws.com/dev/tasks \
  -H "Authorization: Bearer TENANT_A_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title": "Tenant A Task", "priority": "high"}'

# Create task for Tenant B  
curl -X POST https://your-api.amazonaws.com/dev/tasks \
  -H "Authorization: Bearer TENANT_B_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title": "Tenant B Task", "priority": "low"}'

# Verify isolation - Tenant A should only see their tasks
curl -X GET https://your-api.amazonaws.com/dev/tasks \
  -H "Authorization: Bearer TENANT_A_JWT"
```

### 3. Verify DynamoDB Data

Check the DynamoDB table to see tenant-prefixed keys:
- `tenant-A#Task` partition contains only Tenant A's tasks
- `tenant-B#Task` partition contains only Tenant B's tasks
- No cross-tenant data access possible

## Key Security Features Demonstrated

1. **Tenant Isolation**: All data prefixed with tenant ID
2. **JWT Validation**: Lambda authorizer validates all requests
3. **Role-Based Access**: Admin vs user permissions
4. **Usage Tracking**: Events published to EventBridge for billing
5. **CORS Protection**: Proper headers for browser security

## Cost Optimization

- **Pay-per-use**: DynamoDB on-demand, Lambda per-request
- **Zero idle cost**: No servers running when not in use
- **Efficient queries**: Single-table design with GSI
- **Minimal cold starts**: Lightweight functions

## Production Checklist

- [ ] Replace JWT secret with AWS Secrets Manager
- [ ] Enable CloudWatch logging and monitoring
- [ ] Set up proper CI/CD pipeline
- [ ] Configure custom domain with SSL
- [ ] Enable AWS WAF for API protection
- [ ] Set up backup and disaster recovery
- [ ] Implement rate limiting per tenant
- [ ] Add comprehensive error handling
- [ ] Set up usage alerts and billing
- [ ] Enable encryption at rest and in transit