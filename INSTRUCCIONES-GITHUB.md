# 📋 Instrucciones para Subir TAMV a GitHub

## Paso 1: Crear Repositorio en GitHub

1. Ve a **https://github.com/new**
2. **Nombre del repositorio:** `tamv-ecosystem`
3. **Descripción:** `TAMV - Territorio Autónomo Mexicano Virtual - Ecosistema Digital Soberano`
4. **Visibilidad:** Público ✅
5. **NO marques:** "Add a README file" (ya tenemos uno)
6. **NO marques:** "Add .gitignore" (ya tenemos uno)
7. **NO marques:** "Choose a license" (ya está definido)
8. Haz clic en **"Create repository"**

## Paso 2: Configurar Repositorio Local

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Remover el repositorio anterior
git remote remove origin

# Agregar tu nuevo repositorio (CAMBIA "tu-usuario" por tu usuario real)
git remote add origin https://github.com/tu-usuario/tamv-ecosystem.git

# Verificar que esté configurado correctamente
git remote -v

# Subir el proyecto completo
git push -u origin main
```

## Paso 3: Verificar que Funcionó

Si todo salió bien, deberías ver:
- ✅ Mensaje de éxito en la terminal
- ✅ Tu repositorio en GitHub con todos los archivos
- ✅ README visible en la página principal

## Paso 4: Compartir tu Repositorio

Tu repositorio estará disponible en:
**https://github.com/tu-usuario/tamv-ecosystem**

## ❌ Si hay Problemas

### Error 403 (Permisos)
- Verifica que el nombre de usuario sea correcto
- Asegúrate de haber creado el repositorio en GitHub
- Verifica que estés logueado en GitHub

### Error 404 (No encontrado)
- El repositorio no existe o el nombre está mal
- Verifica la URL del repositorio

### Error de autenticación
- Puede que necesites configurar un token de acceso personal
- Ve a GitHub Settings > Developer settings > Personal access tokens

## 🆘 Comando de Emergencia

Si nada funciona, ejecuta el script automático:
```powershell
.\crear-repo-tamv.ps1
```

Este script te guiará paso a paso.