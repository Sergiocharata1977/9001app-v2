#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Inicializando Sistema de Coordinación 9001app-v2');
console.log('═══════════════════════════════════════════════════\n');

// Función para crear directorio si no existe
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dirPath}`);
  }
}

// Función para crear archivo si no existe
function createFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Archivo creado: ${filePath}`);
  }
}

try {
  // 1. Crear estructura de directorios
  console.log('📁 Creando estructura de directorios...');
  
  const directories = [
    'coordination-reports',
    'coordination-reports/project-overview',
    'coordination-reports/agent-status',
    'coordination-reports/integration',
    'coordination-reports/monitoring',
    'coordination-reports/decisions',
    'coordination-reports/final-delivery',
    'logs',
    'config',
    'backups'
  ];

  directories.forEach(dir => {
    ensureDirectoryExists(dir);
  });

  // 2. Crear archivos de configuración
  console.log('\n⚙️ Creando archivos de configuración...');

  // Configuración del coordinador
  const coordinatorConfig = {
    port: 8000,
    logLevel: 'info',
    monitoringInterval: 30000,
    healthCheckInterval: 60000,
    reportInterval: 3600000,
    agentTimeout: 300000,
    maxRetries: 3,
    autoRestart: true,
    backupInterval: 86400000
  };

  createFileIfNotExists(
    'config/coordinator.json',
    JSON.stringify(coordinatorConfig, null, 2)
  );

  // Variables de entorno
  const envContent = `# Configuración del Sistema de Coordinación 9001app-v2
COORDINATOR_PORT=8000
COORDINATOR_LOG_LEVEL=info
AGENT_TIMEOUT=300000
VALIDATION_INTERVAL=60000
REPORT_INTERVAL=3600000

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/9001app_v2
MONGODB_DATABASE=9001app_v2

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=86400
BCRYPT_ROUNDS=12

# Monitoring Configuration
MONITORING_ENABLED=true
ALERT_EMAIL=admin@9001app-v2.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Performance Configuration
MAX_CONCURRENT_TASKS=5
TASK_TIMEOUT=300000
HEALTH_CHECK_INTERVAL=30000
`;

  createFileIfNotExists('config/.env', envContent);

  // 3. Crear archivos de estado inicial
  console.log('\n📊 Creando archivos de estado inicial...');

  const initialStatus = {
    timestamp: new Date().toISOString(),
    systemStatus: 'initializing',
    agents: {
      'agent-1': { status: 'active', progress: 100 },
      'agent-2': { status: 'pending', progress: 0 },
      'agent-3': { status: 'pending', progress: 0 },
      'agent-4': { status: 'pending', progress: 0 },
      'agent-5': { status: 'pending', progress: 0 },
      'agent-6': { status: 'pending', progress: 0 },
      'agent-7': { status: 'pending', progress: 0 },
      'agent-8': { status: 'pending', progress: 0 }
    },
    currentPhase: 'planning',
    totalProgress: 15,
    nextSteps: [
      'Asignar Agente 2: Arquitecto de Base de Datos MongoDB',
      'Configurar MongoDB Atlas',
      'Iniciar diseño de esquemas'
    ]
  };

  createFileIfNotExists(
    'coordination-reports/agent-status/overall-progress.json',
    JSON.stringify(initialStatus, null, 2)
  );

  // 4. Crear archivo de log inicial
  console.log('\n📝 Creando archivo de log inicial...');

  const logContent = `[${new Date().toISOString()}] INFO: Sistema de coordinación inicializado
[${new Date().toISOString()}] INFO: Estructura de directorios creada
[${new Date().toISOString()}] INFO: Archivos de configuración generados
[${new Date().toISOString()}] INFO: Estado inicial establecido
[${new Date().toISOString()}] INFO: Listo para iniciar coordinación
`;

  createFileIfNotExists('logs/coordination.log', logContent);

  // 5. Crear script de inicio rápido
  console.log('\n🚀 Creando script de inicio rápido...');

  const startScript = `#!/bin/bash
echo "🚀 Iniciando Sistema de Coordinación 9001app-v2"
echo "═══════════════════════════════════════════════════"

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Construir el proyecto
echo "🔨 Construyendo proyecto..."
npm run build

# Iniciar coordinación
echo "🎯 Iniciando coordinación..."
npm run coordinate

echo "✅ Sistema de coordinación iniciado"
`;

  createFileIfNotExists('start-coordination.sh', startScript);

  // Hacer el script ejecutable
  try {
    execSync('chmod +x start-coordination.sh');
    console.log('✅ Script de inicio hecho ejecutable');
  } catch (error) {
    console.log('⚠️ No se pudo hacer el script ejecutable (puede ser normal en Windows)');
  }

  // 6. Crear README de coordinación
  console.log('\n📖 Creando documentación de coordinación...');

  const readmeContent = `# Sistema de Coordinación 9001app-v2

## 🎯 Descripción

Sistema de coordinación principal para la migración de Turso SQLite a MongoDB Atlas del proyecto 9001app-v2.

## 🏗️ Arquitectura

### Agentes del Sistema
- **Agente 1**: Coordinador Principal (TÚ)
- **Agente 2**: Arquitecto de Base de Datos MongoDB
- **Agente 3**: Configurador de Backend
- **Agente 4**: Adaptador de Frontend
- **Agente 5**: Tester de Calidad
- **Agente 6**: Documentador
- **Agente 7**: Desplegador
- **Agente 8**: Rehabilitador de Sistema de Agentes

## 🚀 Inicio Rápido

### Opción 1: Script automático
\`\`\`bash
./start-coordination.sh
\`\`\`

### Opción 2: Comandos manuales
\`\`\`bash
# Instalar dependencias
npm install

# Construir proyecto
npm run build

# Iniciar coordinación
npm run coordinate
\`\`\`

## 📋 Comandos Disponibles

### Comandos Principales
- \`npm run coordinate\` - Iniciar sistema de coordinación completo
- \`npm run monitor\` - Mostrar dashboard de monitoreo
- \`npm run reports\` - Generar reportes de progreso
- \`npm run validate\` - Validar estado del sistema

### Comandos Específicos
- \`npm run assign-tasks\` - Asignar tareas a agentes
- \`npm run check-status\` - Verificar estado de agentes
- \`npm run integrate\` - Coordinar integración
- \`npm run final-docs\` - Generar documentación final

## 📊 Monitoreo

### Dashboard en Tiempo Real
- Estado de todos los agentes
- Progreso de tareas
- Métricas del sistema
- Alertas y bloqueos

### Reportes Automáticos
- Reportes diarios de progreso
- Métricas de rendimiento
- Estado de salud del sistema
- Documentación de decisiones

## 🔧 Configuración

### Variables de Entorno
Editar \`config/.env\` para configurar:
- Conexión a MongoDB Atlas
- Configuración de seguridad
- Parámetros de monitoreo
- Configuración de backup

### Configuración del Coordinador
Editar \`config/coordinator.json\` para ajustar:
- Intervalos de monitoreo
- Timeouts de agentes
- Configuración de reintentos
- Parámetros de rendimiento

## 📁 Estructura de Archivos

\`\`\`
coordination-reports/
├── project-overview/     # Plan de migración y timeline
├── agent-status/         # Estado de cada agente
├── integration/          # Información de integración
├── monitoring/           # Métricas y monitoreo
├── decisions/            # Documentación de decisiones
└── final-delivery/       # Entregables finales

logs/                     # Logs del sistema
config/                   # Archivos de configuración
backups/                  # Respaldos automáticos
\`\`\`

## 🚨 Solución de Problemas

### Problemas Comunes
1. **Error de conexión a MongoDB**: Verificar MONGODB_URI en config/.env
2. **Agentes no responden**: Verificar timeouts en config/coordinator.json
3. **Tareas atascadas**: Revisar logs en logs/coordination.log

### Logs y Debugging
- Logs principales: \`logs/coordination.log\`
- Logs de agentes: \`logs/agents/\`
- Logs de errores: \`logs/errors/\`

## 📞 Soporte

Para soporte técnico o reportar problemas:
- Revisar logs del sistema
- Verificar configuración
- Consultar documentación en coordination-reports/

## 🎯 Próximos Pasos

1. **Configurar MongoDB Atlas**: Editar config/.env con credenciales
2. **Iniciar coordinación**: Ejecutar npm run coordinate
3. **Monitorear progreso**: Usar npm run monitor
4. **Asignar tareas**: El sistema asignará automáticamente

---

**Estado**: Inicializado  
**Versión**: 2.0.0  
**Coordinador**: Agente 1 - Sistema de Coordinación Principal
`;

  createFileIfNotExists('COORDINATION-README.md', readmeContent);

  // 7. Verificar instalación
  console.log('\n🔍 Verificando instalación...');

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'src/index.ts',
    'src/core/MigrationCoordinator.ts',
    'src/services/TaskAssignmentService.ts',
    'src/types/AgentTypes.ts'
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - NO ENCONTRADO`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.log('\n⚠️ Algunos archivos requeridos no se encontraron');
    console.log('Por favor, asegúrate de que todos los archivos del proyecto estén presentes');
  }

  // 8. Resumen final
  console.log('\n🎉 INICIALIZACIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════');
  console.log('✅ Estructura de directorios creada');
  console.log('✅ Archivos de configuración generados');
  console.log('✅ Estado inicial establecido');
  console.log('✅ Scripts de inicio creados');
  console.log('✅ Documentación generada');
  console.log('');
  console.log('🚀 Para iniciar el sistema de coordinación:');
  console.log('   npm run coordinate');
  console.log('');
  console.log('📊 Para ver el dashboard:');
  console.log('   npm run monitor');
  console.log('');
  console.log('📖 Para más información:');
  console.log('   Ver COORDINATION-README.md');
  console.log('');
  console.log('🎯 ¡Listo para coordinar la migración a MongoDB Atlas!');

} catch (error) {
  console.error('❌ Error durante la inicialización:', error.message);
  process.exit(1);
}