# Script para configurar el repositorio TAMV completo en GitHub
# Ejecuta estos comandos después de crear el repo en GitHub

# Reemplaza 'tu-usuario' con tu nombre de usuario de GitHub
$GITHUB_USER = "tu-usuario"
$REPO_NAME = "tamv-online"

Write-Host "🏛️ Configurando repositorio TAMV completo..."

# Configurar el repositorio remoto
git remote remove origin 2>$null
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Configurar la rama principal
git branch -M main

# Agregar todos los archivos del proyecto
Write-Host "📁 Agregando todos los archivos del ecosistema TAMV..."
git add .

# Hacer commit del proyecto completo
git commit -m "🏛️ TAMV Ecosystem Complete - Initial Release

- Complete digital sovereign ecosystem
- Quantum-resistant security architecture v3.0
- Living Security System v2.1 with Isabela Runtime
- Full service suite: Social, Education, Health, Economy, Gaming, Governance
- Antifragile system that learns from attacks
- Zero Knowledge Civilization principles
- Post-quantum cryptography implementation
- Complete deployment infrastructure"

# Subir todo el proyecto
Write-Host "🚀 Subiendo proyecto completo a GitHub..."
git push -u origin main

Write-Host "✅ Repositorio TAMV configurado exitosamente!"
Write-Host "🔗 URL: https://github.com/$GITHUB_USER/$REPO_NAME"
Write-Host "🏛️ Ecosistema digital soberano completo disponible online!"