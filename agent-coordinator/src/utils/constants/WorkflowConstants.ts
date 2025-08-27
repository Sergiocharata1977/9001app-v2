// Constantes para el sistema de flujos de trabajo
export const WORKFLOW_CONSTANTS = {
  // Tipos de flujos de trabajo
  WORKFLOW_TYPES: {
    MIGRATION: 'migration',
    TESTING: 'testing',
    DEPLOYMENT: 'deployment',
    MONITORING: 'monitoring',
    RECOVERY: 'recovery',
    MAINTENANCE: 'maintenance',
    BACKUP: 'backup',
    RESTORE: 'restore',
    VALIDATION: 'validation',
    OPTIMIZATION: 'optimization',
    SECURITY_AUDIT: 'security_audit',
    PERFORMANCE_TEST: 'performance_test',
    LOAD_TEST: 'load_test',
    STRESS_TEST: 'stress_test',
    INTEGRATION_TEST: 'integration_test',
    UNIT_TEST: 'unit_test',
    E2E_TEST: 'e2e_test',
    DATA_MIGRATION: 'data_migration',
    SCHEMA_MIGRATION: 'schema_migration',
    API_MIGRATION: 'api_migration',
    FRONTEND_MIGRATION: 'frontend_migration',
    BACKEND_MIGRATION: 'backend_migration',
    DATABASE_MIGRATION: 'database_migration',
    INFRASTRUCTURE_MIGRATION: 'infrastructure_migration',
    SECURITY_MIGRATION: 'security_migration',
    MONITORING_SETUP: 'monitoring_setup',
    CI_CD_SETUP: 'ci_cd_setup',
    DOCUMENTATION_GENERATION: 'documentation_generation',
    CODE_REVIEW: 'code_review',
    QUALITY_ASSURANCE: 'quality_assurance'
  },

  // Estados de flujos de trabajo
  WORKFLOW_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    ROLLED_BACK: 'rolled_back',
    VALIDATING: 'validating',
    PREPARING: 'preparing',
    EXECUTING: 'executing',
    FINALIZING: 'finalizing',
    CLEANING_UP: 'cleaning_up'
  },

  // Tipos de tareas
  TASK_TYPES: {
    EXECUTION: 'execution',
    VALIDATION: 'validation',
    MONITORING: 'monitoring',
    COMMUNICATION: 'communication',
    COORDINATION: 'coordination',
    RECOVERY: 'recovery',
    MAINTENANCE: 'maintenance',
    BACKUP: 'backup',
    RESTORE: 'restore',
    MIGRATION: 'migration',
    TESTING: 'testing',
    DEPLOYMENT: 'deployment',
    VERIFICATION: 'verification',
    CLEANUP: 'cleanup',
    SETUP: 'setup',
    TEARDOWN: 'teardown',
    CHECKPOINT: 'checkpoint',
    ROLLBACK: 'rollback',
    NOTIFICATION: 'notification',
    LOGGING: 'logging',
    AUDITING: 'auditing',
    SECURITY_CHECK: 'security_check',
    PERFORMANCE_CHECK: 'performance_check',
    HEALTH_CHECK: 'health_check',
    RESOURCE_CHECK: 'resource_check',
    DEPENDENCY_CHECK: 'dependency_check',
    PRECONDITION_CHECK: 'precondition_check',
    POSTCONDITION_CHECK: 'postcondition_check'
  },

  // Estados de tareas
  TASK_STATUS: {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    RETRYING: 'retrying',
    PAUSED: 'paused',
    VALIDATING: 'validating',
    PREPARING: 'preparing',
    EXECUTING: 'executing',
    FINALIZING: 'finalizing',
    CLEANING_UP: 'cleaning_up',
    ROLLED_BACK: 'rolled_back',
    SKIPPED: 'skipped',
    TIMEOUT: 'timeout',
    BLOCKED: 'blocked'
  },

  // Prioridades de tareas
  TASK_PRIORITY: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    BACKGROUND: 'background'
  },

  // Estrategias de reintento
  RETRY_STRATEGIES: {
    LINEAR: 'linear',
    EXPONENTIAL: 'exponential',
    FIXED: 'fixed'
  },

  // Estrategias de rollback
  ROLLBACK_STRATEGIES: {
    FULL: 'full',
    PARTIAL: 'partial',
    SELECTIVE: 'selective'
  },

  // Estrategias de ejecución
  EXECUTION_STRATEGIES: {
    SEQUENTIAL: 'sequential',
    PARALLEL: 'parallel',
    CONDITIONAL: 'conditional',
    LOOP: 'loop',
    FORK_JOIN: 'fork_join',
    PIPELINE: 'pipeline'
  },

  // Tipos de validación
  VALIDATION_TYPES: {
    SCHEMA: 'schema',
    CUSTOM: 'custom',
    REGEX: 'regex',
    RANGE: 'range',
    REQUIRED: 'required'
  },

  // Tipos de monitoreo
  MONITORING_TYPES: {
    PERFORMANCE: 'performance',
    RESOURCE: 'resource',
    HEALTH: 'health',
    SECURITY: 'security',
    BUSINESS: 'business'
  },

  // Configuración por defecto
  DEFAULT_CONFIG: {
    TIMEOUT: 3600000, // 1 hora
    MAX_CONCURRENT_TASKS: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000, // 5 segundos
    MAX_BACKOFF_DELAY: 60000, // 1 minuto
    CHECKPOINT_INTERVAL: 300000, // 5 minutos
    VALIDATION_TIMEOUT: 30000, // 30 segundos
    MONITORING_INTERVAL: 30000, // 30 segundos
    ROLLBACK_TIMEOUT: 300000, // 5 minutos
    CLEANUP_TIMEOUT: 60000, // 1 minuto
    NOTIFICATION_ENABLED: true,
    LOGGING_ENABLED: true,
    AUDITING_ENABLED: true,
    SECURITY_ENABLED: true,
    PERFORMANCE_ENABLED: true
  },

  // Límites del sistema
  SYSTEM_LIMITS: {
    MAX_WORKFLOW_DURATION: 86400000, // 24 horas
    MAX_TASKS_PER_WORKFLOW: 1000,
    MAX_CONCURRENT_WORKFLOWS: 100,
    MAX_RETRY_ATTEMPTS: 5,
    MAX_CHECKPOINTS: 100,
    MAX_ROLLBACK_ATTEMPTS: 3,
    MAX_VALIDATION_RULES: 100,
    MAX_MONITORING_METRICS: 50,
    MAX_NOTIFICATION_RECIPIENTS: 100,
    MAX_LOG_ENTRIES: 10000
  },

  // Timeouts
  TIMEOUTS: {
    WORKFLOW_EXECUTION: 3600000, // 1 hora
    TASK_EXECUTION: 300000, // 5 minutos
    VALIDATION: 30000, // 30 segundos
    MONITORING: 30000, // 30 segundos
    ROLLBACK: 300000, // 5 minutos
    CLEANUP: 60000, // 1 minuto
    NOTIFICATION: 10000, // 10 segundos
    LOGGING: 5000, // 5 segundos
    AUDITING: 10000, // 10 segundos
    SECURITY_CHECK: 15000, // 15 segundos
    PERFORMANCE_CHECK: 20000, // 20 segundos
    HEALTH_CHECK: 10000, // 10 segundos
    RESOURCE_CHECK: 15000, // 15 segundos
    DEPENDENCY_CHECK: 10000, // 10 segundos
    PRECONDITION_CHECK: 10000, // 10 segundos
    POSTCONDITION_CHECK: 10000 // 10 segundos
  },

  // Intervalos
  INTERVALS: {
    CHECKPOINT: 300000, // 5 minutos
    MONITORING: 30000, // 30 segundos
    HEALTH_CHECK: 60000, // 1 minuto
    PERFORMANCE_MONITORING: 60000, // 1 minuto
    SECURITY_AUDIT: 3600000, // 1 hora
    RESOURCE_MONITORING: 30000, // 30 segundos
    LOG_ROTATION: 86400000, // 24 horas
    METRICS_COLLECTION: 30000, // 30 segundos
    ALERT_CHECK: 60000, // 1 minuto
    CLEANUP: 3600000 // 1 hora
  },

  // Códigos de error
  ERROR_CODES: {
    WORKFLOW_NOT_FOUND: 'WORKFLOW_NOT_FOUND',
    WORKFLOW_ALREADY_EXISTS: 'WORKFLOW_ALREADY_EXISTS',
    WORKFLOW_EXECUTION_FAILED: 'WORKFLOW_EXECUTION_FAILED',
    WORKFLOW_TIMEOUT: 'WORKFLOW_TIMEOUT',
    WORKFLOW_VALIDATION_FAILED: 'WORKFLOW_VALIDATION_FAILED',
    WORKFLOW_ROLLBACK_FAILED: 'WORKFLOW_ROLLBACK_FAILED',
    TASK_NOT_FOUND: 'TASK_NOT_FOUND',
    TASK_EXECUTION_FAILED: 'TASK_EXECUTION_FAILED',
    TASK_TIMEOUT: 'TASK_TIMEOUT',
    TASK_DEPENDENCY_FAILED: 'TASK_DEPENDENCY_FAILED',
    TASK_VALIDATION_FAILED: 'TASK_VALIDATION_FAILED',
    TASK_ROLLBACK_FAILED: 'TASK_ROLLBACK_FAILED',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    MONITORING_FAILED: 'MONITORING_FAILED',
    ROLLBACK_FAILED: 'ROLLBACK_FAILED',
    CLEANUP_FAILED: 'CLEANUP_FAILED',
    NOTIFICATION_FAILED: 'NOTIFICATION_FAILED',
    LOGGING_FAILED: 'LOGGING_FAILED',
    AUDITING_FAILED: 'AUDITING_FAILED',
    SECURITY_CHECK_FAILED: 'SECURITY_CHECK_FAILED',
    PERFORMANCE_CHECK_FAILED: 'PERFORMANCE_CHECK_FAILED',
    HEALTH_CHECK_FAILED: 'HEALTH_CHECK_FAILED',
    RESOURCE_CHECK_FAILED: 'RESOURCE_CHECK_FAILED',
    DEPENDENCY_CHECK_FAILED: 'DEPENDENCY_CHECK_FAILED',
    PRECONDITION_CHECK_FAILED: 'PRECONDITION_CHECK_FAILED',
    POSTCONDITION_CHECK_FAILED: 'POSTCONDITION_CHECK_FAILED',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
    PERMISSION_DENIED: 'PERMISSION_DENIED'
  },

  // Eventos del sistema
  EVENTS: {
    WORKFLOW_STARTED: 'workflow_started',
    WORKFLOW_COMPLETED: 'workflow_completed',
    WORKFLOW_FAILED: 'workflow_failed',
    WORKFLOW_PAUSED: 'workflow_paused',
    WORKFLOW_CANCELLED: 'workflow_cancelled',
    WORKFLOW_ROLLED_BACK: 'workflow_rolled_back',
    WORKFLOW_VALIDATED: 'workflow_validated',
    WORKFLOW_MONITORED: 'workflow_monitored',
    TASK_STARTED: 'task_started',
    TASK_COMPLETED: 'task_completed',
    TASK_FAILED: 'task_failed',
    TASK_TIMEOUT: 'task_timeout',
    TASK_RETRYING: 'task_retrying',
    TASK_ROLLED_BACK: 'task_rolled_back',
    TASK_VALIDATED: 'task_validated',
    TASK_MONITORED: 'task_monitored',
    CHECKPOINT_CREATED: 'checkpoint_created',
    CHECKPOINT_RESTORED: 'checkpoint_restored',
    VALIDATION_STARTED: 'validation_started',
    VALIDATION_COMPLETED: 'validation_completed',
    VALIDATION_FAILED: 'validation_failed',
    MONITORING_STARTED: 'monitoring_started',
    MONITORING_COMPLETED: 'monitoring_completed',
    MONITORING_FAILED: 'monitoring_failed',
    ROLLBACK_STARTED: 'rollback_started',
    ROLLBACK_COMPLETED: 'rollback_completed',
    ROLLBACK_FAILED: 'rollback_failed',
    CLEANUP_STARTED: 'cleanup_started',
    CLEANUP_COMPLETED: 'cleanup_completed',
    CLEANUP_FAILED: 'cleanup_failed',
    NOTIFICATION_SENT: 'notification_sent',
    NOTIFICATION_FAILED: 'notification_failed',
    LOG_ENTRY_CREATED: 'log_entry_created',
    LOG_ENTRY_FAILED: 'log_entry_failed',
    AUDIT_ENTRY_CREATED: 'audit_entry_created',
    AUDIT_ENTRY_FAILED: 'audit_entry_failed',
    SECURITY_CHECK_STARTED: 'security_check_started',
    SECURITY_CHECK_COMPLETED: 'security_check_completed',
    SECURITY_CHECK_FAILED: 'security_check_failed',
    PERFORMANCE_CHECK_STARTED: 'performance_check_started',
    PERFORMANCE_CHECK_COMPLETED: 'performance_check_completed',
    PERFORMANCE_CHECK_FAILED: 'performance_check_failed',
    HEALTH_CHECK_STARTED: 'health_check_started',
    HEALTH_CHECK_COMPLETED: 'health_check_completed',
    HEALTH_CHECK_FAILED: 'health_check_failed',
    RESOURCE_CHECK_STARTED: 'resource_check_started',
    RESOURCE_CHECK_COMPLETED: 'resource_check_completed',
    RESOURCE_CHECK_FAILED: 'resource_check_failed',
    DEPENDENCY_CHECK_STARTED: 'dependency_check_started',
    DEPENDENCY_CHECK_COMPLETED: 'dependency_check_completed',
    DEPENDENCY_CHECK_FAILED: 'dependency_check_failed',
    PRECONDITION_CHECK_STARTED: 'precondition_check_started',
    PRECONDITION_CHECK_COMPLETED: 'precondition_check_completed',
    PRECONDITION_CHECK_FAILED: 'precondition_check_failed',
    POSTCONDITION_CHECK_STARTED: 'postcondition_check_started',
    POSTCONDITION_CHECK_COMPLETED: 'postcondition_check_completed',
    POSTCONDITION_CHECK_FAILED: 'postcondition_check_failed'
  },

  // Configuración de validación
  VALIDATION: {
    RULES: {
      REQUIRED: 'required',
      TYPE: 'type',
      FORMAT: 'format',
      PATTERN: 'pattern',
      MIN_LENGTH: 'minLength',
      MAX_LENGTH: 'maxLength',
      MIN_VALUE: 'minimum',
      MAX_VALUE: 'maximum',
      ENUM: 'enum',
      CUSTOM: 'custom'
    },
    SEVERITY: {
      INFO: 'info',
      WARNING: 'warning',
      ERROR: 'error',
      CRITICAL: 'critical'
    },
    ACTIONS: {
      CONTINUE: 'continue',
      SKIP: 'skip',
      FAIL: 'fail',
      RETRY: 'retry'
    }
  },

  // Configuración de monitoreo
  MONITORING: {
    METRICS: {
      EXECUTION_TIME: 'execution_time',
      SUCCESS_RATE: 'success_rate',
      ERROR_RATE: 'error_rate',
      THROUGHPUT: 'throughput',
      LATENCY: 'latency',
      RESOURCE_USAGE: 'resource_usage',
      PERFORMANCE_SCORE: 'performance_score',
      HEALTH_SCORE: 'health_score',
      SECURITY_SCORE: 'security_score',
      QUALITY_SCORE: 'quality_score'
    },
    THRESHOLDS: {
      EXECUTION_TIME_WARNING: 300000, // 5 minutos
      EXECUTION_TIME_CRITICAL: 900000, // 15 minutos
      SUCCESS_RATE_WARNING: 0.9, // 90%
      SUCCESS_RATE_CRITICAL: 0.8, // 80%
      ERROR_RATE_WARNING: 0.1, // 10%
      ERROR_RATE_CRITICAL: 0.2, // 20%
      THROUGHPUT_WARNING: 100, // 100 tareas/minuto
      THROUGHPUT_CRITICAL: 50, // 50 tareas/minuto
      LATENCY_WARNING: 30000, // 30 segundos
      LATENCY_CRITICAL: 60000, // 1 minuto
      RESOURCE_USAGE_WARNING: 0.8, // 80%
      RESOURCE_USAGE_CRITICAL: 0.9, // 90%
      PERFORMANCE_SCORE_WARNING: 0.8, // 80%
      PERFORMANCE_SCORE_CRITICAL: 0.7, // 70%
      HEALTH_SCORE_WARNING: 0.8, // 80%
      HEALTH_SCORE_CRITICAL: 0.7, // 70%
      SECURITY_SCORE_WARNING: 0.8, // 80%
      SECURITY_SCORE_CRITICAL: 0.7, // 70%
      QUALITY_SCORE_WARNING: 0.8, // 80%
      QUALITY_SCORE_CRITICAL: 0.7 // 70%
    }
  },

  // Configuración de notificaciones
  NOTIFICATIONS: {
    TYPES: {
      EMAIL: 'email',
      SMS: 'sms',
      PUSH: 'push',
      WEBHOOK: 'webhook',
      SLACK: 'slack',
      TEAMS: 'teams',
      DISCORD: 'discord',
      CUSTOM: 'custom'
    },
    PRIORITIES: {
      LOW: 'low',
      NORMAL: 'normal',
      HIGH: 'high',
      URGENT: 'urgent',
      CRITICAL: 'critical'
    },
    TRIGGERS: {
      WORKFLOW_STARTED: 'workflow_started',
      WORKFLOW_COMPLETED: 'workflow_completed',
      WORKFLOW_FAILED: 'workflow_failed',
      TASK_STARTED: 'task_started',
      TASK_COMPLETED: 'task_completed',
      TASK_FAILED: 'task_failed',
      VALIDATION_FAILED: 'validation_failed',
      MONITORING_ALERT: 'monitoring_alert',
      SECURITY_ALERT: 'security_alert',
      PERFORMANCE_ALERT: 'performance_alert',
      HEALTH_ALERT: 'health_alert',
      RESOURCE_ALERT: 'resource_alert'
    }
  },

  // Configuración de logging
  LOGGING: {
    LEVELS: {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error'
    },
    FORMATS: {
      JSON: 'json',
      TEXT: 'text',
      STRUCTURED: 'structured'
    },
    DESTINATIONS: {
      CONSOLE: 'console',
      FILE: 'file',
      DATABASE: 'database',
      REMOTE: 'remote'
    },
    CATEGORIES: {
      WORKFLOW: 'workflow',
      TASK: 'task',
      VALIDATION: 'validation',
      MONITORING: 'monitoring',
      ROLLBACK: 'rollback',
      CLEANUP: 'cleanup',
      NOTIFICATION: 'notification',
      SECURITY: 'security',
      PERFORMANCE: 'performance',
      HEALTH: 'health',
      RESOURCE: 'resource',
      ERROR: 'error'
    }
  },

  // Configuración de auditoría
  AUDITING: {
    EVENTS: {
      WORKFLOW_CREATED: 'workflow_created',
      WORKFLOW_MODIFIED: 'workflow_modified',
      WORKFLOW_DELETED: 'workflow_deleted',
      WORKFLOW_EXECUTED: 'workflow_executed',
      TASK_CREATED: 'task_created',
      TASK_MODIFIED: 'task_modified',
      TASK_DELETED: 'task_deleted',
      TASK_EXECUTED: 'task_executed',
      VALIDATION_PERFORMED: 'validation_performed',
      MONITORING_PERFORMED: 'monitoring_performed',
      ROLLBACK_PERFORMED: 'rollback_performed',
      CLEANUP_PERFORMED: 'cleanup_performed',
      NOTIFICATION_SENT: 'notification_sent',
      SECURITY_CHECK_PERFORMED: 'security_check_performed',
      PERFORMANCE_CHECK_PERFORMED: 'performance_check_performed',
      HEALTH_CHECK_PERFORMED: 'health_check_performed',
      RESOURCE_CHECK_PERFORMED: 'resource_check_performed',
      CONFIGURATION_CHANGED: 'configuration_changed',
      PERMISSION_GRANTED: 'permission_granted',
      PERMISSION_DENIED: 'permission_denied'
    },
    LEVELS: {
      BASIC: 'basic',
      STANDARD: 'standard',
      DETAILED: 'detailed',
      COMPREHENSIVE: 'comprehensive'
    }
  },

  // Configuración de seguridad
  SECURITY: {
    CHECKS: {
      AUTHENTICATION: 'authentication',
      AUTHORIZATION: 'authorization',
      ENCRYPTION: 'encryption',
      INTEGRITY: 'integrity',
      AVAILABILITY: 'availability',
      CONFIDENTIALITY: 'confidentiality',
      NON_REPUDIATION: 'non_repudiation',
      ACCESS_CONTROL: 'access_control',
      AUDIT_TRAIL: 'audit_trail',
      VULNERABILITY_SCAN: 'vulnerability_scan',
      PENETRATION_TEST: 'penetration_test',
      SECURITY_ASSESSMENT: 'security_assessment'
    },
    LEVELS: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    }
  },

  // Configuración de rendimiento
  PERFORMANCE: {
    CHECKS: {
      RESPONSE_TIME: 'response_time',
      THROUGHPUT: 'throughput',
      LATENCY: 'latency',
      BANDWIDTH: 'bandwidth',
      CPU_USAGE: 'cpu_usage',
      MEMORY_USAGE: 'memory_usage',
      DISK_USAGE: 'disk_usage',
      NETWORK_USAGE: 'network_usage',
      CONCURRENCY: 'concurrency',
      EFFICIENCY: 'efficiency',
      SCALABILITY: 'scalability',
      RELIABILITY: 'reliability',
      AVAILABILITY: 'availability'
    },
    METRICS: {
      AVERAGE: 'average',
      MEDIAN: 'median',
      PERCENTILE_95: 'percentile_95',
      PERCENTILE_99: 'percentile_99',
      MINIMUM: 'minimum',
      MAXIMUM: 'maximum',
      STANDARD_DEVIATION: 'standard_deviation',
      VARIANCE: 'variance'
    }
  },

  // Configuración de salud
  HEALTH: {
    CHECKS: {
      LIVENESS: 'liveness',
      READINESS: 'readiness',
      STARTUP: 'startup',
      SHUTDOWN: 'shutdown',
      CONNECTIVITY: 'connectivity',
      DEPENDENCIES: 'dependencies',
      RESOURCES: 'resources',
      PERFORMANCE: 'performance',
      SECURITY: 'security',
      BUSINESS_LOGIC: 'business_logic'
    },
    STATUS: {
      HEALTHY: 'healthy',
      DEGRADED: 'degraded',
      UNHEALTHY: 'unhealthy',
      UNKNOWN: 'unknown'
    }
  },

  // Configuración de recursos
  RESOURCES: {
    TYPES: {
      CPU: 'cpu',
      MEMORY: 'memory',
      DISK: 'disk',
      NETWORK: 'network',
      DATABASE: 'database',
      CACHE: 'cache',
      QUEUE: 'queue',
      STORAGE: 'storage',
      BANDWIDTH: 'bandwidth',
      CONNECTIONS: 'connections'
    },
    METRICS: {
      USAGE: 'usage',
      UTILIZATION: 'utilization',
      AVAILABILITY: 'availability',
      CAPACITY: 'capacity',
      THROUGHPUT: 'throughput',
      LATENCY: 'latency',
      ERROR_RATE: 'error_rate',
      SUCCESS_RATE: 'success_rate'
    }
  }
} as const;

