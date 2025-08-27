// Constantes para el sistema de comunicación
export const COMMUNICATION_CONSTANTS = {
  // Protocolos de comunicación
  PROTOCOLS: {
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

  // Estados de mensajes
  MESSAGE_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    ACKNOWLEDGED: 'acknowledged',
    FAILED: 'failed',
    TIMEOUT: 'timeout',
    CANCELLED: 'cancelled',
    RETRYING: 'retrying'
  },

  // Tipos de canales
  CHANNEL_TYPES: {
    DIRECT: 'direct',
    BROADCAST: 'broadcast',
    MULTICAST: 'multicast',
    ANYCAST: 'anycast',
    QUEUE: 'queue',
    PUBSUB: 'pubsub',
    STREAM: 'stream',
    RPC: 'rpc'
  },

  // Estados de canales
  CHANNEL_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CONNECTING: 'connecting',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
    MAINTENANCE: 'maintenance'
  },

  // Tipos de colas
  QUEUE_TYPES: {
    FIFO: 'fifo',
    LIFO: 'lifo',
    PRIORITY: 'priority',
    ROUND_ROBIN: 'round_robin',
    WEIGHTED: 'weighted',
    DEAD_LETTER: 'dead_letter'
  },

  // Estados de colas
  QUEUE_STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    FULL: 'full',
    EMPTY: 'empty',
    ERROR: 'error',
    MAINTENANCE: 'maintenance'
  },

  // Tipos de protocolos
  PROTOCOL_TYPES: {
    REQUEST_RESPONSE: 'request_response',
    PUBLISH_SUBSCRIBE: 'publish_subscribe',
    STREAM: 'stream',
    MESSAGE_QUEUE: 'message_queue',
    RPC: 'rpc',
    EVENT_DRIVEN: 'event_driven'
  },

  // Tipos de enrutadores
  ROUTER_TYPES: {
    DIRECT: 'direct',
    TOPIC: 'topic',
    HEADER: 'header',
    CONTENT: 'content',
    LOAD_BALANCER: 'load_balancer',
    FAILOVER: 'failover',
    MULTICAST: 'multicast'
  },

  // Estrategias de enrutamiento
  ROUTING_STRATEGIES: {
    DIRECT: 'direct',
    HIERARCHICAL: 'hierarchical',
    PEER_TO_PEER: 'peer_to_peer',
    HUB_AND_SPOKE: 'hub_and_spoke',
    MESH: 'mesh',
    TREE: 'tree',
    RING: 'ring',
    STAR: 'star'
  },

  // Algoritmos de balanceo de carga
  LOAD_BALANCING_ALGORITHMS: {
    ROUND_ROBIN: 'round_robin',
    LEAST_CONNECTIONS: 'least_connections',
    WEIGHTED_ROUND_ROBIN: 'weighted_round_robin',
    LEAST_RESPONSE_TIME: 'least_response_time',
    IP_HASH: 'ip_hash',
    URL_HASH: 'url_hash',
    RANDOM: 'random',
    CUSTOM: 'custom'
  },

  // Estrategias de failover
  FAILOVER_STRATEGIES: {
    ACTIVE_PASSIVE: 'active_passive',
    ACTIVE_ACTIVE: 'active_active',
    N_PLUS_1: 'n_plus_1',
    GEOGRAPHIC: 'geographic',
    LOAD_BASED: 'load_based',
    PRIORITY_BASED: 'priority_based'
  },

  // Estrategias de recuperación
  RECOVERY_STRATEGIES: {
    RESTART: 'restart',
    REDEPLOY: 'redeploy',
    MIGRATE: 'migrate',
    RESTORE: 'restore',
    REBUILD: 'rebuild',
    CUSTOM: 'custom'
  },

  // Configuración por defecto
  DEFAULT_CONFIG: {
    TIMEOUT: 30000, // 30 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 segundo
    MAX_MESSAGE_SIZE: 1048576, // 1 MB
    MAX_QUEUE_SIZE: 10000,
    MAX_CONNECTIONS: 100,
    HEARTBEAT_INTERVAL: 30000, // 30 segundos
    CONNECTION_TIMEOUT: 10000, // 10 segundos
    READ_TIMEOUT: 30000, // 30 segundos
    WRITE_TIMEOUT: 30000, // 30 segundos
    KEEP_ALIVE: true,
    COMPRESSION: false,
    ENCRYPTION: false
  },

  // Límites del sistema
  SYSTEM_LIMITS: {
    MAX_MESSAGE_SIZE: 10485760, // 10 MB
    MAX_QUEUE_SIZE: 100000,
    MAX_CONNECTIONS: 1000,
    MAX_CHANNELS: 100,
    MAX_SUBSCRIPTIONS: 1000,
    MAX_TOPICS: 1000,
    MAX_ROUTES: 1000,
    MAX_RETRIES: 5,
    MAX_TIMEOUT: 300000, // 5 minutos
    MAX_BANDWIDTH: 1073741824 // 1 GB
  },

  // Timeouts
  TIMEOUTS: {
    CONNECTION: 10000, // 10 segundos
    READ: 30000, // 30 segundos
    WRITE: 30000, // 30 segundos
    MESSAGE_DELIVERY: 10000, // 10 segundos
    ACKNOWLEDGMENT: 5000, // 5 segundos
    HEARTBEAT: 30000, // 30 segundos
    KEEP_ALIVE: 60000, // 1 minuto
    RECONNECT: 5000, // 5 segundos
    FAILOVER: 30000, // 30 segundos
    RECOVERY: 60000 // 1 minuto
  },

  // Intervalos
  INTERVALS: {
    HEARTBEAT: 30000, // 30 segundos
    KEEP_ALIVE: 60000, // 1 minuto
    HEALTH_CHECK: 60000, // 1 minuto
    METRICS_COLLECTION: 30000, // 30 segundos
    CONNECTION_POOL_CLEANUP: 300000, // 5 minutos
    QUEUE_CLEANUP: 600000, // 10 minutos
    CACHE_CLEANUP: 300000, // 5 minutos
    LOG_ROTATION: 86400000, // 24 horas
    PERFORMANCE_MONITORING: 60000, // 1 minuto
    SECURITY_AUDIT: 3600000 // 1 hora
  },

  // Códigos de error
  ERROR_CODES: {
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
    CONNECTION_CLOSED: 'CONNECTION_CLOSED',
    MESSAGE_SEND_FAILED: 'MESSAGE_SEND_FAILED',
    MESSAGE_RECEIVE_FAILED: 'MESSAGE_RECEIVE_FAILED',
    MESSAGE_TIMEOUT: 'MESSAGE_TIMEOUT',
    MESSAGE_TOO_LARGE: 'MESSAGE_TOO_LARGE',
    QUEUE_FULL: 'QUEUE_FULL',
    QUEUE_EMPTY: 'QUEUE_EMPTY',
    QUEUE_NOT_FOUND: 'QUEUE_NOT_FOUND',
    CHANNEL_NOT_FOUND: 'CHANNEL_NOT_FOUND',
    CHANNEL_CLOSED: 'CHANNEL_CLOSED',
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
    ROUTE_FAILED: 'ROUTE_FAILED',
    PROTOCOL_ERROR: 'PROTOCOL_ERROR',
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
    ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
    DECRYPTION_ERROR: 'DECRYPTION_ERROR',
    COMPRESSION_ERROR: 'COMPRESSION_ERROR',
    DECOMPRESSION_ERROR: 'DECOMPRESSION_ERROR',
    SERIALIZATION_ERROR: 'SERIALIZATION_ERROR',
    DESERIALIZATION_ERROR: 'DESERIALIZATION_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    BANDWIDTH_EXCEEDED: 'BANDWIDTH_EXCEEDED',
    RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    DNS_ERROR: 'DNS_ERROR',
    SSL_ERROR: 'SSL_ERROR',
    CERTIFICATE_ERROR: 'CERTIFICATE_ERROR',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
  },

  // Eventos de comunicación
  EVENTS: {
    CONNECTION_ESTABLISHED: 'connection_established',
    CONNECTION_LOST: 'connection_lost',
    CONNECTION_FAILED: 'connection_failed',
    MESSAGE_SENT: 'message_sent',
    MESSAGE_RECEIVED: 'message_received',
    MESSAGE_DELIVERED: 'message_delivered',
    MESSAGE_ACKNOWLEDGED: 'message_acknowledged',
    MESSAGE_FAILED: 'message_failed',
    MESSAGE_TIMEOUT: 'message_timeout',
    MESSAGE_RETRY: 'message_retry',
    QUEUE_CREATED: 'queue_created',
    QUEUE_DELETED: 'queue_deleted',
    QUEUE_FULL: 'queue_full',
    QUEUE_EMPTY: 'queue_empty',
    CHANNEL_CREATED: 'channel_created',
    CHANNEL_DELETED: 'channel_deleted',
    CHANNEL_CLOSED: 'channel_closed',
    ROUTE_CREATED: 'route_created',
    ROUTE_DELETED: 'route_deleted',
    ROUTE_FAILED: 'route_failed',
    PROTOCOL_ERROR: 'protocol_error',
    AUTHENTICATION_FAILED: 'authentication_failed',
    AUTHORIZATION_FAILED: 'authorization_failed',
    ENCRYPTION_ERROR: 'encryption_error',
    DECRYPTION_ERROR: 'decryption_error',
    COMPRESSION_ERROR: 'compression_error',
    DECOMPRESSION_ERROR: 'decompression_error',
    SERIALIZATION_ERROR: 'serialization_error',
    DESERIALIZATION_ERROR: 'deserialization_error',
    VALIDATION_ERROR: 'validation_error',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    BANDWIDTH_EXCEEDED: 'bandwidth_exceeded',
    RESOURCE_EXHAUSTED: 'resource_exhausted',
    NETWORK_ERROR: 'network_error',
    DNS_ERROR: 'dns_error',
    SSL_ERROR: 'ssl_error',
    CERTIFICATE_ERROR: 'certificate_error',
    CONFIGURATION_ERROR: 'configuration_error'
  },

  // Configuración de seguridad
  SECURITY: {
    ENCRYPTION_ALGORITHMS: {
      AES_256: 'aes-256-gcm',
      AES_128: 'aes-128-gcm',
      CHACHA20: 'chacha20-poly1305',
      RSA_2048: 'rsa-2048',
      RSA_4096: 'rsa-4096',
      ECDSA_P256: 'ecdsa-p256',
      ECDSA_P384: 'ecdsa-p384'
    },
    HASH_ALGORITHMS: {
      SHA_256: 'sha256',
      SHA_384: 'sha384',
      SHA_512: 'sha512',
      BLAKE2B: 'blake2b',
      BLAKE3: 'blake3'
    },
    KEY_SIZES: {
      AES_128: 128,
      AES_256: 256,
      RSA_2048: 2048,
      RSA_4096: 4096,
      ECDSA_P256: 256,
      ECDSA_P384: 384
    },
    AUTHENTICATION_METHODS: {
      NONE: 'none',
      TOKEN: 'token',
      CERTIFICATE: 'certificate',
      API_KEY: 'api_key',
      OAUTH: 'oauth',
      SAML: 'saml',
      LDAP: 'ldap',
      KERBEROS: 'kerberos',
      RADIUS: 'radius',
      TACACS: 'tacacs',
      CUSTOM: 'custom'
    },
    AUTHORIZATION_MODELS: {
      NONE: 'none',
      ROLE_BASED: 'role_based',
      ATTRIBUTE_BASED: 'attribute_based',
      POLICY_BASED: 'policy_based',
      IDENTITY_BASED: 'identity_based',
      HYBRID: 'hybrid',
      ZERO_TRUST: 'zero_trust',
      JUST_IN_TIME: 'just_in_time',
      RISK_BASED: 'risk_based'
    }
  },

  // Configuración de compresión
  COMPRESSION: {
    ALGORITHMS: {
      NONE: 'none',
      GZIP: 'gzip',
      DEFLATE: 'deflate',
      BROTLI: 'brotli',
      LZ4: 'lz4',
      ZSTD: 'zstd',
      SNAPPY: 'snappy'
    },
    LEVELS: {
      NONE: 0,
      FAST: 1,
      DEFAULT: 6,
      BEST: 9
    },
    THRESHOLDS: {
      MIN_SIZE: 1024, // 1 KB
      MAX_SIZE: 10485760, // 10 MB
      RATIO_THRESHOLD: 0.8
    }
  },

  // Configuración de serialización
  SERIALIZATION: {
    FORMATS: {
      JSON: 'json',
      XML: 'xml',
      YAML: 'yaml',
      PROTOBUF: 'protobuf',
      AVRO: 'avro',
      MESSAGE_PACK: 'msgpack',
      BSON: 'bson',
      CBOR: 'cbor'
    },
    OPTIONS: {
      PRETTY_PRINT: false,
      COMPACT: true,
      VALIDATE: true,
      STRICT: false,
      IGNORE_UNKNOWN: true
    }
  },

  // Configuración de validación
  VALIDATION: {
    SCHEMAS: {
      MESSAGE: 'message_schema',
      TASK: 'task_schema',
      WORKFLOW: 'workflow_schema',
      AGENT: 'agent_schema',
      EVENT: 'event_schema'
    },
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
    }
  },

  // Configuración de monitoreo
  MONITORING: {
    METRICS: {
      MESSAGES_SENT: 'messages_sent',
      MESSAGES_RECEIVED: 'messages_received',
      MESSAGES_FAILED: 'messages_failed',
      AVERAGE_LATENCY: 'average_latency',
      BANDWIDTH_USAGE: 'bandwidth_usage',
      CONNECTION_COUNT: 'connection_count',
      ERROR_RATE: 'error_rate',
      THROUGHPUT: 'throughput',
      QUEUE_SIZE: 'queue_size',
      QUEUE_DEPTH: 'queue_depth',
      RESPONSE_TIME: 'response_time',
      SUCCESS_RATE: 'success_rate',
      RETRY_COUNT: 'retry_count',
      TIMEOUT_COUNT: 'timeout_count'
    },
    ALERTS: {
      HIGH_LATENCY: 'high_latency',
      HIGH_ERROR_RATE: 'high_error_rate',
      QUEUE_FULL: 'queue_full',
      CONNECTION_FAILURE: 'connection_failure',
      BANDWIDTH_EXCEEDED: 'bandwidth_exceeded',
      RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
      AUTHENTICATION_FAILURE: 'authentication_failure',
      AUTHORIZATION_FAILURE: 'authorization_failure',
      ENCRYPTION_FAILURE: 'encryption_failure',
      VALIDATION_FAILURE: 'validation_failure'
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
      CONNECTION: 'connection',
      MESSAGE: 'message',
      QUEUE: 'queue',
      CHANNEL: 'channel',
      ROUTE: 'route',
      PROTOCOL: 'protocol',
      SECURITY: 'security',
      PERFORMANCE: 'performance',
      ERROR: 'error'
    }
  }
} as const;

