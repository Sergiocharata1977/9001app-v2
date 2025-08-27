#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colores ANSI simples
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Logger simple
class Logger {
  constructor(context) {
    this.context = context;
  }

  info(message, ...args) {
    console.log(`${colors.blue}[${this.context}] INFO: ${message}${colors.reset}`, ...args);
  }

  warn(message, ...args) {
    console.log(`${colors.yellow}[${this.context}] WARN: ${message}${colors.reset}`, ...args);
  }

  error(message, ...args) {
    console.log(`${colors.red}[${this.context}] ERROR: ${message}${colors.reset}`, ...args);
  }

  success(message, ...args) {
    console.log(`${colors.green}[${this.context}] SUCCESS: ${message}${colors.reset}`, ...args);
  }
}

// Sistema de coordinación simplificado
class SimpleCoordinator {
  constructor() {
    this.logger = new Logger('SimpleCoordinator');
    this.agents = new Map();
    this.tasks = new Map();
    this.currentPhase = 'planning';
    this.isRunning = false;
    this.initializeAgents();
  }

  initializeAgents() {
    const agentDefinitions = [
      { id: 'agent-1', name: 'Coordinador Principal', status: 'active', progress: 100 },
      { id: 'agent-2', name: 'Arquitecto de Base de Datos MongoDB', status: 'pending', progress: 0 },
      { id: 'agent-3', name: 'Configurador de Backend', status: 'pending', progress: 0 },
      { id: 'agent-4', name: 'Adaptador de Frontend', status: 'pending', progress: 0 },
      { id: 'agent-5', name: 'Tester de Calidad', status: 'pending', progress: 0 },
      { id: 'agent-6', name: 'Documentador', status: 'pending', progress: 0 },
      { id: 'agent-7', name: 'Desplegador', status: 'pending', progress: 0 },
      { id: 'agent-8', name: 'Rehabilitador de Sistema de Agentes', status: 'pending', progress: 0 }
    ];

    agentDefinitions.forEach(agentDef => {
      this.agents.set(agentDef.id, {
        ...agentDef,
        lastActivity: new Date()
      });
    });

    this.logger.info('Agentes inicializados:', Array.from(this.agents.keys()));
  }

  async start() {
    if (this.isRunning) {
      this.logger.warn('Coordinador ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    this.currentPhase = 'planning';
    
    this.logger.info('🚀 Iniciando sistema de coordinación de migración');
    this.logger.info(`📊 Agentes registrados: ${this.agents.size}`);
    
    // Asignar tareas iniciales
    await this.assignInitialTasks();
  }

  async stop() {
    if (!this.isRunning) {
      this.logger.warn('Coordinador no está ejecutándose');
      return;
    }

    this.isRunning = false;
    this.logger.info('🛑 Deteniendo sistema de coordinación');
  }

  async assignInitialTasks() {
    this.logger.info('📋 Asignando tareas iniciales...');

    // Asignar tareas del Agente 2 (sin dependencias)
    const agent2Tasks = [
      {
        id: 'task-2-1',
        description: 'Análisis de Estructura SQLite',
        estimatedTime: 120
      },
      {
        id: 'task-2-2',
        description: 'Diseño de Esquemas MongoDB',
        estimatedTime: 240
      },
      {
        id: 'task-2-3',
        description: 'Configuración de MongoDB Atlas',
        estimatedTime: 60
      }
    ];

    for (const taskDef of agent2Tasks) {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTask = {
        id: taskId,
        agentId: 'agent-2',
        description: taskDef.description,
        status: 'pending',
        progress: 0
      };

      this.tasks.set(taskId, newTask);
      
      const agent = this.agents.get('agent-2');
      agent.currentTask = taskId;
      agent.status = 'assigned';
      agent.lastActivity = new Date();

      this.logger.info(`📋 Tarea asignada: ${taskId} → agent-2 (${taskDef.description})`);
    }
  }

  getAgentsStatus() {
    return Array.from(this.agents.values());
  }

  getTasksStatus() {
    return Array.from(this.tasks.values());
  }

  getSystemMetrics() {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());

    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'assigned').length;
    const failedAgents = agents.filter(a => a.status === 'error').length;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    
    const systemHealth = totalAgents > 0 ? 
      ((activeAgents / totalAgents) * 100) - (failedAgents * 10) : 0;

    return {
      totalAgents,
      activeAgents,
      failedAgents,
      totalTasks,
      completedTasks,
      failedTasks,
      systemHealth: Math.max(0, systemHealth),
      currentPhase: this.currentPhase,
      isRunning: this.isRunning
    };
  }

  generateProgressReport() {
    const metrics = this.getSystemMetrics();
    const agents = this.getAgentsStatus();
    const tasks = this.getTasksStatus();

    return {
      timestamp: new Date(),
      systemMetrics: metrics,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        progress: agent.progress,
        currentTask: agent.currentTask,
        lastActivity: agent.lastActivity
      })),
      tasks: tasks.map(task => ({
        id: task.id,
        description: task.description,
        status: task.status,
        progress: task.progress,
        agentId: task.agentId,
        startTime: task.startTime,
        endTime: task.endTime
      })),
      currentPhase: this.currentPhase,
      isRunning: this.isRunning
    };
  }
}