// Exportar tipos derivados de las constantes
export type WorkflowType = typeof WORKFLOW_CONSTANTS.WORKFLOW_TYPES[keyof typeof WORKFLOW_CONSTANTS.WORKFLOW_TYPES];
export type WorkflowStatus = typeof WORKFLOW_CONSTANTS.WORKFLOW_STATUS[keyof typeof WORKFLOW_CONSTANTS.WORKFLOW_STATUS];
export type TaskType = typeof WORKFLOW_CONSTANTS.TASK_TYPES[keyof typeof WORKFLOW_CONSTANTS.TASK_TYPES];
export type TaskStatus = typeof WORKFLOW_CONSTANTS.TASK_STATUS[keyof typeof WORKFLOW_CONSTANTS.TASK_STATUS];
export type TaskPriority = typeof WORKFLOW_CONSTANTS.TASK_PRIORITY[keyof typeof WORKFLOW_CONSTANTS.TASK_PRIORITY];
export type RetryStrategy = typeof WORKFLOW_CONSTANTS.RETRY_STRATEGIES[keyof typeof WORKFLOW_CONSTANTS.RETRY_STRATEGIES];
export type RollbackStrategy = typeof WORKFLOW_CONSTANTS.ROLLBACK_STRATEGIES[keyof typeof WORKFLOW_CONSTANTS.ROLLBACK_STRATEGIES];
export type ExecutionStrategy = typeof WORKFLOW_CONSTANTS.EXECUTION_STRATEGIES[keyof typeof WORKFLOW_CONSTANTS.EXECUTION_STRATEGIES];
export type ValidationType = typeof WORKFLOW_CONSTANTS.VALIDATION_TYPES[keyof typeof WORKFLOW_CONSTANTS.VALIDATION_TYPES];
export type MonitoringType = typeof WORKFLOW_CONSTANTS.MONITORING_TYPES[keyof typeof WORKFLOW_CONSTANTS.MONITORING_TYPES];
export type ValidationRule = typeof WORKFLOW_CONSTANTS.VALIDATION.RULES[keyof typeof WORKFLOW_CONSTANTS.VALIDATION.RULES];
export type ValidationSeverity = typeof WORKFLOW_CONSTANTS.VALIDATION.SEVERITY[keyof typeof WORKFLOW_CONSTANTS.VALIDATION.SEVERITY];
export type ValidationAction = typeof WORKFLOW_CONSTANTS.VALIDATION.ACTIONS[keyof typeof WORKFLOW_CONSTANTS.VALIDATION.ACTIONS];
export type NotificationType = typeof WORKFLOW_CONSTANTS.NOTIFICATIONS.TYPES[keyof typeof WORKFLOW_CONSTANTS.NOTIFICATIONS.TYPES];
export type NotificationPriority = typeof WORKFLOW_CONSTANTS.NOTIFICATIONS.PRIORITIES[keyof typeof WORKFLOW_CONSTANTS.NOTIFICATIONS.PRIORITIES];
export type NotificationTrigger = typeof WORKFLOW_CONSTANTS.NOTIFICATIONS.TRIGGERS[keyof typeof WORKFLOW_CONSTANTS.NOTIFICATIONS.TRIGGERS];
export type LogLevel = typeof WORKFLOW_CONSTANTS.LOGGING.LEVELS[keyof typeof WORKFLOW_CONSTANTS.LOGGING.LEVELS];
export type LogFormat = typeof WORKFLOW_CONSTANTS.LOGGING.FORMATS[keyof typeof WORKFLOW_CONSTANTS.LOGGING.FORMATS];
export type LogDestination = typeof WORKFLOW_CONSTANTS.LOGGING.DESTINATIONS[keyof typeof WORKFLOW_CONSTANTS.LOGGING.DESTINATIONS];
export type LogCategory = typeof WORKFLOW_CONSTANTS.LOGGING.CATEGORIES[keyof typeof WORKFLOW_CONSTANTS.LOGGING.CATEGORIES];
export type AuditEvent = typeof WORKFLOW_CONSTANTS.AUDITING.EVENTS[keyof typeof WORKFLOW_CONSTANTS.AUDITING.EVENTS];
export type AuditLevel = typeof WORKFLOW_CONSTANTS.AUDITING.LEVELS[keyof typeof WORKFLOW_CONSTANTS.AUDITING.LEVELS];
export type SecurityCheck = typeof WORKFLOW_CONSTANTS.SECURITY.CHECKS[keyof typeof WORKFLOW_CONSTANTS.SECURITY.CHECKS];
export type SecurityLevel = typeof WORKFLOW_CONSTANTS.SECURITY.LEVELS[keyof typeof WORKFLOW_CONSTANTS.SECURITY.LEVELS];
export type PerformanceCheck = typeof WORKFLOW_CONSTANTS.PERFORMANCE.CHECKS[keyof typeof WORKFLOW_CONSTANTS.PERFORMANCE.CHECKS];
export type PerformanceMetric = typeof WORKFLOW_CONSTANTS.PERFORMANCE.METRICS[keyof typeof WORKFLOW_CONSTANTS.PERFORMANCE.METRICS];
export type HealthCheck = typeof WORKFLOW_CONSTANTS.HEALTH.CHECKS[keyof typeof WORKFLOW_CONSTANTS.HEALTH.CHECKS];
export type HealthStatus = typeof WORKFLOW_CONSTANTS.HEALTH.STATUS[keyof typeof WORKFLOW_CONSTANTS.HEALTH.STATUS];
export type ResourceType = typeof WORKFLOW_CONSTANTS.RESOURCES.TYPES[keyof typeof WORKFLOW_CONSTANTS.RESOURCES.TYPES];
export type ResourceMetric = typeof WORKFLOW_CONSTANTS.RESOURCES.METRICS[keyof typeof WORKFLOW_CONSTANTS.RESOURCES.METRICS];