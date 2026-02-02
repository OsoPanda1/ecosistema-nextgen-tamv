# Lambda API Example

This example demonstrates how to use the cloud-architect power to build a serverless API following AWS Well-Architected principles.

## Architecture

- **Single Stack Design**: Following cloud-architect guidelines for deployment atomicity
- **Layered Lambda Architecture**: Handler → Service → Model layers
- **L2 Constructs**: Using CDK L2 constructs as the default choice
- **AWS Powertools**: Integrated logging, tracing, and metrics
- **Remocal Testing**: Unit and integration tests following cloud-architect strategy

## Project Structure

```
example-lambda-api/
├── src/
│   ├── app.py              # CDK app entry point
│   ├── stack.py            # Single stack definition
│   └── functions/          # Lambda function code
│       ├── handler.py      # Handler layer
│       ├── service.py      # Service layer (business logic)
│       └── models.py       # Model layer (Pydantic models)
├── tests/
│   ├── unit/              # Unit tests (<1s execution)
│   └── integration/       # Integration tests (1-5s execution)
└── requirements.txt
```

## Key Features

1. **Clear Separation of Concerns**: Handler, service, and model layers
2. **Type Safety**: Pydantic models for request/response validation
3. **Observability**: AWS Powertools for logging, tracing, and metrics
4. **Testing Strategy**: Unit tests for business logic, integration tests for full flow
5. **Environment Configuration**: Dev and prod configurations in app.py

## Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Deploy to development
cdk deploy lambda-api-dev

# Deploy to production
cdk deploy lambda-api-prod
```

## Testing

```bash
# Run unit tests (fast)
pytest tests/unit/

# Run integration tests (with AWS services)
pytest tests/integration/

# Run all tests
pytest
```

## Endpoints

- `GET /` - Welcome message with API information
- `GET /health` - Health check endpoint

This example follows all cloud-architect power guidelines for CDK development with Python.