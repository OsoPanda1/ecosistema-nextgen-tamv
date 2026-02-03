# 🚀 TAMV Core API - Guía de Despliegue ECS Express Mode

## 📋 Resumen

Esta guía te ayudará a desplegar **TAMV Core API** en AWS usando **ECS Express Mode**, que proporciona:

- ✅ Despliegue automático con HTTPS
- ✅ Load balancing automático
- ✅ Escalado automático
- ✅ Monitoreo integrado
- ✅ Alta disponibilidad multi-AZ

## 🎯 Configuración del Servicio

| Parámetro | Valor |
|-----------|-------|
| **Nombre del servicio** | `tamv-core-api` |
| **Puerto** | `3000` |
| **Health Check** | `/health` |
| **CPU** | 1024 (1 vCPU) |
| **Memoria** | 2048 MB (2 GB) |
| **Escalado** | 1-10 instancias |

## 🛠️ Prerrequisitos

### 1. Herramientas Requeridas

```powershell
# Verificar Python (ya instalado)
python --version  # Debe ser 3.10+

# Instalar UV (ya hecho)
pip install uv

# Instalar AWS CLI
# Descargar desde: https://aws.amazon.com/cli/

# Instalar Docker Desktop
# Descargar desde: https://www.docker.com/products/docker-desktop/
```

### 2. Configurar Credenciales AWS

```powershell
# Configurar credenciales
aws configure

# Verificar configuración
aws sts get-caller-identity
```

## 🚀 Métodos de Despliegue

### Método 1: Script Automático (Recomendado)

```powershell
# Navegar al directorio del proyecto
cd TAMV-COMPLETE-PROJECT

# Ejecutar script de despliegue automático
.\deploy-ecs-express.ps1 -CreateRepo

# Con parámetros personalizados
.\deploy-ecs-express.ps1 -Region us-east-1 -ServiceName mi-tamv-api -CreateRepo
```

### Método 2: Docker Compose Local (Testing)

```powershell
# Probar localmente antes de desplegar
docker-compose up -d

# Verificar que funciona
curl http://localhost:3000/health

# Detener servicios locales
docker-compose down
```

### Método 3: Manual con AWS CLI

```powershell
# 1. Crear repositorio ECR
aws ecr create-repository --repository-name tamv-core-api --region us-west-2

# 2. Login a ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com

# 3. Build y push imagen
docker build --platform linux/amd64 -t tamv-core-api .
docker tag tamv-core-api:latest ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/tamv-core-api:latest
docker push ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/tamv-core-api:latest

# 4. Crear servicio ECS Express
aws ecs create-express-gateway-service \
    --execution-role-arn arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole \
    --infrastructure-role-arn arn:aws:iam::ACCOUNT_ID:role/ecsInfrastructureRoleForExpressServices \
    --primary-container '{
        "image": "ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/tamv-core-api:latest",
        "containerPort": 3000,
        "environment": [
            {"name": "NODE_ENV", "value": "production"},
            {"name": "PORT", "value": "3000"}
        ]
    }' \
    --service-name tamv-core-api \
    --cpu 1024 \
    --memory 2048 \
    --health-check-path "/health" \
    --scaling-target '{"minTaskCount":1,"maxTaskCount":10}' \
    --region us-west-2
```

## 🔧 Variables de Entorno

### Variables Básicas (Incluidas)
```
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### Variables Adicionales (Configurar según necesidad)
```
# Base de datos (si usas RDS)
POSTGRES_HOST=tu-rds-endpoint
POSTGRES_DB=tamv_production
POSTGRES_USER=tamv_admin
POSTGRES_PASSWORD=tu-password-seguro

# Cache (si usas ElastiCache)
REDIS_HOST=tu-redis-endpoint
REDIS_PORT=6379

# Seguridad
JWT_SECRET=tu-jwt-secret-seguro
ALLOWED_ORIGINS=https://tu-dominio.com
```

## 📊 Monitoreo del Despliegue

### 1. Verificar Estado del Servicio

```powershell
# Estado del servicio
aws ecs describe-services --services tamv-core-api --region us-west-2

# Estado de las tareas
aws ecs list-tasks --service-name tamv-core-api --region us-west-2
```

### 2. Ver Logs

```powershell
# Logs del servicio (requiere configurar CloudWatch)
aws logs describe-log-groups --log-group-name-prefix "/ecs/tamv-core-api"
```

### 3. Health Checks

Una vez desplegado, verifica:

```bash
# Health check básico
curl https://tu-endpoint/health

# Información del ecosistema
curl https://tu-endpoint/api/v1/ecosystem

# Estado de servicios
curl https://tu-endpoint/api/v1/services
```

## 🎯 Endpoints Disponibles

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Página de bienvenida |
| `GET /health` | Health check para ECS |
| `GET /ready` | Readiness probe |
| `GET /api/v1/status` | Estado del sistema |
| `GET /api/v1/ecosystem` | Información del ecosistema |
| `GET /api/v1/services` | Lista de servicios |

## 🔄 Actualizaciones

### Actualizar el Servicio

```powershell
# 1. Build nueva imagen con nuevo tag
docker build --platform linux/amd64 -t tamv-core-api:v1.0.1 .

# 2. Push a ECR
docker tag tamv-core-api:v1.0.1 ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/tamv-core-api:v1.0.1
docker push ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/tamv-core-api:v1.0.1

# 3. Actualizar servicio
aws ecs update-express-gateway-service \
    --service-name tamv-core-api \
    --primary-container '{
        "image": "ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/tamv-core-api:v1.0.1",
        "containerPort": 3000
    }' \
    --region us-west-2
```

## 🧹 Limpieza

### Eliminar el Servicio

```powershell
# Eliminar servicio ECS Express
aws ecs delete-express-gateway-service --service-name tamv-core-api --region us-west-2

# Eliminar repositorio ECR (opcional)
aws ecr delete-repository --repository-name tamv-core-api --force --region us-west-2
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de autenticación ECR**
   ```powershell
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com
   ```

2. **Imagen no compatible con arquitectura**
   ```powershell
   docker build --platform linux/amd64 -t tamv-core-api .
   ```

3. **Roles IAM faltantes**
   - El script automático los crea
   - Verificar permisos de la cuenta AWS

4. **Health check fallando**
   - Verificar que el puerto 3000 esté expuesto
   - Verificar que `/health` responda correctamente

### Logs de Debugging

```powershell
# Ver logs del contenedor
aws ecs describe-tasks --tasks TASK_ARN --region us-west-2

# Ver eventos del servicio
aws ecs describe-services --services tamv-core-api --region us-west-2 --query 'services[0].events'
```

## 💰 Costos Estimados

| Recurso | Costo Mensual Estimado |
|---------|------------------------|
| ECS Express (1 instancia) | $15-30 |
| ALB | $20-25 |
| ECR Storage | $1-5 |
| CloudWatch Logs | $1-3 |
| **Total** | **$37-63/mes** |

## 🎉 ¡Éxito!

Una vez completado el despliegue:

1. ✅ **TAMV Core API** estará ejecutándose en AWS
2. ✅ Tendrás un **endpoint HTTPS** automático
3. ✅ **Escalado automático** configurado
4. ✅ **Monitoreo** integrado con CloudWatch
5. ✅ **Alta disponibilidad** multi-AZ

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en CloudWatch
2. Verifica la configuración en AWS Console
3. Consulta la documentación de AWS ECS Express Mode
4. Verifica que todos los prerrequisitos estén instalados

---

**🌟 TAMV DreamWorld v2.0 - El Primer Ecosistema Civilizacional Digital del Mundo 🌟**