// Constantes para utilidades del sistema
export const UTILITY_CONSTANTS = {
  // Niveles de logging
  LOG_LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal'
  },

  // Formatos de logging
  LOG_FORMATS: {
    JSON: 'json',
    TEXT: 'text',
    STRUCTURED: 'structured',
    COMPACT: 'compact',
    DETAILED: 'detailed'
  },

  // Destinos de logging
  LOG_DESTINATIONS: {
    CONSOLE: 'console',
    FILE: 'file',
    DATABASE: 'database',
    REMOTE: 'remote',
    EMAIL: 'email',
    WEBHOOK: 'webhook'
  },

  // Tipos de configuración
  CONFIG_TYPES: {
    ENVIRONMENT: 'environment',
    APPLICATION: 'application',
    AGENT: 'agent',
    HIERARCHY: 'hierarchy',
    COMMUNICATION: 'communication',
    WORKFLOW: 'workflow',
    MONITORING: 'monitoring',
    SECURITY: 'security',
    TASK: 'task',
    DATABASE: 'database',
    CACHE: 'cache',
    LOGGING: 'logging',
    SYSTEM: 'system',
    CUSTOM: 'custom'
  },

  // Formatos de configuración
  CONFIG_FORMATS: {
    JSON: 'json',
    YAML: 'yaml',
    TOML: 'toml',
    INI: 'ini',
    ENV: 'env',
    XML: 'xml'
  },

  // Tipos de base de datos
  DATABASE_TYPES: {
    MONGODB: 'mongodb',
    POSTGRESQL: 'postgresql',
    MYSQL: 'mysql',
    SQLITE: 'sqlite',
    REDIS: 'redis',
    ELASTICSEARCH: 'elasticsearch',
    INFLUXDB: 'influxdb',
    CASSANDRA: 'cassandra',
    DYNAMODB: 'dynamodb',
    COUCHDB: 'couchdb'
  },

  // Tipos de caché
  CACHE_TYPES: {
    MEMORY: 'memory',
    REDIS: 'redis',
    MEMCACHED: 'memcached',
    HAZELCAST: 'hazelcast',
    EHCACHE: 'ehcache',
    GUAVA: 'guava',
    CUSTOM: 'custom'
  },

  // Tipos de archivo
  FILE_TYPES: {
    CONFIG: 'config',
    LOG: 'log',
    DATA: 'data',
    BACKUP: 'backup',
    TEMP: 'temp',
    CACHE: 'cache',
    TEMPLATE: 'template',
    SCRIPT: 'script',
    DOCUMENT: 'document',
    MEDIA: 'media',
    ARCHIVE: 'archive',
    CUSTOM: 'custom'
  },

  // Extensiones de archivo
  FILE_EXTENSIONS: {
    JSON: '.json',
    YAML: '.yml',
    YML: '.yaml',
    TOML: '.toml',
    INI: '.ini',
    ENV: '.env',
    XML: '.xml',
    TXT: '.txt',
    LOG: '.log',
    CSV: '.csv',
    TSV: '.tsv',
    SQL: '.sql',
    JS: '.js',
    TS: '.ts',
    MD: '.md',
    HTML: '.html',
    CSS: '.css',
    ZIP: '.zip',
    TAR: '.tar',
    GZ: '.gz',
    CUSTOM: '.custom'
  },

  // Tipos de compresión
  COMPRESSION_TYPES: {
    NONE: 'none',
    GZIP: 'gzip',
    DEFLATE: 'deflate',
    BROTLI: 'brotli',
    LZ4: 'lz4',
    SNAPPY: 'snappy',
    ZSTD: 'zstd',
    CUSTOM: 'custom'
  },

  // Tipos de encriptación
  ENCRYPTION_TYPES: {
    NONE: 'none',
    AES: 'aes',
    RSA: 'rsa',
    CHACHA20: 'chacha20',
    SALSA20: 'salsa20',
    CUSTOM: 'custom'
  },

  // Tipos de validación
  VALIDATION_TYPES: {
    SCHEMA: 'schema',
    TYPE: 'type',
    RANGE: 'range',
    PATTERN: 'pattern',
    CUSTOM: 'custom'
  },

  // Tipos de serialización
  SERIALIZATION_TYPES: {
    JSON: 'json',
    XML: 'xml',
    YAML: 'yaml',
    PROTOBUF: 'protobuf',
    AVRO: 'avro',
    MESSAGE_PACK: 'messagepack',
    BSON: 'bson',
    CUSTOM: 'custom'
  },

  // Tipos de codificación
  ENCODING_TYPES: {
    UTF8: 'utf8',
    ASCII: 'ascii',
    BASE64: 'base64',
    HEX: 'hex',
    BINARY: 'binary',
    CUSTOM: 'custom'
  },

  // Configuración por defecto
  DEFAULT_CONFIG: {
    LOG_LEVEL: 'info',
    LOG_FORMAT: 'json',
    LOG_DESTINATION: 'console',
    CONFIG_TYPE: 'application',
    CONFIG_FORMAT: 'json',
    DATABASE_TYPE: 'mongodb',
    CACHE_TYPE: 'memory',
    FILE_TYPE: 'config',
    FILE_EXTENSION: '.json',
    COMPRESSION_TYPE: 'gzip',
    ENCRYPTION_TYPE: 'aes',
    VALIDATION_TYPE: 'schema',
    SERIALIZATION_TYPE: 'json',
    ENCODING_TYPE: 'utf8',
    LOGGING_ENABLED: true,
    CONFIG_ENABLED: true,
    DATABASE_ENABLED: true,
    CACHE_ENABLED: true,
    FILE_ENABLED: true,
    COMPRESSION_ENABLED: true,
    ENCRYPTION_ENABLED: true,
    VALIDATION_ENABLED: true,
    SERIALIZATION_ENABLED: true,
    ENCODING_ENABLED: true,
    BACKUP_ENABLED: true,
    RESTORE_ENABLED: true,
    CLEANUP_ENABLED: true,
    OPTIMIZATION_ENABLED: true,
    SECURITY_ENABLED: true,
    PERFORMANCE_ENABLED: true,
    RESOURCE_ENABLED: true,
    COMMUNICATION_ENABLED: true,
    WORKFLOW_ENABLED: true,
    MONITORING_ENABLED: true,
    TASK_ENABLED: true,
    SYSTEM_ENABLED: true,
    CUSTOM_ENABLED: true
  },

  // Límites del sistema
  SYSTEM_LIMITS: {
    MAX_LOG_LEVELS: 10,
    MAX_LOG_FORMATS: 10,
    MAX_LOG_DESTINATIONS: 10,
    MAX_CONFIG_TYPES: 20,
    MAX_CONFIG_FORMATS: 10,
    MAX_DATABASE_TYPES: 20,
    MAX_CACHE_TYPES: 10,
    MAX_FILE_TYPES: 20,
    MAX_FILE_EXTENSIONS: 30,
    MAX_COMPRESSION_TYPES: 10,
    MAX_ENCRYPTION_TYPES: 10,
    MAX_VALIDATION_TYPES: 10,
    MAX_SERIALIZATION_TYPES: 10,
    MAX_ENCODING_TYPES: 10,
    MAX_LOG_SIZE: 1073741824, // 1 GB
    MAX_CONFIG_SIZE: 104857600, // 100 MB
    MAX_DATABASE_SIZE: 1099511627776, // 1 TB
    MAX_CACHE_SIZE: 107374182400, // 100 GB
    MAX_FILE_SIZE: 1073741824, // 1 GB
    MAX_COMPRESSION_RATIO: 0.1, // 10%
    MAX_ENCRYPTION_LEVEL: 256, // 256 bits
    MAX_VALIDATION_RULES: 1000,
    MAX_SERIALIZATION_SIZE: 1073741824, // 1 GB
    MAX_ENCODING_SIZE: 1073741824, // 1 GB
    MAX_LOG_ENTRIES: 1000000, // 1M entries
    MAX_CONFIG_ENTRIES: 10000, // 10K entries
    MAX_DATABASE_ENTRIES: 1000000000, // 1B entries
    MAX_CACHE_ENTRIES: 10000000, // 10M entries
    MAX_FILE_ENTRIES: 1000000, // 1M entries
    MAX_COMPRESSION_ENTRIES: 1000000, // 1M entries
    MAX_ENCRYPTION_ENTRIES: 1000000, // 1M entries
    MAX_VALIDATION_ENTRIES: 1000000, // 1M entries
    MAX_SERIALIZATION_ENTRIES: 1000000, // 1M entries
    MAX_ENCODING_ENTRIES: 1000000, // 1M entries
    MAX_LOG_RETENTION: 7776000000, // 90 días
    MAX_CONFIG_RETENTION: 31536000000, // 365 días
    MAX_DATABASE_RETENTION: 315360000000, // 10 años
    MAX_CACHE_RETENTION: 86400000, // 24 horas
    MAX_FILE_RETENTION: 31536000000, // 365 días
    MAX_COMPRESSION_RETENTION: 31536000000, // 365 días
    MAX_ENCRYPTION_RETENTION: 31536000000, // 365 días
    MAX_VALIDATION_RETENTION: 31536000000, // 365 días
    MAX_SERIALIZATION_RETENTION: 31536000000, // 365 días
    MAX_ENCODING_RETENTION: 31536000000, // 365 días
    MAX_LOG_ROTATION: 7, // 7 archivos
    MAX_CONFIG_BACKUP: 10, // 10 backups
    MAX_DATABASE_BACKUP: 100, // 100 backups
    MAX_CACHE_BACKUP: 5, // 5 backups
    MAX_FILE_BACKUP: 50, // 50 backups
    MAX_COMPRESSION_BACKUP: 20, // 20 backups
    MAX_ENCRYPTION_BACKUP: 20, // 20 backups
    MAX_VALIDATION_BACKUP: 20, // 20 backups
    MAX_SERIALIZATION_BACKUP: 20, // 20 backups
    MAX_ENCODING_BACKUP: 20 // 20 backups
  },

  // Timeouts
  TIMEOUTS: {
    LOG_WRITE: 5000, // 5 segundos
    CONFIG_LOAD: 10000, // 10 segundos
    CONFIG_SAVE: 10000, // 10 segundos
    DATABASE_CONNECT: 30000, // 30 segundos
    DATABASE_QUERY: 60000, // 1 minuto
    DATABASE_WRITE: 30000, // 30 segundos
    CACHE_GET: 1000, // 1 segundo
    CACHE_SET: 1000, // 1 segundo
    FILE_READ: 10000, // 10 segundos
    FILE_WRITE: 10000, // 10 segundos
    COMPRESSION: 30000, // 30 segundos
    DECOMPRESSION: 30000, // 30 segundos
    ENCRYPTION: 30000, // 30 segundos
    DECRYPTION: 30000, // 30 segundos
    VALIDATION: 10000, // 10 segundos
    SERIALIZATION: 10000, // 10 segundos
    DESERIALIZATION: 10000, // 10 segundos
    ENCODING: 5000, // 5 segundos
    DECODING: 5000, // 5 segundos
    BACKUP_CREATION: 300000, // 5 minutos
    BACKUP_RESTORATION: 600000, // 10 minutos
    CLEANUP_PROCESS: 300000, // 5 minutos
    OPTIMIZATION_PROCESS: 600000, // 10 minutos
    SECURITY_SCAN: 300000, // 5 minutos
    PERFORMANCE_ANALYSIS: 300000, // 5 minutos
    RESOURCE_ANALYSIS: 120000, // 2 minutos
    COMMUNICATION_ANALYSIS: 60000, // 1 minuto
    WORKFLOW_ANALYSIS: 120000, // 2 minutos
    MONITORING_ANALYSIS: 60000, // 1 minuto
    TASK_ANALYSIS: 60000, // 1 minuto
    SYSTEM_ANALYSIS: 300000, // 5 minutos
    CUSTOM_ANALYSIS: 300000 // 5 minutos
  },

  // Intervalos
  INTERVALS: {
    LOG_ROTATION: 86400000, // 24 horas
    CONFIG_BACKUP: 3600000, // 1 hora
    DATABASE_BACKUP: 86400000, // 24 horas
    CACHE_CLEANUP: 300000, // 5 minutos
    FILE_CLEANUP: 3600000, // 1 hora
    COMPRESSION_CLEANUP: 3600000, // 1 hora
    ENCRYPTION_CLEANUP: 3600000, // 1 hora
    VALIDATION_CLEANUP: 3600000, // 1 hora
    SERIALIZATION_CLEANUP: 3600000, // 1 hora
    ENCODING_CLEANUP: 3600000, // 1 hora
    BACKUP_CLEANUP: 604800000, // 7 días
    OPTIMIZATION_PROCESS: 1800000, // 30 minutos
    SECURITY_SCAN: 300000, // 5 minutos
    PERFORMANCE_ANALYSIS: 300000, // 5 minutos
    RESOURCE_ANALYSIS: 120000, // 2 minutos
    COMMUNICATION_ANALYSIS: 60000, // 1 minuto
    WORKFLOW_ANALYSIS: 120000, // 2 minutos
    MONITORING_ANALYSIS: 60000, // 1 minuto
    TASK_ANALYSIS: 60000, // 1 minuto
    SYSTEM_ANALYSIS: 300000, // 5 minutos
    CUSTOM_ANALYSIS: 300000 // 5 minutos
  },

  // Códigos de error
  ERROR_CODES: {
    LOG_WRITE_FAILED: 'LOG_WRITE_FAILED',
    CONFIG_LOAD_FAILED: 'CONFIG_LOAD_FAILED',
    CONFIG_SAVE_FAILED: 'CONFIG_SAVE_FAILED',
    DATABASE_CONNECT_FAILED: 'DATABASE_CONNECT_FAILED',
    DATABASE_QUERY_FAILED: 'DATABASE_QUERY_FAILED',
    DATABASE_WRITE_FAILED: 'DATABASE_WRITE_FAILED',
    CACHE_GET_FAILED: 'CACHE_GET_FAILED',
    CACHE_SET_FAILED: 'CACHE_SET_FAILED',
    FILE_READ_FAILED: 'FILE_READ_FAILED',
    FILE_WRITE_FAILED: 'FILE_WRITE_FAILED',
    COMPRESSION_FAILED: 'COMPRESSION_FAILED',
    DECOMPRESSION_FAILED: 'DECOMPRESSION_FAILED',
    ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
    DECRYPTION_FAILED: 'DECRYPTION_FAILED',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    SERIALIZATION_FAILED: 'SERIALIZATION_FAILED',
    DESERIALIZATION_FAILED: 'DESERIALIZATION_FAILED',
    ENCODING_FAILED: 'ENCODING_FAILED',
    DECODING_FAILED: 'DECODING_FAILED',
    BACKUP_CREATION_FAILED: 'BACKUP_CREATION_FAILED',
    BACKUP_RESTORATION_FAILED: 'BACKUP_RESTORATION_FAILED',
    CLEANUP_PROCESS_FAILED: 'CLEANUP_PROCESS_FAILED',
    OPTIMIZATION_PROCESS_FAILED: 'OPTIMIZATION_PROCESS_FAILED',
    SECURITY_SCAN_FAILED: 'SECURITY_SCAN_FAILED',
    PERFORMANCE_ANALYSIS_FAILED: 'PERFORMANCE_ANALYSIS_FAILED',
    RESOURCE_ANALYSIS_FAILED: 'RESOURCE_ANALYSIS_FAILED',
    COMMUNICATION_ANALYSIS_FAILED: 'COMMUNICATION_ANALYSIS_FAILED',
    WORKFLOW_ANALYSIS_FAILED: 'WORKFLOW_ANALYSIS_FAILED',
    MONITORING_ANALYSIS_FAILED: 'MONITORING_ANALYSIS_FAILED',
    TASK_ANALYSIS_FAILED: 'TASK_ANALYSIS_FAILED',
    SYSTEM_ANALYSIS_FAILED: 'SYSTEM_ANALYSIS_FAILED',
    CUSTOM_ANALYSIS_FAILED: 'CUSTOM_ANALYSIS_FAILED',
    LOG_LIMIT_EXCEEDED: 'LOG_LIMIT_EXCEEDED',
    CONFIG_LIMIT_EXCEEDED: 'CONFIG_LIMIT_EXCEEDED',
    DATABASE_LIMIT_EXCEEDED: 'DATABASE_LIMIT_EXCEEDED',
    CACHE_LIMIT_EXCEEDED: 'CACHE_LIMIT_EXCEEDED',
    FILE_LIMIT_EXCEEDED: 'FILE_LIMIT_EXCEEDED',
    COMPRESSION_LIMIT_EXCEEDED: 'COMPRESSION_LIMIT_EXCEEDED',
    ENCRYPTION_LIMIT_EXCEEDED: 'ENCRYPTION_LIMIT_EXCEEDED',
    VALIDATION_LIMIT_EXCEEDED: 'VALIDATION_LIMIT_EXCEEDED',
    SERIALIZATION_LIMIT_EXCEEDED: 'SERIALIZATION_LIMIT_EXCEEDED',
    ENCODING_LIMIT_EXCEEDED: 'ENCODING_LIMIT_EXCEEDED',
    BACKUP_LIMIT_EXCEEDED: 'BACKUP_LIMIT_EXCEEDED',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    INVALID_LOG: 'INVALID_LOG',
    INVALID_CONFIG: 'INVALID_CONFIG',
    INVALID_DATABASE: 'INVALID_DATABASE',
    INVALID_CACHE: 'INVALID_CACHE',
    INVALID_FILE: 'INVALID_FILE',
    INVALID_COMPRESSION: 'INVALID_COMPRESSION',
    INVALID_ENCRYPTION: 'INVALID_ENCRYPTION',
    INVALID_VALIDATION: 'INVALID_VALIDATION',
    INVALID_SERIALIZATION: 'INVALID_SERIALIZATION',
    INVALID_ENCODING: 'INVALID_ENCODING',
    INVALID_BACKUP: 'INVALID_BACKUP',
    INVALID_CLEANUP: 'INVALID_CLEANUP',
    INVALID_OPTIMIZATION: 'INVALID_OPTIMIZATION',
    INVALID_SECURITY: 'INVALID_SECURITY',
    INVALID_PERFORMANCE: 'INVALID_PERFORMANCE',
    INVALID_RESOURCE: 'INVALID_RESOURCE',
    INVALID_COMMUNICATION: 'INVALID_COMMUNICATION',
    INVALID_WORKFLOW: 'INVALID_WORKFLOW',
    INVALID_MONITORING: 'INVALID_MONITORING',
    INVALID_TASK: 'INVALID_TASK',
    INVALID_SYSTEM: 'INVALID_SYSTEM',
    INVALID_CUSTOM: 'INVALID_CUSTOM'
  },

  // Eventos del sistema
  EVENTS: {
    LOG_WRITTEN: 'log_written',
    CONFIG_LOADED: 'config_loaded',
    CONFIG_SAVED: 'config_saved',
    DATABASE_CONNECTED: 'database_connected',
    DATABASE_QUERIED: 'database_queried',
    DATABASE_WRITTEN: 'database_written',
    CACHE_GET: 'cache_get',
    CACHE_SET: 'cache_set',
    FILE_READ: 'file_read',
    FILE_WRITTEN: 'file_written',
    COMPRESSED: 'compressed',
    DECOMPRESSED: 'decompressed',
    ENCRYPTED: 'encrypted',
    DECRYPTED: 'decrypted',
    VALIDATED: 'validated',
    SERIALIZED: 'serialized',
    DESERIALIZED: 'deserialized',
    ENCODED: 'encoded',
    DECODED: 'decoded',
    BACKUP_CREATED: 'backup_created',
    BACKUP_RESTORED: 'backup_restored',
    CLEANUP_PROCESSED: 'cleanup_processed',
    OPTIMIZATION_PROCESSED: 'optimization_processed',
    SECURITY_SCANNED: 'security_scanned',
    PERFORMANCE_ANALYZED: 'performance_analyzed',
    RESOURCE_ANALYZED: 'resource_analyzed',
    COMMUNICATION_ANALYZED: 'communication_analyzed',
    WORKFLOW_ANALYZED: 'workflow_analyzed',
    MONITORING_ANALYZED: 'monitoring_analyzed',
    TASK_ANALYZED: 'task_analyzed',
    SYSTEM_ANALYZED: 'system_analyzed',
    CUSTOM_ANALYZED: 'custom_analyzed',
    LOG_LIMIT_EXCEEDED: 'log_limit_exceeded',
    CONFIG_LIMIT_EXCEEDED: 'config_limit_exceeded',
    DATABASE_LIMIT_EXCEEDED: 'database_limit_exceeded',
    CACHE_LIMIT_EXCEEDED: 'cache_limit_exceeded',
    FILE_LIMIT_EXCEEDED: 'file_limit_exceeded',
    COMPRESSION_LIMIT_EXCEEDED: 'compression_limit_exceeded',
    ENCRYPTION_LIMIT_EXCEEDED: 'encryption_limit_exceeded',
    VALIDATION_LIMIT_EXCEEDED: 'validation_limit_exceeded',
    SERIALIZATION_LIMIT_EXCEEDED: 'serialization_limit_exceeded',
    ENCODING_LIMIT_EXCEEDED: 'encoding_limit_exceeded',
    BACKUP_LIMIT_EXCEEDED: 'backup_limit_exceeded',
    CONFIGURATION_ERROR: 'configuration_error',
    RESOURCE_EXHAUSTED: 'resource_exhausted',
    PERMISSION_DENIED: 'permission_denied',
    INVALID_LOG: 'invalid_log',
    INVALID_CONFIG: 'invalid_config',
    INVALID_DATABASE: 'invalid_database',
    INVALID_CACHE: 'invalid_cache',
    INVALID_FILE: 'invalid_file',
    INVALID_COMPRESSION: 'invalid_compression',
    INVALID_ENCRYPTION: 'invalid_encryption',
    INVALID_VALIDATION: 'invalid_validation',
    INVALID_SERIALIZATION: 'invalid_serialization',
    INVALID_ENCODING: 'invalid_encoding',
    INVALID_BACKUP: 'invalid_backup',
    INVALID_CLEANUP: 'invalid_cleanup',
    INVALID_OPTIMIZATION: 'invalid_optimization',
    INVALID_SECURITY: 'invalid_security',
    INVALID_PERFORMANCE: 'invalid_performance',
    INVALID_RESOURCE: 'invalid_resource',
    INVALID_COMMUNICATION: 'invalid_communication',
    INVALID_WORKFLOW: 'invalid_workflow',
    INVALID_MONITORING: 'invalid_monitoring',
    INVALID_TASK: 'invalid_task',
    INVALID_SYSTEM: 'invalid_system',
    INVALID_CUSTOM: 'invalid_custom'
  }
} as const;

