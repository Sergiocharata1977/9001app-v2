import { Logger } from '../utils/Logger';
import { MigrationCoordinator, AgentTask } from '../core/MigrationCoordinator';
import { AgentType, TaskDefinition, AgentDefinition } from '../types/AgentTypes';

export class TaskAssignmentService {
  private logger: Logger;
  private coordinator: MigrationCoordinator;
  private taskDefinitions: Map<string, TaskDefinition> = new Map();
  private agentDefinitions: Map<string, AgentDefinition> = new Map();

  constructor(coordinator: MigrationCoordinator) {
    this.logger = new Logger('TaskAssignmentService');
    this.coordinator = coordinator;
    this.initializeTaskDefinitions();
    this.initializeAgentDefinitions();
  }

  /**
   * Inicializar definiciones de tareas para la migración
   */
  private initializeTaskDefinitions(): void {
    const tasks: TaskDefinition[] = [
      // AGENTE 2: Arquitecto de Base de Datos MongoDB
      {
        id: 'task-2-1',
        agentId: 'agent-2',
        title: 'Análisis de Estructura SQLite',
        description: 'Analizar la estructura actual de la base de datos SQLite para identificar tablas, relaciones y tipos de datos',
        type: 'analysis',
        priority: 'critical',
        estimatedTime: 120, // 2 horas
        dependencies: [],
        acceptanceCriteria: [
          'Documento de análisis completo de la estructura SQLite',
          'Identificación de todas las tablas y relaciones',
          'Mapeo de tipos de datos SQLite a MongoDB',
          'Identificación de restricciones y índices'
        ],
        deliverables: [
          'analysis-sqlite-structure.md',
          'data-mapping-sqlite-to-mongodb.json',
          'database-schema-analysis.pdf'
        ]
      },
      {
        id: 'task-2-2',
        agentId: 'agent-2',
        title: 'Diseño de Esquemas MongoDB',
        description: 'Diseñar los esquemas de MongoDB optimizados para el sistema de gestión de calidad ISO 9001',
        type: 'development',
        priority: 'critical',
        estimatedTime: 240, // 4 horas
        dependencies: ['task-2-1'],
        acceptanceCriteria: [
          'Esquemas MongoDB completos para todas las entidades',
          'Optimización de consultas y rendimiento',
          'Configuración de índices apropiados',
          'Validación de integridad de datos'
        ],
        deliverables: [
          'mongodb-schemas.ts',
          'database-indexes.json',
          'query-optimization.md',
          'data-validation-rules.ts'
        ]
      },
      {
        id: 'task-2-3',
        agentId: 'agent-2',
        title: 'Configuración de MongoDB Atlas',
        description: 'Configurar el cluster de MongoDB Atlas y establecer conexiones seguras',
        type: 'deployment',
        priority: 'high',
        estimatedTime: 60, // 1 hora
        dependencies: ['task-2-2'],
        acceptanceCriteria: [
          'Cluster MongoDB Atlas configurado',
          'Conexiones seguras establecidas',
          'Usuarios y permisos configurados',
          'Backup automático habilitado'
        ],
        deliverables: [
          'mongodb-atlas-config.json',
          'connection-strings.env',
          'security-config.md',
          'backup-config.json'
        ]
      },

      // AGENTE 3: Configurador de Backend
      {
        id: 'task-3-1',
        agentId: 'agent-3',
        title: 'Instalación de Dependencias MongoDB',
        description: 'Instalar y configurar las dependencias necesarias para MongoDB en el backend',
        type: 'development',
        priority: 'critical',
        estimatedTime: 30, // 30 minutos
        dependencies: ['task-2-3'],
        acceptanceCriteria: [
          'Mongoose instalado y configurado',
          'Dependencias de MongoDB instaladas',
          'Configuración de conexión establecida',
          'Variables de entorno configuradas'
        ],
        deliverables: [
          'package.json-updated',
          'mongodb-connection.ts',
          'environment-variables.env'
        ]
      },
      {
        id: 'task-3-2',
        agentId: 'agent-3',
        title: 'Migración de Modelos de Datos',
        description: 'Migrar todos los modelos de datos de SQLite a MongoDB usando Mongoose',
        type: 'development',
        priority: 'critical',
        estimatedTime: 180, // 3 horas
        dependencies: ['task-3-1', 'task-2-2'],
        acceptanceCriteria: [
          'Todos los modelos migrados a Mongoose',
          'Validaciones implementadas',
          'Relaciones entre modelos establecidas',
          'Métodos de instancia y estáticos definidos'
        ],
        deliverables: [
          'models/User.ts',
          'models/Document.ts',
          'models/Audit.ts',
          'models/Process.ts',
          'models/Quality.ts'
        ]
      },
      {
        id: 'task-3-3',
        agentId: 'agent-3',
        title: 'Adaptación de Controladores',
        description: 'Adaptar todos los controladores para trabajar con MongoDB en lugar de SQLite',
        type: 'development',
        priority: 'critical',
        estimatedTime: 240, // 4 horas
        dependencies: ['task-3-2'],
        acceptanceCriteria: [
          'Todos los controladores adaptados',
          'Operaciones CRUD funcionando',
          'Manejo de errores implementado',
          'Validaciones de entrada configuradas'
        ],
        deliverables: [
          'controllers/authController.ts',
          'controllers/documentController.ts',
          'controllers/auditController.ts',
          'controllers/processController.ts',
          'controllers/qualityController.ts'
        ]
      },
      {
        id: 'task-3-4',
        agentId: 'agent-3',
        title: 'Actualización de Servicios',
        description: 'Actualizar todos los servicios para usar MongoDB y optimizar el rendimiento',
        type: 'development',
        priority: 'high',
        estimatedTime: 120, // 2 horas
        dependencies: ['task-3-3'],
        acceptanceCriteria: [
          'Servicios actualizados para MongoDB',
          'Optimización de consultas implementada',
          'Caché configurado donde sea apropiado',
          'Manejo de transacciones implementado'
        ],
        deliverables: [
          'services/authService.ts',
          'services/documentService.ts',
          'services/auditService.ts',
          'services/processService.ts',
          'services/qualityService.ts'
        ]
      },

      // AGENTE 4: Adaptador de Frontend
      {
        id: 'task-4-1',
        agentId: 'agent-4',
        title: 'Actualización de Servicios API',
        description: 'Actualizar los servicios del frontend para trabajar con las nuevas APIs de MongoDB',
        type: 'development',
        priority: 'high',
        estimatedTime: 120, // 2 horas
        dependencies: ['task-3-4'],
        acceptanceCriteria: [
          'Servicios API actualizados',
          'Manejo de errores mejorado',
          'Tipos TypeScript actualizados',
          'Interceptores de HTTP configurados'
        ],
        deliverables: [
          'services/api.ts',
          'services/auth.ts',
          'services/documents.ts',
          'services/audits.ts',
          'types/api.ts'
        ]
      },
      {
        id: 'task-4-2',
        agentId: 'agent-4',
        title: 'Adaptación de Componentes',
        description: 'Adaptar los componentes del frontend para trabajar con la nueva estructura de datos',
        type: 'development',
        priority: 'high',
        estimatedTime: 180, // 3 horas
        dependencies: ['task-4-1'],
        acceptanceCriteria: [
          'Componentes adaptados para MongoDB',
          'Formularios actualizados',
          'Tablas y listas funcionando',
          'Filtros y búsquedas optimizados'
        ],
        deliverables: [
          'components/DocumentForm.tsx',
          'components/AuditTable.tsx',
          'components/ProcessList.tsx',
          'components/QualityDashboard.tsx'
        ]
      },
      {
        id: 'task-4-3',
        agentId: 'agent-4',
        title: 'Optimización de UI/UX',
        description: 'Optimizar la interfaz de usuario para mejorar la experiencia con MongoDB',
        type: 'development',
        priority: 'medium',
        estimatedTime: 90, // 1.5 horas
        dependencies: ['task-4-2'],
        acceptanceCriteria: [
          'Interfaz optimizada para MongoDB',
          'Carga de datos mejorada',
          'Feedback visual implementado',
          'Responsive design verificado'
        ],
        deliverables: [
          'ui-optimizations.md',
          'performance-improvements.tsx',
          'responsive-design.css'
        ]
      },

      // AGENTE 5: Tester de Calidad
      {
        id: 'task-5-1',
        agentId: 'agent-5',
        title: 'Tests Unitarios',
        description: 'Crear suite completa de tests unitarios para todos los componentes',
        type: 'testing',
        priority: 'high',
        estimatedTime: 180, // 3 horas
        dependencies: ['task-3-4', 'task-4-3'],
        acceptanceCriteria: [
          'Cobertura de tests > 90%',
          'Tests para todos los modelos',
          'Tests para todos los controladores',
          'Tests para servicios críticos'
        ],
        deliverables: [
          'tests/models/',
          'tests/controllers/',
          'tests/services/',
          'coverage-report.json'
        ]
      },
      {
        id: 'task-5-2',
        agentId: 'agent-5',
        title: 'Tests de Integración',
        description: 'Implementar tests de integración para validar el flujo completo',
        type: 'testing',
        priority: 'high',
        estimatedTime: 120, // 2 horas
        dependencies: ['task-5-1'],
        acceptanceCriteria: [
          'Tests de integración completos',
          'Flujos de usuario validados',
          'APIs probadas end-to-end',
          'Base de datos de test configurada'
        ],
        deliverables: [
          'tests/integration/',
          'test-database-config.json',
          'integration-test-results.md'
        ]
      },
      {
        id: 'task-5-3',
        agentId: 'agent-5',
        title: 'Tests de Rendimiento',
        description: 'Implementar tests de rendimiento para validar la escalabilidad',
        type: 'testing',
        priority: 'medium',
        estimatedTime: 90, // 1.5 horas
        dependencies: ['task-5-2'],
        acceptanceCriteria: [
          'Tests de carga implementados',
          'Métricas de rendimiento establecidas',
          'Bottlenecks identificados',
          'Optimizaciones recomendadas'
        ],
        deliverables: [
          'tests/performance/',
          'performance-metrics.json',
          'optimization-recommendations.md'
        ]
      },

      // AGENTE 6: Documentador
      {
        id: 'task-6-1',
        agentId: 'agent-6',
        title: 'Documentación Técnica',
        description: 'Crear documentación técnica completa del sistema migrado',
        type: 'documentation',
        priority: 'high',
        estimatedTime: 120, // 2 horas
        dependencies: ['task-5-3'],
        acceptanceCriteria: [
          'Documentación técnica completa',
          'Diagramas de arquitectura',
          'Guías de desarrollo',
          'Documentación de APIs'
        ],
        deliverables: [
          'docs/technical/',
          'docs/api/',
          'docs/architecture/',
          'README.md'
        ]
      },
      {
        id: 'task-6-2',
        agentId: 'agent-6',
        title: 'Manuales de Usuario',
        description: 'Crear manuales de usuario para todas las funcionalidades',
        type: 'documentation',
        priority: 'medium',
        estimatedTime: 90, // 1.5 horas
        dependencies: ['task-6-1'],
        acceptanceCriteria: [
          'Manuales de usuario completos',
          'Guías paso a paso',
          'Capturas de pantalla incluidas',
          'FAQ documentado'
        ],
        deliverables: [
          'docs/user-manuals/',
          'docs/guides/',
          'docs/faq.md'
        ]
      },

      // AGENTE 7: Desplegador
      {
        id: 'task-7-1',
        agentId: 'agent-7',
        title: 'Configuración de Producción',
        description: 'Configurar el entorno de producción para MongoDB Atlas',
        type: 'deployment',
        priority: 'critical',
        estimatedTime: 60, // 1 hora
        dependencies: ['task-6-2'],
        acceptanceCriteria: [
          'Entorno de producción configurado',
          'Variables de entorno seguras',
          'Configuración de MongoDB Atlas',
          'Monitoreo configurado'
        ],
        deliverables: [
          'production-config/',
          'environment-prod.env',
          'monitoring-config.json'
        ]
      },
      {
        id: 'task-7-2',
        agentId: 'agent-7',
        title: 'Despliegue Automatizado',
        description: 'Implementar CI/CD para despliegue automatizado',
        type: 'deployment',
        priority: 'high',
        estimatedTime: 90, // 1.5 horas
        dependencies: ['task-7-1'],
        acceptanceCriteria: [
          'Pipeline CI/CD configurado',
          'Despliegue automatizado funcionando',
          'Rollback automático configurado',
          'Notificaciones configuradas'
        ],
        deliverables: [
          '.github/workflows/',
          'docker-compose.yml',
          'deployment-scripts/'
        ]
      },

      // AGENTE 8: Rehabilitador
      {
        id: 'task-8-1',
        agentId: 'agent-8',
        title: 'Optimización del Sistema',
        description: 'Optimizar el sistema completo y rehabilitar el coordinador de agentes',
        type: 'optimization',
        priority: 'medium',
        estimatedTime: 60, // 1 hora
        dependencies: ['task-7-2'],
        acceptanceCriteria: [
          'Sistema optimizado',
          'Rendimiento mejorado',
          'Coordinador rehabilitado',
          'Métricas de sistema actualizadas'
        ],
        deliverables: [
          'optimization-report.md',
          'performance-improvements.json',
          'coordinator-updates.ts'
        ]
      }
    ];

    tasks.forEach(task => {
      this.taskDefinitions.set(task.id, task);
    });

    this.logger.info(`Definiciones de tareas inicializadas: ${this.taskDefinitions.size} tareas`);
  }

