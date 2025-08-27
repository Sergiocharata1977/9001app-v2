export type AgentStatus = 
  | 'pending'      // Pendiente de asignación
  | 'active'       // Activo y funcionando
  | 'assigned'     // Con tarea asignada
  | 'idle'         // Sin tareas activas
  | 'error'        // Error en ejecución
  | 'completed'    // Tarea completada
  | 'stopped';     // Detenido

export type TaskStatus = 
  | 'pending'      // Pendiente de ejecución
  | 'running'      // En ejecución
  | 'completed'    // Completada exitosamente
  | 'failed'       // Fallida
  | 'cancelled'    // Cancelada
  | 'paused';      // Pausada

export type MigrationPhase = 
  | 'planning'     // Fase 1: Planificación
  | 'development'  // Fase 2: Desarrollo
  | 'testing'      // Fase 3: Testing
  | 'deployment';  // Fase 4: Despliegue

export type AgentType = 
  | 'coordinator'    // Agente 1: Coordinador Principal
  | 'database'       // Agente 2: Arquitecto MongoDB
  | 'backend'        // Agente 3: Configurador Backend
  | 'frontend'       // Agente 4: Adaptador Frontend
  | 'testing'        // Agente 5: Tester de Calidad
  | 'documentation'  // Agente 6: Documentador
  | 'deployment'     // Agente 7: Desplegador
  | 'optimization';  // Agente 8: Rehabilitador

export interface AgentDefinition {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  responsibilities: string[];
  dependencies: string[];
  estimatedTime: number; // en días
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface TaskDefinition {
  id: string;
  agentId: string;
  title: string;
  description: string;
  type: 'analysis' | 'development' | 'testing' | 'deployment' | 'documentation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number; // en minutos
  dependencies: string[];
  acceptanceCriteria: string[];
  deliverables: string[];
}

export interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  failedAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  systemHealth: number;
  currentPhase: MigrationPhase;
  isRunning: boolean;
  uptime: number;
  averageResponseTime: number;
  throughput: number;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageResponseTime: number;
  uptime: number;
  successRate: number;
  lastActivity: Date;
  performance: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface TaskMetrics {
  startTime: Date;
  endTime?: Date;
  duration: number;
  progress: number;
  status: TaskStatus;
  error?: string;
  performance: {
    cpu: number;
    memory: number;
    throughput: number;
  };
}

export interface MigrationProgress {
  phase: MigrationPhase;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  estimatedCompletion: Date;
  blockers: string[];
  nextSteps: string[];
}

export interface CoordinationEvent {
  type: 'task:assigned' | 'task:progress' | 'task:completed' | 'task:failed' |
        'agent:status-change' | 'phase:changed' | 'system:health-check' |
        'migration:completed' | 'coordinator:started' | 'coordinator:stopped';
  timestamp: Date;
  data: any;
}

export interface HealthCheckResult {
  timestamp: Date;
  systemHealth: number;
  activeAgents: number;
  inactiveAgents: number;
  stuckTasks: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ProgressReport {
  timestamp: Date;
  systemMetrics: SystemMetrics;
  agents: Array<{
    id: string;
    name: string;
    status: AgentStatus;
    progress: number;
    currentTask?: string;
    lastActivity: Date;
    metrics: AgentMetrics;
  }>;
  tasks: Array<{
    id: string;
    description: string;
    status: TaskStatus;
    progress: number;
    agentId: string;
    startTime?: Date;
    endTime?: Date;
    error?: string;
  }>;
  currentPhase: MigrationPhase;
  isRunning: boolean;
  migrationProgress: MigrationProgress;
  healthCheck: HealthCheckResult;
}

// Tipos para comunicación entre agentes
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'task-request' | 'task-update' | 'status-report' | 'error-report' | 'completion-notification';
  data: any;
  timestamp: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface TaskRequest {
  agentId: string;
  taskType: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number;
  dependencies: string[];
  requirements: string[];
}

export interface TaskUpdate {
  taskId: string;
  progress: number;
  status: TaskStatus;
  message?: string;
  error?: string;
  result?: any;
}

export interface StatusReport {
  agentId: string;
  status: AgentStatus;
  progress: number;
  currentTask?: string;
  metrics: AgentMetrics;
  lastActivity: Date;
  issues: string[];
  nextActions: string[];
}

// Tipos para configuración del sistema
export interface CoordinatorConfig {
  port: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  monitoringInterval: number;
  healthCheckInterval: number;
  reportInterval: number;
  agentTimeout: number;
  maxRetries: number;
  autoRestart: boolean;
  backupInterval: number;
}

export interface DatabaseConfig {
  type: 'mongodb' | 'sqlite' | 'postgresql';
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  connectionString?: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
}

export interface SecurityConfig {
  enabled: boolean;
  jwtSecret: string;
  jwtExpiration: number;
  bcryptRounds: number;
  corsOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

// Tipos para validación y testing
export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  metrics: {
    coverage: number;
    performance: number;
    security: number;
    reliability: number;
  };
}

export interface TestResult {
  testId: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: string;
  output?: string;
  coverage?: number;
  timestamp: Date;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage: number;
    duration: number;
  };
}

// Tipos para documentación
export interface DocumentationItem {
  id: string;
  title: string;
  type: 'technical' | 'user' | 'api' | 'deployment' | 'troubleshooting';
  content: string;
  author: string;
  version: string;
  lastUpdated: Date;
  tags: string[];
  relatedItems: string[];
}

export interface APIDocumentation {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example: any;
  }>;
  responses: Array<{
    code: number;
    description: string;
    schema: any;
    example: any;
  }>;
  authentication: boolean;
  rateLimit?: number;
}

// Tipos para despliegue
export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  platform: 'local' | 'docker' | 'kubernetes' | 'cloud';
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  scaling: {
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilization: number;
  };
  monitoring: {
    enabled: boolean;
    metrics: string[];
    alerts: string[];
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };
}

export interface DeploymentStatus {
  environment: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'rolled-back';
  version: string;
  deployedAt: Date;
  duration: number;
  health: number;
  issues: string[];
  metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
}