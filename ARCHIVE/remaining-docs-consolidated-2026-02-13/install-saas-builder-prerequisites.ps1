# Script de instalación de prerequisitos para SaaS Builder Power
# Este script instala UV/UVX y verifica Docker para el poder completo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalador de SaaS Builder Power" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un comando existe
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# 1. Instalar UV (incluye UVX)
Write-Host "[1/4] Verificando UV/UVX..." -ForegroundColor Yellow

if (Test-CommandExists "uvx") {
    Write-Host "✓ UV/UVX ya está instalado" -ForegroundColor Green
    uvx --version
} else {
    Write-Host "→ Instalando UV/UVX..." -ForegroundColor Yellow
    try {
        # Descargar e instalar UV
        powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
        
        # Agregar al PATH de la sesión actual
        $uvPath = "$env:USERPROFILE\.local\bin"
        if (Test-Path $uvPath) {
            $env:Path = "$uvPath;$env:Path"
            Write-Host "✓ UV/UVX instalado correctamente" -ForegroundColor Green
        } else {
            Write-Host "⚠ UV instalado pero necesita reiniciar la terminal" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ Error instalando UV: $_" -ForegroundColor Red
        Write-Host "→ Intenta manualmente: https://docs.astral.sh/uv/getting-started/installation/" -ForegroundColor Yellow
    }
}

Write-Host ""

# 2. Verificar Python (UV lo necesita)
Write-Host "[2/4] Verificando Python..." -ForegroundColor Yellow

if (Test-CommandExists "python") {
    $pythonVersion = python --version
    Write-Host "✓ Python encontrado: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ Python no encontrado" -ForegroundColor Yellow
    Write-Host "→ UV puede descargar Python automáticamente cuando sea necesario" -ForegroundColor Cyan
}

Write-Host ""

# 3. Verificar Docker (para Terraform power)
Write-Host "[3/4] Verificando Docker..." -ForegroundColor Yellow

if (Test-CommandExists "docker") {
    Write-Host "✓ Docker está instalado" -ForegroundColor Green
    docker --version
} else {
    Write-Host "⚠ Docker no encontrado" -ForegroundColor Yellow
    Write-Host "→ Necesario para Terraform Power" -ForegroundColor Cyan
    Write-Host "→ Descarga: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
}

Write-Host ""

# 4. Verificar Node.js (para desarrollo frontend)
Write-Host "[4/4] Verificando Node.js..." -ForegroundColor Yellow

if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    
    if (Test-CommandExists "npm") {
        $npmVersion = npm --version
        Write-Host "✓ NPM encontrado: v$npmVersion" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ Node.js no encontrado" -ForegroundColor Yellow
    Write-Host "→ Recomendado para desarrollo frontend" -ForegroundColor Cyan
    Write-Host "→ Descarga: https://nodejs.org/" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumen de Instalación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Resumen
$uvInstalled = Test-CommandExists "uvx"
$dockerInstalled = Test-CommandExists "docker"
$nodeInstalled = Test-CommandExists "node"

Write-Host "UV/UVX:  $(if($uvInstalled){'✓ Instalado'}else{'✗ No instalado'})" -ForegroundColor $(if($uvInstalled){'Green'}else{'Red'})
Write-Host "Docker:  $(if($dockerInstalled){'✓ Instalado'}else{'⚠ Opcional'})" -ForegroundColor $(if($dockerInstalled){'Green'}else{'Yellow'})
Write-Host "Node.js: $(if($nodeInstalled){'✓ Instalado'}else{'⚠ Opcional'})" -ForegroundColor $(if($nodeInstalled){'Green'}else{'Yellow'})

Write-Host ""

if ($uvInstalled) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ¡Instalación Completada!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Reinicia Kiro (Ctrl+Shift+P → 'Reload Window')" -ForegroundColor White
    Write-Host "2. Los MCP servers se reconectarán automáticamente" -ForegroundColor White
    Write-Host "3. Verifica el panel de MCP Servers en Kiro" -ForegroundColor White
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  Acción Requerida" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor:" -ForegroundColor Cyan
    Write-Host "1. Cierra y reabre PowerShell como Administrador" -ForegroundColor White
    Write-Host "2. Ejecuta este script nuevamente" -ForegroundColor White
    Write-Host "3. O instala UV manualmente desde:" -ForegroundColor White
    Write-Host "   https://docs.astral.sh/uv/getting-started/installation/" -ForegroundColor White
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
