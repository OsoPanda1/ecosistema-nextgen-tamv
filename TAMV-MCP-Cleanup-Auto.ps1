# TAMV MCP Cleanup Script - Automated Version
# Soluciona errores persistentes de logs y procesos MCP colgados

Write-Host "🔧 TAMV MCP Cleanup Script - Iniciando..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Función para escribir logs con timestamp
function Write-Log($message, $color = "White") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message" -ForegroundColor $color
}

# Paso 1: Identificar procesos problemáticos
Write-Log "🔍 Identificando procesos MCP problemáticos..." "Yellow"

$mcpProcesses = Get-Process | Where-Object {
    $_.ProcessName -like "*uvx*" -or 
    $_.ProcessName -like "*mcp*" -or
    $_.ProcessName -like "*stripe*" -or
    $_.ProcessName -like "*aws*"
} -ErrorAction SilentlyContinue

if ($mcpProcesses) {
    Write-Log "📊 Procesos MCP encontrados:" "Cyan"
    $mcpProcesses | ForEach-Object {
        $cpuUsage = if ($_.CPU) { [math]::Round($_.CPU, 2) } else { "N/A" }
        $memoryMB = [math]::Round($_.WorkingSet / 1MB, 2)
        Write-Log "   - $($_.ProcessName) (PID: $($_.Id)) - CPU: $cpuUsage - Memoria: ${memoryMB}MB" "White"
    }
} else {
    Write-Log "✅ No se encontraron procesos MCP activos" "Green"
}

# Paso 2: Terminar procesos problemáticos
Write-Log "🛑 Terminando procesos MCP problemáticos..." "Yellow"

try {
    $terminatedCount = 0
    
    # Terminar procesos uvx
    $uvxProcesses = Get-Process | Where-Object {$_.ProcessName -like "*uvx*"} -ErrorAction SilentlyContinue
    if ($uvxProcesses) {
        $uvxProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        $terminatedCount += $uvxProcesses.Count
        Write-Log "   ✅ Terminados $($uvxProcesses.Count) procesos uvx" "Green"
    }
    
    # Terminar procesos MCP específicos
    $mcpSpecific = Get-Process | Where-Object {
        $_.ProcessName -like "*mcp*" -or
        $_.ProcessName -like "*stripe-mcp*" -or
        $_.ProcessName -like "*aws-mcp*"
    } -ErrorAction SilentlyContinue
    
    if ($mcpSpecific) {
        $mcpSpecific | Stop-Process -Force -ErrorAction SilentlyContinue
        $terminatedCount += $mcpSpecific.Count
        Write-Log "   ✅ Terminados $($mcpSpecific.Count) procesos MCP específicos" "Green"
    }
    
    if ($terminatedCount -eq 0) {
        Write-Log "   ℹ️ No se encontraron procesos problemáticos para terminar" "Cyan"
    } else {
        Write-Log "   🎯 Total de procesos terminados: $terminatedCount" "Green"
    }
    
} catch {
    Write-Log "   ⚠️ Error al terminar procesos: $($_.Exception.Message)" "Red"
}

# Paso 3: Limpiar archivos temporales
Write-Log "🧹 Limpiando archivos temporales MCP..." "Yellow"

$tempPaths = @(
    "$env:TEMP\*mcp*",
    "$env:TEMP\*uvx*",
    "$env:TEMP\*stripe*",
    "$env:LOCALAPPDATA\Temp\*mcp*",
    "$env:LOCALAPPDATA\Temp\*uvx*"
)

$cleanedFiles = 0
foreach ($path in $tempPaths) {
    try {
        $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
        if ($files) {
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
            $cleanedFiles += $files.Count
        }
    } catch {
        # Ignorar errores de archivos en uso
    }
}

if ($cleanedFiles -gt 0) {
    Write-Log "   ✅ Limpiados $cleanedFiles archivos temporales" "Green"
} else {
    Write-Log "   ℹ️ No se encontraron archivos temporales para limpiar" "Cyan"
}

# Paso 4: Limpiar cache de uvx/uv
Write-Log "🗂️ Limpiando cache de uvx/uv..." "Yellow"

try {
    if (Get-Command uvx -ErrorAction SilentlyContinue) {
        uvx cache clean 2>$null
        Write-Log "   ✅ Cache de uvx limpiado" "Green"
    }
    
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        uv cache clean 2>$null
        Write-Log "   ✅ Cache de uv limpiado" "Green"
    }
} catch {
    Write-Log "   ⚠️ Error al limpiar cache: $($_.Exception.Message)" "Red"
}

# Paso 5: Verificar configuración MCP
Write-Log "⚙️ Verificando configuración MCP..." "Yellow"

$mcpConfigPath = "TAMV-FINAL-PRODUCTION-READY\.kiro\settings\mcp.json"
$mcpFixedPath = "TAMV-FINAL-PRODUCTION-READY\.kiro\settings\mcp-fixed.json"

if (Test-Path $mcpFixedPath) {
    Write-Log "   📁 Configuración MCP optimizada encontrada" "Green"
    
    if (Test-Path $mcpConfigPath) {
        # Hacer backup de la configuración actual
        $backupPath = "$mcpConfigPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $mcpConfigPath $backupPath -ErrorAction SilentlyContinue
        Write-Log "   💾 Backup creado: $backupPath" "Cyan"
    }
    
    # Aplicar configuración optimizada
    try {
        Copy-Item $mcpFixedPath $mcpConfigPath -Force
        Write-Log "   ✅ Configuración MCP optimizada aplicada" "Green"
    } catch {
        Write-Log "   ⚠️ Error al aplicar configuración: $($_.Exception.Message)" "Red"
    }
} else {
    Write-Log "   ⚠️ Configuración MCP optimizada no encontrada" "Yellow"
}

# Paso 6: Verificar estado final
Write-Log "🔍 Verificando estado final..." "Yellow"

Start-Sleep -Seconds 3

$remainingProcesses = Get-Process | Where-Object {
    $_.ProcessName -like "*uvx*" -or 
    $_.ProcessName -like "*mcp*"
} -ErrorAction SilentlyContinue

if ($remainingProcesses) {
    Write-Log "   ⚠️ Procesos MCP aún activos:" "Yellow"
    $remainingProcesses | ForEach-Object {
        Write-Log "     - $($_.ProcessName) (PID: $($_.Id))" "White"
    }
} else {
    Write-Log "   ✅ No hay procesos MCP problemáticos activos" "Green"
}

# Resumen final
Write-Host "================================================" -ForegroundColor Cyan
Write-Log "🎉 TAMV MCP Cleanup completado exitosamente!" "Green"
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Reiniciar Kiro para aplicar la nueva configuración MCP" -ForegroundColor White
Write-Host "2. Verificar que los Kiro Powers funcionen correctamente" -ForegroundColor White
Write-Host "3. Monitorear logs para confirmar que el problema se resolvió" -ForegroundColor White
Write-Host ""

Write-Host "✨ Script completado. Los logs persistentes deberían estar resueltos." -ForegroundColor Green