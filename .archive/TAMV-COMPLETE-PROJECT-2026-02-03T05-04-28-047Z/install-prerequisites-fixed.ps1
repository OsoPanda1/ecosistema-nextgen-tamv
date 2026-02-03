# TAMV Core API - Instalacion Automatica de Prerrequisitos
# Ejecutar como Administrador: .\install-prerequisites-fixed.ps1

param(
    [switch]$SkipDocker = $false,
    [switch]$SkipAWS = $false,
    [switch]$Force = $false
)

Write-Host "TAMV - Instalacion de Prerrequisitos" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "Este script requiere permisos de administrador" -ForegroundColor Yellow
    Write-Host "Ejecuta PowerShell como Administrador y vuelve a intentar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pasos para ejecutar como administrador:" -ForegroundColor Cyan
    Write-Host "1. Presiona Win + X" -ForegroundColor White
    Write-Host "2. Selecciona 'Windows PowerShell (Admin)'" -ForegroundColor White
    Write-Host "3. Navega a la carpeta del proyecto" -ForegroundColor White
    Write-Host "4. Ejecuta: .\install-prerequisites-fixed.ps1" -ForegroundColor White
    exit 1
}

Write-Host "Ejecutandose con permisos de administrador" -ForegroundColor Green
Write-Host ""

