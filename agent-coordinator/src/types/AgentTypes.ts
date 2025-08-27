// Tipos base para el sistema de agentes multi-nivel
export interface IAgent {
  id: string;
  name: string;
  type: AgentType;
  level: AgentLevel;
  role: AgentRole;
  status: AgentStatus;
  priority: AgentPriority;
  capabilities: string[];
  dependencies: string[];
  health: IAgentHealth;
  metrics: IAgentMetrics;
  config: IAgentConfig;
  parentId?: string;
  childrenIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type AgentType = 
  | 'super_coordinator'
  | 'area_coordinator'
  | 'specialized_agent'
  | 'security'
  | 'structure' 
  | 'typescript'
  | 'api'
  | 'database'
  | 'frontend'
  | 'backend'
  | 'testing'
  | 'deployment'
  | 'monitoring'
  | 'migration'
  | 'documentation'
  | 'performance'
  | 'recovery';

export type AgentLevel = 
  | 'level_1' // Super Coordinador
  | 'level_2' // Coordinadores de Área
  | 'level_3'; // Agentes Especializados

export type AgentRole = 
  | 'coordinator'
  | 'executor'
  | 'monitor'
  | 'validator'
  | 'reporter'
  | 'backup'
  | 'recovery';

export type AgentStatus = 
  | 'idle'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'recovering'
  | 'maintenance'
  | 'offline';

export type AgentPriority = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface IAgentHealth {
  isHealthy: boolean;
  lastCheck: string;
  uptime: number;
  errorCount: number;
  successRate: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
  lastError?: string;
  recoveryAttempts: number;
}

export interface IAgentMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  tasksCompleted: number;
  tasksFailed: number;
  messagesSent: number;
  messagesReceived: number;
  errorsHandled: number;
  performanceScore: number;
}

