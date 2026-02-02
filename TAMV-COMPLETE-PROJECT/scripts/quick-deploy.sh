#!/bin/bash

# TAMV Quick Deploy Script - Para desarrollo y testing local
# Developed by Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)
# 
# Despliegue rápido para desarrollo local con Docker Compose

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${ENVIRONMENT:-development}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
error_exit() {
    log_error "$1"
    exit 1
}

# Check prerequisites for local development
check_local_prerequisites() {
    log_info "Checking local prerequisites..."
    
    # Check required tools
    local tools=("docker" "docker-compose" "node" "python3" "git")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error_exit "$tool is required but not installed"
        fi
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error_exit "Docker daemon is not running"
    fi
    
    log_success "Local prerequisites check passed"
}

# Create local environment file
create_local_env() {
    log_info "Creating local environment configuration..."
    
    cat > "$PROJECT_ROOT/.env.local" << 'EOF'
# TAMV Local Development Environment
ENVIRONMENT=development
NODE_ENV=development

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=tamv_dev
POSTGRES_USER=tamv_dev
POSTGRES_PASSWORD=tamv_dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# API Configuration
API_PORT=3000
XR_ENGINE_PORT=3001
QUANTUM_PROCESSOR_PORT=3002
ISABELLA_AI_PORT=3003
BLOCKCHAIN_SERVICE_PORT=3004
SECURITY_SERVICE_PORT=3005

# JWT Secret (for development only)
JWT_SECRET=tamv_dev_jwt_secret_key_not_for_production

# Isabella AI Configuration
ISABELLA_MODEL_VERSION=v2.1-dev
ISABELLA_ETHICAL_MODE=development
ISABELLA_DEBUG=true

# Quantum Configuration (Simulator)
QUANTUM_BACKEND=simulator
QUANTUM_MAX_QUBITS=32

# Security (Development mode)
TENOCHTITLAN_MODE=development
SECURITY_LEVEL=development
ENABLE_DEBUG_LOGS=true

# Frontend URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3000/api
XR_URL=http://localhost:3001
AI_URL=http://localhost:3003

# Development flags
ENABLE_HOT_RELOAD=true
ENABLE_DEBUG_MODE=true
SKIP_AUTH_IN_DEV=false
MOCK_EXTERNAL_SERVICES=true
EOF
    
    log_success "Local environment file created"
}

# Create Docker Compose file for local development
create_docker_compose() {
    log_info "Creating Docker Compose configuration..."
    
    cat > "$PROJECT_ROOT/docker-compose.dev.yml" << 'EOF'
version: '3.8'

services:
  # Database Services
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: tamv_dev
      POSTGRES_USER: tamv_dev
      POSTGRES_PASSWORD: tamv_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/immortal-core/tamv-immortal-core-v1.1.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tamv_dev"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # TAMV Core Services
  tamv-core-api:
    build:
      context: .
      dockerfile: docker/tamv-core-api/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - POSTGRES_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
    command: npm run dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  tamv-xr-renderer:
    build:
      context: .
      dockerfile: docker/tamv-xr-renderer/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - CORE_API_URL=http://tamv-core-api:3000
    depends_on:
      tamv-core-api:
        condition: service_healthy
    volumes:
      - ./src/xr-engine:/app/src
    command: npm run dev

  tamv-quantum-processor:
    build:
      context: .
      dockerfile: docker/tamv-quantum-processor/Dockerfile
    ports:
      - "3002:3002"
    environment:
      - PYTHON_ENV=development
      - QUANTUM_BACKEND=simulator
      - CORE_API_URL=http://tamv-core-api:3000
    depends_on:
      tamv-core-api:
        condition: service_healthy
    volumes:
      - ./src/quantum-engine:/app/src
    command: python -m uvicorn main:app --host 0.0.0.0 --port 3002 --reload

  tamv-isabella-ai:
    build:
      context: .
      dockerfile: docker/tamv-isabella-ai/Dockerfile
    ports:
      - "3003:3003"
    environment:
      - PYTHON_ENV=development
      - ISABELLA_MODE=development
      - CORE_API_URL=http://tamv-core-api:3000
    depends_on:
      tamv-core-api:
        condition: service_healthy
    volumes:
      - ./src/ai/isabella-universal:/app/src
    command: python -m uvicorn main:app --host 0.0.0.0 --port 3003 --reload

  tamv-blockchain-service:
    build:
      context: .
      dockerfile: docker/tamv-blockchain-service/Dockerfile
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=development
      - BLOCKCHAIN_NETWORK=development
      - CORE_API_URL=http://tamv-core-api:3000
    depends_on:
      tamv-core-api:
        condition: service_healthy
    volumes:
      - ./src/blockchain/msr-chain:/app/src
    command: npm run dev

  tamv-security-service:
    build:
      context: .
      dockerfile: docker/tamv-security-service/Dockerfile
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=development
      - TENOCHTITLAN_MODE=development
      - CORE_API_URL=http://tamv-core-api:3000
    depends_on:
      tamv-core-api:
        condition: service_healthy
    volumes:
      - ./src/security/tenochtitlan:/app/src
    command: npm run dev

  # Development Tools
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: tamv-dev-network
EOF
    
    log_success "Docker Compose configuration created"
}

