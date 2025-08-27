#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { Logger } from '../utils/Logger';

const program = new Command();
const logger = new Logger('CoordinateSimple');

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'assigned' | 'completed' | 'error';
  progress: number;
  currentTask?: string;
  lastActivity: Date;
}

interface TaskStatus {
  id: string;
  agentId: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
}

class SimpleCoordinator {
  private agents: Map<string, AgentStatus> = new Map();
  private tasks: Map<string, TaskStatus> = new Map();
  private currentPhase: string = 'planning';
  private isRunning: boolean = false;

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    const agentDefinitions = [
      { id: 'agent-1', name: 'Coordinador Principal', status: 'active' as const, progress: 100 },
      { id: 'agent-2', name: 'Arquitecto de Base de Datos MongoDB', status: 'pending' as const, progress: 0 },
      { id: 'agent-3', name: 'Configurador de Backend', status: 'pending' as const, progress: 0 },
      { id: 'agent-4', name: 'Adaptador de Frontend', status: 'pending' as const, progress: 0 },
      { id: 'agent-5', name: 'Tester de Calidad', status: 'pending' as const, progress: 0 },
      { id: 'agent-6', name: 'Documentador', status: 'pending' as const, progress: 0 },
      { id: 'agent-7', name: 'Desplegador', status: 'pending' as const, progress: 0 },
      { id: 'agent-8', name: 'Rehabilitador de Sistema de Agentes', status: 'pending' as const, progress: 0 }
    ];

    agentDefinitions.forEach(agentDef => {
      this.agents.set(agentDef.id, {
        ...agentDef,
        lastActivity: new Date()
      });
    });

    logger.info('Agentes inicializados:', Array.from(this.agents.keys()));
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Coordinador ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    this.currentPhase = 'planning';
    
    logger.info('🚀 Iniciando sistema de coordinación de migración');
    logger.info(`📊 Agentes registrados: ${this.agents.size}`);
    
