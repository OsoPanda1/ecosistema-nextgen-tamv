# TAMV Core API - Script de Despliegue Automático para AWS ECS Express Mode
# Ejecutar: .\deploy-ecs-express.ps1

param(
    [string]$Region = "us-west-2",
    [string]$ServiceName = "tamv-core-api",
    [string]$ImageTag = "",
    [switch]$SkipBuild = $false,
    [switch]$CreateRepo = $false
)

# Configuración
$ErrorActionPreference = "Stop"
$ECR_REPO_NAME = "tamv-core-api"
$CPU = 1024
$MEMORY = 2048
$PORT = 3000
$HEALTH_CHECK_PATH = "/health"

Write-Host "🚀 TAMV Core API - Despliegue ECS Express Mode" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Generar tag único si no se proporciona
if ([string]::IsNullOrEmpty($ImageTag)) {
    $ImageTag = "v1.0.0-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
}

Write-Host "📋 Configuración del despliegue:" -ForegroundColor Yellow
Write-Host "   Región: $Region"
Write-Host "   Servicio: $ServiceName"
Write-Host "   Tag de imagen: $ImageTag"
Write-Host "   CPU: $CPU"
Write-Host "   Memoria: $MEMORY MB"
Write-Host "   Puerto: $PORT"
Write-Host ""

# Verificar prerrequisitos
Write-Host "🔍 Verificando prerrequisitos..." -ForegroundColor Yellow

# Verificar AWS CLI
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI no está instalado" -ForegroundColor Red
    Write-Host "   Instala desde: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Verificar Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    Write-Host "   Instala desde: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Verificar credenciales AWS
try {
    $awsIdentity = aws sts get-caller-identity --output text --query 'Account' 2>$null
    if ($awsIdentity) {
        Write-Host "✅ Credenciales AWS configuradas (Cuenta: $awsIdentity)" -ForegroundColor Green
    } else {
        throw "No se pudieron obtener las credenciales"
    }
} catch {
    Write-Host "❌ Credenciales AWS no configuradas" -ForegroundColor Red
    Write-Host "   Ejecuta: aws configure" -ForegroundColor Yellow
    exit 1
}

$ACCOUNT_ID = $awsIdentity
$ECR_URI = "$ACCOUNT_ID.dkr.ecr.$Region.amazonaws.com/$ECR_REPO_NAME"

Write-Host ""
Write-Host "🏗️  Preparando despliegue..." -ForegroundColor Yellow

# Crear repositorio ECR si se solicita
if ($CreateRepo) {
    Write-Host "📦 Creando repositorio ECR..." -ForegroundColor Yellow
    try {
        aws ecr create-repository --repository-name $ECR_REPO_NAME --region $Region 2>$null
        Write-Host "✅ Repositorio ECR creado: $ECR_REPO_NAME" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Repositorio ECR ya existe o error al crear" -ForegroundColor Yellow
    }
}

# Verificar si el repositorio existe
try {
    aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $Region >$null 2>&1
    Write-Host "✅ Repositorio ECR encontrado: $ECR_REPO_NAME" -ForegroundColor Green
} catch {
    Write-Host "❌ Repositorio ECR no encontrado: $ECR_REPO_NAME" -ForegroundColor Red
    Write-Host "   Ejecuta con -CreateRepo para crearlo automáticamente" -ForegroundColor Yellow
    exit 1
}

# Login a ECR
Write-Host "🔐 Autenticando con ECR..." -ForegroundColor Yellow
try {
    aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$Region.amazonaws.com
    Write-Host "✅ Autenticación ECR exitosa" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en autenticación ECR" -ForegroundColor Red
    exit 1
}

# Build de la imagen Docker
if (-not $SkipBuild) {
    Write-Host "🐳 Construyendo imagen Docker..." -ForegroundColor Yellow
    try {
        docker build --platform linux/amd64 -t $ECR_REPO_NAME:$ImageTag -t $ECR_REPO_NAME:latest .
        Write-Host "✅ Imagen Docker construida exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error construyendo imagen Docker" -ForegroundColor Red
        exit 1
    }

    # Tag para ECR
    Write-Host "🏷️  Etiquetando imagen para ECR..." -ForegroundColor Yellow
    docker tag $ECR_REPO_NAME:$ImageTag $ECR_URI:$ImageTag
    docker tag $ECR_REPO_NAME:latest $ECR_URI:latest

    # Push a ECR
    Write-Host "📤 Subiendo imagen a ECR..." -ForegroundColor Yellow
    try {
        docker push $ECR_URI:$ImageTag
        docker push $ECR_URI:latest
        Write-Host "✅ Imagen subida exitosamente a ECR" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error subiendo imagen a ECR" -ForegroundColor Red
        exit 1
    }
}

# Crear roles IAM necesarios
Write-Host "🔑 Verificando roles IAM..." -ForegroundColor Yellow

$EXECUTION_ROLE_NAME = "ecsTaskExecutionRole"
$INFRASTRUCTURE_ROLE_NAME = "ecsInfrastructureRoleForExpressServices"

# Verificar/crear rol de ejecución
try {
    aws iam get-role --role-name $EXECUTION_ROLE_NAME >$null 2>&1
    Write-Host "✅ Rol de ejecución encontrado: $EXECUTION_ROLE_NAME" -ForegroundColor Green
} catch {
    Write-Host "📝 Creando rol de ejecución..." -ForegroundColor Yellow
    $trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@
    $trustPolicy | Out-File -FilePath "trust-policy.json" -Encoding utf8
    aws iam create-role --role-name $EXECUTION_ROLE_NAME --assume-role-policy-document file://trust-policy.json
    aws iam attach-role-policy --role-name $EXECUTION_ROLE_NAME --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
    Remove-Item "trust-policy.json"
    Write-Host "✅ Rol de ejecución creado: $EXECUTION_ROLE_NAME" -ForegroundColor Green
}