// Exportar tipos derivados de las constantes
export type CommunicationProtocol = typeof COMMUNICATION_CONSTANTS.PROTOCOLS[keyof typeof COMMUNICATION_CONSTANTS.PROTOCOLS];
export type MessageType = typeof COMMUNICATION_CONSTANTS.MESSAGE_TYPES[keyof typeof COMMUNICATION_CONSTANTS.MESSAGE_TYPES];
export type MessagePriority = typeof COMMUNICATION_CONSTANTS.MESSAGE_PRIORITY[keyof typeof COMMUNICATION_CONSTANTS.MESSAGE_PRIORITY];
export type MessageStatus = typeof COMMUNICATION_CONSTANTS.MESSAGE_STATUS[keyof typeof COMMUNICATION_CONSTANTS.MESSAGE_STATUS];
export type ChannelType = typeof COMMUNICATION_CONSTANTS.CHANNEL_TYPES[keyof typeof COMMUNICATION_CONSTANTS.CHANNEL_TYPES];
export type ChannelStatus = typeof COMMUNICATION_CONSTANTS.CHANNEL_STATUS[keyof typeof COMMUNICATION_CONSTANTS.CHANNEL_STATUS];
export type QueueType = typeof COMMUNICATION_CONSTANTS.QUEUE_TYPES[keyof typeof COMMUNICATION_CONSTANTS.QUEUE_TYPES];
export type QueueStatus = typeof COMMUNICATION_CONSTANTS.QUEUE_STATUS[keyof typeof COMMUNICATION_CONSTANTS.QUEUE_STATUS];
export type ProtocolType = typeof COMMUNICATION_CONSTANTS.PROTOCOL_TYPES[keyof typeof COMMUNICATION_CONSTANTS.PROTOCOL_TYPES];
export type RouterType = typeof COMMUNICATION_CONSTANTS.ROUTER_TYPES[keyof typeof COMMUNICATION_CONSTANTS.ROUTER_TYPES];
export type RoutingStrategy = typeof COMMUNICATION_CONSTANTS.ROUTING_STRATEGIES[keyof typeof COMMUNICATION_CONSTANTS.ROUTING_STRATEGIES];
export type LoadBalancingAlgorithm = typeof COMMUNICATION_CONSTANTS.LOAD_BALANCING_ALGORITHMS[keyof typeof COMMUNICATION_CONSTANTS.LOAD_BALANCING_ALGORITHMS];
export type FailoverStrategy = typeof COMMUNICATION_CONSTANTS.FAILOVER_STRATEGIES[keyof typeof COMMUNICATION_CONSTANTS.FAILOVER_STRATEGIES];
export type RecoveryStrategy = typeof COMMUNICATION_CONSTANTS.RECOVERY_STRATEGIES[keyof typeof COMMUNICATION_CONSTANTS.RECOVERY_STRATEGIES];
export type EncryptionAlgorithm = typeof COMMUNICATION_CONSTANTS.SECURITY.ENCRYPTION_ALGORITHMS[keyof typeof COMMUNICATION_CONSTANTS.SECURITY.ENCRYPTION_ALGORITHMS];
export type HashAlgorithm = typeof COMMUNICATION_CONSTANTS.SECURITY.HASH_ALGORITHMS[keyof typeof COMMUNICATION_CONSTANTS.SECURITY.HASH_ALGORITHMS];
export type AuthenticationMethod = typeof COMMUNICATION_CONSTANTS.SECURITY.AUTHENTICATION_METHODS[keyof typeof COMMUNICATION_CONSTANTS.SECURITY.AUTHENTICATION_METHODS];
export type AuthorizationModel = typeof COMMUNICATION_CONSTANTS.SECURITY.AUTHORIZATION_MODELS[keyof typeof COMMUNICATION_CONSTANTS.SECURITY.AUTHORIZATION_MODELS];
export type CompressionAlgorithm = typeof COMMUNICATION_CONSTANTS.COMPRESSION.ALGORITHMS[keyof typeof COMMUNICATION_CONSTANTS.COMPRESSION.ALGORITHMS];
export type SerializationFormat = typeof COMMUNICATION_CONSTANTS.SERIALIZATION.FORMATS[keyof typeof COMMUNICATION_CONSTANTS.SERIALIZATION.FORMATS];
export type ValidationRule = typeof COMMUNICATION_CONSTANTS.VALIDATION.RULES[keyof typeof COMMUNICATION_CONSTANTS.VALIDATION.RULES];
export type LogLevel = typeof COMMUNICATION_CONSTANTS.LOGGING.LEVELS[keyof typeof COMMUNICATION_CONSTANTS.LOGGING.LEVELS];
export type LogFormat = typeof COMMUNICATION_CONSTANTS.LOGGING.FORMATS[keyof typeof COMMUNICATION_CONSTANTS.LOGGING.FORMATS];
export type LogDestination = typeof COMMUNICATION_CONSTANTS.LOGGING.DESTINATIONS[keyof typeof COMMUNICATION_CONSTANTS.LOGGING.DESTINATIONS];
export type LogCategory = typeof COMMUNICATION_CONSTANTS.LOGGING.CATEGORIES[keyof typeof COMMUNICATION_CONSTANTS.LOGGING.CATEGORIES];