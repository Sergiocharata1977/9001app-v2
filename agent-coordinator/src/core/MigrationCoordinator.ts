import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { AgentStatus, TaskStatus, MigrationPhase, AgentType } from '../types/AgentTypes';

export interface AgentTask {
  id: string;
  agentId: string;
  description: string;
  status: TaskStatus;
  progress: number;
  dependencies: string[];
  estimatedTime: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  progress: number;
  currentTask?: string;
  lastActivity: Date;
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    averageResponseTime: number;
    uptime: number;
  };
}

export class MigrationCoordinator extends EventEmitter {
  private logger: Logger;
  private agents: Map<string, AgentInfo> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private currentPhase: MigrationPhase = 'planning';
  private isRunning: boolean = false;

  constructor() {
    super();
    this.logger = new Logger('MigrationCoordinator');
    this.initializeAgents();
  }

  /**
   * Inicializar todos los agentes del sistema
   */
  private initializeAgents(): void {
    const agentDefinitions = [
      {
        id: 'agent-1',
        name: 'Coordinador Principal',
        type: 'coordinator' as AgentType,
        description: 'Sistema de coordinación principal'
      },
      {
        id: 'agent-2',
        name: 'Arquitecto de Base de Datos MongoDB',
        type: 'database' as AgentType,
        description: 'Diseño de esquemas y estructura MongoDB'
      },
      {
        id: 'agent-3',
        name: 'Configurador de Backend',
        type: 'backend' as AgentType,
        description: 'Migración de backend a MongoDB'
      },
      {
        id: 'agent-4',
        name: 'Adaptador de Frontend',
        type: 'frontend' as AgentType,
        description: 'Adaptación de frontend para MongoDB'
      },
      {
        id: 'agent-5',
        name: 'Tester de Calidad',
        type: 'testing' as AgentType,
        description: 'Suite de tests y validación'
      },
      {
        id: 'agent-6',
        name: 'Documentador',
        type: 'documentation' as AgentType,
        description: 'Documentación técnica y manuales'
      },
      {
        id: 'agent-7',
        name: 'Desplegador',
        type: 'deployment' as AgentType,
        description: 'Despliegue y configuración de producción'
      },
      {
        id: 'agent-8',
        name: 'Rehabilitador de Sistema de Agentes',
        type: 'optimization' as AgentType,
        description: 'Optimización y rehabilitación del sistema'
      }
    ];

    agentDefinitions.forEach(agentDef => {
      this.agents.set(agentDef.id, {
        id: agentDef.id,
        name: agentDef.name,
        type: agentDef.type,
        status: agentDef.id === 'agent-1' ? 'active' : 'pending',
        progress: agentDef.id === 'agent-1' ? 100 : 0,
        lastActivity: new Date(),
        metrics: {
          tasksCompleted: 0,
          tasksFailed: 0,
          averageResponseTime: 0,
          uptime: 0
        }
      });
    });

    this.logger.info('Agentes inicializados:', Array.from(this.agents.keys()));
  }

