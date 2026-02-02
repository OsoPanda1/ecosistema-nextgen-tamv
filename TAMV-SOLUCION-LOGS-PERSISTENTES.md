# 🔧 Solución para Errores Persistentes de Logs MCP

## 🚨 **Problema Identificado**

Los servidores MCP están generando logs excesivos debido a la configuración `FASTMCP_LOG_LEVEL: "ERROR"` y procesos uvx que no se terminan correctamente.

## ✅ **Soluciones Inmediatas**

### **1. Actualizar Configuración MCP**

Cambiar el nivel de logs de ERROR a WARN o INFO para reducir el ruido:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "uvx",
      "args": ["stripe-mcp-server@latest"],
      "env": {
        "STRIPE_SECRET_KEY": "{{STRIPE_SECRET_KEY}}",
        "STRIPE_WEBHOOK_SECRET": "{{STRIPE_WEBHOOK_SECRET}}",
        "FASTMCP_LOG_LEVEL": "WARN"
      },
      "disabled": false
    }
  }
}
```

### **2. Script de Limpieza de Procesos**

```powershell
# Terminar procesos MCP colgados
Get-Process | Where-Object {$_.ProcessName -like "*uvx*" -or $_.ProcessName -like "*mcp*"} | Stop-Process -Force

# Limpiar logs temporales
Remove-Item -Path "$env:TEMP\*mcp*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\*uvx*" -Recurse -Force -ErrorAction SilentlyContinue

# Reiniciar servicios MCP
Write-Host "Procesos MCP limpiados exitosamente"
```

### **3. Configuración Optimizada de Logs**

```json
{
  "mcpServers": {
    "stripe": {
      "env": {
        "FASTMCP_LOG_LEVEL": "WARN",
        "FASTMCP_LOG_FILE": "false",
        "FASTMCP_QUIET": "true"
      }
    },
    "aws-knowledge": {
      "env": {
        "FASTMCP_LOG_LEVEL": "WARN",
        "FASTMCP_LOG_FILE": "false"
      }
    },
    "aws-api": {
      "env": {
        "AWS_REGION": "us-east-1",
        "FASTMCP_LOG_LEVEL": "WARN",
        "FASTMCP_LOG_FILE": "false"
      }
    }
  }
}
```

### **4. Monitoreo de Procesos**

```powershell
# Script de monitoreo continuo
function Monitor-MCPProcesses {
    $mcpProcesses = Get-Process | Where-Object {
        $_.ProcessName -like "*uvx*" -or 
        $_.ProcessName -like "*mcp*" -or
        $_.ProcessName -like "*stripe*"
    }
    
    foreach ($process in $mcpProcesses) {
        if ($process.CPU -gt 50) {
            Write-Warning "Proceso $($process.ProcessName) usando CPU alta: $($process.CPU)"
            # Opcional: terminar procesos problemáticos
            # $process | Stop-Process -Force
        }
    }
}

# Ejecutar cada 30 segundos
while ($true) {
    Monitor-MCPProcesses
    Start-Sleep -Seconds 30
}
```

### **5. Configuración de Kiro Powers**

Actualizar la configuración para reducir logs:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "uvx",
      "args": ["stripe-mcp-server@latest"],
      "env": {
        "STRIPE_SECRET_KEY": "{{STRIPE_SECRET_KEY}}",
        "STRIPE_WEBHOOK_SECRET": "{{STRIPE_WEBHOOK_SECRET}}",
        "FASTMCP_LOG_LEVEL": "WARN",
        "FASTMCP_QUIET": "true",
        "NODE_ENV": "production"
      },
      "disabled": false,
      "timeout": 30000,
      "retries": 3
    }
  }
}
```

## 🚀 **Pasos de Implementación**

### **Paso 1: Limpiar Procesos Actuales**
```powershell
# Ejecutar en PowerShell como Administrador
Get-Process | Where-Object {$_.ProcessName -like "*uvx*"} | Stop-Process -Force
Get-Process | Where-Object {$_.ProcessName -like "*mcp*"} | Stop-Process -Force
```

