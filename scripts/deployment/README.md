# Scripts de Despliegue - 9001app-v2

## 🚀 Descripción

Este directorio contiene todos los scripts relacionados con el despliegue de la aplicación 9001app-v2 en diferentes entornos.

## 📁 Archivos Disponibles

### `deploy-server.sh`
Script principal para despliegue completo al servidor de producción.

**Características:**
- Backup automático antes del deploy
- Build de frontend y backend
- Deploy con zero-downtime
- Verificación post-deploy
- Rollback automático en caso de error

**Uso:**
```bash
./deploy-server.sh [environment] [version]

# Ejemplos:
./deploy-server.sh production v2.1.0
./deploy-server.sh staging latest
./deploy-server.sh production rollback
```

**Variables de entorno requeridas:**
```bash
SERVER_HOST=your-server.com
SERVER_USER=deploy-user
SERVER_PATH=/opt/9001app
DB_BACKUP_PATH=/backups/db
```

### `deploy-quick.bat`
Script de despliegue rápido para cambios menores (Windows).

**Características:**
- Deploy solo de archivos modificados
- Sin downtime para cambios menores
- Reinicio selectivo de servicios
- Logs detallados

**Uso:**
```cmd
deploy-quick.bat [component]

REM Ejemplos:
deploy-quick.bat frontend
deploy-quick.bat backend
deploy-quick.bat all
```

## 🔧 Configuración

### Preparación del Servidor

#### 1. Usuario de Deploy
```bash
# Crear usuario de deploy
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy

# Configurar SSH keys
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

#### 2. Directorios de Deploy
```bash
# Crear estructura de directorios
sudo mkdir -p /opt/9001app/{current,releases,shared}
sudo mkdir -p /opt/9001app/shared/{uploads,logs,config}
sudo chown -R deploy:deploy /opt/9001app
```

#### 3. Servicios del Sistema
```bash
# PM2 para manejo de procesos
sudo npm install -g pm2
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy

# Nginx para proxy reverso
sudo apt install nginx
sudo systemctl enable nginx
```

### Variables de Entorno

#### Deploy Server (.env.deploy)
```bash
# Servidor de destino
SERVER_HOST=your-production-server.com
SERVER_USER=deploy
SERVER_PORT=22

# Paths del servidor
SERVER_PATH=/opt/9001app
BACKUP_PATH=/backups/9001app
LOG_PATH=/var/log/9001app

# Base de datos
DB_HOST=localhost
DB_NAME=9001app2_production
DB_BACKUP_RETENTION_DAYS=30

# Servicios
PM2_APP_NAME=9001app2-backend
NGINX_SITE_NAME=9001app

# Notificaciones
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
EMAIL_NOTIFICATIONS=admin@yourcompany.com

# Rollback
KEEP_RELEASES=5
ROLLBACK_ON_FAILURE=true
```

## 📋 Proceso de Despliegue

### 1. Pre-Deploy
```bash
# Verificaciones automáticas
- Conectividad al servidor
- Espacio en disco disponible
- Servicios running
- Base de datos accesible
- Permisos de usuario deploy
```

### 2. Backup
```bash
# Backup automático
- Código actual
- Base de datos
- Archivos de configuración
- Uploads/assets
```

### 3. Build
```bash
# Build local o en servidor
- npm install (dependencies)
- npm run build (frontend)
- tsc (backend TypeScript)
- npm run test (tests opcionales)
```

### 4. Deploy
```bash
# Transferencia de archivos
- rsync código a servidor
- Actualizar configuraciones
- Instalar dependencias
- Ejecutar migraciones (si hay)
```

### 5. Restart Services
```bash
# Reinicio de servicios
- PM2 reload (zero-downtime)
- Nginx reload (si hay cambios)
- Verificar health checks
```

### 6. Post-Deploy
```bash
# Verificaciones post-deploy
- Health check de API
- Verificar frontend
- Pruebas de humo
- Notificaciones de éxito/error
```

## 🔄 Rollback

### Rollback Automático
```bash
# En caso de falla en deploy
./deploy-server.sh production rollback

# Rollback a versión específica
./deploy-server.sh production rollback v2.0.5
```

### Rollback Manual
```bash
# Conectar al servidor
ssh deploy@your-server.com

# Ver releases disponibles
ls -la /opt/9001app/releases/

# Cambiar symlink a release anterior
ln -sfn /opt/9001app/releases/v2.0.5 /opt/9001app/current

# Reiniciar servicios
pm2 restart 9001app2-backend
```

## 📊 Monitoreo de Deploy

### Logs de Deploy
```bash
# Logs en tiempo real
tail -f /var/log/9001app/deploy.log

# Logs de PM2
pm2 logs 9001app2-backend

# Logs de aplicación
tail -f /opt/9001app/shared/logs/application.log
```

### Health Checks
```bash
# Verificar API
curl -f http://localhost:5000/api/health

# Verificar frontend
curl -f http://localhost:3000/

# Verificar base de datos
mongosh --eval "db.adminCommand('ping')"
```

## 🚨 Troubleshooting

### Problemas Comunes

#### Deploy Falla por Permisos
```bash
# Verificar permisos
sudo chown -R deploy:deploy /opt/9001app
sudo chmod -R 755 /opt/9001app
```

#### PM2 No Reinicia
```bash
# Verificar proceso PM2
pm2 status
pm2 restart all

# Logs de PM2
pm2 logs --lines 50
```

#### Frontend No Carga
```bash
# Verificar build de frontend
ls -la /opt/9001app/current/frontend/dist/

# Verificar configuración Nginx
nginx -t
sudo systemctl reload nginx
```

#### Base de Datos No Conecta
```bash
# Verificar MongoDB
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"

# Verificar configuración
cat /opt/9001app/current/backend/.env
```

### Comandos de Diagnóstico
```bash
# Script de diagnóstico completo
./deploy-server.sh production diagnose

# Verificar conectividad
./deploy-server.sh production test-connection

# Verificar servicios
./deploy-server.sh production check-services
```

## 📚 Referencias

- [Documentación de PM2](https://pm2.keymetrics.io/docs/)
- [Guía de Nginx](https://nginx.org/en/docs/)
- [MongoDB Operations](https://docs.mongodb.com/manual/administration/)

---

**Notas Importantes:**
- Siempre hacer backup antes de deploy a producción
- Probar deploys en staging primero
- Tener plan de rollback preparado
- Monitorear aplicación post-deploy

**Última actualización**: Enero 2024