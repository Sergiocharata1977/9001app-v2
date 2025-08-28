@echo off
chcp 65001 >nul
echo 🚀 DESPLIEGUE RÁPIDO 9001APP2
echo ==============================================
echo.

REM Variables
set SERVER_IP=31.97.162.229
set SERVER_USER=root
set SSH_KEY=C:\Users\Usuario\.ssh\9001app2

echo 📅 Fecha: %date% %time%
echo 🌐 Servidor: %SERVER_IP%
echo.

REM 1. Verificar conectividad SSH
echo 🌐 Verificando conectividad SSH...
ssh -i "%SSH_KEY%" -o ConnectTimeout=10 -o BatchMode=yes %SERVER_USER%@%SERVER_IP% "echo 'SSH connection OK'"
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudo conectar al servidor via SSH
    pause
    exit /b 1
)
echo ✅ Conectividad SSH establecida
echo.

REM 2. Subir script de despliegue
echo 📤 Subiendo script de despliegue al servidor...
scp -i "%SSH_KEY%" deploy-automated.sh %SERVER_USER%@%SERVER_IP%:/tmp/
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudo subir el script
    pause
    exit /b 1
)
echo ✅ Script subido exitosamente
echo.

REM 3. Ejecutar despliegue
echo 🚀 Ejecutando despliegue en el servidor...
ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/deploy-automated.sh; /tmp/deploy-automated.sh"
if %errorlevel% neq 0 (
    echo ❌ ERROR: Error en el despliegue
    pause
    exit /b 1
)
echo ✅ Despliegue completado exitosamente
echo.

REM 4. Limpiar archivos temporales
echo 🧹 Limpiando archivos temporales...
ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "rm -f /tmp/deploy-automated.sh"
echo ✅ Archivos temporales limpiados
echo.

REM 5. Verificar despliegue
echo 🔍 Verificando despliegue...
timeout /t 5 /nobreak >nul

echo 📊 Verificando servicios...
curl -s -o nul -w "Frontend: %%{http_code}\n" http://%SERVER_IP%/
curl -s -o nul -w "Backend: %%{http_code}\n" http://%SERVER_IP%:5000/api/health

echo.
echo ==============================================
echo ✅ DESPLIEGUE COMPLETADO EXITOSAMENTE
echo 📊 Resumen:
echo    - Servidor: %SERVER_IP%
echo    - Frontend: http://%SERVER_IP%/
echo    - Backend: http://%SERVER_IP%:5000
echo    - API Health: http://%SERVER_IP%:5000/api/health
echo ==============================================
echo.

echo 🔧 Comandos útiles:
echo    - Ver logs: ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "tail -f /root/deploy-*.log"
echo    - Estado PM2: ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "pm2 list"
echo    - Reiniciar PM2: ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "pm2 restart 9001app2-backend"
echo.

pause
