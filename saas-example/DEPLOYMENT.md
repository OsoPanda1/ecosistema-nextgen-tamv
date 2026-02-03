# Deployment Guide

## Prerequisites

- AWS account with credentials configured
- Node.js 18+ installed
- Serverless Framework CLI (`npm install -g serverless`)

## Backend Deployment

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set environment variables:
```bash
export JWT_SECRET="your-secret-key"
```

3. Deploy to AWS:
```bash
npm run deploy
```

This will:
- Create DynamoDB table with tenant isolation
- Deploy Lambda functions (authorizer + API handlers)
- Set up API Gateway with custom authorizer
- Output API endpoint URL

## Frontend Deployment

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/dev
```

3. Build for production:
```bash
npm run build
```

4. Deploy to S3 + CloudFront or Vercel/Netlify

## Testing

1. Get a JWT token from your auth provider (Auth0, Cognito, etc.)
2. Make API requests with `Authorization: Bearer <token>` header
3. Verify tenant isolation by checking different tenant IDs

## Next Steps

- Integrate real authentication (Auth0, Cognito)
- Add Stripe for billing
- Implement usage metering
- Add monitoring with CloudWatch
- Set up CI/CD pipeline
