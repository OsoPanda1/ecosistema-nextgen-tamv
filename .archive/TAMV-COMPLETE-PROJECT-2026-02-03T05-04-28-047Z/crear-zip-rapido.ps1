# 📦 SCRIPT RÁPIDO PARA CREAR ZIP DE TAMV
# Ejecutar en PowerShell como Administrador

Write-Host "🚀 Creando ZIP completo de TAMV DreamWorld v2.0..." -ForegroundColor Green

# Configuración automática
$currentPath = Get-Location
$projectName = "TAMV-DreamWorld-v2.0-Complete"
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$zipName = "$projectName-$timestamp.zip"
$outputPath = "$env:USERPROFILE\Downloads\$zipName"

Write-Host "📁 Directorio actual: $currentPath" -ForegroundColor Yellow
Write-Host "📦 Archivo ZIP: $zipName" -ForegroundColor Yellow

try {
    # Crear ZIP usando PowerShell nativo
    Write-Host "🗜️ Comprimiendo archivos..." -ForegroundColor Yellow
    
    # Comprimir todo el contenido actual
    Compress-Archive -Path ".\*" -DestinationPath $outputPath -Force
    
    # Verificar que se creó correctamente
    if (Test-Path $outputPath) {
        $zipSize = [math]::Round((Get-Item $outputPath).Length / 1MB, 2)
        Write-Host "✅ ¡ZIP creado exitosamente!" -ForegroundColor Green
        Write-Host "📍 Ubicación: $outputPath" -ForegroundColor Cyan
        Write-Host "📏 Tamaño: $zipSize MB" -ForegroundColor Cyan
        
        # Abrir la carpeta Downloads
        Write-Host "📂 Abriendo carpeta Downloads..." -ForegroundColor Yellow
        Start-Process "explorer.exe" "/select,`"$outputPath`""
        
        Write-Host "🎉 ¡TAMV DreamWorld v2.0 empaquetado completamente!" -ForegroundColor Green
        Write-Host "🌟 El archivo está listo para compartir o desplegar." -ForegroundColor Green
    } else {
        throw "No se pudo crear el archivo ZIP"
    }
} catch {
    Write-Host "❌ Error al crear el ZIP: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Intenta ejecutar PowerShell como Administrador" -ForegroundColor Yellow
}

Write-Host "📋 Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")