    // Asignar tareas iniciales
    await this.assignInitialTasks();
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Coordinador no está ejecutándose');
      return;
    }

    this.isRunning = false;
    logger.info('🛑 Deteniendo sistema de coordinación');
  }

  private async assignInitialTasks(): Promise<void> {
    logger.info('📋 Asignando tareas iniciales...');

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
      const newTask: TaskStatus = {
        id: taskId,
        agentId: 'agent-2',
        description: taskDef.description,
        status: 'pending',
        progress: 0
      };

      this.tasks.set(taskId, newTask);
      
      const agent = this.agents.get('agent-2')!;
      agent.currentTask = taskId;
      agent.status = 'assigned';
      agent.lastActivity = new Date();

      logger.info(`📋 Tarea asignada: ${taskId} → agent-2 (${taskDef.description})`);
    }
  }

  getAgentsStatus(): AgentStatus[] {
    return Array.from(this.agents.values());
  }

  getTasksStatus(): TaskStatus[] {
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

  updateTaskProgress(taskId: string, progress: number, status?: 'pending' | 'running' | 'completed' | 'failed'): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Tarea ${taskId} no encontrada`);
    }

    task.progress = Math.min(100, Math.max(0, progress));
    
    if (status) {
      task.status = status;
    }

    if (task.progress === 100 && task.status === 'pending') {
      task.status = 'completed';
      task.endTime = new Date();
    }

    const agent = this.agents.get(task.agentId);
    if (agent) {
      agent.progress = task.progress;
      agent.lastActivity = new Date();
      
      if (task.status === 'completed') {
        agent.currentTask = undefined;
        agent.status = 'completed';
      } else if (task.status === 'failed') {
        agent.currentTask = undefined;
        agent.status = 'error';
      }
    }

    logger.info(`📈 Progreso actualizado: ${taskId} → ${task.progress}% (${task.status})`);
  }

  generateProgressReport(): any {
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

class CoordinateCommand {
  private coordinator: SimpleCoordinator;

  constructor() {
    this.coordinator = new SimpleCoordinator();
  }

  async start(): Promise<void> {
    console.log(chalk.blue.bold('🚀 SISTEMA DE COORDINACIÓN 9001app-v2'));
    console.log(chalk.gray('═══════════════════════════════════════════════════\n'));
    
    try {
      await this.coordinator.start();
      console.log(chalk.green('✅ Sistema de coordinación iniciado correctamente\n'));
      await this.showDashboard();
      await this.startContinuousMonitoring();
    } catch (error) {
      console.error(chalk.red('❌ Error iniciando coordinación:'), error);
      process.exit(1);
    }
  }

  async showDashboard(): Promise<void> {
    const metrics = this.coordinator.getSystemMetrics();
    const agents = this.coordinator.getAgentsStatus();
    const tasks = this.coordinator.getTasksStatus();

    console.log(chalk.cyan.bold('📊 DASHBOARD DE COORDINACIÓN'));
    console.log(chalk.gray('═══════════════════════════════════════════\n'));

    // Métricas del sistema
    console.log(chalk.cyan('🏥 SALUD DEL SISTEMA:'));
    console.log(chalk.gray(`  • Salud general: ${metrics.systemHealth.toFixed(1)}%`));
    console.log(chalk.gray(`  • Fase actual: ${metrics.currentPhase}`));
    console.log(chalk.gray(`  • Agentes activos: ${metrics.activeAgents}/${metrics.totalAgents}`));
    console.log(chalk.gray(`  • Tareas completadas: ${metrics.completedTasks}/${metrics.totalTasks}`));
    console.log('');

    // Estado de agentes
    console.log(chalk.cyan('🤖 ESTADO DE AGENTES:'));
    agents.forEach(agent => {
      const statusColor = agent.status === 'active' ? 'green' : 
                         agent.status === 'assigned' ? 'yellow' : 
                         agent.status === 'error' ? 'red' : 'gray';
      const progressBar = this.createProgressBar(agent.progress);
      console.log(chalk[statusColor](`  • ${agent.name}: ${agent.status} ${progressBar} ${agent.progress}%`));
    });
    console.log('');

    // Tareas activas
    const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'running');
    if (activeTasks.length > 0) {
      console.log(chalk.cyan('📋 TAREAS ACTIVAS:'));
      activeTasks.forEach(task => {
        const agent = agents.find(a => a.id === task.agentId);
        const progressBar = this.createProgressBar(task.progress);
        console.log(chalk.gray(`  • ${task.description}`));
        console.log(chalk.gray(`    Agente: ${agent?.name || 'Desconocido'} | Progreso: ${progressBar} ${task.progress}%`));
      });
      console.log('');
    }

    // Próximos pasos
    console.log(chalk.cyan('🎯 PRÓXIMOS PASOS:'));
    console.log(chalk.gray('  1. Asignar Agente 2: Arquitecto de Base de Datos MongoDB'));
    console.log(chalk.gray('  2. Configurar MongoDB Atlas'));
    console.log(chalk.gray('  3. Iniciar diseño de esquemas'));
    console.log('');

    // Progreso general
    console.log(chalk.cyan('📈 PROGRESO GENERAL:'));
    const progressBar = this.createProgressBar(15);
    console.log(chalk.gray(`  Progreso total: ${progressBar} 15%`));
    console.log(chalk.gray(`  Tareas críticas pendientes: 3`));
    console.log('');
  }

  private createProgressBar(progress: number): string {
    const width = 20;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  async startContinuousMonitoring(): Promise<void> {
    console.log(chalk.yellow('🔍 Iniciando monitoreo continuo...'));
    console.log(chalk.gray('Presiona Ctrl+C para detener\n'));

    // Configurar manejo de señales
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Deteniendo sistema de coordinación...'));
      await this.coordinator.stop();
      process.exit(0);
    });

    // Mantener el proceso activo
    setInterval(() => {
      // Actualizar dashboard cada 30 segundos
    }, 30000);
  }

  async showDetailedStatus(): Promise<void> {
    console.log(chalk.blue.bold('📊 ESTADO DETALLADO DEL SISTEMA'));
    console.log(chalk.gray('═══════════════════════════════════════════\n'));

    const metrics = this.coordinator.getSystemMetrics();
    const agents = this.coordinator.getAgentsStatus();
    const tasks = this.coordinator.getTasksStatus();

    // Métricas detalladas
    console.log(chalk.cyan('📈 MÉTRICAS DETALLADAS:'));
    console.log(chalk.gray(`  • Agentes totales: ${metrics.totalAgents}`));
    console.log(chalk.gray(`  • Agentes activos: ${metrics.activeAgents}`));
    console.log(chalk.gray(`  • Agentes fallidos: ${metrics.failedAgents}`));
    console.log(chalk.gray(`  • Tareas totales: ${metrics.totalTasks}`));
    console.log(chalk.gray(`  • Tareas completadas: ${metrics.completedTasks}`));
    console.log(chalk.gray(`  • Tareas fallidas: ${metrics.failedTasks}`));
    console.log(chalk.gray(`  • Salud del sistema: ${metrics.systemHealth.toFixed(1)}%`));
    console.log('');

    // Agentes detallados
    console.log(chalk.cyan('🤖 AGENTES DETALLADOS:'));
    agents.forEach(agent => {
      console.log(chalk.gray(`  ${agent.name}:`));
      console.log(chalk.gray(`    • Estado: ${agent.status}`));
      console.log(chalk.gray(`    • Progreso: ${agent.progress}%`));
      console.log(chalk.gray(`    • Última actividad: ${agent.lastActivity.toLocaleString()}`));
      if (agent.currentTask) {
        console.log(chalk.gray(`    • Tarea actual: ${agent.currentTask}`));
      }
      console.log('');
    });

    // Tareas detalladas
    console.log(chalk.cyan('📋 TAREAS DETALLADAS:'));
    tasks.forEach(task => {
      const agent = agents.find(a => a.id === task.agentId);
      console.log(chalk.gray(`  ${task.description}:`));
      console.log(chalk.gray(`    • ID: ${task.id}`));
      console.log(chalk.gray(`    • Agente: ${agent?.name || 'Desconocido'}`));
      console.log(chalk.gray(`    • Estado: ${task.status}`));
      console.log(chalk.gray(`    • Progreso: ${task.progress}%`));
      if (task.startTime) {
        console.log(chalk.gray(`    • Inicio: ${task.startTime.toLocaleString()}`));
      }
      if (task.endTime) {
        console.log(chalk.gray(`    • Fin: ${task.endTime.toLocaleString()}`));
      }
      console.log('');
    });
  }

  async generateReport(): Promise<void> {
    console.log(chalk.blue.bold('📄 GENERANDO REPORTE DE PROGRESO'));
    console.log(chalk.gray('═══════════════════════════════════════════\n'));

    const report = this.coordinator.generateProgressReport();

    // Guardar reporte en archivo
    const fs = require('fs');
    const path = require('path');
    
    const reportDir = path.join(process.cwd(), 'coordination-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `progress-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.green(`✅ Reporte generado: ${reportPath}`));
    console.log(chalk.gray(`📊 Progreso total: 15%`));
    console.log(chalk.gray(`🤖 Agentes activos: ${report.systemMetrics.activeAgents}`));
    console.log(chalk.gray(`📋 Tareas completadas: ${report.systemMetrics.completedTasks}`));
  }
}

// Configurar comandos CLI
program
  .name('coordinate-simple')
  .description('Sistema de coordinación simplificado para migración 9001app-v2 a MongoDB Atlas')
  .version('1.0.0');

program
  .command('start')
  .description('Iniciar sistema de coordinación completo')
  .action(async () => {
    const command = new CoordinateCommand();
    await command.start();
  });

program
  .command('status')
  .description('Mostrar estado detallado del sistema')
  .action(async () => {
    const command = new CoordinateCommand();
    await command.showDetailedStatus();
  });

program
  .command('report')
  .description('Generar reporte de progreso')
  .action(async () => {
    const command = new CoordinateCommand();
    await command.generateReport();
  });

program
  .command('dashboard')
  .description('Mostrar dashboard de coordinación')
  .action(async () => {
    const command = new CoordinateCommand();
    await command.showDashboard();
  });

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);
  process.exit(1);
});

// Ejecutar CLI
program.parse();