  /**
   * Iniciar el sistema de coordinación
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Coordinador ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    this.currentPhase = 'planning';
    
    this.logger.info('🚀 Iniciando sistema de coordinación de migración');
    this.logger.info(`📊 Agentes registrados: ${this.agents.size}`);
    
    // Emitir evento de inicio
    this.emit('coordinator:started', {
      timestamp: new Date(),
      agentsCount: this.agents.size,
      phase: this.currentPhase
    });

    // Iniciar monitoreo automático
    this.startMonitoring();
  }

  /**
   * Detener el sistema de coordinación
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Coordinador no está ejecutándose');
      return;
    }

    this.isRunning = false;
    this.logger.info('🛑 Deteniendo sistema de coordinación');

    // Emitir evento de parada
    this.emit('coordinator:stopped', {
      timestamp: new Date(),
      finalPhase: this.currentPhase
    });
  }

  /**
   * Asignar tarea a un agente específico
   */
  assignTask(agentId: string, task: Omit<AgentTask, 'id' | 'status' | 'progress'>): string {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agente ${agentId} no encontrado`);
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: AgentTask = {
      ...task,
      id: taskId,
      status: 'pending',
      progress: 0
    };

    this.tasks.set(taskId, newTask);
    
    const agent = this.agents.get(agentId)!;
    agent.currentTask = taskId;
    agent.status = 'assigned';
    agent.lastActivity = new Date();

    this.logger.info(`📋 Tarea asignada: ${taskId} → ${agentId} (${task.description})`);

    // Emitir evento de asignación
    this.emit('task:assigned', {
      taskId,
      agentId,
      task: newTask,
      timestamp: new Date()
    });

    return taskId;
  }

  /**
   * Actualizar progreso de una tarea
   */
  updateTaskProgress(taskId: string, progress: number, status?: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Tarea ${taskId} no encontrada`);
    }

    const previousProgress = task.progress;
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
        agent.metrics.tasksCompleted++;
        agent.currentTask = undefined;
        agent.status = 'idle';
      } else if (task.status === 'failed') {
        agent.metrics.tasksFailed++;
        agent.currentTask = undefined;
        agent.status = 'error';
      }
    }

    this.logger.info(`📈 Progreso actualizado: ${taskId} → ${task.progress}% (${task.status})`);

    // Emitir evento de progreso
    this.emit('task:progress', {
      taskId,
      progress: task.progress,
      status: task.status,
      timestamp: new Date()
    });
  }

  /**
   * Marcar tarea como completada
   */
  completeTask(taskId: string, result?: any): void {
    this.updateTaskProgress(taskId, 100, 'completed');
    
    const task = this.tasks.get(taskId);
    if (task) {
      task.endTime = new Date();
    }

    this.logger.info(`✅ Tarea completada: ${taskId}`);

    // Emitir evento de completado
    this.emit('task:completed', {
      taskId,
      result,
      timestamp: new Date()
    });

    // Verificar si podemos avanzar a la siguiente fase
    this.checkPhaseTransition();
  }

  /**
   * Marcar tarea como fallida
   */
  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'failed';
      task.error = error;
      task.endTime = new Date();
    }

    this.updateTaskProgress(taskId, 0, 'failed');

    this.logger.error(`❌ Tarea fallida: ${taskId} - ${error}`);

    // Emitir evento de fallo
    this.emit('task:failed', {
      taskId,
      error,
      timestamp: new Date()
    });
  }

  /**
   * Obtener estado de todos los agentes
   */
  getAgentsStatus(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  /**
   * Obtener estado de todas las tareas
   */
  getTasksStatus(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Obtener métricas del sistema
   */
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

  /**
   * Obtener tareas pendientes de un agente
   */
  getPendingTasks(agentId: string): AgentTask[] {
    return Array.from(this.tasks.values()).filter(
      task => task.agentId === agentId && task.status === 'pending'
    );
  }

  /**
   * Verificar dependencias de una tarea
   */
  checkTaskDependencies(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask && depTask.status === 'completed';
    });
  }

  /**
   * Iniciar monitoreo automático
   */
  private startMonitoring(): void {
    const monitoringInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(monitoringInterval);
        return;
      }

      this.performHealthCheck();
      this.checkForStuckTasks();
      this.updateSystemMetrics();
    }, 30000); // Cada 30 segundos

    this.logger.info('🔍 Monitoreo automático iniciado');
  }

  /**
   * Realizar verificación de salud del sistema
   */
  private performHealthCheck(): void {
    const agents = Array.from(this.agents.values());
    const inactiveAgents = agents.filter(
      agent => agent.status !== 'active' && 
      agent.status !== 'assigned' && 
      agent.status !== 'completed'
    );

    if (inactiveAgents.length > 0) {
      this.logger.warn(`⚠️ Agentes inactivos detectados: ${inactiveAgents.map(a => a.name).join(', ')}`);
    }

    // Emitir evento de health check
    this.emit('system:health-check', {
      timestamp: new Date(),
      activeAgents: agents.filter(a => a.status === 'active' || a.status === 'assigned').length,
      inactiveAgents: inactiveAgents.length,
      systemHealth: this.getSystemMetrics().systemHealth
    });
  }

  /**
   * Verificar tareas atascadas
   */
  private checkForStuckTasks(): void {
    const now = new Date();
    const stuckTasks = Array.from(this.tasks.values()).filter(task => {
      if (task.status !== 'pending' || !task.startTime) return false;
      
      const timeSinceStart = now.getTime() - task.startTime.getTime();
      const estimatedTimeMs = task.estimatedTime * 60 * 1000; // Convertir minutos a ms
      
      return timeSinceStart > estimatedTimeMs * 1.5; // 50% más del tiempo estimado
    });

    if (stuckTasks.length > 0) {
      this.logger.warn(`⚠️ Tareas atascadas detectadas: ${stuckTasks.map(t => t.id).join(', ')}`);
      
      // Emitir evento de tareas atascadas
      this.emit('system:stuck-tasks', {
        timestamp: new Date(),
        stuckTasks: stuckTasks.map(t => ({ id: t.id, description: t.description }))
      });
    }
  }

  /**
   * Actualizar métricas del sistema
   */
  private updateSystemMetrics(): void {
    const agents = Array.from(this.agents.values());
    
    agents.forEach(agent => {
      if (agent.status === 'active' || agent.status === 'assigned') {
        const uptime = Date.now() - agent.lastActivity.getTime();
        agent.metrics.uptime = uptime;
      }
    });
  }

  /**
   * Verificar transición de fase
   */
  private checkPhaseTransition(): void {
    const currentPhaseTasks = this.getTasksForPhase(this.currentPhase);
    const completedPhaseTasks = currentPhaseTasks.filter(t => t.status === 'completed');
    
    if (completedPhaseTasks.length === currentPhaseTasks.length && currentPhaseTasks.length > 0) {
      this.advanceToNextPhase();
    }
  }

  /**
   * Obtener tareas para una fase específica
   */
  private getTasksForPhase(phase: MigrationPhase): AgentTask[] {
    // Implementar lógica específica por fase
    switch (phase) {
      case 'planning':
        return Array.from(this.tasks.values()).filter(t => 
          t.description.includes('planificación') || 
          t.description.includes('análisis')
        );
      case 'development':
        return Array.from(this.tasks.values()).filter(t => 
          t.description.includes('desarrollo') || 
          t.description.includes('implementación')
        );
      case 'testing':
        return Array.from(this.tasks.values()).filter(t => 
          t.description.includes('test') || 
          t.description.includes('validación')
        );
      case 'deployment':
        return Array.from(this.tasks.values()).filter(t => 
          t.description.includes('despliegue') || 
          t.description.includes('producción')
        );
      default:
        return [];
    }
  }

  /**
   * Avanzar a la siguiente fase
   */
  private advanceToNextPhase(): void {
    const phases: MigrationPhase[] = ['planning', 'development', 'testing', 'deployment'];
    const currentIndex = phases.indexOf(this.currentPhase);
    
    if (currentIndex < phases.length - 1) {
      this.currentPhase = phases[currentIndex + 1];
      this.logger.info(`🔄 Avanzando a fase: ${this.currentPhase}`);
      
      // Emitir evento de cambio de fase
      this.emit('phase:changed', {
        previousPhase: phases[currentIndex],
        newPhase: this.currentPhase,
        timestamp: new Date()
      });
    } else {
      this.logger.info('🎉 Migración completada - Todas las fases finalizadas');
      
      // Emitir evento de completado
      this.emit('migration:completed', {
        timestamp: new Date(),
        totalTasks: this.tasks.size,
        completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length
      });
    }
  }

  /**
   * Generar reporte de progreso
   */
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
        lastActivity: agent.lastActivity,
        metrics: agent.metrics
      })),
      tasks: tasks.map(task => ({
        id: task.id,
        description: task.description,
        status: task.status,
        progress: task.progress,
        agentId: task.agentId,
        startTime: task.startTime,
        endTime: task.endTime,
        error: task.error
      })),
      currentPhase: this.currentPhase,
      isRunning: this.isRunning
    };
  }
}