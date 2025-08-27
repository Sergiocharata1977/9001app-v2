// Tipos para sistema de tareas avanzado
export interface ITask {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  agentType: AgentType;
  priority: TaskPriority;
  dependencies: string[];
  estimatedDuration: number;
  requiredCapabilities: string[];
  config: TaskConfig;
  status: TaskStatus;
  assignedAgentId?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  result?: TaskResult;
  error?: TaskError;
  retries: number;
  progress: number;
  metadata: TaskMetadata;
  validation: TaskValidation;
  monitoring: TaskMonitoring;
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
  | 'deployment'
  | 'verification'
  | 'cleanup'
  | 'setup'
  | 'teardown'
  | 'checkpoint'
  | 'rollback'
  | 'notification'
  | 'logging'
  | 'auditing'
  | 'security_check'
  | 'performance_check'
  | 'health_check'
  | 'resource_check'
  | 'dependency_check'
  | 'precondition_check'
  | 'postcondition_check';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low' | 'background';

export type TaskStatus = 
  | 'pending'
  | 'assigned'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying'
  | 'paused'
  | 'validating'
  | 'preparing'
  | 'executing'
  | 'finalizing'
  | 'cleaning_up'
  | 'rolled_back'
  | 'skipped'
  | 'timeout'
  | 'blocked';

export interface TaskConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  maxConcurrentExecutions: number;
  resourceRequirements: ResourceRequirements;
  environment: Record<string, any>;
  parameters: Record<string, any>;
  secrets: string[];
  artifacts: string[];
  outputs: string[];
  inputs: string[];
  conditions: TaskCondition[];
  actions: TaskAction[];
  errorHandling: ErrorHandlingConfig;
  monitoring: MonitoringConfig;
  validation: ValidationConfig;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  gpu?: number;
  storage?: number;
  bandwidth?: number;
}

export interface TaskCondition {
  type: 'precondition' | 'postcondition' | 'guard';
  expression: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: 'continue' | 'skip' | 'fail' | 'retry';
}

export interface TaskAction {
  type: 'execute' | 'validate' | 'monitor' | 'notify' | 'log' | 'audit';
  name: string;
  config: Record<string, any>;
  condition?: string;
  onSuccess?: string;
  onFailure?: string;
}

export interface ErrorHandlingConfig {
  strategy: 'retry' | 'skip' | 'fail' | 'rollback' | 'continue';
  maxRetries: number;
  retryDelay: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  errorCodes: string[];
  fallbackAction?: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  logging: LoggingConfig;
  tracing: TracingConfig;
}

export interface AlertConfig {
  type: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  recipients: string[];
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'structured';
  destination: string[];
  retention: number;
}

export interface TracingConfig {
  enabled: boolean;
  sampling: number;
  tags: Record<string, string>;
  baggage: Record<string, string>;
}

export interface ValidationConfig {
  enabled: boolean;
  rules: ValidationRule[];
  schema?: string;
  customValidators: string[];
  onValidationFailure: 'fail' | 'warn' | 'continue';
}

export interface ValidationRule {
  name: string;
  type: 'schema' | 'custom' | 'regex' | 'range' | 'required';
  expression: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface TaskResult {
  success: boolean;
  data: any;
  metadata: Record<string, any>;
  artifacts: string[];
  outputs: Record<string, any>;
  metrics: TaskMetrics;
  logs: string[];
}

export interface TaskError {
  code: string;
  message: string;
  details: any;
  stack?: string;
  context: Record<string, any>;
  timestamp: string;
  retryable: boolean;
}

export interface TaskMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkUsage: number;
  diskUsage: number;
  throughput: number;
  latency: number;
  errorRate: number;
}

export interface TaskMetadata {
  version: string;
  author: string;
  tags: string[];
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedDuration: number;
  actualDuration?: number;
  resourceUsage: ResourceUsage;
  dependencies: string[];
  prerequisites: string[];
  postConditions: string[];
  documentation: string;
  examples: string[];
  troubleshooting: string[];
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  time: number;
}

export interface TaskValidation {
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  rules: ValidationResult[];
  overall: boolean;
  timestamp: string;
  duration: number;
}

export interface ValidationResult {
  rule: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  details: any;
  timestamp: string;
}

export interface TaskMonitoring {
  status: 'active' | 'inactive' | 'error';
  metrics: Record<string, number>;
  alerts: Alert[];
  logs: LogEntry[];
  events: Event[];
  health: HealthStatus;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, any>;
  source: string;
}

export interface Event {
  id: string;
  type: string;
  timestamp: string;
  data: any;
  source: string;
  correlationId?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  checks: HealthCheck[];
  lastCheck: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  timestamp: string;
  duration: number;
}

// Tipos para gestión de tareas
export interface ITaskManager {
  id: string;
  name: string;
  tasks: ITask[];
  queue: TaskQueue;
  scheduler: TaskScheduler;
  executor: TaskExecutor;
  monitor: TaskMonitor;
  status: TaskManagerStatus;
  metrics: TaskManagerMetrics;
}

