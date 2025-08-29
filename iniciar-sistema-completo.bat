@echo off
echo ========================================
echo  INICIANDO SISTEMA COMPLETO 9001APP-V2
echo  CON AGENT COORDINATOR
echo ========================================
echo.

echo [INFO] Verificando dependencias...

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado
    echo Por favor instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar dependencias del proyecto
if not exist "agent-coordinator\node_modules" (
    echo [WARNING] Dependencias del agent-coordinator no instaladas
    echo Ejecutando instalación...
    cd agent-coordinator
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo [WARNING] Dependencias del frontend no instaladas
    echo Ejecutando instalación...
    cd frontend
    npm install
    cd ..
)

if not exist "backend\node_modules" (
    echo [WARNING] Dependencias del backend no instaladas
    echo Ejecutando instalación...
    cd backend
    npm install
    cd ..
)

echo.
echo [INFO] Iniciando servicios...
echo.

REM Iniciar Agent Coordinator
echo [1/3] Iniciando Agent Coordinator...
start "Agent Coordinator" cmd /k "cd agent-coordinator && echo 🤖 Iniciando Agent Coordinator... && npm start"
timeout /t 3 /nobreak >nul

REM Iniciar Backend
echo [2/3] Iniciando Backend...
start "Backend API" cmd /k "cd backend && echo 🔧 Iniciando Backend API... && npm run dev"
timeout /t 3 /nobreak >nul

REM Iniciar Frontend
echo [3/3] Iniciando Frontend...
start "Frontend React" cmd /k "cd frontend && echo 🎨 Iniciando Frontend React... && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  SISTEMA COMPLETO INICIADO
echo ========================================
echo.
echo URLs disponibles:
echo.
echo 🎨 Frontend (React):
echo    http://localhost:5173
echo.
echo 🔧 Backend (API):
echo    http://localhost:3000
echo.
echo 🤖 Agent Coordinator:
echo    http://localhost:8000
echo.
echo 👑 Super Admin Panel (Agent Coordinator):
echo    http://localhost:5173/app/admin/super
echo.
echo ========================================
echo  INSTRUCCIONES DE USO
echo ========================================
echo.
echo 1. Acceder al Super Admin Panel:
echo    http://localhost:5173/app/admin/super
echo.
echo 2. Hacer clic en la pestaña "🤖 Agent Coordinator"
echo.
echo 3. Controles disponibles:
echo    - Ejecutar Migración Completa (todos los agentes)
echo    - Ejecutar agentes individuales
echo    - Ver logs en tiempo real
echo    - Monitorear métricas del sistema
echo.
echo 4. Dashboard independiente:
echo    http://localhost:8000
echo.
echo ========================================
echo  AGENTES DISPONIBLES
echo ========================================
echo.
echo 🛡️  Security Agent       - Auditoría de seguridad
echo 📁 Structure Agent      - Análisis de estructura
echo 📝 TypeScript Agent     - Migración TypeScript
echo 🚀 API Agent           - Optimización APIs
echo 🗄️  MongoDB Agent       - Migración MongoDB
echo 🌐 Web Agent           - Dashboard web
echo.
echo ========================================
echo  COMANDOS ÚTILES
echo ========================================
echo.
echo Verificar estado de agentes:
echo   curl http://localhost:8000/health
echo.
echo Ver logs:
echo   curl http://localhost:8000/api/logs
echo.
echo Estado de agentes:
echo   curl http://localhost:8000/api/agents
echo.
echo Para detener todos los servicios:
echo   Cerrar las ventanas de terminal abiertas
echo.
echo ========================================
echo.
echo ✅ Sistema listo para usar
echo 🚀 Accede a: http://localhost:5173/app/admin/super
echo.
echo Presiona cualquier tecla para continuar...
pause >nul