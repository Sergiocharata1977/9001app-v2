# 9001app-v2 - Documentación Interna

## 📋 Sistema de Gestión de Calidad ISO 9001

### Información del Proyecto
- **Proyecto**: 9001app-v2
- **Tipo**: Sistema de Gestión de Calidad ISO 9001
- **Backend**: Node.js + TypeScript + Express + MongoDB
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Base de Datos**: MongoDB (migrado desde Turso SQLite)
- **Arquitectura**: Monolítica modular con sistema de agentes IA

### 📚 Estructura de Documentación

#### Para Super Administradores
- [Arquitectura del Sistema](./internal/super-admin/architecture.md)
- [Gestión de Organizaciones](./internal/super-admin/organization-management.md)
- [Configuración de Seguridad](./internal/super-admin/security-config.md)
- [Monitoreo y Logs](./internal/super-admin/monitoring.md)
- [Backup y Restauración](./internal/super-admin/backup-restore.md)
- [Escalabilidad](./internal/super-admin/scalability.md)

#### Para Programadores
- [Setup del Entorno](./internal/programmers/environment-setup.md)
- [Arquitectura de Código](./internal/programmers/code-architecture.md)
- [API Reference](./api/api-reference.md)
- [Base de Datos](./internal/programmers/database.md)
- [Testing](./internal/programmers/testing.md)
- [Deployment](./internal/programmers/deployment.md)

#### Procesos Internos
- [Flujo de Desarrollo](./internal/processes/development-workflow.md)
- [Revisión de Código](./internal/processes/code-review.md)
- [Procedimientos de Despliegue](./internal/processes/deployment-procedures.md)
- [Protocolos de Mantenimiento](./internal/processes/maintenance-protocols.md)

#### Planes del Proyecto
- [Roadmap de Desarrollo](./internal/plans/development-roadmap.md)
- [Planes de Migración](./internal/plans/migration-plans.md)
- [Cronogramas](./internal/plans/schedules.md)
- [Metas y Objetivos](./internal/plans/goals-objectives.md)

### 🔧 Herramientas y Scripts
Consulta el directorio [`/scripts`](../scripts/) para herramientas organizadas por categoría:
- **Deployment**: Scripts de despliegue
- **Setup**: Scripts de configuración inicial
- **Maintenance**: Scripts de mantenimiento
- **Development**: Scripts de desarrollo

### 📊 Estado del Proyecto
- ✅ Backend 100% TypeScript
- ✅ Frontend 80% TypeScript (en progreso)
- ✅ Migración a MongoDB completada
- ✅ Sistema de agentes IA implementado
- ✅ Autenticación y autorización implementada

### 🔗 Enlaces Rápidos
- [Configuración](../config/)
- [Scripts](../scripts/)
- [Backend](../backend/)
- [Frontend](../frontend/)

---
*Última actualización: $(date)*