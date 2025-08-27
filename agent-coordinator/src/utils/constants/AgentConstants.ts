// Constantes para el sistema de agentes
export const AGENT_CONSTANTS = {
  // Tipos de agentes
  AGENT_TYPES: {
    SUPER_COORDINATOR: 'super_coordinator',
    AREA_COORDINATOR: 'area_coordinator',
    SPECIALIZED_AGENT: 'specialized_agent',
    SECURITY: 'security',
    STRUCTURE: 'structure',
    TYPESCRIPT: 'typescript',
    API: 'api',
    DATABASE: 'database',
    FRONTEND: 'frontend',
    BACKEND: 'backend',
    TESTING: 'testing',
    DEPLOYMENT: 'deployment',
    MONITORING: 'monitoring',
    MIGRATION: 'migration',
    DOCUMENTATION: 'documentation',
    PERFORMANCE: 'performance',
    RECOVERY: 'recovery'
  },

  // Niveles de agentes
  AGENT_LEVELS: {
    LEVEL_1: 'level_1', // Super Coordinador
    LEVEL_2: 'level_2', // Coordinadores de Área
    LEVEL_3: 'level_3'  // Agentes Especializados
  },

  // Roles de agentes
  AGENT_ROLES: {
    COORDINATOR: 'coordinator',
    EXECUTOR: 'executor',
    MONITOR: 'monitor',
    VALIDATOR: 'validator',
    REPORTER: 'reporter',
    BACKUP: 'backup',
    RECOVERY: 'recovery'
  },

  // Estados de agentes
  AGENT_STATUS: {
    IDLE: 'idle',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    PAUSED: 'paused',
    RECOVERING: 'recovering',
    MAINTENANCE: 'maintenance',
    OFFLINE: 'offline'
  },

  // Prioridades de agentes
  AGENT_PRIORITY: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  },

  // Configuración por defecto
  DEFAULT_CONFIG: {
    MAX_RETRIES: 3,
    TIMEOUT: 30000, // 30 segundos
    AUTO_RESTART: true,
    LOG_LEVEL: 'info',
    NOTIFICATIONS: true,
    MAX_CONCURRENT_TASKS: 5,
    HEARTBEAT_INTERVAL: 30000, // 30 segundos
    HEALTH_CHECK_INTERVAL: 60000, // 1 minuto
    BACKUP_INTERVAL: 3600000, // 1 hora
    SECURITY_LEVEL: 'medium'
  },

  // Límites del sistema
  SYSTEM_LIMITS: {
    MAX_AGENTS_PER_NODE: 100,
    MAX_TASKS_PER_AGENT: 50,
    MAX_CONCURRENT_TASKS: 1000,
    MAX_MESSAGE_QUEUE_SIZE: 10000,
    MAX_WORKFLOW_DURATION: 86400000, // 24 horas
    MAX_RETRY_ATTEMPTS: 5,
    MAX_BACKUP_SIZE: 1073741824, // 1 GB
    MAX_LOG_RETENTION: 2592000000 // 30 días
  },

  // Timeouts
  TIMEOUTS: {
    AGENT_STARTUP: 30000, // 30 segundos
    AGENT_SHUTDOWN: 15000, // 15 segundos
    TASK_EXECUTION: 300000, // 5 minutos
    MESSAGE_DELIVERY: 10000, // 10 segundos
    HEALTH_CHECK: 5000, // 5 segundos
    COMMUNICATION: 15000, // 15 segundos
    WORKFLOW_EXECUTION: 3600000, // 1 hora
    RECOVERY_ATTEMPT: 60000, // 1 minuto
    BACKUP_OPERATION: 300000, // 5 minutos
    RESTORE_OPERATION: 600000 // 10 minutos
  },

  // Intervalos
  INTERVALS: {
    HEARTBEAT: 30000, // 30 segundos
    HEALTH_CHECK: 60000, // 1 minuto
    METRICS_COLLECTION: 30000, // 30 segundos
    PERFORMANCE_MONITORING: 60000, // 1 minuto
    SECURITY_AUDIT: 3600000, // 1 hora
    BACKUP_SCHEDULE: 86400000, // 24 horas
    LOG_ROTATION: 86400000, // 24 horas
    CACHE_CLEANUP: 300000, // 5 minutos
    GARBAGE_COLLECTION: 300000, // 5 minutos
    SYSTEM_OPTIMIZATION: 3600000 // 1 hora
  },

  // Códigos de error
  ERROR_CODES: {
    AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
    AGENT_ALREADY_EXISTS: 'AGENT_ALREADY_EXISTS',
    AGENT_STARTUP_FAILED: 'AGENT_STARTUP_FAILED',
    AGENT_SHUTDOWN_FAILED: 'AGENT_SHUTDOWN_FAILED',
    TASK_EXECUTION_FAILED: 'TASK_EXECUTION_FAILED',
    TASK_TIMEOUT: 'TASK_TIMEOUT',
    TASK_DEPENDENCY_FAILED: 'TASK_DEPENDENCY_FAILED',
    MESSAGE_DELIVERY_FAILED: 'MESSAGE_DELIVERY_FAILED',
    COMMUNICATION_FAILED: 'COMMUNICATION_FAILED',
    HEALTH_CHECK_FAILED: 'HEALTH_CHECK_FAILED',
    WORKFLOW_EXECUTION_FAILED: 'WORKFLOW_EXECUTION_FAILED',
    RECOVERY_FAILED: 'RECOVERY_FAILED',
    BACKUP_FAILED: 'BACKUP_FAILED',
    RESTORE_FAILED: 'RESTORE_FAILED',
    SECURITY_VIOLATION: 'SECURITY_VIOLATION',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
  },

  // Eventos del sistema
  EVENTS: {
    AGENT_STARTED: 'agent_started',
    AGENT_STOPPED: 'agent_stopped',
    AGENT_FAILED: 'agent_failed',
    AGENT_RECOVERED: 'agent_recovered',
    TASK_STARTED: 'task_started',
    TASK_COMPLETED: 'task_completed',
    TASK_FAILED: 'task_failed',
    TASK_TIMEOUT: 'task_timeout',
    MESSAGE_SENT: 'message_sent',
    MESSAGE_RECEIVED: 'message_received',
    MESSAGE_FAILED: 'message_failed',
    WORKFLOW_STARTED: 'workflow_started',
    WORKFLOW_COMPLETED: 'workflow_completed',
    WORKFLOW_FAILED: 'workflow_failed',
    HEALTH_CHECK: 'health_check',
    PERFORMANCE_ALERT: 'performance_alert',
    SECURITY_ALERT: 'security_alert',
    RESOURCE_ALERT: 'resource_alert',
    BACKUP_STARTED: 'backup_started',
    BACKUP_COMPLETED: 'backup_completed',
    BACKUP_FAILED: 'backup_failed',
    RESTORE_STARTED: 'restore_started',
    RESTORE_COMPLETED: 'restore_completed',
    RESTORE_FAILED: 'restore_failed'
  },

  // Tipos de mensajes
  MESSAGE_TYPES: {
    TASK_ASSIGNMENT: 'task_assignment',
    TASK_COMPLETION: 'task_completion',
    TASK_FAILURE: 'task_failure',
    HEALTH_CHECK: 'health_check',
    STATUS_UPDATE: 'status_update',
    RESOURCE_REQUEST: 'resource_request',
    ERROR_NOTIFICATION: 'error_notification',
    COORDINATION_SIGNAL: 'coordination_signal',
    HIERARCHY_UPDATE: 'hierarchy_update',
    ROLE_CHANGE: 'role_change',
    PERMISSION_REQUEST: 'permission_request',
    RECOVERY_SIGNAL: 'recovery_signal',
    PERFORMANCE_ALERT: 'performance_alert',
    SECURITY_ALERT: 'security_alert',
    WORKFLOW_START: 'workflow_start',
    WORKFLOW_COMPLETE: 'workflow_complete',
    WORKFLOW_FAIL: 'workflow_fail',
    BACKUP_REQUEST: 'backup_request',
    RESTORE_REQUEST: 'restore_request',
    MAINTENANCE_NOTICE: 'maintenance_notice',
    SYSTEM_BROADCAST: 'system_broadcast',
    HEARTBEAT: 'heartbeat',
    PING: 'ping',
    PONG: 'pong'
  },

  // Prioridades de mensajes
  MESSAGE_PRIORITY: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
    CRITICAL: 'critical'
  },

  // Protocolos de comunicación
  COMMUNICATION_PROTOCOLS: {
    HTTP: 'http',
    WEBSOCKET: 'websocket',
    REDIS: 'redis',
    RABBITMQ: 'rabbitmq',
    KAFKA: 'kafka',
    GRPC: 'grpc',
    INTERNAL: 'internal',
    TCP: 'tcp',
    UDP: 'udp',
    MQTT: 'mqtt'
  },

  // Estados de comunicación
  COMMUNICATION_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    ACKNOWLEDGED: 'acknowledged',
    FAILED: 'failed',
    TIMEOUT: 'timeout',
    CANCELLED: 'cancelled',
    RETRYING: 'retrying'
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

  // Niveles de seguridad
  SECURITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  // Métodos de autenticación
  AUTHENTICATION_METHODS: {
    NONE: 'none',
    TOKEN: 'token',
    CERTIFICATE: 'certificate',
    BIOMETRIC: 'biometric',
    MULTI_FACTOR: 'multi_factor',
    OAUTH: 'oauth',
    SAML: 'saml',
    LDAP: 'ldap',
    KERBEROS: 'kerberos',
    RADIUS: 'radius',
    TACACS: 'tacacs',
    CUSTOM: 'custom'
  },

  // Niveles de encriptación
  ENCRYPTION_LEVELS: {
    NONE: 'none',
    BASIC: 'basic',
    STANDARD: 'standard',
    HIGH: 'high',
    MILITARY: 'military',
    QUANTUM: 'quantum'
  },

  // Tipos de alertas
  ALERT_TYPES: {
    HEALTH_DEGRADED: 'health_degraded',
    PERFORMANCE_DEGRADED: 'performance_degraded',
    RESOURCE_EXHAUSTED: 'resource_exhausted',
    COMMUNICATION_FAILED: 'communication_failed',
    TASK_FAILED: 'task_failed',
    SECURITY_VIOLATION: 'security_violation',
    HIERARCHY_CONFLICT: 'hierarchy_conflict',
    PERMISSION_DENIED: 'permission_denied',
    TIMEOUT: 'timeout',
    ERROR_RATE_HIGH: 'error_rate_high',
    LATENCY_HIGH: 'latency_high',
    THROUGHPUT_LOW: 'throughput_low',
    MEMORY_HIGH: 'memory_high',
    CPU_HIGH: 'cpu_high',
    DISK_FULL: 'disk_full',
    NETWORK_ISSUE: 'network_issue',
    CONNECTION_LOST: 'connection_lost',
    AUTHENTICATION_FAILED: 'authentication_failed',
    AUTHORIZATION_FAILED: 'authorization_failed',
    ENCRYPTION_ERROR: 'encryption_error'
  },

  // Severidades de alertas
  ALERT_SEVERITY: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
  },

  // Tipos de eventos
  EVENT_TYPES: {
    AGENT_STARTED: 'agent_started',
    AGENT_STOPPED: 'agent_stopped',
    TASK_STARTED: 'task_started',
    TASK_COMPLETED: 'task_completed',
    TASK_FAILED: 'task_failed',
    HEALTH_CHECK: 'health_check',
    RESOURCE_LOW: 'resource_low',
    ERROR_OCCURRED: 'error_occurred',
    RECOVERY_ATTEMPTED: 'recovery_attempted',
    ROLE_CHANGED: 'role_changed',
    PERMISSION_GRANTED: 'permission_granted',
    PERMISSION_DENIED: 'permission_denied',
    HIERARCHY_UPDATED: 'hierarchy_updated',
    COMMUNICATION_SENT: 'communication_sent',
    COMMUNICATION_RECEIVED: 'communication_received',
    WORKFLOW_STARTED: 'workflow_started',
    WORKFLOW_COMPLETED: 'workflow_completed',
    WORKFLOW_FAILED: 'workflow_failed',
    BACKUP_STARTED: 'backup_started',
    BACKUP_COMPLETED: 'backup_completed',
    RESTORE_STARTED: 'restore_started',
    RESTORE_COMPLETED: 'restore_completed',
    MAINTENANCE_STARTED: 'maintenance_started',
    MAINTENANCE_COMPLETED: 'maintenance_completed',
    SCALING_STARTED: 'scaling_started',
    SCALING_COMPLETED: 'scaling_completed',
    FAILOVER_TRIGGERED: 'failover_triggered',
    RECOVERY_STARTED: 'recovery_started',
    RECOVERY_COMPLETED: 'recovery_completed',
    SECURITY_AUDIT: 'security_audit',
    PERFORMANCE_TEST: 'performance_test',
    LOAD_TEST: 'load_test',
    STRESS_TEST: 'stress_test',
    INTEGRATION_TEST: 'integration_test',
    UNIT_TEST: 'unit_test',
    E2E_TEST: 'e2e_test'
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
    }
  },

  // Configuración de monitoreo
  MONITORING: {
    METRICS: {
      CPU_USAGE: 'cpu_usage',
      MEMORY_USAGE: 'memory_usage',
      DISK_USAGE: 'disk_usage',
      NETWORK_USAGE: 'network_usage',
      RESPONSE_TIME: 'response_time',
      THROUGHPUT: 'throughput',
      ERROR_RATE: 'error_rate',
      AVAILABILITY: 'availability',
      EFFICIENCY: 'efficiency',
      QUALITY_SCORE: 'quality_score'
    },
    INTERVALS: {
      REAL_TIME: 1000, // 1 segundo
      SHORT_TERM: 5000, // 5 segundos
      MEDIUM_TERM: 30000, // 30 segundos
      LONG_TERM: 300000 // 5 minutos
    }
  },

  // Configuración de recuperación
  RECOVERY: {
    STRATEGIES: {
      RESTART: 'restart',
      REDEPLOY: 'redeploy',
      MIGRATE: 'migrate',
      RESTORE: 'restore',
      REBUILD: 'rebuild',
      CUSTOM: 'custom'
    },
    MAX_ATTEMPTS: 3,
    BACKOFF_DELAY: 5000, // 5 segundos
    MAX_BACKOFF_DELAY: 60000 // 1 minuto
  },

  // Configuración de backup
  BACKUP: {
    STRATEGIES: {
      FULL: 'full',
      INCREMENTAL: 'incremental',
      DIFFERENTIAL: 'differential',
      SNAPSHOT: 'snapshot',
      CONTINUOUS: 'continuous',
      HYBRID: 'hybrid'
    },
    RETENTION: {
      COPIES: 3,
      DAYS: 30,
      MONTHS: 12,
      YEARS: 3
    }
  }
} as const;