# Funcion para descargar archivos
function Download-File {
    param(
        [string]$Url,
        [string]$OutputPath
    )
    
    try {
        Write-Host "Descargando desde: $Url" -ForegroundColor Yellow
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
        Write-Host "Descarga completada: $OutputPath" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Error descargando: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Verificar Python (ya esta instalado)
Write-Host "Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python no encontrado" -ForegroundColor Red
    Write-Host "Instala Python desde: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Verificar/Instalar UV
Write-Host ""
Write-Host "Verificando UV..." -ForegroundColor Yellow
try {
    # Intentar ejecutar uv desde diferentes ubicaciones posibles
    $uvPath = Get-Command uv -ErrorAction SilentlyContinue
    if ($uvPath) {
        $uvVersion = uv --version 2>&1
        Write-Host "UV encontrado: $uvVersion" -ForegroundColor Green
    } else {
        throw "UV no encontrado en PATH"
    }
} catch {
    Write-Host "UV no encontrado en PATH, instalando..." -ForegroundColor Yellow
    try {
        pip install uv --user
        Write-Host "UV instalado correctamente" -ForegroundColor Green
        Write-Host "Reinicia PowerShell para usar UV" -ForegroundColor Yellow
    } catch {
        Write-Host "Error instalando UV: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Instalar Docker Desktop
if (-not $SkipDocker) {
    Write-Host ""
    Write-Host "Verificando Docker..." -ForegroundColor Yellow
    
    try {
        $dockerVersion = docker --version 2>&1
        Write-Host "Docker encontrado: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "Docker no encontrado, descargando Docker Desktop..." -ForegroundColor Yellow
        
        $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
        $dockerInstaller = "$env:TEMP\DockerDesktopInstaller.exe"
        
        if (Download-File -Url $dockerUrl -OutputPath $dockerInstaller) {
            Write-Host "Instalando Docker Desktop..." -ForegroundColor Yellow
            Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Yellow
            
            try {
                Start-Process -FilePath $dockerInstaller -ArgumentList "install", "--quiet" -Wait -NoNewWindow
                Write-Host "Docker Desktop instalado" -ForegroundColor Green
                Write-Host "Reinicia el sistema para completar la instalacion" -ForegroundColor Yellow
                
                # Limpiar archivo temporal
                Remove-Item $dockerInstaller -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "Error instalando Docker Desktop: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "Instala manualmente desde: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
            }
        }
    }
} else {
    Write-Host "Saltando instalacion de Docker (--SkipDocker)" -ForegroundColor Yellow
}

# Instalar AWS CLI
if (-not $SkipAWS) {
    Write-Host ""
    Write-Host "Verificando AWS CLI..." -ForegroundColor Yellow
    
    try {
        $awsVersion = aws --version 2>&1
        Write-Host "AWS CLI encontrado: $awsVersion" -ForegroundColor Green
    } catch {
        Write-Host "AWS CLI no encontrado, descargando..." -ForegroundColor Yellow
        
        $awsUrl = "https://awscli.amazonaws.com/AWSCLIV2.msi"
        $awsInstaller = "$env:TEMP\AWSCLIV2.msi"
        
        if (Download-File -Url $awsUrl -OutputPath $awsInstaller) {
            Write-Host "Instalando AWS CLI..." -ForegroundColor Yellow
            
            try {
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $awsInstaller, "/quiet" -Wait -NoNewWindow
                Write-Host "AWS CLI instalado" -ForegroundColor Green
                
                # Limpiar archivo temporal
                Remove-Item $awsInstaller -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "Error instalando AWS CLI: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "Instala manualmente desde: https://aws.amazon.com/cli/" -ForegroundColor Cyan
            }
        }
    }
} else {
    Write-Host "Saltando instalacion de AWS CLI (--SkipAWS)" -ForegroundColor Yellow
}

# Verificar Chocolatey (opcional, para instalaciones futuras)
Write-Host ""
Write-Host "Verificando Chocolatey (opcional)..." -ForegroundColor Yellow
try {
    $chocoVersion = choco --version 2>&1
    Write-Host "Chocolatey encontrado: $chocoVersion" -ForegroundColor Green
} catch {
    Write-Host "Chocolatey no encontrado" -ForegroundColor Yellow
    Write-Host "Para instalarlo ejecuta el comando de instalacion oficial" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Resumen de Instalacion" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Verificar estado final
$pythonOk = $false
$uvOk = $false
$dockerOk = $false
$awsOk = $false

try { python --version >$null 2>&1; $pythonOk = $true } catch { }
try { uv --version >$null 2>&1; $uvOk = $true } catch { }
try { docker --version >$null 2>&1; $dockerOk = $true } catch { }
try { aws --version >$null 2>&1; $awsOk = $true } catch { }

Write-Host "Python 3.14+: $(if($pythonOk){'Instalado'}else{'Faltante'})" -ForegroundColor $(if($pythonOk){'Green'}else{'Red'})
Write-Host "UV Package Manager: $(if($uvOk){'Instalado'}else{'Requiere reinicio'})" -ForegroundColor $(if($uvOk){'Green'}else{'Yellow'})
Write-Host "Docker Desktop: $(if($dockerOk){'Instalado'}else{'Requiere reinicio'})" -ForegroundColor $(if($dockerOk){'Green'}else{'Yellow'})
Write-Host "AWS CLI: $(if($awsOk){'Instalado'}else{'Requiere reinicio'})" -ForegroundColor $(if($awsOk){'Green'}else{'Yellow'})

Write-Host ""
if ($pythonOk -and $uvOk -and $dockerOk -and $awsOk) {
    Write-Host "Todos los prerrequisitos estan instalados!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Configura AWS: aws configure" -ForegroundColor White
    Write-Host "2. Inicia Docker Desktop" -ForegroundColor White
    Write-Host "3. Ejecuta: .\deploy-ecs-express.ps1 -CreateRepo" -ForegroundColor White
} else {
    Write-Host "Algunos prerrequisitos requieren atencion" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Acciones requeridas:" -ForegroundColor Cyan
    
    if (-not $uvOk) {
        Write-Host "- Reinicia PowerShell para usar UV" -ForegroundColor White
    }
    
    if (-not $dockerOk) {
        Write-Host "- Reinicia el sistema para completar Docker" -ForegroundColor White
        Write-Host "- Inicia Docker Desktop despues del reinicio" -ForegroundColor White
    }
    
    if (-not $awsOk) {
        Write-Host "- Reinicia PowerShell para usar AWS CLI" -ForegroundColor White
        Write-Host "- Configura credenciales: aws configure" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Documentacion adicional:" -ForegroundColor Cyan
Write-Host "- README-DEPLOYMENT.md - Guia completa de despliegue" -ForegroundColor White
Write-Host "- compose.yml - Testing local con Docker" -ForegroundColor White
Write-Host "- deploy-ecs-express.ps1 - Script de despliegue automatico" -ForegroundColor White

Write-Host ""
Write-Host "TAMV DreamWorld v2.0 - Listo para conquistar la nube!" -ForegroundColor Cyan