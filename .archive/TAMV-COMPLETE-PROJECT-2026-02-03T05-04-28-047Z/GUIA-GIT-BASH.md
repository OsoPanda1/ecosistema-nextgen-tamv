# 🚀 TAMV - Guía de Despliegue desde Git Bash

## 📋 Pasos para Ejecutar desde Git GUI/Git Bash

### 🎯 Método 1: Usando Git Bash (Recomendado)

#### **Paso 1: Abrir Git Bash**
1. **Clic derecho** en la carpeta del proyecto `TAMV-COMPLETE-PROJECT`
2. Selecciona **"Git Bash Here"**
3. Se abrirá la terminal Git Bash en la carpeta correcta

#### **Paso 2: Verificar Ubicación**
```bash
# Verificar que estás en la carpeta correcta
pwd
# Debe mostrar: /c/Users/tamvo/OneDrive/aqui/Datos adjuntos/tamv/TAMV-COMPLETE-PROJECT

# Listar archivos para confirmar
ls -la
# Debes ver: package.json, Dockerfile, deploy-ecs-express.ps1, etc.
```

#### **Paso 3: Instalar Prerrequisitos**
```bash
# Ejecutar script de instalación (requiere permisos de administrador)
# Opción A: Desde Git Bash
powershell.exe -ExecutionPolicy Bypass -File "./install-prerequisites.ps1"

# Opción B: Abrir PowerShell como Admin manualmente
# 1. Win + X -> "Windows PowerShell (Admin)"
# 2. cd "C:\Users\tamvo\OneDrive\aqui\Datos adjuntos\tamv\TAMV-COMPLETE-PROJECT"
# 3. .\install-prerequisites.ps1
```

#### **Paso 4: Configurar AWS (Después de instalar prerrequisitos)**
```bash
# Configurar credenciales AWS
aws configure
# Ingresa:
# - AWS Access Key ID: [tu-access-key]
# - AWS Secret Access Key: [tu-secret-key]
# - Default region: us-west-2
# - Default output format: json
```

#### **Paso 5: Testing Local (Opcional)**
```bash
# Probar localmente antes de desplegar
powershell.exe -ExecutionPolicy Bypass -File "./test-local.ps1"

# Ver logs si hay problemas
powershell.exe -ExecutionPolicy Bypass -File "./test-local.ps1" -Logs

# Detener servicios locales
powershell.exe -ExecutionPolicy Bypass -File "./test-local.ps1" -Stop
```

#### **Paso 6: Despliegue a AWS**
```bash
# Desplegar automáticamente a AWS ECS Express Mode
powershell.exe -ExecutionPolicy Bypass -File "./deploy-ecs-express.ps1" -CreateRepo

# Con parámetros personalizados
powershell.exe -ExecutionPolicy Bypass -File "./deploy-ecs-express.ps1" -CreateRepo -Region "us-east-1" -ServiceName "mi-tamv-api"
```

---

### 🎯 Método 2: Usando Git GUI + Terminal Integrada

#### **Paso 1: Abrir Git GUI**
1. **Clic derecho** en la carpeta `TAMV-COMPLETE-PROJECT`
2. Selecciona **"Git GUI"**
3. En Git GUI, ve a **Repository → Git Bash** (o presiona Ctrl+T)

#### **Paso 2: Ejecutar Comandos**
```bash
# Mismo proceso que el Método 1, desde el Paso 2 en adelante
pwd
ls -la
powershell.exe -ExecutionPolicy Bypass -File "./install-prerequisites.ps1"
```

---

### 🎯 Método 3: Comandos Directos en Git Bash

#### **Instalación Completa en Una Sola Sesión**
```bash
# 1. Navegar al directorio (si no estás ahí)
cd "/c/Users/tamvo/OneDrive/aqui/Datos adjuntos/tamv/TAMV-COMPLETE-PROJECT"

# 2. Verificar archivos
ls -la | grep -E "(package.json|Dockerfile|deploy-ecs-express.ps1)"

# 3. Instalar prerrequisitos (ejecutar como admin)
echo "⚠️  Ejecuta PowerShell como Administrador para este paso:"
echo ".\install-prerequisites.ps1"

# 4. Configurar AWS (después de instalar AWS CLI)
echo "Configura AWS con: aws configure"

# 5. Testing local
echo "Testing local: .\test-local.ps1"

# 6. Despliegue final
echo "Despliegue: .\deploy-ecs-express.ps1 -CreateRepo"
```

---