// Exportar tipos derivados de las constantes
export type AgentType = typeof AGENT_CONSTANTS.AGENT_TYPES[keyof typeof AGENT_CONSTANTS.AGENT_TYPES];
export type AgentLevel = typeof AGENT_CONSTANTS.AGENT_LEVELS[keyof typeof AGENT_CONSTANTS.AGENT_LEVELS];
export type AgentRole = typeof AGENT_CONSTANTS.AGENT_ROLES[keyof typeof AGENT_CONSTANTS.AGENT_ROLES];
export type AgentStatus = typeof AGENT_CONSTANTS.AGENT_STATUS[keyof typeof AGENT_CONSTANTS.AGENT_STATUS];
export type AgentPriority = typeof AGENT_CONSTANTS.AGENT_PRIORITY[keyof typeof AGENT_CONSTANTS.AGENT_PRIORITY];
export type MessageType = typeof AGENT_CONSTANTS.MESSAGE_TYPES[keyof typeof AGENT_CONSTANTS.MESSAGE_TYPES];
export type MessagePriority = typeof AGENT_CONSTANTS.MESSAGE_PRIORITY[keyof typeof AGENT_CONSTANTS.MESSAGE_PRIORITY];
export type CommunicationProtocol = typeof AGENT_CONSTANTS.COMMUNICATION_PROTOCOLS[keyof typeof AGENT_CONSTANTS.COMMUNICATION_PROTOCOLS];
export type CommunicationStatus = typeof AGENT_CONSTANTS.COMMUNICATION_STATUS[keyof typeof AGENT_CONSTANTS.COMMUNICATION_STATUS];
export type TaskType = typeof AGENT_CONSTANTS.TASK_TYPES[keyof typeof AGENT_CONSTANTS.TASK_TYPES];
export type TaskStatus = typeof AGENT_CONSTANTS.TASK_STATUS[keyof typeof AGENT_CONSTANTS.TASK_STATUS];
export type TaskPriority = typeof AGENT_CONSTANTS.TASK_PRIORITY[keyof typeof AGENT_CONSTANTS.TASK_PRIORITY];
export type WorkflowType = typeof AGENT_CONSTANTS.WORKFLOW_TYPES[keyof typeof AGENT_CONSTANTS.WORKFLOW_TYPES];
export type WorkflowStatus = typeof AGENT_CONSTANTS.WORKFLOW_STATUS[keyof typeof AGENT_CONSTANTS.WORKFLOW_STATUS];
export type SecurityLevel = typeof AGENT_CONSTANTS.SECURITY_LEVELS[keyof typeof AGENT_CONSTANTS.SECURITY_LEVELS];
export type AuthenticationMethod = typeof AGENT_CONSTANTS.AUTHENTICATION_METHODS[keyof typeof AGENT_CONSTANTS.AUTHENTICATION_METHODS];
export type EncryptionLevel = typeof AGENT_CONSTANTS.ENCRYPTION_LEVELS[keyof typeof AGENT_CONSTANTS.ENCRYPTION_LEVELS];
export type AlertType = typeof AGENT_CONSTANTS.ALERT_TYPES[keyof typeof AGENT_CONSTANTS.ALERT_TYPES];
export type AlertSeverity = typeof AGENT_CONSTANTS.ALERT_SEVERITY[keyof typeof AGENT_CONSTANTS.ALERT_SEVERITY];
export type EventType = typeof AGENT_CONSTANTS.EVENT_TYPES[keyof typeof AGENT_CONSTANTS.EVENT_TYPES];
export type LogLevel = typeof AGENT_CONSTANTS.LOGGING.LEVELS[keyof typeof AGENT_CONSTANTS.LOGGING.LEVELS];
export type LogFormat = typeof AGENT_CONSTANTS.LOGGING.FORMATS[keyof typeof AGENT_CONSTANTS.LOGGING.FORMATS];
export type LogDestination = typeof AGENT_CONSTANTS.LOGGING.DESTINATIONS[keyof typeof AGENT_CONSTANTS.LOGGING.DESTINATIONS];
export type RecoveryStrategy = typeof AGENT_CONSTANTS.RECOVERY.STRATEGIES[keyof typeof AGENT_CONSTANTS.RECOVERY.STRATEGIES];
export type BackupStrategy = typeof AGENT_CONSTANTS.BACKUP.STRATEGIES[keyof typeof AGENT_CONSTANTS.BACKUP.STRATEGIES];