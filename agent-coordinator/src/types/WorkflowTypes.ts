// Tipos para flujos de trabajo avanzados
export interface IWorkflow {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  level: AgentLevel;
  version: string;
  tasks: ITask[];
  dependencies: Record<string, string[]>;
  parallelExecution: boolean;
  maxConcurrentTasks: number;
  timeout: number;
  retryPolicy: IRetryPolicy;
  rollbackPolicy: IRollbackPolicy;
  validationPolicy: IValidationPolicy;
  monitoringPolicy: IMonitoringPolicy;
  status: WorkflowStatus;
  metadata: WorkflowMetadata;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
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
  | 'optimization'
  | 'security_audit'
  | 'performance_test'
  | 'load_test'
  | 'stress_test'
  | 'integration_test'
  | 'unit_test'
  | 'e2e_test'
  | 'data_migration'
  | 'schema_migration'
  | 'api_migration'
  | 'frontend_migration'
  | 'backend_migration'
  | 'database_migration'
  | 'infrastructure_migration'
  | 'security_migration'
  | 'monitoring_setup'
  | 'ci_cd_setup'
  | 'documentation_generation'
  | 'code_review'
  | 'quality_assurance';

export type WorkflowStatus = 
  | 'draft'
  | 'active'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled'
  | 'rolled_back'
  | 'validating'
  | 'preparing'
  | 'executing'
  | 'finalizing'
  | 'cleaning_up';

export interface WorkflowMetadata {
  author: string;
  tags: string[];
  category: string;
  complexity: 'simple' | 'medium' | 'complex' | 'very_complex';
  estimatedDuration: number;
  requiredResources: string[];
  prerequisites: string[];
  postConditions: string[];
  documentation: string;
  examples: string[];
  troubleshooting: string[];
}

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

export interface IRetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  backoffDelay: number;
  retryOnErrors: string[];
  maxBackoffDelay: number;
  jitter: boolean;
  retryCondition: string;
  onRetryExhausted: 'fail' | 'skip' | 'rollback';
}

export interface IRollbackPolicy {
  enabled: boolean;
  triggerConditions: string[];
  rollbackSteps: string[];
  maxRollbackAttempts: number;
  rollbackTimeout: number;
  partialRollback: boolean;
  rollbackStrategy: 'full' | 'partial' | 'selective';
  checkpointInterval: number;
  onRollbackFailure: 'continue' | 'fail' | 'manual';
}

export interface IValidationPolicy {
  enabled: boolean;
  preExecution: ValidationRule[];
  postExecution: ValidationRule[];
  continuous: ValidationRule[];
  schemaValidation: boolean;
  customValidators: string[];
  onValidationFailure: 'fail' | 'warn' | 'continue';
  validationTimeout: number;
}

export interface IMonitoringPolicy {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  logging: LoggingConfig;
  tracing: TracingConfig;
  healthChecks: HealthCheckConfig[];
  performanceMonitoring: PerformanceMonitoringConfig;
  resourceMonitoring: ResourceMonitoringConfig;
}

export interface HealthCheckConfig {
  name: string;
  type: 'http' | 'tcp' | 'command' | 'script' | 'custom';
  config: Record<string, any>;
  interval: number;
  timeout: number;
  retries: number;
  onFailure: 'alert' | 'fail' | 'retry';
}

export interface PerformanceMonitoringConfig {
  enabled: boolean;
  metrics: string[];
  thresholds: Record<string, number>;
  sampling: number;
  retention: number;
  alerts: AlertConfig[];
}

export interface ResourceMonitoringConfig {
  enabled: boolean;
  resources: string[];
  thresholds: Record<string, number>;
  interval: number;
  retention: number;
  alerts: AlertConfig[];
}

// Tipos para plantillas de flujos de trabajo
export interface IWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  category: string;
  version: string;
  template: ITask[];
  parameters: TemplateParameter[];
  variables: TemplateVariable[];
  conditions: TemplateCondition[];
  outputs: TemplateOutput[];
  metadata: TemplateMetadata;
  examples: TemplateExample[];
  documentation: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
  description: string;
  validation?: string;
  options?: any[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  value: any;
  description: string;
  scope: 'global' | 'workflow' | 'task';
}

export interface TemplateCondition {
  name: string;
  expression: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: 'continue' | 'skip' | 'fail';
}

export interface TemplateOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  source: string;
  format?: string;
}

export interface TemplateMetadata {
  author: string;
  tags: string[];
  complexity: 'simple' | 'medium' | 'complex' | 'very_complex';
  estimatedDuration: number;
  requiredResources: string[];
  prerequisites: string[];
  postConditions: string[];
  compatibility: string[];
  version: string;
}

export interface TemplateExample {
  name: string;
  description: string;
  parameters: Record<string, any>;
  expectedOutput: any;
  notes: string;
}

// Tipos para ejecución de flujos de trabajo
export interface IWorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  tasks: TaskExecution[];
  dependencies: Record<string, string[]>;
  parallelExecution: boolean;
  maxConcurrentTasks: number;
  timeout: number;
  retryPolicy: IRetryPolicy;
  rollbackPolicy: IRollbackPolicy;
  validationPolicy: IValidationPolicy;
  monitoringPolicy: IMonitoringPolicy;
  metadata: ExecutionMetadata;
  metrics: ExecutionMetrics;
  logs: ExecutionLog[];
  events: ExecutionEvent[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: ExecutionError;
}

export type ExecutionStatus = 
  | 'preparing'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused'
  | 'rolled_back'
  | 'validating'
  | 'finalizing'
  | 'cleaning_up';

export interface TaskExecution {
  id: string;
  taskId: string;
  workflowExecutionId: string;
  status: TaskStatus;
  assignedAgentId?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  result?: TaskResult;
  error?: TaskError;
  retries: number;
  progress: number;
  dependencies: string[];
  metadata: TaskMetadata;
  validation: TaskValidation;
  monitoring: TaskMonitoring;
}

export interface ExecutionMetadata {
  triggeredBy: string;
  triggerType: 'manual' | 'scheduled' | 'event' | 'api';
  triggerData: any;
  environment: string;
  version: string;
  tags: string[];
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
}

export interface ExecutionMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  pendingTasks: number;
  averageTaskDuration: number;
  totalDuration: number;
  resourceUsage: ResourceUsage;
  throughput: number;
  errorRate: number;
  successRate: number;
}

export interface ExecutionLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, any>;
  source: string;
  taskId?: string;
}

export interface ExecutionEvent {
  id: string;
  type: string;
  timestamp: string;
  data: any;
  source: string;
  taskId?: string;
  correlationId?: string;
}

export interface ExecutionError {
  code: string;
  message: string;
  details: any;
  stack?: string;
  context: Record<string, any>;
  timestamp: string;
  taskId?: string;
  recoverable: boolean;
}