export interface TaskQueue {
  id: string;
  name: string;
  type: QueueType;
  tasks: ITask[];
  config: QueueConfig;
  status: QueueStatus;
  metrics: QueueMetrics;
}

export type QueueType = 
  | 'fifo'
  | 'lifo'
  | 'priority'
  | 'round_robin'
  | 'weighted'
  | 'dead_letter'
  | 'retry'
  | 'scheduled'
  | 'batch'
  | 'stream';

export interface QueueConfig {
  maxSize: number;
  maxTasks: number;
  timeout: number;
  retryAttempts: number;
  deadLetterQueue?: string;
  priorityLevels: number;
  persistence: boolean;
  monitoring: boolean;
  loadBalancing: boolean;
  failover: boolean;
}

export type QueueStatus = 
  | 'active'
  | 'paused'
  | 'full'
  | 'empty'
  | 'error'
  | 'maintenance'
  | 'scaling'
  | 'migrating';

export interface QueueMetrics {
  size: number;
  taskCount: number;
  enqueueRate: number;
  dequeueRate: number;
  averageWaitTime: number;
  maxWaitTime: number;
  errorRate: number;
  throughput: number;
  utilization: number;
  backlog: number;
}

export interface TaskScheduler {
  id: string;
  name: string;
  type: SchedulerType;
  policies: SchedulingPolicy[];
  algorithms: SchedulingAlgorithm[];
  constraints: SchedulingConstraint[];
  status: SchedulerStatus;
  metrics: SchedulerMetrics;
}

export type SchedulerType = 
  | 'fifo'
  | 'priority'
  | 'round_robin'
  | 'least_loaded'
  | 'shortest_job_first'
  | 'earliest_deadline_first'
  | 'fair_share'
  | 'capacity_aware'
  | 'energy_aware'
  | 'custom';

export interface SchedulingPolicy {
  id: string;
  name: string;
  type: string;
  rules: SchedulingRule[];
  priority: number;
  enabled: boolean;
}

export interface SchedulingRule {
  condition: string;
  action: string;
  parameters: Record<string, any>;
  priority: number;
}

export interface SchedulingAlgorithm {
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
  performance: AlgorithmPerformance;
}

export interface AlgorithmPerformance {
  efficiency: number;
  fairness: number;
  throughput: number;
  latency: number;
  resourceUtilization: number;
}

export interface SchedulingConstraint {
  type: 'resource' | 'time' | 'dependency' | 'affinity' | 'anti_affinity' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  enforcement: 'strict' | 'flexible' | 'advisory';
}

export type SchedulerStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface SchedulerMetrics {
  totalScheduled: number;
  successfulSchedules: number;
  failedSchedules: number;
  averageSchedulingTime: number;
  algorithmUsage: Record<string, number>;
  constraintViolations: number;
  performance: SchedulerPerformance;
}

export interface SchedulerPerformance {
  efficiency: number;
  fairness: number;
  throughput: number;
  latency: number;
  resourceUtilization: number;
  loadBalancing: number;
}

export interface TaskExecutor {
  id: string;
  name: string;
  type: ExecutorType;
  workers: TaskWorker[];
  config: ExecutorConfig;
  status: ExecutorStatus;
  metrics: ExecutorMetrics;
}

export type ExecutorType = 
  | 'thread_pool'
  | 'process_pool'
  | 'async'
  | 'distributed'
  | 'container'
  | 'serverless'
  | 'custom';

export interface TaskWorker {
  id: string;
  name: string;
  type: string;
  status: WorkerStatus;
  currentTask?: string;
  metrics: WorkerMetrics;
  health: WorkerHealth;
}

export type WorkerStatus = 'idle' | 'busy' | 'error' | 'maintenance' | 'offline';

export interface WorkerMetrics {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  currentLoad: number;
  uptime: number;
}

export interface WorkerHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  checks: HealthCheck[];
  lastCheck: string;
}

export interface ExecutorConfig {
  maxWorkers: number;
  maxConcurrentTasks: number;
  workerTimeout: number;
  taskTimeout: number;
  retryAttempts: number;
  loadBalancing: boolean;
  failover: boolean;
  monitoring: boolean;
}

export type ExecutorStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface ExecutorMetrics {
  totalExecuted: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  workerUtilization: number;
  queueSize: number;
  throughput: number;
  errorRate: number;
}

export interface TaskMonitor {
  id: string;
  name: string;
  tasks: string[];
  metrics: MonitorMetrics;
  alerts: MonitorAlert[];
  status: MonitorStatus;
}

export interface MonitorMetrics {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
}

export interface MonitorAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export type MonitorStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export type TaskManagerStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface TaskManagerMetrics {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  queueMetrics: QueueMetrics;
  schedulerMetrics: SchedulerMetrics;
  executorMetrics: ExecutorMetrics;
  monitorMetrics: MonitorMetrics;
}