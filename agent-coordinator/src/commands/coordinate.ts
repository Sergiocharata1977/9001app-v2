#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { MigrationCoordinator } from '../core/MigrationCoordinator';
import { TaskAssignmentService } from '../services/TaskAssignmentService';
import { Logger } from '../utils/Logger';

const program = new Command();
const logger = new Logger('CoordinateCommand');

class CoordinateCommand {
  private coordinator: MigrationCoordinator;
  private taskService: TaskAssignmentService;

  constructor() {
    this.coordinator = new MigrationCoordinator();
    this.taskService = new TaskAssignmentService(this.coordinator);
  }

  /**
   * Iniciar coordinación completa
   */
  async start(): Promise<void> {
    console.log(chalk.blue.bold('🚀 SISTEMA DE COORDINACIÓN 9001app-v2'));
    console.log(chalk.gray('═══════════════════════════════════════════════════\n'));
    
    try {
      // Iniciar coordinador
      await this.coordinator.start();
      
      // Asignar tareas iniciales
      console.log(chalk.yellow('📋 Asignando tareas iniciales...'));
      await this.taskService.assignInitialTasks();
      
      // Mostrar estado inicial
      console.log(chalk.green('✅ Sistema de coordinación iniciado correctamente\n'));
      
      // Mostrar dashboard
      await this.showDashboard();
      
      // Iniciar monitoreo continuo
      await this.startContinuousMonitoring();
      
    } catch (error) {
      console.error(chalk.red('❌ Error iniciando coordinación:'), error);
      process.exit(1);
    }
  }

  /**
   * Mostrar dashboard de coordinación
   */
  async showDashboard(): Promise<void> {
    const metrics = this.coordinator.getSystemMetrics();
    const agents = this.coordinator.getAgentsStatus();
    const tasks = this.coordinator.getTasksStatus();
    const assignmentReport = this.taskService.generateAssignmentReport();

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
    if (assignmentReport.nextSteps.length > 0) {
      console.log(chalk.cyan('🎯 PRÓXIMOS PASOS:'));
      assignmentReport.nextSteps.forEach((step, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${step}`));
      });
      console.log('');
    }

    // Bloqueos
    if (assignmentReport.blockers.length > 0) {
      console.log(chalk.red('🚨 BLOQUEOS DETECTADOS:'));
      assignmentReport.blockers.forEach(blocker => {
        console.log(chalk.red(`  • ${blocker}`));
      });
      console.log('');
    }

    // Progreso general
    console.log(chalk.cyan('📈 PROGRESO GENERAL:'));
    const progressBar = this.createProgressBar(assignmentReport.projectProgress);
    console.log(chalk.gray(`  Progreso total: ${progressBar} ${assignmentReport.projectProgress}%`));
    console.log(chalk.gray(`  Tareas críticas pendientes: ${assignmentReport.criticalTasks}`));
    console.log('');
  }

  /**
   * Iniciar monitoreo continuo
   */
  async startContinuousMonitoring(): Promise<void> {
    console.log(chalk.yellow('🔍 Iniciando monitoreo continuo...'));
    console.log(chalk.gray('Presiona Ctrl+C para detener\n'));

    // Configurar eventos del coordinador
    this.coordinator.on('task:assigned', (data) => {
      console.log(chalk.blue(`📋 Tarea asignada: ${data.taskId} → ${data.agentId}`));
    });

    this.coordinator.on('task:progress', (data) => {
      if (data.progress % 25 === 0) { // Mostrar cada 25%
        console.log(chalk.yellow(`📈 Progreso: ${data.taskId} → ${data.progress}%`));
      }
    });

    this.coordinator.on('task:completed', (data) => {
      console.log(chalk.green(`✅ Tarea completada: ${data.taskId}`));
      this.checkForNextTasks();
    });

    this.coordinator.on('task:failed', (data) => {
      console.log(chalk.red(`❌ Tarea fallida: ${data.taskId} - ${data.error}`));
    });

    this.coordinator.on('phase:changed', (data) => {
      console.log(chalk.magenta(`🔄 Cambio de fase: ${data.previousPhase} → ${data.newPhase}`));
    });

    this.coordinator.on('migration:completed', (data) => {
      console.log(chalk.green.bold('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE'));
      console.log(chalk.gray(`Total de tareas: ${data.totalTasks}`));
      console.log(chalk.gray(`Tareas completadas: ${data.completedTasks}`));
      process.exit(0);
    });

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

  /**
   * Verificar y asignar próximas tareas
   */
  private async checkForNextTasks(): Promise<void> {
    const availableTasks = this.taskService.getAvailableTasks();
    
    for (const task of availableTasks) {
      const agentTasks = this.coordinator.getPendingTasks(task.agentId);
      if (agentTasks.length === 0) {
        await this.taskService.assignTasksForAgent(task.agentId);
      }
    }
  }

  /**
   * Crear barra de progreso visual
   */
  private createProgressBar(progress: number): string {
    const width = 20;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Mostrar estado detallado
   */
  async showDetailedStatus(): Promise<void> {
    console.log(chalk.blue.bold('📊 ESTADO DETALLADO DEL SISTEMA'));
    console.log(chalk.gray('═══════════════════════════════════════════\n'));

    const metrics = this.coordinator.getSystemMetrics();
    const agents = this.coordinator.getAgentsStatus();
    const tasks = this.coordinator.getTasksStatus();
    const assignmentReport = this.taskService.generateAssignmentReport();

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
      console.log(chalk.gray(`    • Tareas completadas: ${agent.metrics.tasksCompleted}`));
      console.log(chalk.gray(`    • Tareas fallidas: ${agent.metrics.tasksFailed}`));
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
      if (task.error) {
        console.log(chalk.red(`    • Error: ${task.error}`));
      }
      console.log('');
    });
  }

  /**
   * Generar reporte de progreso
   */
  async generateReport(): Promise<void> {
    console.log(chalk.blue.bold('📄 GENERANDO REPORTE DE PROGRESO'));
    console.log(chalk.gray('═══════════════════════════════════════════\n'));

    const report = this.coordinator.generateProgressReport();
    const assignmentReport = this.taskService.generateAssignmentReport();

    // Guardar reporte en archivo
    const fs = require('fs');
    const path = require('path');
    
    const reportDir = path.join(process.cwd(), 'coordination-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `progress-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      ...report,
      assignmentReport
    }, null, 2));

    console.log(chalk.green(`✅ Reporte generado: ${reportPath}`));
    console.log(chalk.gray(`📊 Progreso total: ${assignmentReport.projectProgress}%`));
    console.log(chalk.gray(`🤖 Agentes activos: ${report.systemMetrics.activeAgents}`));
    console.log(chalk.gray(`📋 Tareas completadas: ${report.systemMetrics.completedTasks}`));
  }
}

// Configurar comandos CLI
program
  .name('coordinate')
  .description('Sistema de coordinación para migración 9001app-v2 a MongoDB Atlas')
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
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Ejecutar CLI
program.parse();