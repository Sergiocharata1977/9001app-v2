#!/bin/bash
set -euo pipefail

# ===============================================
# SCRIPT DE DESPLIEGUE AUTOMÁTICO 9001APP2
# ===============================================

echo "🚀 Iniciando despliegue automático..."
echo "📅 Fecha: $(date)"
echo "=============================================="

# Variables
PROJECT_DIR="/root/9001app2"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
STATIC_ROOT="/var/www/9001app2"
STATIC_DIR="$STATIC_ROOT/dist"
LOG_FILE="/root/deploy.log"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Función de error
error() {
    log "❌ ERROR: $1"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    error "Directorio del proyecto no encontrado: $PROJECT_DIR"
fi

log "📁 Navegando a: $PROJECT_DIR"
cd $PROJECT_DIR || error "No se pudo acceder al directorio del proyecto"

# 1. ACTUALIZAR CÓDIGO DESDE GITLAB
log "🔄 Actualizando código desde GitLab..."
git fetch origin
git reset --hard origin/master
git pull origin master

if [ $? -ne 0 ]; then
    error "Error al actualizar desde GitLab"
fi

log "✅ Código actualizado exitosamente"

# 2. FRONTEND - INSTALAR Y CONSTRUIR
log "🎨 Procesando Frontend..."
cd $FRONTEND_DIR || error "No se pudo acceder al directorio Frontend"

# Instalar dependencias
log "📦 Instalando dependencias del Frontend..."
npm install --production=false

if [ $? -ne 0 ]; then
    error "Error al instalar dependencias del Frontend"
fi

# Construir para producción
log "🏗️ Construyendo Frontend para producción..."
npm run build

if [ $? -ne 0 ]; then
    error "Error al construir el Frontend"
fi

log "✅ Frontend construido exitosamente"

# 3. BACKEND - INSTALAR Y CONFIGURAR
log "⚙️ Procesando Backend..."
cd $BACKEND_DIR || error "No se pudo acceder al directorio Backend"

# Instalar dependencias del backend
log "📦 Instalando dependencias del Backend..."
npm install --production=false

if [ $? -ne 0 ]; then
    error "Error al instalar dependencias del Backend"
fi

# Verificar variables de entorno
if [ ! -f ".env" ]; then
    log "⚠️ Archivo .env no encontrado, copiando desde ejemplo..."
    cp .env.example .env 2>/dev/null || log "⚠️ No se encontró .env.example"
fi

log "✅ Backend configurado exitosamente"

# 4. REINICIAR/RECARGAR BACKEND CON PM2
log "🔄 Reiniciando/recargando backend con PM2..."
cd $BACKEND_DIR
if pm2 describe "9001app2-backend" >/dev/null 2>&1; then
    pm2 reload "9001app2-backend"
else
    pm2 start ecosystem.config.cjs --name "9001app2-backend"
fi

# 5. HEALTH CHECK BACKEND
log "🩺 Verificando salud del backend..."
sleep 2
if curl -fsS http://127.0.0.1:5000/api/health >/dev/null; then
    log "✅ Backend OK"
else
    error "❌ Backend no responde en /api/health. Abortando publicación de frontend"
fi

# 6. PUBLICAR FRONTEND ESTÁTICO PARA NGINX
log "📦 Publicando frontend en ${STATIC_DIR}..."
mkdir -p "$STATIC_DIR"
rsync -a --delete "$FRONTEND_DIR/dist/" "$STATIC_DIR/"
# Si el servidor usa usuario www-data para Nginx, asegura permisos (ignora errores si no aplica)
chown -R www-data:www-data "$STATIC_ROOT" 2>/dev/null || true

# 7. RECARGAR NGINX
log "🔁 Validando y recargando Nginx..."
if nginx -t; then
    systemctl reload nginx
    log "✅ Nginx recargado"
else
    error "❌ Configuración de Nginx inválida"
fi

# 8. VERIFICAR ESTADO FINAL
log "🔍 Verificando estado de servicios..."
if pm2 list | grep -q "9001app2-backend.*online"; then
    log "✅ Backend funcionando correctamente"
else
    error "❌ Backend no está funcionando"
fi

if curl -fsS http://127.0.0.1/ >/dev/null; then
    log "✅ Frontend servido por Nginx en puerto 80"
else
    log "⚠️ Frontend podría tardar en estar disponible"
fi

# 6. LIMPIAR LOGS ANTIGUOS
find /root -name "*.log" -mtime +7 -delete 2>/dev/null

# 7. RESUMEN FINAL
log "🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE"
log "📊 Resumen:"
log "   - Frontend: http://31.97.162.229/"
log "   - Backend: http://31.97.162.229:5000 (proxy /api)"
log "   - Logs: $LOG_FILE"
log "=============================================="

echo "✅ Despliegue completado en $(date)" 