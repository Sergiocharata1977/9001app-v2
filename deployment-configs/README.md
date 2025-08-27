# 🚀 DevOps Configuration - 9001app-v2

## 📋 Overview

Este directorio contiene toda la configuración de DevOps para el proyecto 9001app-v2, incluyendo CI/CD, monitoreo, backup, seguridad y despliegue automatizado.

## 🏗️ Estructura del Proyecto

```
deployment-configs/
├── docker/                    # Configuración de Docker
│   ├── Dockerfile.backend     # Dockerfile para backend
│   ├── Dockerfile.frontend    # Dockerfile para frontend
│   ├── docker-compose.yml     # Desarrollo local
│   ├── docker-compose.prod.yml # Producción
│   └── docker-scripts/        # Scripts de Docker
├── kubernetes/                # Configuración de Kubernetes
│   ├── backend/              # Deployment backend
│   ├── frontend/             # Deployment frontend
│   ├── mongodb/              # Configuración MongoDB
│   ├── monitoring/           # Monitoreo
│   └── ingress/              # Ingress y SSL
├── ci-cd/                    # Pipelines CI/CD
│   ├── github-actions/       # GitHub Actions
│   ├── jenkins/              # Jenkins
│   └── gitlab-ci/            # GitLab CI
├── infrastructure/           # Infraestructura como código
│   ├── terraform/            # Terraform
│   ├── ansible/              # Ansible
│   └── cloudformation/       # AWS CloudFormation
├── monitoring/               # Monitoreo y observabilidad
│   ├── prometheus/           # Prometheus
│   ├── grafana/              # Grafana
│   ├── logging/              # ELK Stack
│   └── alerting/             # Alertas
├── security/                 # Seguridad
│   ├── ssl/                  # Certificados SSL
│   ├── firewall/             # Reglas de firewall
│   └── secrets/              # Gestión de secretos
├── backup/                   # Sistema de backup
│   ├── mongodb/              # Backup MongoDB
│   ├── application/          # Backup aplicación
│   └── disaster-recovery/    # Recuperación ante desastres
├── scripts/                  # Scripts de automatización
│   ├── deployment/           # Scripts de despliegue
│   ├── monitoring/           # Scripts de monitoreo
│   └── maintenance/          # Scripts de mantenimiento
└── documentation/            # Documentación
    ├── deployment-guide.md   # Guía de despliegue
    ├── monitoring-guide.md   # Guía de monitoreo
    └── security-guide.md     # Guía de seguridad
```

## 🚀 Quick Start

### 1. Configuración Inicial

```bash
# Clonar el repositorio
git clone https://github.com/Sergiocharata1977/9001app-v2.git
cd 9001app-v2

# Instalar dependencias
npm install

# Configurar variables de entorno
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

### 2. Despliegue Rápido

```bash
# Despliegue en desarrollo
npm run deploy:dev

# Despliegue en staging
npm run deploy:staging

# Despliegue en producción
npm run deploy:prod
```

### 3. Monitoreo

```bash
# Configurar monitoreo
npm run setup-monitoring

# Verificar estado
npm run monitor

# Generar reportes
npm run monitor:reports
```

## 🛠️ Comandos Principales

### Despliegue

```bash
# Despliegue completo
npm run deploy

# Despliegue específico por entorno
npm run deploy:dev      # Desarrollo
npm run deploy:staging  # Staging
npm run deploy:prod     # Producción

# Rollback
npm run rollback

# Estado del despliegue
npm run status
```

### Testing

```bash
# Tests de integración
npm run test:integration

# Tests de performance
npm run test:performance

# Tests de humo
npm run test:smoke

# Tests de recuperación
npm run test:recovery
```

### Monitoreo

```bash
# Configurar monitoreo
npm run setup-monitoring

# Verificar salud del sistema
npm run monitor

# Generar reportes
npm run monitor:reports

# Configurar alertas
npm run alert:configure

# Probar alertas
npm run alert:test
```

### Backup

```bash
# Backup manual
npm run backup

# Validar backup
npm run backup:validate

# Limpiar backups antiguos
npm run backup:cleanup
```

### Seguridad

```bash
# Escaneo de seguridad
npm run security:scan

# Auditoría de seguridad
npm run security:audit

# Configurar firewall
npm run security:firewall

# Renovar certificados SSL
npm run ssl:renew
```

### Mantenimiento

```bash
# Mantenimiento general
npm run maintenance

# Backup de mantenimiento
npm run maintenance:backup

# Limpieza del sistema
npm run maintenance:cleanup

# Actualizaciones de seguridad
npm run maintenance:security

