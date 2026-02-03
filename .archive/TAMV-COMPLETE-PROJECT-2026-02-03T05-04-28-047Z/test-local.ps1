# TAMV Core API - Script de Testing Local
# Ejecutar: .\test-local.ps1

param(
    [switch]$Build = $false,
    [switch]$Stop = $false,
    [switch]$Logs = $false,
    [switch]$Clean = $false
)

Write-Host "🧪 TAMV Core API - Testing Local" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Verificar Docker
try {
    docker --version >$null 2>&1
    Write-Host "✅ Docker está disponible" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está disponible" -ForegroundColor Red
    Write-Host "   Instala Docker Desktop y asegúrate de que esté ejecutándose" -ForegroundColor Yellow
    exit 1
}

# Verificar que Docker esté ejecutándose
try {
    docker info >$null 2>&1
    Write-Host "✅ Docker daemon está ejecutándose" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker daemon no está ejecutándose" -ForegroundColor Red
    Write-Host "   Inicia Docker Desktop" -ForegroundColor Yellow
    exit 1
}

if ($Stop) {
    Write-Host ""
    Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    exit 0
}

if ($Clean) {
    Write-Host ""
    Write-Host "🧹 Limpiando contenedores y volúmenes..." -ForegroundColor Yellow
    docker-compose down -v --remove-orphans
    docker system prune -f
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
    exit 0
}

if ($Logs) {
    Write-Host ""
    Write-Host "📋 Mostrando logs..." -ForegroundColor Yellow
    docker-compose logs -f tamv-core-api
    exit 0
}

# Build si se solicita
if ($Build) {
    Write-Host ""
    Write-Host "🔨 Construyendo imagen..." -ForegroundColor Yellow
    docker-compose build tamv-core-api
}

Write-Host ""
Write-Host "🚀 Iniciando servicios locales..." -ForegroundColor Yellow

# Iniciar servicios
docker-compose up -d

Write-Host ""
Write-Host "⏳ Esperando que los servicios estén listos..." -ForegroundColor Yellow

# Esperar a que los servicios estén listos
$maxAttempts = 30
$attempt = 0

do {
    Start-Sleep -Seconds 2
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ TAMV Core API está listo!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "   Intento $attempt/$maxAttempts - Esperando..." -ForegroundColor Yellow
    }
    
} while ($attempt -lt $maxAttempts)

if ($attempt -ge $maxAttempts) {
    Write-Host "❌ Timeout esperando que el servicio esté listo" -ForegroundColor Red
    Write-Host "   Verifica los logs: docker-compose logs tamv-core-api" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡Servicios iniciados correctamente!" -ForegroundColor Green
Write-Host ""

# Mostrar información de los servicios
Write-Host "📊 Estado de los servicios:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "🌐 Endpoints disponibles:" -ForegroundColor Cyan
Write-Host "   • API Principal: http://localhost:3000" -ForegroundColor White
Write-Host "   • Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host "   • Ecosystem Info: http://localhost:3000/api/v1/ecosystem" -ForegroundColor White
Write-Host "   • Services List: http://localhost:3000/api/v1/services" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  Herramientas de desarrollo:" -ForegroundColor Cyan
Write-Host "   • Adminer (DB): http://localhost:8080" -ForegroundColor White
Write-Host "   • Redis Commander: http://localhost:8081" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Ejecutando tests básicos..." -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "   1. Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    if ($healthResponse.status -eq "healthy") {
        Write-Host "      ✅ Health Check OK" -ForegroundColor Green
    } else {
        Write-Host "      ❌ Health Check Failed" -ForegroundColor Red
    }
} catch {
    Write-Host "      ❌ Health Check Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API Status
Write-Host "   2. API Status..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/status" -Method Get
    if ($statusResponse.ecosystem -eq "TAMV DreamWorld v2.0") {
        Write-Host "      ✅ API Status OK" -ForegroundColor Green
    } else {
        Write-Host "      ❌ API Status Failed" -ForegroundColor Red
    }
} catch {
    Write-Host "      ❌ API Status Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Ecosystem Info
Write-Host "   3. Ecosystem Info..." -ForegroundColor Yellow
try {
    $ecosystemResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/ecosystem" -Method Get
    if ($ecosystemResponse.name -eq "TAMV DreamWorld v2.0") {
        Write-Host "      ✅ Ecosystem Info OK" -ForegroundColor Green
        Write-Host "      📊 Usuarios activos: $($ecosystemResponse.statistics.activeUsers)" -ForegroundColor Cyan
        Write-Host "      💰 Ingresos mensuales: `$$($ecosystemResponse.statistics.monthlyRevenue)" -ForegroundColor Cyan
    } else {
        Write-Host "      ❌ Ecosystem Info Failed" -ForegroundColor Red
    }
} catch {
    Write-Host "      ❌ Ecosystem Info Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   • Ver logs: .\test-local.ps1 -Logs" -ForegroundColor White
Write-Host "   • Detener: .\test-local.ps1 -Stop" -ForegroundColor White
Write-Host "   • Limpiar: .\test-local.ps1 -Clean" -ForegroundColor White
Write-Host "   • Rebuild: .\test-local.ps1 -Build" -ForegroundColor White

Write-Host ""
Write-Host "🚀 TAMV Core API ejecutándose localmente!" -ForegroundColor Green
Write-Host "   Presiona Ctrl+C para ver los logs en tiempo real" -ForegroundColor Yellow
Write-Host "   O ejecuta: docker-compose logs -f tamv-core-api" -ForegroundColor Yellow

Write-Host ""
Write-Host "📝 Próximo paso: Desplegar a AWS con .\deploy-ecs-express.ps1 -CreateRepo" -ForegroundColor Cyan