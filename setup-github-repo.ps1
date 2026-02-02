# Script para configurar el repositorio GitHub
# Ejecuta estos comandos después de crear el repo en GitHub

# Reemplaza 'tu-usuario' con tu nombre de usuario de GitHub
$GITHUB_USER = "tu-usuario"
$REPO_NAME = "tamv-quantum-security"

# Configurar el repositorio remoto
git remote remove origin
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Configurar la rama principal
git branch -M main

# Subir todo el proyecto
git push -u origin main

Write-Host "✅ Repositorio configurado exitosamente!"
Write-Host "🔗 URL: https://github.com/$GITHUB_USER/$REPO_NAME"