export interface IAgentConfig {
  maxRetries: number;
  timeout: number;
  autoRestart: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  notifications: boolean;
  maxConcurrentTasks: number;
  heartbeatInterval: number;
  healthCheckInterval: number;
  backupInterval: number;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Tipos para jerarquía de agentes
export interface IAgentHierarchy {
  id: string;
  name: string;
  level: AgentLevel;
  agents: IAgent[];
  parent?: IAgentHierarchy;
  children: IAgentHierarchy[];
  coordinator: IAgent;
  status: HierarchyStatus;
  load: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export type HierarchyStatus = 
  | 'active'
  | 'inactive'
  | 'overloaded'
  | 'maintenance'
  | 'recovering';

// Tipos para roles y permisos
export interface IAgentRole {
  id: string;
  name: string;
  level: AgentLevel;
  permissions: Permission[];
  capabilities: string[];
  responsibilities: string[];
  maxAgents: number;
  canDelegate: boolean;
  canOverride: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export type PermissionAction = 
  | 'read'
  | 'write'
  | 'execute'
  | 'delete'
  | 'admin'
  | 'delegate'
  | 'override';

// Tipos para comunicación avanzada
export interface IAgentCommunication {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  type: CommunicationType;
  protocol: CommunicationProtocol;
  payload: any;
  priority: MessagePriority;
  timestamp: string;
  correlationId?: string;
  responseRequired: boolean;
  timeout: number;
  retries: number;
  status: CommunicationStatus;
}

export type CommunicationType = 
  | 'task_assignment'
  | 'task_completion'
  | 'task_failure'
  | 'health_check'
  | 'status_update'
  | 'resource_request'
  | 'error_notification'
  | 'coordination_signal'
  | 'hierarchy_update'
  | 'role_change'
  | 'permission_request'
  | 'recovery_signal'
  | 'performance_alert'
  | 'security_alert';

export type CommunicationProtocol = 
  | 'http'
  | 'websocket'
  | 'redis'
  | 'rabbitmq'
  | 'kafka'
  | 'grpc'
  | 'internal';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type CommunicationStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'acknowledged'
  | 'failed'
  | 'timeout'
  | 'cancelled';

// Tipos para monitoreo avanzado
export interface IAgentMonitoring {
  id: string;
  agentId: string;
  timestamp: string;
  health: IAgentHealth;
  metrics: IAgentMetrics;
  alerts: IAlert[];
  events: IEvent[];
  performance: IPerformanceData;
  resources: IResourceUsage;
}

export interface IAlert {
  id: string;
  agentId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  actionRequired: boolean;
}

export type AlertType = 
  | 'health_degraded'
  | 'performance_degraded'
  | 'resource_exhausted'
  | 'communication_failed'
  | 'task_failed'
  | 'security_violation'
  | 'hierarchy_conflict'
  | 'permission_denied';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface IEvent {
  id: string;
  agentId: string;
  type: EventType;
  timestamp: string;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  correlationId?: string;
}

export type EventType = 
  | 'agent_started'
  | 'agent_stopped'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'health_check'
  | 'resource_low'
  | 'error_occurred'
  | 'recovery_attempted'
  | 'role_changed'
  | 'permission_granted'
  | 'permission_denied'
  | 'hierarchy_updated'
  | 'communication_sent'
  | 'communication_received';

export interface IPerformanceData {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  efficiency: number;
  qualityScore: number;
}

export interface IResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
  threads: number;
}

// Tipos para flujos de trabajo
export interface IWorkflow {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  level: AgentLevel;
  tasks: ITask[];
  dependencies: Record<string, string[]>;
  parallelExecution: boolean;
  maxConcurrentTasks: number;
  timeout: number;
  retryPolicy: IRetryPolicy;
  rollbackPolicy: IRollbackPolicy;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export type WorkflowType = 
  | 'migration'
  | 'testing'
  | 'deployment'
  | 'monitoring'
  | 'recovery'
  | 'maintenance'
  | 'backup'
  | 'restore'
  | 'validation'
  | 'optimization';

export type WorkflowStatus = 
  | 'draft'
  | 'active'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled'
  | 'rolled_back';

export interface ITask {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  agentType: AgentType;
  priority: AgentPriority;
  dependencies: string[];
  estimatedDuration: number;
  requiredCapabilities: string[];
  config: Record<string, any>;
  status: TaskStatus;
  assignedAgentId?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  result?: any;
  error?: string;
  retries: number;
  progress: number;
}

export type TaskType = 
  | 'execution'
  | 'validation'
  | 'monitoring'
  | 'communication'
  | 'coordination'
  | 'recovery'
  | 'maintenance'
  | 'backup'
  | 'restore'
  | 'migration'
  | 'testing'
  | 'deployment';

export type TaskStatus = 
  | 'pending'
  | 'assigned'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying'
  | 'paused';

export interface IRetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  backoffDelay: number;
  retryOnErrors: string[];
  maxBackoffDelay: number;
}

export interface IRollbackPolicy {
  enabled: boolean;
  triggerConditions: string[];
  rollbackSteps: string[];
  maxRollbackAttempts: number;
  rollbackTimeout: number;
}

// Tipos para seguridad
export interface ISecurityContext {
  agentId: string;
  permissions: Permission[];
  roles: string[];
  securityLevel: SecurityLevel;
  authenticationMethod: AuthenticationMethod;
  encryptionLevel: EncryptionLevel;
  auditEnabled: boolean;
  lastSecurityCheck: string;
}

export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

export type AuthenticationMethod = 
  | 'none'
  | 'token'
  | 'certificate'
  | 'biometric'
  | 'multi_factor';

export type EncryptionLevel = 
  | 'none'
  | 'basic'
  | 'standard'
  | 'high'
  | 'military';

// Tipos para métricas del sistema
export interface ISystemMetrics {
  totalAgents: number;
  activeAgents: number;
  failedAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  systemHealth: number;
  resourceUtilization: IResourceUtilization;
  performanceMetrics: IPerformanceMetrics;
  securityMetrics: ISecurityMetrics;
  communicationMetrics: ICommunicationMetrics;
}

export interface IResourceUtilization {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
  threads: number;
}

export interface IPerformanceMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  availability: number;
  efficiency: number;
  qualityScore: number;
}

export interface ISecurityMetrics {
  authenticationSuccess: number;
  authenticationFailures: number;
  authorizationSuccess: number;
  authorizationFailures: number;
  securityViolations: number;
  encryptionUsage: number;
  auditEvents: number;
}

export interface ICommunicationMetrics {
  messagesSent: number;
  messagesReceived: number;
  messagesFailed: number;
  averageLatency: number;
  bandwidthUsage: number;
  connectionCount: number;
  protocolUsage: Record<string, number>;
}