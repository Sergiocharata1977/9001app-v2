module.exports = {
  apps: [
    {
      name: 'iso-flow-backend',
      script: 'backend/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'iso-flow-frontend',
      script: 'frontend/scripts/serve.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'agent-coordinator',
      script: 'scripts/agent-coordinator.js',
      instances: 1,
      autorestart: true,
      watch: false,
      cron_restart: '*/15 * * * *', // Cada 15 minutos
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'database-tracker',
      script: 'scripts/database-tracker.js',
      instances: 1,
      autorestart: true,
      watch: false,
      cron_restart: '0 */12 * * *', // Cada 12 horas
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'auto-cleanup',
      script: 'scripts/auto-cleanup.js',
      instances: 1,
      autorestart: false, // No reiniciar automáticamente
      watch: false,
      cron_restart: '0 2 */2 * *', // Cada 2 días a las 2:00 AM
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
