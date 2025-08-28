@echo off
echo Iniciando Sistema SGC...

REM Verificar si existe Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)

echo Node.js encontrado

REM Iniciar Backend
echo Iniciando Backend...
cd backend
start "Backend SGC" powershell -NoExit -Command "npm run dev"
cd ..

REM Esperar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar Frontend
echo Iniciando Frontend...
cd frontend
start "Frontend SGC" powershell -NoExit -Command "npm run dev"
cd ..

echo Sistema iniciado!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
pause
