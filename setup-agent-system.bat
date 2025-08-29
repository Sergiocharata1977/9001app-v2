@echo off
echo ========================================
echo  CONFIGURACION SISTEMA DE AGENTES 9001APP-V2
echo ========================================
echo.

echo [1/5] Verificando estructura de directorios...
if not exist "agent-coordinator" (
    echo ERROR: Directorio agent-coordinator no encontrado
    echo Ejecute este script desde la raiz del proyecto
    pause
    exit /b 1
)

echo [2/5] Instalando dependencias del coordinador de agentes...
cd agent-coordinator
npm install

echo [3/5] Compilando TypeScript...
npx tsc --build

echo [4/5] Verificando dependencias del frontend...
cd ../frontend
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    npm install
)

echo [5/5] Verificando dependencias del backend...
cd ../backend
if not exist "node_modules" (
    echo Instalando dependencias del backend...
    npm install
)

cd ..

echo.
echo ========================================
echo  CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Para iniciar el sistema completo:
echo.
echo 1. Sistema de agentes (Terminal 1):
echo    cd agent-coordinator
echo    npm start
echo.
echo 2. Backend (Terminal 2):
echo    cd backend
echo    npm run dev
echo.
echo 3. Frontend (Terminal 3):
echo    cd frontend
echo    npm run dev
echo.
echo El dashboard de agentes estara disponible en:
echo - Frontend Super Admin: http://localhost:5173/app/admin/super
echo - Dashboard independiente: http://localhost:8000
echo.
pause