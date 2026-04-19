Write-Host "🏛️ TAMV - Configuración automática de GitHub"
Write-Host ""

# Mostrar instrucciones
Write-Host "PASO 1: Crear repositorio en GitHub"
Write-Host "- Ve a: https://github.com/new"
Write-Host "- Nombre: tamv-ecosystem"
Write-Host "- Público: SÍ"
Write-Host "- NO agregues README, .gitignore o licencia"
Write-Host ""

# Pedir confirmación
$confirm = Read-Host "¿Ya creaste el repositorio? (s/n)"
if ($confirm -ne "s") {
    Write-Host "❌ Crea el repositorio primero y vuelve a ejecutar el script"
    exit
}

# Pedir usuario
$username = Read-Host "Ingresa tu nombre de usuario de GitHub"

Write-Host ""
Write-Host "🔧 Configurando repositorio..."

# Configurar repositorio
git remote remove origin 2>$null
git remote add origin "https://github.com/$username/tamv-ecosystem.git"

Write-Host "✅ Repositorio configurado"
Write-Host "🚀 Subiendo proyecto..."

# Subir proyecto
git push -u origin main

Write-Host ""
Write-Host "🎉 ¡Listo! Tu repositorio TAMV:"
Write-Host "🔗 https://github.com/$username/tamv-ecosystem"