  /**
   * Inicializar definiciones de agentes
   */
  private initializeAgentDefinitions(): void {
    const agents: AgentDefinition[] = [
      {
        id: 'agent-1',
        name: 'Coordinador Principal',
        type: 'coordinator',
        description: 'Sistema de coordinación principal para la migración',
        responsibilities: [
          'Coordinar todos los agentes',
          'Monitorear progreso',
          'Gestionar dependencias',
          'Generar reportes'
        ],
        dependencies: [],
        estimatedTime: 0,
        priority: 'critical'
      },
      {
        id: 'agent-2',
        name: 'Arquitecto de Base de Datos MongoDB',
        type: 'database',
        description: 'Diseño de esquemas y estructura MongoDB',
        responsibilities: [
          'Analizar estructura SQLite',
          'Diseñar esquemas MongoDB',
          'Configurar MongoDB Atlas',
          'Optimizar consultas'
        ],
        dependencies: [],
        estimatedTime: 3,
        priority: 'critical'
      },
      {
        id: 'agent-3',
        name: 'Configurador de Backend',
        type: 'backend',
        description: 'Migración de backend a MongoDB',
        responsibilities: [
          'Instalar dependencias MongoDB',
          'Migrar modelos de datos',
          'Adaptar controladores',
          'Actualizar servicios'
        ],
        dependencies: ['agent-2'],
        estimatedTime: 4,
        priority: 'critical'
      },
      {
        id: 'agent-4',
        name: 'Adaptador de Frontend',
        type: 'frontend',
        description: 'Adaptación de frontend para MongoDB',
        responsibilities: [
          'Actualizar servicios API',
          'Adaptar componentes',
          'Optimizar UI/UX',
          'Validar funcionalidad'
        ],
        dependencies: ['agent-3'],
        estimatedTime: 3,
        priority: 'high'
      },
      {
        id: 'agent-5',
        name: 'Tester de Calidad',
        type: 'testing',
        description: 'Suite de tests y validación',
        responsibilities: [
          'Crear tests unitarios',
          'Implementar tests de integración',
          'Configurar tests de rendimiento',
          'Validar calidad'
        ],
        dependencies: ['agent-2', 'agent-3', 'agent-4'],
        estimatedTime: 3,
        priority: 'high'
      },
      {
        id: 'agent-6',
        name: 'Documentador',
        type: 'documentation',
        description: 'Documentación técnica y manuales',
        responsibilities: [
          'Documentar arquitectura',
          'Crear manuales de usuario',
          'Escribir guías de despliegue',
          'Documentar APIs'
        ],
        dependencies: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'],
        estimatedTime: 2,
        priority: 'medium'
      },
      {
        id: 'agent-7',
        name: 'Desplegador',
        type: 'deployment',
        description: 'Despliegue y configuración de producción',
        responsibilities: [
          'Configurar entorno de producción',
          'Implementar CI/CD',
          'Configurar monitoreo',
          'Desplegar aplicación'
        ],
        dependencies: ['agent-2', 'agent-3', 'agent-4', 'agent-5', 'agent-6'],
        estimatedTime: 2,
        priority: 'high'
      },
      {
        id: 'agent-8',
        name: 'Rehabilitador de Sistema de Agentes',
        type: 'optimization',
        description: 'Optimización y rehabilitación del sistema',
        responsibilities: [
          'Optimizar coordinador',
          'Mejorar rendimiento',
          'Configuración final',
          'Validación completa'
        ],
        dependencies: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5', 'agent-6', 'agent-7'],
        estimatedTime: 1,
        priority: 'medium'
      }
    ];

    agents.forEach(agent => {
      this.agentDefinitions.set(agent.id, agent);
    });

    this.logger.info(`Definiciones de agentes inicializadas: ${this.agentDefinitions.size} agentes`);
  }

