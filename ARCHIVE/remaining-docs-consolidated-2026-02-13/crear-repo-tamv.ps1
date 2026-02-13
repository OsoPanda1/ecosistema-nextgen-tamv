# Script para crear tu propio repositorio TAMV
Write-Host "🏛️ Configurando tu repositorio TAMV personal..."

# Paso 1: Mostrar instrucciones
Write-Host ""
Write-Host "INSTRUCCIONES:"
Write-Host "1. Ve a https://github.com/new"
Write-Host "2. Nombre del repositorio: tamv-ecosystem"
Write-Host "3. Descripción: TAMV - Territorio Autónomo Mexicano Virtual - Ecosistema Digital Soberano"
Write-Host "4. Selecciona PÚBLICO"
Write-Host "5. NO inicialices con README (ya tenemos uno)"
Write-Host "6. Crea el repositorio"
Write-Host ""

# Paso 2: Pedir el nombre de usuario
$username = Read-Host "Ingresa tu nombre de usuario de GitHub"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Necesitas ingresar tu nombre de usuario de GitHub"
    exit 1
}

# Paso 3: Configurar el nuevo repositorio
Write-Host "🔧 Configurando repositorio remoto..."

# Remover el origen actual
git remote remove origin

# Agregar el nuevo origen
$repoUrl = "https://github.com/$username/tamv-ecosystem.git"
git remote add origin $repoUrl

Write-Host "✅ Repositorio configurado: $repoUrl"

# Paso 4: Hacer push
Write-Host "🚀 Subiendo proyecto a GitHub..."
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡ÉXITO! Tu repositorio TAMV está online:"
    Write-Host "🔗 https://github.com/$username/tamv-ecosystem"
    Write-Host ""
    Write-Host "🏛️ Ecosistema TAMV completo disponible públicamente!"
} else {
    Write-Host ""
    Write-Host "❌ Error al subir. Verifica que:"
    Write-Host "   - Creaste el repositorio en GitHub"
    Write-Host "   - El nombre de usuario es correcto"
    Write-Host "   - Tienes permisos de escritura"
    Write-Host ""
    Write-Host "Puedes intentar manualmente:"
    Write-Host "git push -u origin main"
}