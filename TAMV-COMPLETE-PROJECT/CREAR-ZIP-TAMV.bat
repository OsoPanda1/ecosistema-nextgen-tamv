@echo off
echo.
echo 📦 CREANDO ZIP COMPLETO DE TAMV DREAMWORLD v2.0
echo ================================================
echo.

REM Configuración
set "PROJECT_NAME=TAMV-DreamWorld-v2.0-Complete"
set "TIMESTAMP=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%-%time:~0,2%%time:~3,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "ZIP_NAME=%PROJECT_NAME%-%TIMESTAMP%.zip"
set "OUTPUT_PATH=%USERPROFILE%\Downloads\%ZIP_NAME%"

echo 🚀 Iniciando proceso de empaquetado...
echo 📁 Directorio actual: %CD%
echo 📦 Archivo ZIP: %ZIP_NAME%
echo 📍 Destino: %OUTPUT_PATH%
echo.

REM Crear ZIP usando PowerShell
echo 🗜️ Comprimiendo archivos...
powershell -Command "Compress-Archive -Path '.\*' -DestinationPath '%OUTPUT_PATH%' -Force"

REM Verificar si se creó correctamente
if exist "%OUTPUT_PATH%" (
    echo.
    echo ✅ ¡ZIP creado exitosamente!
    echo 📍 Ubicación: %OUTPUT_PATH%
    
    REM Obtener tamaño del archivo
    for %%A in ("%OUTPUT_PATH%") do set "SIZE=%%~zA"
    set /a "SIZE_MB=%SIZE% / 1048576"
    echo 📏 Tamaño: %SIZE_MB% MB
    
    echo.
    echo 🎉 ¡TAMV DreamWorld v2.0 empaquetado completamente!
    echo 🌟 El archivo está listo para compartir o desplegar.
    echo.
    
    REM Abrir carpeta Downloads
    echo 📂 Abriendo carpeta Downloads...
    explorer /select,"%OUTPUT_PATH%"
    
) else (
    echo.
    echo ❌ Error: No se pudo crear el archivo ZIP
    echo 💡 Intenta ejecutar como Administrador
    echo.
)

echo.
echo 📋 Presiona cualquier tecla para cerrar...
pause >nul