### **Paso 2: Actualizar Configuración MCP**
```powershell
# Navegar al directorio de configuración
cd "TAMV-FINAL-PRODUCTION-READY\.kiro\settings"

# Hacer backup de la configuración actual
Copy-Item "mcp.json" "mcp.json.backup"

# Aplicar nueva configuración (ver archivo actualizado arriba)
```

### **Paso 3: Reiniciar Kiro**
```powershell
# Cerrar Kiro completamente
taskkill /f /im "Kiro.exe" 2>$null

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Reiniciar Kiro (ajustar ruta según instalación)
Start-Process "C:\Users\$env:USERNAME\AppData\Local\Programs\Kiro\Kiro.exe"
```

### **Paso 4: Verificar Solución**
```powershell
# Verificar que no hay procesos problemáticos
Get-Process | Where-Object {$_.ProcessName -like "*uvx*" -or $_.ProcessName -like "*mcp*"} | 
    Select-Object ProcessName, Id, CPU, WorkingSet

# Verificar logs de Kiro (si están disponibles)
Get-ChildItem "$env:APPDATA\Kiro\logs" -ErrorAction SilentlyContinue | 
    Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

## 🔍 **Diagnóstico Adicional**

### **Verificar Estado de MCP Servers**
```powershell
# Verificar conectividad de servidores MCP
$mcpServers = @("stripe", "aws-knowledge", "aws-api", "dynamodb")

foreach ($server in $mcpServers) {
    Write-Host "Verificando servidor: $server"
    # Aquí iría la lógica de verificación específica
}
```

### **Limpiar Cache de uvx**
```powershell
# Limpiar cache de uvx que puede estar causando problemas
if (Get-Command uvx -ErrorAction SilentlyContinue) {
    uvx cache clean
}

# Limpiar cache de pip/uv
if (Get-Command uv -ErrorAction SilentlyContinue) {
    uv cache clean
}
```

## ⚠️ **Prevención Futura**

### **1. Configuración de Timeouts**
```json
{
  "mcpServers": {
    "stripe": {
      "timeout": 30000,
      "retries": 3,
      "backoff": "exponential"
    }
  }
}
```

### **2. Monitoreo Automático**
Crear un script que se ejecute cada hora para limpiar procesos problemáticos:

```powershell
# Guardar como: TAMV-MCP-Cleanup.ps1
$logFile = "C:\temp\mcp-cleanup.log"

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -FilePath $logFile -Append
}

# Limpiar procesos problemáticos
$problemProcesses = Get-Process | Where-Object {
    ($_.ProcessName -like "*uvx*" -or $_.ProcessName -like "*mcp*") -and
    ($_.CPU -gt 50 -or $_.WorkingSet -gt 500MB)
}

if ($problemProcesses) {
    Write-Log "Encontrados $($problemProcesses.Count) procesos problemáticos"
    $problemProcesses | Stop-Process -Force
    Write-Log "Procesos limpiados exitosamente"
} else {
    Write-Log "No se encontraron procesos problemáticos"
}
```

### **3. Programar Tarea Automática**
```powershell
# Crear tarea programada para ejecutar limpieza cada hora
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\TAMV-MCP-Cleanup.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "TAMV-MCP-Cleanup" -Action $action -Trigger $trigger -Settings $settings
```

## ✅ **Resultado Esperado**

Después de implementar estas soluciones:

1. **Reducción significativa** en logs de error
2. **Procesos MCP estables** sin consumo excesivo de CPU
3. **Mejor rendimiento** de Kiro Powers
4. **Conexiones MCP confiables** con Stripe y AWS
5. **Monitoreo automático** para prevenir futuros problemas

## 📞 **Soporte Adicional**

Si el problema persiste después de implementar estas soluciones:

1. **Verificar versiones** de uvx y servidores MCP
2. **Revisar logs específicos** de cada servidor
3. **Considerar reinstalación** de componentes problemáticos
4. **Contactar soporte** de Kiro si es necesario

---

**Estado**: Solución lista para implementación  
**Prioridad**: Alta - Implementar inmediatamente  
**Tiempo estimado**: 15-30 minutos