# Create Dockerfiles for each service
create_dockerfiles() {
    log_info "Creating Dockerfiles for services..."
    
    # Create docker directory
    mkdir -p "$PROJECT_ROOT/docker"
    
    # TAMV Core API Dockerfile
    mkdir -p "$PROJECT_ROOT/docker/tamv-core-api"
    cat > "$PROJECT_ROOT/docker/tamv-core-api/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
EOF

    # XR Renderer Dockerfile
    mkdir -p "$PROJECT_ROOT/docker/tamv-xr-renderer"
    cat > "$PROJECT_ROOT/docker/tamv-xr-renderer/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies for XR rendering
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy XR engine source
COPY src/xr-engine/ ./src/

EXPOSE 3001

CMD ["npm", "run", "start:xr"]
EOF

    # Quantum Processor Dockerfile
    mkdir -p "$PROJECT_ROOT/docker/tamv-quantum-processor"
    cat > "$PROJECT_ROOT/docker/tamv-quantum-processor/Dockerfile" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install quantum computing libraries
RUN pip install qiskit qiskit-aer cirq tensorflow-quantum

# Copy quantum engine source
COPY src/quantum-engine/ ./src/

EXPOSE 3002

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3002"]
EOF

    # Isabella AI Dockerfile
    mkdir -p "$PROJECT_ROOT/docker/tamv-isabella-ai"
    cat > "$PROJECT_ROOT/docker/tamv-isabella-ai/Dockerfile" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install AI/ML libraries
RUN pip install torch torchvision transformers scikit-learn pandas numpy

# Copy Isabella AI source
COPY src/ai/isabella-universal/ ./src/

EXPOSE 3003

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3003"]
EOF

    # Blockchain Service Dockerfile
    mkdir -p "$PROJECT_ROOT/docker/tamv-blockchain-service"
    cat > "$PROJECT_ROOT/docker/tamv-blockchain-service/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Install blockchain dependencies
RUN npm install web3 ethers @openzeppelin/contracts

# Copy blockchain source
COPY src/blockchain/msr-chain/ ./src/

EXPOSE 3004

CMD ["npm", "run", "start:blockchain"]
EOF

    # Security Service Dockerfile
    mkdir -p "$PROJECT_ROOT/docker/tamv-security-service"
    cat > "$PROJECT_ROOT/docker/tamv-security-service/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy security source
COPY src/security/tenochtitlan/ ./src/

EXPOSE 3005

CMD ["npm", "run", "start:security"]
EOF

    log_success "Dockerfiles created for all services"
}

# Create package.json with development scripts
create_package_json() {
    log_info "Creating package.json with development scripts..."
    
    cat > "$PROJECT_ROOT/package.json" << 'EOF'
{
  "name": "tamv-dreamworld-v2",
  "version": "2.0.0",
  "description": "TAMV DreamWorld v2.0 - Complete Digital Ecosystem",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "start:xr": "node src/xr-engine/tamv-4d-renderer.js",
    "start:blockchain": "node src/blockchain/msr-chain/msr-blockchain.js",
    "start:security": "node src/security/tenochtitlan/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "build": "webpack --mode production",
    "docker:build": "docker-compose -f docker-compose.dev.yml build",
    "docker:up": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:down": "docker-compose -f docker-compose.dev.yml down",
    "docker:logs": "docker-compose -f docker-compose.dev.yml logs -f",
    "quick-deploy": "./scripts/quick-deploy.sh",
    "health-check": "curl -f http://localhost:3000/health"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "redis": "^4.6.7",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.9.2",
    "winston": "^3.10.0",
    "axios": "^1.4.0",
    "socket.io": "^4.7.2",
    "three": "^0.154.0",
    "web3": "^4.0.3",
    "ethers": "^6.7.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "webpack": "^5.88.2",
    "webpack-cli": "^5.1.4"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "author": "Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)",
  "license": "MIT"
}
EOF

    log_success "Package.json created"
}

# Create Python requirements file
create_requirements() {
    log_info "Creating Python requirements file..."
    
    cat > "$PROJECT_ROOT/requirements.txt" << 'EOF'
# TAMV Python Dependencies
fastapi==0.103.0
uvicorn[standard]==0.23.2
pydantic==2.3.0
sqlalchemy==2.0.20
alembic==1.11.3
psycopg2-binary==2.9.7
redis==4.6.0
celery==5.3.1

# AI/ML Dependencies
torch==2.0.1
torchvision==0.15.2
transformers==4.33.2
scikit-learn==1.3.0
pandas==2.0.3
numpy==1.24.3
matplotlib==3.7.2
seaborn==0.12.2

# Quantum Computing
qiskit==0.44.1
qiskit-aer==0.12.2
cirq==1.2.0
tensorflow-quantum==0.7.3

# Security
cryptography==41.0.4
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0

# Utilities
python-multipart==0.0.6
python-dotenv==1.0.0
requests==2.31.0
aiohttp==3.8.5
websockets==11.0.3

# Development
pytest==7.4.0
pytest-asyncio==0.21.1
black==23.7.0
flake8==6.0.0
mypy==1.5.1
EOF

    log_success "Requirements.txt created"
}