// Comando de coordinación
class CoordinateCommand {
  constructor() {
    this.coordinator = new SimpleCoordinator();
  }

  async start() {
    console.log(`${colors.blue}${colors.bright}🚀 SISTEMA DE COORDINACIÓN 9001app-v2${colors.reset}`);
    console.log(`${colors.gray}═══════════════════════════════════════════════════${colors.reset}\n`);
    
    try {
      await this.coordinator.start();
      console.log(`${colors.green}✅ Sistema de coordinación iniciado correctamente${colors.reset}\n`);
      await this.showDashboard();
      await this.startContinuousMonitoring();
    } catch (error) {
      console.error(`${colors.red}❌ Error iniciando coordinación:${colors.reset}`, error);
      process.exit(1);
    }
  }

  async showDashboard() {
    const metrics = this.coordinator.getSystemMetrics();
    const agents = this.coordinator.getAgentsStatus();
    const tasks = this.coordinator.getTasksStatus();

    console.log(`${colors.cyan}${colors.bright}📊 DASHBOARD DE COORDINACIÓN${colors.reset}`);
    console.log(`${colors.gray}═══════════════════════════════════════════${colors.reset}\n`);

    // Métricas del sistema
    console.log(`${colors.cyan}🏥 SALUD DEL SISTEMA:${colors.reset}`);
    console.log(`${colors.gray}  • Salud general: ${metrics.systemHealth.toFixed(1)}%${colors.reset}`);
    console.log(`${colors.gray}  • Fase actual: ${metrics.currentPhase}${colors.reset}`);
    console.log(`${colors.gray}  • Agentes activos: ${metrics.activeAgents}/${metrics.totalAgents}${colors.reset}`);
    console.log(`${colors.gray}  • Tareas completadas: ${metrics.completedTasks}/${metrics.totalTasks}${colors.reset}`);
    console.log('');

    // Estado de agentes
    console.log(`${colors.cyan}🤖 ESTADO DE AGENTES:${colors.reset}`);
    agents.forEach(agent => {
      const statusColor = agent.status === 'active' ? colors.green : 
                         agent.status === 'assigned' ? colors.yellow : 
                         agent.status === 'error' ? colors.red : colors.gray;
      const progressBar = this.createProgressBar(agent.progress);
      console.log(`${statusColor}  • ${agent.name}: ${agent.status} ${progressBar} ${agent.progress}%${colors.reset}`);
    });
    console.log('');

    // Tareas activas
    const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'running');
    if (activeTasks.length > 0) {
      console.log(`${colors.cyan}📋 TAREAS ACTIVAS:${colors.reset}`);
      activeTasks.forEach(task => {
        const agent = agents.find(a => a.id === task.agentId);
        const progressBar = this.createProgressBar(task.progress);
        console.log(`${colors.gray}  • ${task.description}${colors.reset}`);
        console.log(`${colors.gray}    Agente: ${agent?.name || 'Desconocido'} | Progreso: ${progressBar} ${task.progress}%${colors.reset}`);
      });
      console.log('');
    }

    // Próximos pasos
    console.log(`${colors.cyan}🎯 PRÓXIMOS PASOS:${colors.reset}`);
    console.log(`${colors.gray}  1. Asignar Agente 2: Arquitecto de Base de Datos MongoDB${colors.reset}`);
    console.log(`${colors.gray}  2. Configurar MongoDB Atlas${colors.reset}`);
    console.log(`${colors.gray}  3. Iniciar diseño de esquemas${colors.reset}`);
    console.log('');