// Exportar tipos derivados de las constantes
export type LogLevel = typeof UTILITY_CONSTANTS.LOG_LEVELS[keyof typeof UTILITY_CONSTANTS.LOG_LEVELS];
export type LogFormat = typeof UTILITY_CONSTANTS.LOG_FORMATS[keyof typeof UTILITY_CONSTANTS.LOG_FORMATS];
export type LogDestination = typeof UTILITY_CONSTANTS.LOG_DESTINATIONS[keyof typeof UTILITY_CONSTANTS.LOG_DESTINATIONS];
export type ConfigType = typeof UTILITY_CONSTANTS.CONFIG_TYPES[keyof typeof UTILITY_CONSTANTS.CONFIG_TYPES];
export type ConfigFormat = typeof UTILITY_CONSTANTS.CONFIG_FORMATS[keyof typeof UTILITY_CONSTANTS.CONFIG_FORMATS];
export type DatabaseType = typeof UTILITY_CONSTANTS.DATABASE_TYPES[keyof typeof UTILITY_CONSTANTS.DATABASE_TYPES];
export type CacheType = typeof UTILITY_CONSTANTS.CACHE_TYPES[keyof typeof UTILITY_CONSTANTS.CACHE_TYPES];
export type FileType = typeof UTILITY_CONSTANTS.FILE_TYPES[keyof typeof UTILITY_CONSTANTS.FILE_TYPES];
export type FileExtension = typeof UTILITY_CONSTANTS.FILE_EXTENSIONS[keyof typeof UTILITY_CONSTANTS.FILE_EXTENSIONS];
export type CompressionType = typeof UTILITY_CONSTANTS.COMPRESSION_TYPES[keyof typeof UTILITY_CONSTANTS.COMPRESSION_TYPES];
export type EncryptionType = typeof UTILITY_CONSTANTS.ENCRYPTION_TYPES[keyof typeof UTILITY_CONSTANTS.ENCRYPTION_TYPES];
export type ValidationType = typeof UTILITY_CONSTANTS.VALIDATION_TYPES[keyof typeof UTILITY_CONSTANTS.VALIDATION_TYPES];
export type SerializationType = typeof UTILITY_CONSTANTS.SERIALIZATION_TYPES[keyof typeof UTILITY_CONSTANTS.SERIALIZATION_TYPES];
export type EncodingType = typeof UTILITY_CONSTANTS.ENCODING_TYPES[keyof typeof UTILITY_CONSTANTS.ENCODING_TYPES];