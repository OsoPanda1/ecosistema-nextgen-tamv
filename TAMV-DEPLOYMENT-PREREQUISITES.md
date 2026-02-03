# TAMV - Prerequisitos y Secrets para Despliegue
## Guía Completa de Configuración Pre-Despliegue

**Versión:** 1.0  
**Fecha:** 2026-02-02  
**Estado:** Producción

---

## 📋 TABLA DE CONTENIDOS

1. [Cuentas y Servicios Requeridos](#cuentas-y-servicios-requeridos)
2. [Secrets y Credenciales](#secrets-y-credenciales)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Configuración de AWS](#configuración-de-aws)
5. [Configuración de Servicios Externos](#configuración-de-servicios-externos)
6. [Variables de Entorno](#variables-de-entorno)
7. [Certificados SSL/TLS](#certificados-ssltls)
8. [Checklist Pre-Despliegue](#checklist-pre-despliegue)

---

## 1. CUENTAS Y SERVICIOS REQUERIDOS

### 1.1 Servicios Cloud Esenciales

#### AWS Account (REQUERIDO)
- **Cuenta AWS** con permisos de administrador
- **Región recomendada:** us-west-2 (Oregon)
- **Servicios a habilitar:**
  - ECS (Elastic Container Service)
  - ECR (Elastic Container Registry)
  - RDS (PostgreSQL)
  - ElastiCache (Redis)
  - VPC (Virtual Private Cloud)
  - ALB (Application Load Balancer)
  - CloudWatch (Monitoring)
  - Secrets Manager
  - IAM (Identity and Access Management)

**Costo estimado:** $200-500/mes (desarrollo), $1,000-3,000/mes (producción)


#### Domain & DNS (REQUERIDO)
- **Dominio registrado:** tamv.org (o tu dominio)
- **DNS Provider:** Route 53, Cloudflare, o similar
- **Subdominios necesarios:**
  - api.tamv.org (API Backend)
  - app.tamv.org (Frontend)
  - admin.tamv.org (Panel Admin)
  - cdn.tamv.org (Assets estáticos)

#### Email Service (REQUERIDO)
- **AWS SES** (Simple Email Service) configurado
- **Dominio verificado** para envío de emails
- **Límites aumentados** (salir de sandbox)
- **Templates de email** configurados

#### CDN & Storage (REQUERIDO)
- **AWS S3** para almacenamiento de archivos
- **CloudFront** para CDN global
- **Buckets necesarios:**
  - tamv-user-uploads (privado)
  - tamv-public-assets (público)
  - tamv-backups (privado, versionado)

### 1.2 Servicios de Terceros (OPCIONAL pero RECOMENDADO)

#### Monitoring & Logging
- **Datadog** o **New Relic** (APM)
- **Sentry** (Error tracking)
- **LogDNA** o **Papertrail** (Log aggregation)

#### Payment Processing (si monetización activa)
- **Stripe** Account
- **PayPal** Business Account
- **Crypto Wallet** (si aceptas crypto)

#### Communication Services
- **Twilio** (SMS/WhatsApp)
- **SendGrid** (Email alternativo)
- **Pusher** o **Ably** (Real-time notifications)

---

## 2. SECRETS Y CREDENCIALES

### 2.1 Secrets Críticos (NUNCA COMMITEAR)


#### JWT Secrets
```bash
# Generar JWT Secret (256-bit)
openssl rand -base64 32

# Ejemplo de output:
# 8f3d9a2b7c1e4f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

**Variables requeridas:**
- `JWT_SECRET` - Secret principal para tokens
- `JWT_REFRESH_SECRET` - Secret para refresh tokens
- `JWT_EXPIRATION` - Tiempo de expiración (ej: "15m", "1h", "7d")
- `JWT_REFRESH_EXPIRATION` - Tiempo refresh (ej: "7d", "30d")

#### Database Credentials
```bash
# PostgreSQL Production
POSTGRES_HOST=tamv-prod.cluster-xxxxx.us-west-2.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=tamv_production
POSTGRES_USER=tamv_admin
POSTGRES_PASSWORD=<GENERAR_PASSWORD_FUERTE>

# Generar password seguro
openssl rand -base64 24
```

**Requisitos de password:**
- Mínimo 24 caracteres
- Incluir mayúsculas, minúsculas, números, símbolos
- NO usar palabras del diccionario
- Rotar cada 90 días

#### Redis Credentials
```bash
REDIS_HOST=tamv-prod.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=<GENERAR_PASSWORD_FUERTE>
REDIS_TLS_ENABLED=true
```

#### AWS Credentials
```bash
# IAM User para deployment
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=<SECRET>
AWS_REGION=us-west-2
AWS_ACCOUNT_ID=123456789012

# Crear IAM User con permisos:
# - AmazonECS_FullAccess
# - AmazonEC2ContainerRegistryFullAccess
# - AmazonRDSFullAccess
# - AmazonElastiCacheFullAccess
# - CloudWatchFullAccess
```


#### Encryption Keys
```bash
# Generar encryption key para datos sensibles
openssl rand -hex 32

# Variables requeridas:
ENCRYPTION_KEY=<64_HEX_CHARACTERS>
ENCRYPTION_ALGORITHM=aes-256-gcm
```

#### API Keys de Servicios Externos
```bash
# Stripe (Payment Processing)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (Email)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@tamv.org
SENDGRID_FROM_NAME=TAMV Platform

# Twilio (SMS)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Sentry (Error Tracking)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production

# Datadog (Monitoring)
DATADOG_API_KEY=...
DATADOG_APP_KEY=...
```

### 2.2 Almacenamiento Seguro de Secrets

#### Opción 1: AWS Secrets Manager (RECOMENDADO)
```bash
# Crear secret en AWS
aws secretsmanager create-secret \
  --name tamv/production/database \
  --secret-string '{"username":"tamv_admin","password":"..."}'

# Crear secret para JWT
aws secretsmanager create-secret \
  --name tamv/production/jwt \
  --secret-string '{"secret":"...","refresh_secret":"..."}'
```

#### Opción 2: Environment Variables Encriptadas
```bash
# Usar AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name /tamv/production/jwt-secret \
  --value "..." \
  --type SecureString \
  --key-id alias/aws/ssm
```


#### Opción 3: .env File (SOLO DESARROLLO LOCAL)
```bash
# Crear .env desde template
cp .env.example .env

# NUNCA commitear .env a git
echo ".env" >> .gitignore

# Encriptar .env para backup
gpg --symmetric --cipher-algo AES256 .env
```

---

## 3. CONFIGURACIÓN DE BASE DE DATOS

### 3.1 PostgreSQL Setup

#### Crear RDS Instance
```bash
# Via AWS CLI
aws rds create-db-instance \
  --db-instance-identifier tamv-production \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username tamv_admin \
  --master-user-password <PASSWORD> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --multi-az \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name tamv-db-subnet
```

#### Configuración Recomendada
- **Instance Type:** db.t3.medium (desarrollo), db.r6g.xlarge (producción)
- **Storage:** 100GB inicial, auto-scaling hasta 1TB
- **Multi-AZ:** Habilitado para alta disponibilidad
- **Backups:** Retención 7 días (desarrollo), 30 días (producción)
- **Encryption:** Habilitado con KMS
- **Performance Insights:** Habilitado

#### Extensiones PostgreSQL Requeridas
```sql
-- Conectar a la base de datos
psql -h <RDS_ENDPOINT> -U tamv_admin -d tamv_production

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
```

