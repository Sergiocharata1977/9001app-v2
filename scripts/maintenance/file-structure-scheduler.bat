@echo off
setlocal enabledelayedexpansion

:: Script para manejar el scheduler de estructura de archivos
:: Uso: file-structure-scheduler.bat [comando]

set COMMAND=%1
set SCRIPT_PATH=backend\scripts\file-structure-scheduler.js

if "%COMMAND%"=="" (
    echo 📋 Comandos disponibles:
    echo   start  - Iniciar scheduler ^(actualización cada 48 horas^)
    echo   stop   - Detener scheduler
    echo   status - Mostrar estado actual
    echo   update - Ejecutar actualización manual
    goto :eof
)

if "%COMMAND%"=="start" (
    echo 🔄 Iniciando scheduler de estructura de archivos...
    node %SCRIPT_PATH% start
) else if "%COMMAND%"=="stop" (
    echo 🛑 Deteniendo scheduler...
    node %SCRIPT_PATH% stop
) else if "%COMMAND%"=="status" (
    echo 📊 Mostrando estado del scheduler...
    node %SCRIPT_PATH% status
) else if "%COMMAND%"=="update" (
    echo 📁 Ejecutando actualización manual...
    node %SCRIPT_PATH% update
) else (
    echo ❌ Comando no válido: %COMMAND%
    echo 📋 Comandos disponibles: start, stop, status, update
)

endlocal