  /**
   * Asignar tareas iniciales a los agentes
   */
  async assignInitialTasks(): Promise<void> {
    this.logger.info('🚀 Iniciando asignación de tareas iniciales');

    // Asignar tareas del Agente 2 (sin dependencias)
    await this.assignTasksForAgent('agent-2');

    this.logger.info('✅ Tareas iniciales asignadas');
  }

  /**
   * Asignar tareas para un agente específico
   */
  async assignTasksForAgent(agentId: string): Promise<void> {
    const agentTasks = Array.from(this.taskDefinitions.values())
      .filter(task => task.agentId === agentId)
      .sort((a, b) => {
        // Ordenar por prioridad y dependencias
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    for (const taskDef of agentTasks) {
      // Verificar si las dependencias están completadas
      if (this.checkTaskDependencies(taskDef.dependencies)) {
        const taskId = this.coordinator.assignTask(agentId, {
          agentId: taskDef.agentId,
          description: taskDef.description,
          dependencies: taskDef.dependencies,
          estimatedTime: taskDef.estimatedTime
        });

        this.logger.info(`📋 Tarea asignada: ${taskId} → ${agentId} (${taskDef.title})`);
      } else {
        this.logger.info(`⏳ Tarea pendiente de dependencias: ${taskDef.title}`);
      }
    }
  }

  /**
   * Verificar si las dependencias de una tarea están completadas
   */
  private checkTaskDependencies(dependencies: string[]): boolean {
    if (dependencies.length === 0) return true;

    return dependencies.every(depId => {
      const depTask = this.coordinator.getTasksStatus().find(t => t.id === depId);
      return depTask && depTask.status === 'completed';
    });
  }

  /**
   * Obtener próximas tareas disponibles
   */
  getAvailableTasks(): TaskDefinition[] {
    return Array.from(this.taskDefinitions.values()).filter(taskDef => {
      // Verificar si la tarea ya está asignada
      const assignedTask = this.coordinator.getTasksStatus().find(t => t.id === taskDef.id);
      if (assignedTask) return false;

      // Verificar dependencias
      return this.checkTaskDependencies(taskDef.dependencies);
    });
  }

  /**
   * Obtener tareas pendientes de un agente
   */
  getPendingTasksForAgent(agentId: string): TaskDefinition[] {
    return Array.from(this.taskDefinitions.values()).filter(taskDef => {
      if (taskDef.agentId !== agentId) return false;

      const assignedTask = this.coordinator.getTasksStatus().find(t => t.id === taskDef.id);
      if (!assignedTask) return false;

      return assignedTask.status === 'pending' || assignedTask.status === 'running';
    });
  }

  /**
   * Obtener progreso de un agente
   */
  getAgentProgress(agentId: string): number {
    const agentTasks = Array.from(this.taskDefinitions.values())
      .filter(task => task.agentId === agentId);

    if (agentTasks.length === 0) return 0;

    const completedTasks = agentTasks.filter(taskDef => {
      const task = this.coordinator.getTasksStatus().find(t => t.id === taskDef.id);
      return task && task.status === 'completed';
    });

    return Math.round((completedTasks.length / agentTasks.length) * 100);
  }

  /**
   * Obtener progreso general del proyecto
   */
  getProjectProgress(): number {
    const allTasks = Array.from(this.taskDefinitions.values());
    const completedTasks = allTasks.filter(taskDef => {
      const task = this.coordinator.getTasksStatus().find(t => t.id === taskDef.id);
      return task && task.status === 'completed';
    });

    return Math.round((completedTasks.length / allTasks.length) * 100);
  }

  /**
   * Obtener tareas críticas pendientes
   */
  getCriticalPendingTasks(): TaskDefinition[] {
    return this.getAvailableTasks().filter(task => task.priority === 'critical');
  }

  /**
   * Obtener bloqueos del proyecto
   */
  getProjectBlockers(): string[] {
    const blockers: string[] = [];
    const allTasks = Array.from(this.taskDefinitions.values());

    allTasks.forEach(taskDef => {
      const assignedTask = this.coordinator.getTasksStatus().find(t => t.id === taskDef.id);
      
      if (assignedTask && assignedTask.status === 'failed') {
        blockers.push(`Tarea fallida: ${taskDef.title} - ${assignedTask.error}`);
      }

      if (!assignedTask && !this.checkTaskDependencies(taskDef.dependencies)) {
        blockers.push(`Dependencias pendientes: ${taskDef.title}`);
      }
    });

    return blockers;
  }

  /**
   * Generar reporte de asignación de tareas
   */
  generateAssignmentReport(): any {
    const agents = Array.from(this.agentDefinitions.values());
    const tasks = Array.from(this.taskDefinitions.values());
    const assignedTasks = this.coordinator.getTasksStatus();

    return {
      timestamp: new Date(),
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        progress: this.getAgentProgress(agent.id),
        totalTasks: tasks.filter(t => t.agentId === agent.id).length,
        completedTasks: assignedTasks.filter(t => 
          tasks.find(td => td.id === t.id)?.agentId === agent.id && t.status === 'completed'
        ).length,
        pendingTasks: this.getPendingTasksForAgent(agent.id).length
      })),
      projectProgress: this.getProjectProgress(),
      criticalTasks: this.getCriticalPendingTasks().length,
      blockers: this.getProjectBlockers(),
      nextSteps: this.getAvailableTasks().slice(0, 5).map(t => t.title)
    };
  }
}