# Verificar/crear rol de infraestructura
try {
    aws iam get-role --role-name $INFRASTRUCTURE_ROLE_NAME >$null 2>&1
    Write-Host "✅ Rol de infraestructura encontrado: $INFRASTRUCTURE_ROLE_NAME" -ForegroundColor Green
} catch {
    Write-Host "📝 Creando rol de infraestructura..." -ForegroundColor Yellow
    $trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@
    $trustPolicy | Out-File -FilePath "trust-policy.json" -Encoding utf8
    aws iam create-role --role-name $INFRASTRUCTURE_ROLE_NAME --assume-role-policy-document file://trust-policy.json
    aws iam attach-role-policy --role-name $INFRASTRUCTURE_ROLE_NAME --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonECSInfrastructureRoleforExpressGatewayServices"
    Remove-Item "trust-policy.json"
    Write-Host "✅ Rol de infraestructura creado: $INFRASTRUCTURE_ROLE_NAME" -ForegroundColor Green
}

# Desplegar con ECS Express Mode
Write-Host ""
Write-Host "🚀 Desplegando con ECS Express Mode..." -ForegroundColor Cyan

$EXECUTION_ROLE_ARN = "arn:aws:iam::$ACCOUNT_ID`:role/$EXECUTION_ROLE_NAME"
$INFRASTRUCTURE_ROLE_ARN = "arn:aws:iam::$ACCOUNT_ID`:role/$INFRASTRUCTURE_ROLE_NAME"

try {
    $deployResult = aws ecs create-express-gateway-service `
        --execution-role-arn $EXECUTION_ROLE_ARN `
        --infrastructure-role-arn $INFRASTRUCTURE_ROLE_ARN `
        --primary-container "{
            `"image`": `"$ECR_URI`:$ImageTag`",
            `"containerPort`": $PORT,
            `"environment`": [
                {`"name`": `"NODE_ENV`", `"value`": `"production`"},
                {`"name`": `"PORT`", `"value`": `"$PORT`"},
                {`"name`": `"LOG_LEVEL`", `"value`": `"info`"}
            ]
        }" `
        --service-name $ServiceName `
        --cpu $CPU `
        --memory $MEMORY `
        --health-check-path $HEALTH_CHECK_PATH `
        --scaling-target "{`"minTaskCount`":1,`"maxTaskCount`":10}" `
        --region $Region

    Write-Host "✅ Servicio ECS Express creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Información del despliegue:" -ForegroundColor Yellow
    Write-Host "   Servicio: $ServiceName"
    Write-Host "   Imagen: $ECR_URI`:$ImageTag"
    Write-Host "   CPU: $CPU"
    Write-Host "   Memoria: $MEMORY MB"
    Write-Host "   Health Check: $HEALTH_CHECK_PATH"
    Write-Host ""
    
} catch {
    Write-Host "❌ Error desplegando servicio ECS Express" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Monitorear despliegue
Write-Host "⏳ Monitoreando despliegue..." -ForegroundColor Yellow
Write-Host "   Esto puede tomar varios minutos..."

$maxAttempts = 20
$attempt = 0

do {
    Start-Sleep -Seconds 30
    $attempt++
    
    try {
        $serviceStatus = aws ecs describe-services --services $ServiceName --region $Region --query 'services[0].deployments[0].rolloutState' --output text
        Write-Host "   Intento $attempt/$maxAttempts - Estado: $serviceStatus" -ForegroundColor Yellow
        
        if ($serviceStatus -eq "COMPLETED") {
            Write-Host "✅ Despliegue completado exitosamente!" -ForegroundColor Green
            break
        }
        
        if ($serviceStatus -eq "FAILED") {
            Write-Host "❌ Despliegue falló" -ForegroundColor Red
            break
        }
        
    } catch {
        Write-Host "   Error verificando estado del servicio" -ForegroundColor Yellow
    }
    
} while ($attempt -lt $maxAttempts)

if ($attempt -ge $maxAttempts) {
    Write-Host "⚠️  Tiempo de espera agotado. Verifica el estado manualmente." -ForegroundColor Yellow
}

# Obtener endpoint
Write-Host ""
Write-Host "🌐 Obteniendo endpoint del servicio..." -ForegroundColor Yellow

try {
    Start-Sleep -Seconds 60  # Esperar a que se configure el ALB
    
    # Aquí necesitarías obtener el endpoint del servicio
    # El comando exacto depende de cómo ECS Express expone esta información
    Write-Host "✅ Servicio desplegado. Verifica en la consola AWS ECS para obtener el endpoint." -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 ¡Despliegue de TAMV Core API completado!" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Verifica el estado en AWS Console > ECS > Services"
    Write-Host "   2. Obtén el endpoint HTTPS del servicio"
    Write-Host "   3. Prueba el health check: https://tu-endpoint/health"
    Write-Host "   4. Explora la API: https://tu-endpoint/api/v1/ecosystem"
    Write-Host ""
    
} catch {
    Write-Host "⚠️  No se pudo obtener el endpoint automáticamente" -ForegroundColor Yellow
    Write-Host "   Verifica en AWS Console > ECS > Services > $ServiceName" -ForegroundColor Yellow
}

Write-Host "🚀 TAMV DreamWorld v2.0 está ahora en la nube! 🌟" -ForegroundColor Cyan