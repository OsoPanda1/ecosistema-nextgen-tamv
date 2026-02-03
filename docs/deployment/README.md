# TAMV Deployment Guide

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 14.0
- **Docker**: >= 20.10 (for containerized deployment)
- **Docker Compose**: >= 2.0 (for local development)

### System Requirements

- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space
- **OS**: Linux, macOS, or Windows with WSL2

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tamv
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and configure it:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your local configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tamv_dev
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3000
```

### 4. Set Up Database

Start PostgreSQL (or use Docker Compose):

```bash
docker-compose up -d postgres
```

Run migrations:

```bash
npm run db:migrate
```

Seed development data (optional):

```bash
npm run db:seed
```

### 5. Start Development Servers

Backend:

```bash
npm run backend:dev
```

Frontend (when configured):

```bash
npm run frontend:dev
```

## Docker Deployment

### Using Docker Compose

Start all services:

```bash
docker-compose up -d
```

View logs:

```bash
docker-compose logs -f
```

Stop services:

```bash
docker-compose down
```

### Building Docker Images

Backend:

```bash
docker build -t tamv-backend:latest -f backend/Dockerfile .
```

## Production Deployment

### Environment Configuration

Ensure all production environment variables are set:

```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Migrations

Run migrations in production:

```bash
NODE_ENV=production npm run db:migrate
```

### Health Checks

The backend exposes a health check endpoint:

```
GET /health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "database": "connected"
}
```

### Monitoring

- Monitor the `/health` endpoint
- Set up logging aggregation
- Configure alerts for errors and downtime

## Rollback Procedures

### Database Rollback

To rollback the last migration:

```bash
npm run db:migrate:rollback
```

### Application Rollback

1. Stop the current deployment
2. Deploy the previous version
3. Verify health checks pass
4. Monitor for errors

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Verify network connectivity
- Check firewall rules

### Port Already in Use

Change the PORT in `.env` file or stop the conflicting process.

### Migration Failures

- Check database permissions
- Verify migration files are valid
- Review migration logs
- Rollback and retry if needed

## Security Checklist

- [ ] All secrets are stored securely (not in code)
- [ ] HTTPS is enforced in production
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Database backups are configured
- [ ] Monitoring and alerting are set up
- [ ] Security headers are configured
- [ ] Input validation is enabled on all endpoints

## Support

For deployment issues, please:

1. Check the troubleshooting section
2. Review application logs
3. Consult the architecture documentation
4. Contact the development team
