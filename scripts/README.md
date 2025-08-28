# Scripts - 9001app-v2

## 📁 Organización de Scripts

Los scripts están organizados por categoría para facilitar su uso y mantenimiento:

```
scripts/
├── deployment/          # Scripts de despliegue
├── setup/              # Scripts de configuración inicial
├── maintenance/        # Scripts de mantenimiento
├── development/        # Scripts de desarrollo
└── README.md          # Este archivo
```

## 🚀 Deployment (Despliegue)

Scripts para desplegar la aplicación en diferentes entornos.

### Archivos Disponibles
- `deploy-server.sh` - Deploy completo al servidor
- `deploy-quick.bat` - Deploy rápido para cambios menores

### Uso
```bash
cd scripts/deployment
./deploy-server.sh production
```

## ⚙️ Setup (Configuración)

Scripts para configuración inicial del proyecto y servicios.

### Archivos Disponibles
- `configure-mongodb.js` - Configuración inicial de MongoDB
- `setup-mongodb.js` - Setup completo de base de datos

### Uso
```bash
cd scripts/setup
node configure-mongodb.js
```

## 🔧 Maintenance (Mantenimiento)

Scripts para tareas de mantenimiento y limpieza automática.

### Archivos Disponibles
- `file-structure-scheduler.bat` - Programador de limpieza de archivos

### Uso
```bash
cd scripts/maintenance
./cleanup-logs.sh
```

## 💻 Development (Desarrollo)

Scripts para facilitar el desarrollo local y testing.

### Archivos Disponibles
- `iniciar-sistema-avanzado.ps1` - Inicio completo del sistema
- `iniciar.bat` - Inicio básico
- `control-continuo.ps1` - Monitoreo continuo
- `activate-codespaces.ps1` - Activación de Codespaces
- `activate-codespaces-web.ps1` - Activación web de Codespaces
- `apply-all-agents.ps1` - Aplicar configuración de agentes

### Uso
```bash
cd scripts/development
./iniciar-desarrollo.sh
```

## 🔄 Ejecución de Scripts

### Permisos
```bash
# Dar permisos de ejecución a scripts de shell
chmod +x scripts/**/*.sh

# Para PowerShell en Linux/macOS
pwsh script.ps1
```

### Variables de Entorno
Los scripts pueden requerir variables de entorno específicas. Consulta la documentación de cada script.

### Logs
Los scripts generan logs en:
- `logs/scripts/` - Logs de ejecución
- `logs/deployment/` - Logs de despliegue
- `logs/maintenance/` - Logs de mantenimiento

## 📋 Convenciones

### Nomenclatura
- **Shell scripts**: `.sh` para Linux/macOS
- **Batch scripts**: `.bat` para Windows
- **PowerShell**: `.ps1` para multiplataforma
- **Node.js**: `.js` para scripts de Node

### Estructura de Script
```bash
#!/bin/bash
# Descripción del script
# Autor: [nombre]
# Fecha: [fecha]

set -e  # Salir en error
set -u  # Error en variables no definidas

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/../../logs/script.log"

# Funciones
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Script principal
main() {
    log "Iniciando script..."
    # Lógica del script
    log "Script completado."
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

## 🔧 Scripts Útiles

### Verificar Estado del Sistema
```bash
# Verificar todos los servicios
./scripts/development/check-system-health.sh

# Verificar base de datos
./scripts/setup/check-mongodb.sh

# Verificar aplicación
./scripts/maintenance/health-check.sh
```

### Backup y Restauración
```bash
# Backup completo
./scripts/maintenance/backup-full.sh

# Restaurar desde backup
./scripts/maintenance/restore-backup.sh [backup-file]
```

### Desarrollo
```bash
# Setup completo de desarrollo
./scripts/development/setup-dev-environment.sh

# Reiniciar servicios de desarrollo
./scripts/development/restart-dev-services.sh
```

## 📚 Documentación Adicional

- [Procedimientos de Despliegue](../docs/internal/processes/deployment-procedures.md)
- [Guía de Setup del Entorno](../docs/internal/programmers/environment-setup.md)
- [Protocolos de Mantenimiento](../docs/internal/processes/maintenance-protocols.md)

---

**Última actualización**: Enero 2024