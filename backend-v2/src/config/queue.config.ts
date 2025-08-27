import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  // Redis connection for queues
  redis: {
    host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.QUEUE_REDIS_PORT, 10) || parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.QUEUE_REDIS_PASSWORD || process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.QUEUE_REDIS_DB, 10) || 1, // Different DB for queues
  },
  
  // Default job options
  defaultJobOptions: {
    removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE, 10) || 10,
    removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL, 10) || 50,
    attempts: parseInt(process.env.QUEUE_DEFAULT_ATTEMPTS, 10) || 3,
    backoff: {
      type: process.env.QUEUE_BACKOFF_TYPE || 'exponential',
      delay: parseInt(process.env.QUEUE_BACKOFF_DELAY, 10) || 2000,
    },
    delay: parseInt(process.env.QUEUE_DEFAULT_DELAY, 10) || 0,
  },
  
  // Queue definitions
  queues: {
    // Document processing queue
    documents: {
      name: 'documents',
      concurrency: parseInt(process.env.QUEUE_DOCUMENTS_CONCURRENCY, 10) || 5,
      jobs: {
        generatePdf: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 5,
        },
        processUpload: {
          attempts: 2,
          backoff: { type: 'fixed', delay: 3000 },
          removeOnComplete: 10,
        },
        indexContent: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 20,
        },
        generateThumbnail: {
          attempts: 2,
          backoff: { type: 'fixed', delay: 1000 },
          removeOnComplete: 10,
        },
      },
    },
    
    // Notification queue
    notifications: {
      name: 'notifications',
      concurrency: parseInt(process.env.QUEUE_NOTIFICATIONS_CONCURRENCY, 10) || 10,
      jobs: {
        sendEmail: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 50,
        },
        sendSms: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 50,
        },
        sendWhatsapp: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 50,
        },
        sendSlack: {
          attempts: 2,
          backoff: { type: 'fixed', delay: 1000 },
          removeOnComplete: 100,
        },
        reminder: {
          attempts: 3,
          backoff: { type: 'fixed', delay: 60000 }, // 1 minute
          removeOnComplete: 20,
        },
      },
    },
    
    // Reports and analytics queue
    reports: {
      name: 'reports',
      concurrency: parseInt(process.env.QUEUE_REPORTS_CONCURRENCY, 10) || 3,
      jobs: {
        generateReport: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 10000 },
          removeOnComplete: 5,
          timeout: 300000, // 5 minutes
        },
        exportData: {
          attempts: 2,
          backoff: { type: 'fixed', delay: 5000 },
          removeOnComplete: 10,
          timeout: 180000, // 3 minutes
        },
        calculateMetrics: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: 10,
        },
        syncKpis: {
          attempts: 3,
          backoff: { type: 'fixed', delay: 5000 },
          removeOnComplete: 20,
        },
      },
    },
    
    // Search indexing queue
    search: {
      name: 'search',
      concurrency: parseInt(process.env.QUEUE_SEARCH_CONCURRENCY, 10) || 5,
      jobs: {
        indexDocument: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 50,
        },
        reindexAll: {
          attempts: 1,
          removeOnComplete: 1,
          timeout: 3600000, // 1 hour
        },
        updateIndex: {
          attempts: 3,
          backoff: { type: 'fixed', delay: 1000 },
          removeOnComplete: 100,
        },
      },
    },
    
    // Audit and compliance queue
    audit: {
      name: 'audit',
      concurrency: parseInt(process.env.QUEUE_AUDIT_CONCURRENCY, 10) || 2,
      jobs: {
        generateAuditTrail: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
        },
        complianceCheck: {
          attempts: 2,
          backoff: { type: 'fixed', delay: 10000 },
          removeOnComplete: 20,
        },
        scheduleAudit: {
          attempts: 3,
          backoff: { type: 'fixed', delay: 60000 },
          removeOnComplete: 10,
        },
      },
    },
    
    // Integration queue
    integrations: {
      name: 'integrations',
      concurrency: parseInt(process.env.QUEUE_INTEGRATIONS_CONCURRENCY, 10) || 3,
      jobs: {
        webhookDelivery: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 100,
        },
        erpSync: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 20,
        },
        crmSync: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 20,
        },
        dataImport: {
          attempts: 2,
          backoff: { type: 'fixed', delay: 10000 },
          removeOnComplete: 5,
          timeout: 1800000, // 30 minutes
        },
      },
    },
  },
  
  // Scheduled jobs (cron-like)
  scheduledJobs: {
    // Daily backup
    dailyBackup: {
      cron: process.env.CRON_DAILY_BACKUP || '0 2 * * *', // 2 AM daily
      timezone: process.env.CRON_TIMEZONE || 'UTC',
      enabled: process.env.CRON_BACKUP_ENABLED === 'true' || true,
    },
    
    // KPI calculation
    kpiCalculation: {
      cron: process.env.CRON_KPI_CALCULATION || '0 */6 * * *', // Every 6 hours
      timezone: process.env.CRON_TIMEZONE || 'UTC',
      enabled: process.env.CRON_KPI_ENABLED === 'true' || true,
    },
    
    // Reminder notifications
    reminderCheck: {
      cron: process.env.CRON_REMINDER_CHECK || '*/15 * * * *', // Every 15 minutes
      timezone: process.env.CRON_TIMEZONE || 'UTC',
      enabled: process.env.CRON_REMINDER_ENABLED === 'true' || true,
    },
    
    // Cleanup old files
    cleanupFiles: {
      cron: process.env.CRON_CLEANUP_FILES || '0 3 * * 0', // 3 AM every Sunday
      timezone: process.env.CRON_TIMEZONE || 'UTC',
      enabled: process.env.CRON_CLEANUP_ENABLED === 'true' || true,
    },
    
    // Health check all systems
    healthCheck: {
      cron: process.env.CRON_HEALTH_CHECK || '*/5 * * * *', // Every 5 minutes
      timezone: process.env.CRON_TIMEZONE || 'UTC',
      enabled: process.env.CRON_HEALTH_ENABLED === 'true' || true,
    },
  },
  
  // Queue monitoring
  monitoring: {
    enabled: process.env.QUEUE_MONITORING_ENABLED === 'true' || true,
    dashboard: {
      enabled: process.env.QUEUE_DASHBOARD_ENABLED === 'true' || true,
      port: parseInt(process.env.QUEUE_DASHBOARD_PORT, 10) || 3001,
      username: process.env.QUEUE_DASHBOARD_USERNAME || 'admin',
      password: process.env.QUEUE_DASHBOARD_PASSWORD || 'admin123',
    },
    alerts: {
      enabled: process.env.QUEUE_ALERTS_ENABLED === 'true' || true,
      failedJobsThreshold: parseInt(process.env.QUEUE_FAILED_THRESHOLD, 10) || 10,
      stalledJobsThreshold: parseInt(process.env.QUEUE_STALLED_THRESHOLD, 10) || 5,
      delayThreshold: parseInt(process.env.QUEUE_DELAY_THRESHOLD, 10) || 60000, // 1 minute
    },
  },
}));