## 🔧 Comandos Específicos para Git Bash

### **Verificación de Prerrequisitos**
```bash
# Verificar Python
python --version

# Verificar si UV está instalado
which uv || echo "UV no encontrado"

# Verificar Docker
docker --version || echo "Docker no encontrado"

# Verificar AWS CLI
aws --version || echo "AWS CLI no encontrado"
```

### **Manejo de Permisos en Git Bash**
```bash
# Hacer scripts ejecutables
chmod +x *.ps1

# Ejecutar PowerShell desde Git Bash
powershell.exe -ExecutionPolicy Bypass -Command "Get-ExecutionPolicy"

# Ejecutar script específico
powershell.exe -ExecutionPolicy Bypass -File "./deploy-ecs-express.ps1" -CreateRepo
```

### **Monitoreo del Despliegue**
```bash
# Ver estado de Docker Compose
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f tamv-core-api

# Verificar endpoint local
curl http://localhost:3000/health

# Verificar servicios AWS (después del despliegue)
aws ecs describe-services --services tamv-core-api --region us-west-2
```

---

## 🚨 Solución de Problemas Comunes

### **Error: "Execution Policy"**
```bash
# Solución: Usar -ExecutionPolicy Bypass
powershell.exe -ExecutionPolicy Bypass -File "./script.ps1"
```

### **Error: "Command not found"**
```bash
# Verificar PATH
echo $PATH

# Recargar PATH
source ~/.bashrc

# Usar ruta completa
/c/Program\ Files/Docker/Docker/resources/bin/docker.exe --version
```

### **Error: "Permission denied"**
```bash
# Ejecutar como administrador
# 1. Cerrar Git Bash
# 2. Clic derecho en Git Bash → "Run as administrator"
# 3. Navegar al directorio y ejecutar
```

---

## 📋 Checklist de Ejecución

### ✅ **Antes de Empezar**
- [ ] Git Bash instalado y funcionando
- [ ] Estás en la carpeta `TAMV-COMPLETE-PROJECT`
- [ ] Puedes ver los archivos: `package.json`, `Dockerfile`, `deploy-ecs-express.ps1`

### ✅ **Instalación de Prerrequisitos**
- [ ] Ejecutar `install-prerequisites.ps1` como administrador
- [ ] Reiniciar PowerShell/Git Bash después de la instalación
- [ ] Verificar que `docker --version` funciona
- [ ] Verificar que `aws --version` funciona

### ✅ **Configuración AWS**
- [ ] Ejecutar `aws configure`
- [ ] Ingresar Access Key ID
- [ ] Ingresar Secret Access Key
- [ ] Configurar región (us-west-2)
- [ ] Verificar con `aws sts get-caller-identity`

### ✅ **Testing Local (Opcional)**
- [ ] Ejecutar `test-local.ps1`
- [ ] Verificar `http://localhost:3000/health`
- [ ] Detener servicios con `test-local.ps1 -Stop`

### ✅ **Despliegue a AWS**
- [ ] Ejecutar `deploy-ecs-express.ps1 -CreateRepo`
- [ ] Esperar ~10 minutos para completar
- [ ] Obtener endpoint HTTPS del servicio
- [ ] Verificar que funciona en la nube

---

## 🎯 Comando Final Todo-en-Uno

```bash
# Ejecutar desde Git Bash en la carpeta TAMV-COMPLETE-PROJECT
echo "🚀 Iniciando despliegue TAMV..."

# Verificar ubicación
pwd

# Mostrar archivos disponibles
echo "📁 Archivos disponibles:"
ls -la *.ps1 *.json Dockerfile

echo ""
echo "📋 Pasos a seguir:"
echo "1. Ejecuta como Admin: .\install-prerequisites.ps1"
echo "2. Configura AWS: aws configure"
echo "3. Testing local: .\test-local.ps1"
echo "4. Despliegue: .\deploy-ecs-express.ps1 -CreateRepo"
echo ""
echo "🌟 TAMV DreamWorld v2.0 - ¡Listo para la nube!"
```

---

## 💡 Consejos Adicionales

1. **Mantén Git Bash abierto** durante todo el proceso
2. **Ejecuta un comando a la vez** y verifica que funcione
3. **Lee los mensajes de error** - los scripts dan información detallada
4. **Usa Tab para autocompletar** nombres de archivos
5. **Presiona Ctrl+C** para cancelar comandos si es necesario

¡Con estos pasos tendrás TAMV ejecutándose en AWS desde Git Bash! 🚀