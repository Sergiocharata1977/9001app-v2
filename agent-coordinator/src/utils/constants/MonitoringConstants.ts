// Constantes para el sistema de monitoreo
export const MONITORING_CONSTANTS = {
  // Estados de monitoreo
  MONITORING_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ERROR: 'error',
    MAINTENANCE: 'maintenance'
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

  // Tipos de métricas
  METRIC_TYPES: {
    COUNTER: 'counter',
    GAUGE: 'gauge',
    HISTOGRAM: 'histogram',
    SUMMARY: 'summary',
    TIMER: 'timer',
    RATE: 'rate',
    PERCENTILE: 'percentile',
    CUSTOM: 'custom'
  },

  // Tipos de recursos
  RESOURCE_TYPES: {
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

  // Métricas de recursos
  RESOURCE_METRICS: {
    USAGE: 'usage',
    UTILIZATION: 'utilization',
    AVAILABILITY: 'availability',
    CAPACITY: 'capacity',
    THROUGHPUT: 'throughput',
    LATENCY: 'latency',
    ERROR_RATE: 'error_rate',
    SUCCESS_RATE: 'success_rate'
  },

  // Métricas de rendimiento
  PERFORMANCE_METRICS: {
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

  // Métricas de comunicación
  COMMUNICATION_METRICS: {
    MESSAGES_SENT: 'messages_sent',
    MESSAGES_RECEIVED: 'messages_received',
    MESSAGES_FAILED: 'messages_failed',
    AVERAGE_LATENCY: 'average_latency',
    BANDWIDTH_USAGE: 'bandwidth_usage',
    CONNECTION_COUNT: 'connection_count',
    ERROR_RATE: 'error_rate',
    THROUGHPUT: 'throughput',
    QUEUE_SIZE: 'queue_size',
    RETRY_COUNT: 'retry_count',
    TIMEOUT_COUNT: 'timeout_count'
  },

  // Métricas de flujos de trabajo
  WORKFLOW_METRICS: {
    TOTAL_WORKFLOWS: 'total_workflows',
    ACTIVE_WORKFLOWS: 'active_workflows',
    COMPLETED_WORKFLOWS: 'completed_workflows',
    FAILED_WORKFLOWS: 'failed_workflows',
    AVERAGE_WORKFLOW_DURATION: 'average_workflow_duration',
    WORKFLOW_SUCCESS_RATE: 'workflow_success_rate',
    TASK_COMPLETION_RATE: 'task_completion_rate',
    PARALLEL_EXECUTION_RATE: 'parallel_execution_rate',
    ROLLBACK_COUNT: 'rollback_count',
    RECOVERY_COUNT: 'recovery_count'
  },

  // Métricas de jerarquía
  HIERARCHY_METRICS: {
    TOTAL_HIERARCHIES: 'total_hierarchies',
    ACTIVE_HIERARCHIES: 'active_hierarchies',
    FAILED_HIERARCHIES: 'failed_hierarchies',
    TOTAL_LEVELS: 'total_levels',
    AVERAGE_AGENTS_PER_LEVEL: 'average_agents_per_level',
    HIERARCHY_DEPTH: 'hierarchy_depth',
    COORDINATION_EFFICIENCY: 'coordination_efficiency',
    LOAD_DISTRIBUTION: 'load_distribution',
    FAILOVER_EVENTS: 'failover_events',
    SCALING_EVENTS: 'scaling_events'
  },

  // Métricas de seguridad
  SECURITY_METRICS: {
    AUTHENTICATION_SUCCESS: 'authentication_success',
    AUTHENTICATION_FAILURES: 'authentication_failures',
    AUTHORIZATION_SUCCESS: 'authorization_success',
    AUTHORIZATION_FAILURES: 'authorization_failures',
    SECURITY_VIOLATIONS: 'security_violations',
    ENCRYPTION_USAGE: 'encryption_usage',
    AUDIT_EVENTS: 'audit_events',
    FAILED_LOGINS: 'failed_logins',
    BLOCKED_REQUESTS: 'blocked_requests',
    SUSPICIOUS_ACTIVITIES: 'suspicious_activities',
    POLICY_VIOLATIONS: 'policy_violations',
    DATA_BREACHES: 'data_breaches'
  },

  // Tipos de reportes
  REPORT_TYPES: {
    PERFORMANCE: 'performance',
    HEALTH: 'health',
    ERROR: 'error',
    METRICS: 'metrics',
    SECURITY: 'security',
    COMPLIANCE: 'compliance',
    AUDIT: 'audit',
    SUMMARY: 'summary',
    DETAILED: 'detailed',
    CUSTOM: 'custom'
  },

  // Estados de reportes
  REPORT_STATUS: {
    DRAFT: 'draft',
    GENERATED: 'generated',
    DELIVERED: 'delivered',
    ARCHIVED: 'archived'
  },

  // Tipos de visualizaciones
  VISUALIZATION_TYPES: {
    LINE_CHART: 'line_chart',
    BAR_CHART: 'bar_chart',
    AREA_CHART: 'area_chart',
    PIE_CHART: 'pie_chart',
    SCATTER_PLOT: 'scatter_plot',
    HEATMAP: 'heatmap',
    GAUGE: 'gauge',
    RADAR: 'radar',
    FUNNEL: 'funnel',
    TREE: 'tree',
    NETWORK: 'network',
    TIMELINE: 'timeline'
  },

  // Estados de visualizaciones
  VISUALIZATION_STATUS: {
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error',
    UPDATING: 'updating'
  },

  // Tipos de gráficos
  GRAPH_TYPES: {
    DEPENDENCY: 'dependency',
    COMMUNICATION: 'communication',
    WORKFLOW: 'workflow',
    HIERARCHY: 'hierarchy',
    PERFORMANCE: 'performance',
    RESOURCE: 'resource',
    SECURITY: 'security',
    CUSTOM: 'custom'
  },

  // Estados de gráficos
  GRAPH_STATUS: {
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error',
    UPDATING: 'updating'
  },

  // Configuración por defecto
  DEFAULT_CONFIG: {
    METRICS_COLLECTION_INTERVAL: 30000, // 30 segundos
    HEALTH_CHECK_INTERVAL: 60000, // 1 minuto
    PERFORMANCE_MONITORING_INTERVAL: 60000, // 1 minuto
    SECURITY_AUDIT_INTERVAL: 3600000, // 1 hora
    BACKUP_SCHEDULE_INTERVAL: 86400000, // 24 horas
    LOG_ROTATION_INTERVAL: 86400000, // 24 horas
    CACHE_CLEANUP_INTERVAL: 300000, // 5 minutos
    GARBAGE_COLLECTION_INTERVAL: 300000, // 5 minutos
    SYSTEM_OPTIMIZATION_INTERVAL: 3600000, // 1 hora
    ALERT_CHECK_INTERVAL: 60000, // 1 minuto
    REPORT_GENERATION_INTERVAL: 3600000, // 1 hora
    DASHBOARD_UPDATE_INTERVAL: 30000, // 30 segundos
    METRICS_RETENTION_DAYS: 30,
    LOG_RETENTION_DAYS: 90,
    ALERT_RETENTION_DAYS: 365,
    REPORT_RETENTION_DAYS: 2555, // 7 años
    MAX_METRICS_PER_AGENT: 100,
    MAX_ALERTS_PER_AGENT: 1000,
    MAX_EVENTS_PER_AGENT: 10000,
    MAX_REPORTS_PER_AGENT: 100,
    MAX_DASHBOARDS_PER_USER: 10,
    MAX_WIDGETS_PER_DASHBOARD: 20,
    MAX_CHARTS_PER_WIDGET: 5,
    MAX_DATA_POINTS_PER_CHART: 1000
  },

  // Límites del sistema
  SYSTEM_LIMITS: {
    MAX_METRICS_COLLECTION_RATE: 1000, // métricas por segundo
    MAX_HEALTH_CHECKS_PER_MINUTE: 60,
    MAX_PERFORMANCE_MONITORING_RATE: 100, // monitoreos por minuto
    MAX_SECURITY_AUDITS_PER_HOUR: 10,
    MAX_BACKUP_OPERATIONS_PER_DAY: 24,
    MAX_LOG_ENTRIES_PER_SECOND: 10000,
    MAX_ALERTS_PER_MINUTE: 100,
    MAX_EVENTS_PER_SECOND: 1000,
    MAX_REPORTS_PER_HOUR: 100,
    MAX_DASHBOARD_UPDATES_PER_MINUTE: 60,
    MAX_METRICS_STORAGE_SIZE: 107374182400, // 100 GB
    MAX_LOG_STORAGE_SIZE: 107374182400, // 100 GB
    MAX_ALERT_STORAGE_SIZE: 10737418240, // 10 GB
    MAX_REPORT_STORAGE_SIZE: 10737418240, // 10 GB
    MAX_DASHBOARD_STORAGE_SIZE: 1073741824 // 1 GB
  },

  // Timeouts
  TIMEOUTS: {
    METRICS_COLLECTION: 30000, // 30 segundos
    HEALTH_CHECK: 10000, // 10 segundos
    PERFORMANCE_MONITORING: 30000, // 30 segundos
    SECURITY_AUDIT: 300000, // 5 minutos
    BACKUP_OPERATION: 3600000, // 1 hora
    LOG_ROTATION: 300000, // 5 minutos
    CACHE_CLEANUP: 60000, // 1 minuto
    GARBAGE_COLLECTION: 300000, // 5 minutos
    SYSTEM_OPTIMIZATION: 1800000, // 30 minutos
    ALERT_CHECK: 10000, // 10 segundos
    REPORT_GENERATION: 300000, // 5 minutos
    DASHBOARD_UPDATE: 5000, // 5 segundos
    METRICS_QUERY: 30000, // 30 segundos
    LOG_QUERY: 60000, // 1 minuto
    ALERT_QUERY: 30000, // 30 segundos
    REPORT_QUERY: 60000, // 1 minuto
    DASHBOARD_LOAD: 10000, // 10 segundos
    CHART_RENDER: 5000, // 5 segundos
    GRAPH_RENDER: 10000 // 10 segundos
  },

  // Intervalos
  INTERVALS: {
    REAL_TIME: 1000, // 1 segundo
    SHORT_TERM: 5000, // 5 segundos
    MEDIUM_TERM: 30000, // 30 segundos
    LONG_TERM: 300000, // 5 minutos
    HOURLY: 3600000, // 1 hora
    DAILY: 86400000, // 24 horas
    WEEKLY: 604800000, // 7 días
    MONTHLY: 2592000000 // 30 días
  },

  // Códigos de error
  ERROR_CODES: {
    METRICS_COLLECTION_FAILED: 'METRICS_COLLECTION_FAILED',
    HEALTH_CHECK_FAILED: 'HEALTH_CHECK_FAILED',
    PERFORMANCE_MONITORING_FAILED: 'PERFORMANCE_MONITORING_FAILED',
    SECURITY_AUDIT_FAILED: 'SECURITY_AUDIT_FAILED',
    BACKUP_OPERATION_FAILED: 'BACKUP_OPERATION_FAILED',
    LOG_ROTATION_FAILED: 'LOG_ROTATION_FAILED',
    CACHE_CLEANUP_FAILED: 'CACHE_CLEANUP_FAILED',
    GARBAGE_COLLECTION_FAILED: 'GARBAGE_COLLECTION_FAILED',
    SYSTEM_OPTIMIZATION_FAILED: 'SYSTEM_OPTIMIZATION_FAILED',
    ALERT_CHECK_FAILED: 'ALERT_CHECK_FAILED',
    REPORT_GENERATION_FAILED: 'REPORT_GENERATION_FAILED',
    DASHBOARD_UPDATE_FAILED: 'DASHBOARD_UPDATE_FAILED',
    METRICS_QUERY_FAILED: 'METRICS_QUERY_FAILED',
    LOG_QUERY_FAILED: 'LOG_QUERY_FAILED',
    ALERT_QUERY_FAILED: 'ALERT_QUERY_FAILED',
    REPORT_QUERY_FAILED: 'REPORT_QUERY_FAILED',
    DASHBOARD_LOAD_FAILED: 'DASHBOARD_LOAD_FAILED',
    CHART_RENDER_FAILED: 'CHART_RENDER_FAILED',
    GRAPH_RENDER_FAILED: 'GRAPH_RENDER_FAILED',
    METRICS_STORAGE_FULL: 'METRICS_STORAGE_FULL',
    LOG_STORAGE_FULL: 'LOG_STORAGE_FULL',
    ALERT_STORAGE_FULL: 'ALERT_STORAGE_FULL',
    REPORT_STORAGE_FULL: 'REPORT_STORAGE_FULL',
    DASHBOARD_STORAGE_FULL: 'DASHBOARD_STORAGE_FULL',
    METRICS_RETENTION_EXCEEDED: 'METRICS_RETENTION_EXCEEDED',
    LOG_RETENTION_EXCEEDED: 'LOG_RETENTION_EXCEEDED',
    ALERT_RETENTION_EXCEEDED: 'ALERT_RETENTION_EXCEEDED',
    REPORT_RETENTION_EXCEEDED: 'REPORT_RETENTION_EXCEEDED',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
    PERMISSION_DENIED: 'PERMISSION_DENIED'
  },

  // Eventos del sistema
  EVENTS: {
    METRICS_COLLECTED: 'metrics_collected',
    HEALTH_CHECK_PERFORMED: 'health_check_performed',
    PERFORMANCE_MONITORED: 'performance_monitored',
    SECURITY_AUDITED: 'security_audited',
    BACKUP_CREATED: 'backup_created',
    LOG_ROTATED: 'log_rotated',
    CACHE_CLEANED: 'cache_cleaned',
    GARBAGE_COLLECTED: 'garbage_collected',
    SYSTEM_OPTIMIZED: 'system_optimized',
    ALERT_GENERATED: 'alert_generated',
    ALERT_ACKNOWLEDGED: 'alert_acknowledged',
    ALERT_RESOLVED: 'alert_resolved',
    REPORT_GENERATED: 'report_generated',
    REPORT_DELIVERED: 'report_delivered',
    DASHBOARD_UPDATED: 'dashboard_updated',
    DASHBOARD_CREATED: 'dashboard_created',
    DASHBOARD_DELETED: 'dashboard_deleted',
    WIDGET_ADDED: 'widget_added',
    WIDGET_REMOVED: 'widget_removed',
    WIDGET_UPDATED: 'widget_updated',
    CHART_RENDERED: 'chart_rendered',
    GRAPH_RENDERED: 'graph_rendered',
    METRICS_QUERIED: 'metrics_queried',
    LOG_QUERIED: 'log_queried',
    ALERT_QUERIED: 'alert_queried',
    REPORT_QUERIED: 'report_queried',
    DASHBOARD_LOADED: 'dashboard_loaded',
    METRICS_STORED: 'metrics_stored',
    LOG_STORED: 'log_stored',
    ALERT_STORED: 'alert_stored',
    REPORT_STORED: 'report_stored',
    METRICS_ARCHIVED: 'metrics_archived',
    LOG_ARCHIVED: 'log_archived',
    ALERT_ARCHIVED: 'alert_archived',
    REPORT_ARCHIVED: 'report_archived',
    METRICS_DELETED: 'metrics_deleted',
    LOG_DELETED: 'log_deleted',
    ALERT_DELETED: 'alert_deleted',
    REPORT_DELETED: 'report_deleted'
  },

  // Configuración de métricas
  METRICS_CONFIG: {
    COLLECTION: {
      ENABLED: true,
      INTERVAL: 30000, // 30 segundos
      BATCH_SIZE: 100,
      COMPRESSION: true,
      VALIDATION: true
    },
    STORAGE: {
      TYPE: 'time_series',
      RETENTION: 2592000000, // 30 días
      COMPRESSION: true,
      INDEXING: true,
      PARTITIONING: true
    },
    PROCESSING: {
      AGGREGATION: true,
      FILTERING: true,
      TRANSFORMATION: true,
      ENRICHMENT: true
    },
    QUERY: {
      CACHE_ENABLED: true,
      CACHE_TTL: 300000, // 5 minutos
      MAX_RESULTS: 10000,
      TIMEOUT: 30000 // 30 segundos
    }
  },

  // Configuración de alertas
  ALERTS_CONFIG: {
    GENERATION: {
      ENABLED: true,
      THRESHOLDS: true,
      RULES: true,
      CORRELATION: true
    },
    NOTIFICATION: {
      ENABLED: true,
      CHANNELS: ['email', 'sms', 'push', 'webhook'],
      ESCALATION: true,
      ACKNOWLEDGMENT: true
    },
    STORAGE: {
      RETENTION: 31536000000, // 365 días
      COMPRESSION: true,
      INDEXING: true,
      ARCHIVING: true
    },
    PROCESSING: {
      DEDUPLICATION: true,
      GROUPING: true,
      SUPPRESSION: true,
      ENRICHMENT: true
    }
  },

  // Configuración de reportes
  REPORTS_CONFIG: {
    GENERATION: {
      ENABLED: true,
      SCHEDULING: true,
      TEMPLATES: true,
      CUSTOMIZATION: true
    },
    DELIVERY: {
      ENABLED: true,
      CHANNELS: ['email', 'file', 'api', 'dashboard'],
      FORMATS: ['pdf', 'html', 'json', 'csv'],
      COMPRESSION: true
    },
    STORAGE: {
      RETENTION: 220752000000, // 2555 días (7 años)
      COMPRESSION: true,
      INDEXING: true,
      ARCHIVING: true
    },
    PROCESSING: {
      AGGREGATION: true,
      FILTERING: true,
      SORTING: true,
      PAGINATION: true
    }
  },

  // Configuración de dashboards
  DASHBOARDS_CONFIG: {
    CREATION: {
      ENABLED: true,
      TEMPLATES: true,
      CUSTOMIZATION: true,
      SHARING: true
    },
    UPDATES: {
      ENABLED: true,
      INTERVAL: 30000, // 30 segundos
      REAL_TIME: true,
      CACHING: true
    },
    STORAGE: {
      RETENTION: 31536000000, // 365 días
      COMPRESSION: true,
      INDEXING: true,
      BACKUP: true
    },
    RENDERING: {
      CACHE_ENABLED: true,
      CACHE_TTL: 60000, // 1 minuto
      OPTIMIZATION: true,
      RESPONSIVE: true
    }
  },

  // Configuración de visualizaciones
  VISUALIZATIONS_CONFIG: {
    CHARTS: {
      TYPES: ['line', 'bar', 'area', 'pie', 'scatter', 'heatmap', 'gauge', 'radar'],
      ANIMATIONS: true,
      INTERACTIVITY: true,
      RESPONSIVE: true
    },
    GRAPHS: {
      TYPES: ['dependency', 'communication', 'workflow', 'hierarchy', 'performance'],
      LAYOUTS: ['force', 'hierarchical', 'circular', 'grid'],
      INTERACTIONS: true,
      ZOOM: true
    },
    WIDGETS: {
      TYPES: ['metric', 'chart', 'graph', 'table', 'text', 'custom'],
      LAYOUT: 'grid',
      RESIZABLE: true,
      DRAGGABLE: true
    }
  },

  // Configuración de logging
  LOGGING_CONFIG: {
    COLLECTION: {
      ENABLED: true,
      LEVELS: ['debug', 'info', 'warn', 'error'],
      FORMATS: ['json', 'text', 'structured'],
      DESTINATIONS: ['console', 'file', 'database', 'remote']
    },
    STORAGE: {
      RETENTION: 7776000000, // 90 días
      COMPRESSION: true,
      INDEXING: true,
      ROTATION: true
    },
    PROCESSING: {
      PARSING: true,
      FILTERING: true,
      ENRICHMENT: true,
      CORRELATION: true
    },
    QUERY: {
      CACHE_ENABLED: true,
      CACHE_TTL: 300000, // 5 minutos
      MAX_RESULTS: 10000,
      TIMEOUT: 60000 // 1 minuto
    }
  }
} as const;

// Exportar tipos derivados de las constantes
export type MonitoringStatus = typeof MONITORING_CONSTANTS.MONITORING_STATUS[keyof typeof MONITORING_CONSTANTS.MONITORING_STATUS];
export type AlertType = typeof MONITORING_CONSTANTS.ALERT_TYPES[keyof typeof MONITORING_CONSTANTS.ALERT_TYPES];
export type AlertSeverity = typeof MONITORING_CONSTANTS.ALERT_SEVERITY[keyof typeof MONITORING_CONSTANTS.ALERT_SEVERITY];
export type EventType = typeof MONITORING_CONSTANTS.EVENT_TYPES[keyof typeof MONITORING_CONSTANTS.EVENT_TYPES];
export type MetricType = typeof MONITORING_CONSTANTS.METRIC_TYPES[keyof typeof MONITORING_CONSTANTS.METRIC_TYPES];
export type ResourceType = typeof MONITORING_CONSTANTS.RESOURCE_TYPES[keyof typeof MONITORING_CONSTANTS.RESOURCE_TYPES];
export type ResourceMetric = typeof MONITORING_CONSTANTS.RESOURCE_METRICS[keyof typeof MONITORING_CONSTANTS.RESOURCE_METRICS];
export type PerformanceMetric = typeof MONITORING_CONSTANTS.PERFORMANCE_METRICS[keyof typeof MONITORING_CONSTANTS.PERFORMANCE_METRICS];
export type CommunicationMetric = typeof MONITORING_CONSTANTS.COMMUNICATION_METRICS[keyof typeof MONITORING_CONSTANTS.COMMUNICATION_METRICS];
export type WorkflowMetric = typeof MONITORING_CONSTANTS.WORKFLOW_METRICS[keyof typeof MONITORING_CONSTANTS.WORKFLOW_METRICS];
export type HierarchyMetric = typeof MONITORING_CONSTANTS.HIERARCHY_METRICS[keyof typeof MONITORING_CONSTANTS.HIERARCHY_METRICS];
export type SecurityMetric = typeof MONITORING_CONSTANTS.SECURITY_METRICS[keyof typeof MONITORING_CONSTANTS.SECURITY_METRICS];
export type ReportType = typeof MONITORING_CONSTANTS.REPORT_TYPES[keyof typeof MONITORING_CONSTANTS.REPORT_TYPES];
export type ReportStatus = typeof MONITORING_CONSTANTS.REPORT_STATUS[keyof typeof MONITORING_CONSTANTS.REPORT_STATUS];
export type VisualizationType = typeof MONITORING_CONSTANTS.VISUALIZATION_TYPES[keyof typeof MONITORING_CONSTANTS.VISUALIZATION_TYPES];
export type VisualizationStatus = typeof MONITORING_CONSTANTS.VISUALIZATION_STATUS[keyof typeof MONITORING_CONSTANTS.VISUALIZATION_STATUS];
export type GraphType = typeof MONITORING_CONSTANTS.GRAPH_TYPES[keyof typeof MONITORING_CONSTANTS.GRAPH_TYPES];
export type GraphStatus = typeof MONITORING_CONSTANTS.GRAPH_STATUS[keyof typeof MONITORING_CONSTANTS.GRAPH_STATUS];