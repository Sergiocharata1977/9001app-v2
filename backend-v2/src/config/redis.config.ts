import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  // Connection settings
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  
  // Connection pool
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES, 10) || 3,
  retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY, 10) || 100,
  enableReadyCheck: process.env.REDIS_READY_CHECK === 'true' || true,
  maxLoadingTimeout: parseInt(process.env.REDIS_LOADING_TIMEOUT, 10) || 5000,
  
  // Cache configuration
  ttl: parseInt(process.env.REDIS_TTL, 10) || 3600, // 1 hour default
  max: parseInt(process.env.REDIS_MAX_ITEMS, 10) || 1000,
  
  // Session store
  session: {
    prefix: process.env.REDIS_SESSION_PREFIX || 'sess:',
    ttl: parseInt(process.env.REDIS_SESSION_TTL, 10) || 86400, // 24 hours
  },
  
  // Rate limiting store
  rateLimit: {
    prefix: process.env.REDIS_RATE_LIMIT_PREFIX || 'rl:',
    ttl: parseInt(process.env.REDIS_RATE_LIMIT_TTL, 10) || 3600, // 1 hour
  },
  
  // Queue configuration
  queue: {
    prefix: process.env.REDIS_QUEUE_PREFIX || 'bull:',
    defaultJobOptions: {
      removeOnComplete: parseInt(process.env.REDIS_QUEUE_COMPLETE_JOBS, 10) || 10,
      removeOnFail: parseInt(process.env.REDIS_QUEUE_FAILED_JOBS, 10) || 50,
      attempts: parseInt(process.env.REDIS_QUEUE_ATTEMPTS, 10) || 3,
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.REDIS_QUEUE_BACKOFF_DELAY, 10) || 2000,
      },
    },
  },
  
  // Cluster configuration (for production)
  cluster: {
    enabled: process.env.REDIS_CLUSTER_ENABLED === 'true' || false,
    nodes: process.env.REDIS_CLUSTER_NODES?.split(',') || [],
    options: {
      enableOfflineQueue: false,
      redisOptions: {
        password: process.env.REDIS_PASSWORD || '',
      },
    },
  },
  
  // Sentinel configuration (for high availability)
  sentinel: {
    enabled: process.env.REDIS_SENTINEL_ENABLED === 'true' || false,
    sentinels: process.env.REDIS_SENTINELS?.split(',').map(s => {
      const [host, port] = s.split(':');
      return { host, port: parseInt(port, 10) };
    }) || [],
    name: process.env.REDIS_SENTINEL_NAME || 'mymaster',
    password: process.env.REDIS_SENTINEL_PASSWORD || '',
  },
  
  // TLS configuration
  tls: {
    enabled: process.env.REDIS_TLS_ENABLED === 'true' || false,
    ca: process.env.REDIS_TLS_CA || '',
    cert: process.env.REDIS_TLS_CERT || '',
    key: process.env.REDIS_TLS_KEY || '',
    rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED === 'true' || true,
  },
  
  // Monitoring and health checks
  monitoring: {
    enabled: process.env.REDIS_MONITORING_ENABLED === 'true' || true,
    healthCheckInterval: parseInt(process.env.REDIS_HEALTH_CHECK_INTERVAL, 10) || 30000, // 30 seconds
    connectionTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT, 10) || 10000, // 10 seconds
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT, 10) || 5000, // 5 seconds
  },
}));