# Script para agregar UV al PATH de forma permanente
# Ejecutar como Administrador si es necesario

$uvPath = "C:\Users\tamvo\.local\bin"

Write-Host "Agregando UV al PATH del usuario..." -ForegroundColor Cyan

# Obtener el PATH actual del usuario
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Verificar si ya está en el PATH
if ($currentPath -like "*$uvPath*") {
    Write-Host "✓ UV ya está en el PATH" -ForegroundColor Green
} else {
    # Agregar al PATH
    $newPath = "$uvPath;$currentPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✓ UV agregado al PATH permanentemente" -ForegroundColor Green
    Write-Host "→ Reinicia Kiro para que tome efecto" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Verificando instalación..." -ForegroundColor Cyan
$env:Path = "$uvPath;$env:Path"
uvx --version

Write-Host ""
Write-Host "¡Listo! Ahora reinicia Kiro." -ForegroundColor Green