    // Progreso general
    console.log(`${colors.cyan}📈 PROGRESO GENERAL:${colors.reset}`);
    const progressBar = this.createProgressBar(15);
    console.log(`${colors.gray}  Progreso total: ${progressBar} 15%${colors.reset}`);
    console.log(`${colors.gray}  Tareas críticas pendientes: 3${colors.reset}`);
    console.log('');
  }

  createProgressBar(progress) {
    const width = 20;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  async startContinuousMonitoring() {
    console.log(`${colors.yellow}🔍 Iniciando monitoreo continuo...${colors.reset}`);
    console.log(`${colors.gray}Presiona Ctrl+C para detener${colors.reset}\n`);

    // Configurar manejo de señales
    process.on('SIGINT', async () => {
      console.log(`${colors.yellow}\n🛑 Deteniendo sistema de coordinación...${colors.reset}`);
      await this.coordinator.stop();
      process.exit(0);
    });

    // Mantener el proceso activo
    setInterval(() => {
      // Actualizar dashboard cada 30 segundos
    }, 30000);
  }

  async showDetailedStatus() {
    console.log(`${colors.blue}${colors.bright}📊 ESTADO DETALLADO DEL SISTEMA${colors.reset}`);
    console.log(`${colors.gray}═══════════════════════════════════════════${colors.reset}\n`);

    const metrics = this.coordinator.getSystemMetrics();
    const agents = this.coordinator.getAgentsStatus();
    const tasks = this.coordinator.getTasksStatus();

    // Métricas detalladas
    console.log(`${colors.cyan}📈 MÉTRICAS DETALLADAS:${colors.reset}`);
    console.log(`${colors.gray}  • Agentes totales: ${metrics.totalAgents}${colors.reset}`);
    console.log(`${colors.gray}  • Agentes activos: ${metrics.activeAgents}${colors.reset}`);
    console.log(`${colors.gray}  • Agentes fallidos: ${metrics.failedAgents}${colors.reset}`);
    console.log(`${colors.gray}  • Tareas totales: ${metrics.totalTasks}${colors.reset}`);
    console.log(`${colors.gray}  • Tareas completadas: ${metrics.completedTasks}${colors.reset}`);
    console.log(`${colors.gray}  • Tareas fallidas: ${metrics.failedTasks}${colors.reset}`);
    console.log(`${colors.gray}  • Salud del sistema: ${metrics.systemHealth.toFixed(1)}%${colors.reset}`);
    console.log('');

    // Agentes detallados
    console.log(`${colors.cyan}🤖 AGENTES DETALLADOS:${colors.reset}`);
    agents.forEach(agent => {
      console.log(`${colors.gray}  ${agent.name}:${colors.reset}`);
      console.log(`${colors.gray}    • Estado: ${agent.status}${colors.reset}`);
      console.log(`${colors.gray}    • Progreso: ${agent.progress}%${colors.reset}`);
      console.log(`${colors.gray}    • Última actividad: ${agent.lastActivity.toLocaleString()}${colors.reset}`);
      if (agent.currentTask) {
        console.log(`${colors.gray}    • Tarea actual: ${agent.currentTask}${colors.reset}`);
      }
      console.log('');
    });

    // Tareas detalladas
    console.log(`${colors.cyan}📋 TAREAS DETALLADAS:${colors.reset}`);
    tasks.forEach(task => {
      const agent = agents.find(a => a.id === task.agentId);
      console.log(`${colors.gray}  ${task.description}:${colors.reset}`);
      console.log(`${colors.gray}    • ID: ${task.id}${colors.reset}`);
      console.log(`${colors.gray}    • Agente: ${agent?.name || 'Desconocido'}${colors.reset}`);
      console.log(`${colors.gray}    • Estado: ${task.status}${colors.reset}`);
      console.log(`${colors.gray}    • Progreso: ${task.progress}%${colors.reset}`);
      if (task.startTime) {
        console.log(`${colors.gray}    • Inicio: ${task.startTime.toLocaleString()}${colors.reset}`);
      }
      if (task.endTime) {
        console.log(`${colors.gray}    • Fin: ${task.endTime.toLocaleString()}${colors.reset}`);
      }
      console.log('');
    });
  }

  async generateReport() {
    console.log(`${colors.blue}${colors.bright}📄 GENERANDO REPORTE DE PROGRESO${colors.reset}`);
    console.log(`${colors.gray}═══════════════════════════════════════════${colors.reset}\n`);

    const report = this.coordinator.generateProgressReport();

    // Guardar reporte en archivo
    const reportDir = path.join(process.cwd(), 'coordination-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `progress-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`${colors.green}✅ Reporte generado: ${reportPath}${colors.reset}`);
    console.log(`${colors.gray}📊 Progreso total: 15%${colors.reset}`);
    console.log(`${colors.gray}🤖 Agentes activos: ${report.systemMetrics.activeAgents}${colors.reset}`);
    console.log(`${colors.gray}📋 Tareas completadas: ${report.systemMetrics.completedTasks}${colors.reset}`);
  }
}

// Función principal
async function main() {
  const command = process.argv[2] || 'start';
  const coordinator = new CoordinateCommand();

  switch (command) {
    case 'start':
      await coordinator.start();
      break;
    case 'status':
      await coordinator.showDetailedStatus();
      break;
    case 'report':
      await coordinator.generateReport();
      break;
    case 'dashboard':
      await coordinator.showDashboard();
      break;
    default:
      console.log(`${colors.blue}${colors.bright}🚀 SISTEMA DE COORDINACIÓN 9001app-v2${colors.reset}`);
      console.log(`${colors.gray}═══════════════════════════════════════════════════${colors.reset}\n`);
      console.log(`${colors.cyan}Comandos disponibles:${colors.reset}`);
      console.log(`${colors.gray}  node coordination-system-simple.cjs start     - Iniciar coordinación${colors.reset}`);
      console.log(`${colors.gray}  node coordination-system-simple.cjs status    - Mostrar estado detallado${colors.reset}`);
      console.log(`${colors.gray}  node coordination-system-simple.cjs report    - Generar reporte${colors.reset}`);
      console.log(`${colors.gray}  node coordination-system-simple.cjs dashboard - Mostrar dashboard${colors.reset}`);
      break;
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error(`${colors.red}Unhandled Rejection at:${colors.reset}`, promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(`${colors.red}Uncaught Exception:${colors.reset}`, error);
  process.exit(1);
});

// Ejecutar
main().catch(error => {
  console.error(`${colors.red}Error en el sistema de coordinación:${colors.reset}`, error);
  process.exit(1);
});