# Start local development environment
start_local_environment() {
    log_info "Starting local development environment..."
    
    # Build and start services
    cd "$PROJECT_ROOT"
    
    # Install Node.js dependencies
    if [ -f "package.json" ]; then
        log_info "Installing Node.js dependencies..."
        npm install
    fi
    
    # Install Python dependencies
    if [ -f "requirements.txt" ]; then
        log_info "Installing Python dependencies..."
        pip3 install -r requirements.txt
    fi
    
    # Build Docker images
    log_info "Building Docker images..."
    docker-compose -f docker-compose.dev.yml build
    
    # Start services
    log_info "Starting services..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    local services=("postgres" "redis" "tamv-core-api")
    for service in "${services[@]}"; do
        if docker-compose -f docker-compose.dev.yml ps "$service" | grep -q "Up"; then
            log_success "$service is running"
        else
            log_warning "$service is not running properly"
        fi
    done
}

# Show local environment info
show_environment_info() {
    log_info "TAMV Local Development Environment Ready!"
    echo ""
    echo "🌟 Services Available:"
    echo "   📊 Core API: http://localhost:3000"
    echo "   🔮 XR Renderer: http://localhost:3001"
    echo "   ⚛️ Quantum Processor: http://localhost:3002"
    echo "   🤖 Isabella AI: http://localhost:3003"
    echo "   ⛓️ Blockchain Service: http://localhost:3004"
    echo "   🛡️ Security Service: http://localhost:3005"
    echo ""
    echo "🛠️ Development Tools:"
    echo "   📊 Database Admin: http://localhost:8080"
    echo "   🔴 Redis Commander: http://localhost:8081"
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
    echo "   Restart service: docker-compose -f docker-compose.dev.yml restart SERVICE_NAME"
    echo "   Health check: npm run health-check"
    echo ""
    echo "🔧 Configuration:"
    echo "   Environment: development"
    echo "   Database: PostgreSQL (localhost:5432)"
    echo "   Cache: Redis (localhost:6379)"
    echo "   Hot reload: Enabled"
    echo ""
}

# Stop local environment
stop_local_environment() {
    log_info "Stopping local development environment..."
    
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.dev.yml down
    
    log_success "Local environment stopped"
}

# Clean up local environment
cleanup_local_environment() {
    log_info "Cleaning up local development environment..."
    
    cd "$PROJECT_ROOT"
    
    # Stop and remove containers
    docker-compose -f docker-compose.dev.yml down -v
    
    # Remove images
    docker-compose -f docker-compose.dev.yml down --rmi all
    
    # Clean up Docker system
    docker system prune -f
    
    log_success "Local environment cleaned up"
}

# Main function
main() {
    local action="${1:-start}"
    
    case "$action" in
        "start"|"up")
            log_info "Starting TAMV local development environment..."
            check_local_prerequisites
            create_local_env
            create_docker_compose
            create_dockerfiles
            create_package_json
            create_requirements
            start_local_environment
            show_environment_info
            ;;
        "stop"|"down")
            log_info "Stopping local environment..."
            stop_local_environment
            ;;
        "restart")
            log_info "Restarting local environment..."
            stop_local_environment
            sleep 5
            start_local_environment
            show_environment_info
            ;;
        "cleanup"|"clean")
            log_info "Cleaning up local environment..."
            cleanup_local_environment
            ;;
        "logs")
            cd "$PROJECT_ROOT"
            docker-compose -f docker-compose.dev.yml logs -f
            ;;
        "status")
            cd "$PROJECT_ROOT"
            docker-compose -f docker-compose.dev.yml ps
            ;;
        "health")
            log_info "Checking service health..."
            curl -f http://localhost:3000/health || log_error "Core API not responding"
            curl -f http://localhost:3001/health || log_error "XR Renderer not responding"
            curl -f http://localhost:3002/health || log_error "Quantum Processor not responding"
            curl -f http://localhost:3003/health || log_error "Isabella AI not responding"
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|cleanup|logs|status|health}"
            echo ""
            echo "Commands:"
            echo "  start/up    - Start local development environment"
            echo "  stop/down   - Stop local development environment"
            echo "  restart     - Restart local development environment"
            echo "  cleanup     - Clean up all local resources"
            echo "  logs        - Show service logs"
            echo "  status      - Show service status"
            echo "  health      - Check service health"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"