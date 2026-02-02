# TAMV - Instalacion Manual de Prerrequisitos
# Ejecutar como Administrador

Write-Host "TAMV - Instalacion Manual" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# 1. Verificar Python
Write-Host "1. Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "Python OK: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python NO encontrado" -ForegroundColor Red
    Write-Host "Descarga desde: https://www.python.org/downloads/" -ForegroundColor Yellow
}

# 2. Instalar UV
Write-Host ""
Write-Host "2. Instalando UV..." -ForegroundColor Yellow
try {
    pip install uv --user
    Write-Host "UV instalado correctamente" -ForegroundColor Green
} catch {
    Write-Host "Error instalando UV" -ForegroundColor Red
}

# 3. Verificar Docker
Write-Host ""
Write-Host "3. Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "Docker OK: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker NO encontrado" -ForegroundColor Red
    Write-Host "Descarga desde: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host "Instala Docker Desktop y reinicia el sistema" -ForegroundColor Yellow
}

# 4. Verificar AWS CLI
Write-Host ""
Write-Host "4. Verificando AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version
    Write-Host "AWS CLI OK: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "AWS CLI NO encontrado" -ForegroundColor Red
    Write-Host "Descarga desde: https://aws.amazon.com/cli/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "RESUMEN:" -ForegroundColor Cyan
Write-Host "========" -ForegroundColor Cyan
Write-Host "Si algun componente falta, instalalo manualmente" -ForegroundColor Yellow
Write-Host "Luego ejecuta: .\deploy-ecs-express.ps1 -CreateRepo" -ForegroundColor Green