# Renovación de certificados
npm run maintenance:certificates
```

## 🔧 Configuración por Entorno

### Desarrollo

- **Docker Compose**: `docker-compose.yml`
- **Puertos**:
  - Frontend: 3001
  - Backend: 3000
  - MongoDB: 27017
  - Redis: 6379
  - Prometheus: 9090
  - Grafana: 3002

### Staging

- **Docker Compose**: `docker-compose.staging.yml`
- **Configuración**: Similar a desarrollo pero con datos de prueba
- **Monitoreo**: Básico

### Producción

- **Kubernetes**: Namespace `9001app`
- **Replicas**:
  - Backend: 3
  - Frontend: 2
- **Recursos**:
  - Backend: 1 CPU, 1GB RAM
  - Frontend: 0.5 CPU, 512MB RAM
- **Monitoreo**: Completo con alertas

## 📊 Monitoreo

### Métricas Recolectadas

- **Sistema**: CPU, memoria, disco, red
- **Aplicación**: Requests, errores, latencia
- **Base de datos**: Conexiones, queries, performance
- **Agentes**: Estado, coordinación, errores

### Dashboards Disponibles

1. **Sistema General**: Métricas de infraestructura
2. **Aplicación**: Métricas de la aplicación
3. **Base de Datos**: Performance de MongoDB
4. **Agentes**: Estado de los agentes del sistema

### Alertas Configuradas

- **Críticas**: Aplicación caída, backup fallido
- **Advertencias**: Alto uso de CPU/memoria, errores frecuentes
- **Informativas**: Alto número de usuarios activos

## 🔒 Seguridad

### Medidas Implementadas

- **Firewall**: Reglas iptables restrictivas
- **SSL/TLS**: Certificados Let's Encrypt
- **Secrets**: Gestión segura de credenciales
- **Rate Limiting**: Protección contra ataques
- **Logs de Auditoría**: Registro de todas las acciones

### Certificados SSL

```bash
# Instalar certificados
npm run ssl:install

# Renovar certificados
npm run ssl:renew
```

## 💾 Backup

### Estrategia de Backup

- **Frecuencia**: Diario a las 2:00 AM
- **Retención**: 30 días
- **Compresión**: Gzip
- **Almacenamiento**: Local + S3

### Comandos de Backup

```bash
# Backup manual
npm run backup

# Validar backup
npm run backup:validate

# Restaurar backup
./deployment-configs/backup/mongodb/restore-script.sh /path/to/backup.tar.gz
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Contenedores no inician

```bash
# Verificar logs
docker-compose logs

# Verificar recursos
docker system df
```

#### 2. Problemas de conectividad

```bash
# Verificar red
docker network ls
docker network inspect 9001app-network
```

#### 3. Problemas de monitoreo

```bash
# Verificar Prometheus
curl http://localhost:9090/api/v1/targets

# Verificar Grafana
curl http://localhost:3002/api/health
```

### Logs Importantes

```bash
# Logs de aplicación
docker-compose logs -f backend
docker-compose logs -f frontend

# Logs de monitoreo
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

## 📞 Soporte

### Contactos

- **DevOps Engineer**: devops@9001app.com
- **Database Administrator**: dba@9001app.com
- **System Administrator**: sysadmin@9001app.com

### Canales

- **Slack**: #9001app-deployments
- **Email**: deployments@9001app.com
- **Documentación**: https://docs.9001app.com

### Escalación

1. **Nivel 1**: DevOps Engineer (1 hora)
2. **Nivel 2**: Senior DevOps Engineer (30 minutos)
3. **Nivel 3**: System Administrator (inmediato)

## 📚 Documentación Adicional

- [Guía de Despliegue](documentation/deployment-guide.md)
- [Guía de Monitoreo](documentation/monitoring-guide.md)
- [Guía de Seguridad](documentation/security-guide.md)
- [Guía de Backup](documentation/backup-guide.md)
- [Guía de Troubleshooting](documentation/troubleshooting.md)

## 🔄 Actualizaciones

### Versión Actual: 1.0.0

- ✅ CI/CD Pipeline completo
- ✅ Monitoreo con Prometheus + Grafana
- ✅ Sistema de backup automático
- ✅ Configuración de seguridad
- ✅ Documentación completa

### Próximas Mejoras

- 🔄 Integración con AWS EKS
- 🔄 Implementación de Istio Service Mesh
- 🔄 Automatización de escalado
- 🔄 Machine Learning para alertas inteligentes

---

**Última actualización**: $(date +%Y-%m-%d)
**Versión**: 1.0.0
**Autor**: DevOps Team - 9001app-v2