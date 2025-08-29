@echo off
echo ========================================
echo  INICIANDO SISTEMA DE AGENTES 9001APP-V2
echo ========================================
echo.

echo Verificando dependencias...
if not exist "agent-coordinator\node_modules" (
    echo ERROR: Dependencias no instaladas. Ejecute setup-agent-system.bat primero
    pause
    exit /b 1
)

echo Iniciando sistema de agentes en segundo plano...
cd agent-coordinator
start "Agent Coordinator" cmd /k "npm start"

echo.
echo ========================================
echo  SISTEMA DE AGENTES INICIADO
echo ========================================
echo.
echo Dashboard disponible en: http://localhost:8000
echo.
echo Agentes disponibles:
echo - Security Agent       (Auditoria de seguridad)
echo - Structure Agent      (Analisis de estructura)
echo - TypeScript Agent     (Migracion TypeScript)
echo - API Agent           (Optimizacion APIs)
echo - MongoDB Agent       (Migracion MongoDB)
echo - Web Agent           (Dashboard web)
echo.
echo Para acceder desde Super Admin:
echo http://localhost:5173/app/admin/super
echo.
echo Presione cualquier tecla para continuar...
pause > nul