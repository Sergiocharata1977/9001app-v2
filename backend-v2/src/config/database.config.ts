import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'isoflow4',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'isoflow4_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || false,
  ssl: process.env.DB_SSL === 'true' || false,
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 100,
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 60000,
  
  // Multi-tenant configuration
  enableRowLevelSecurity: process.env.DB_RLS_ENABLED === 'true' || true,
  defaultSchema: process.env.DB_DEFAULT_SCHEMA || 'public',
  
  // Performance optimizations
  poolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 20,
  acquireConnectionTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
  idleConnectionTimeout: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 180000,
  reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL, 10) || 10000,
  
  // Backup and retention
  backupEnabled: process.env.DB_BACKUP_ENABLED === 'true' || true,
  backupRetentionDays: parseInt(process.env.DB_BACKUP_RETENTION_DAYS, 10) || 30,
  
  // Audit configuration
  auditTablePrefix: process.env.DB_AUDIT_PREFIX || 'audit_',
  enableAuditLog: process.env.DB_AUDIT_ENABLED === 'true' || true,
}));