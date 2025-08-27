import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Configuración de niveles de log personalizados
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  ai: 5, // Nivel especial para logs de IA
  trace: 6
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
  ai: 'cyan',
  trace: 'gray'
};

winston.addColors(logColors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Configuración de rotación de archivos
const fileRotateTransport = new DailyRotateFile({
  filename: path.join('logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error'
});

const aiFileRotateTransport = new DailyRotateFile({
  filename: path.join('logs', 'ai-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'ai'
});

// Configuración del logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: { 
    service: 'isoflow4-backend',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Consola
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),
    
    // Archivos de rotación
    fileRotateTransport,
    errorFileRotateTransport,
    aiFileRotateTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'exceptions.log'),
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'rejections.log'),
      format: logFormat
    })
  ]
});

// Logger especializado para IA
export const aiLogger = winston.createLogger({
  levels: logLevels,
  level: 'ai',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, agent, organization, ...meta }) => {
      let log = `${timestamp} [AI-${level.toUpperCase()}]`;
      
      if (agent) {
        log += ` [Agent: ${agent}]`;
      }
      
      if (organization) {
        log += ` [Org: ${organization}]`;
      }
      
      log += `: ${message}`;
      
      if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
      }
      
      return log;
    })
  ),
  transports: [
    aiFileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, agent, organization, ...meta }) => {
          let log = `${timestamp} [AI-${level}]`;
          
          if (agent) {
            log += ` [${agent}]`;
          }
          
          if (organization) {
            log += ` [${organization}]`;
          }
          
          log += `: ${message}`;
          
          if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
          }
          
          return log;
        })
      )
    })
  ]
});

// Logger especializado para métricas
export const metricsLogger = winston.createLogger({
  levels: logLevels,
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join('logs', 'metrics-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

// Logger especializado para auditoría
export const auditLogger = winston.createLogger({
  levels: logLevels,
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, user, organization, action, resource, ...meta }) => {
      let log = `${timestamp} [AUDIT-${level.toUpperCase()}]`;
      
      if (user) {
        log += ` [User: ${user}]`;
      }
      
      if (organization) {
        log += ` [Org: ${organization}]`;
      }
      
      if (action) {
        log += ` [Action: ${action}]`;
      }
      
      if (resource) {
        log += ` [Resource: ${resource}]`;
      }
      
      log += `: ${message}`;
      
      if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
      }
      
      return log;
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join('logs', 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d'
    })
  ]
});

// Funciones helper para logging estructurado
export const logAI = (message: string, meta?: any) => {
  aiLogger.log('ai', message, meta);
};

export const logMetrics = (message: string, metrics: any) => {
  metricsLogger.info(message, { metrics });
};

export const logAudit = (message: string, auditData: {
  user?: string;
  organization?: string;
  action: string;
  resource: string;
  details?: any;
}) => {
  auditLogger.info(message, auditData);
};

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    ...meta
  });
};

export const logWarning = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHTTP = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Middleware para logging de requests HTTP
export const httpLogger = winston.createLogger({
  levels: logLevels,
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, method, url, status, responseTime, ip, userAgent, ...meta }) => {
      let log = `${timestamp} [HTTP-${level.toUpperCase()}] ${method} ${url} ${status} ${responseTime}ms`;
      
      if (ip) {
        log += ` [IP: ${ip}]`;
      }
      
      if (userAgent) {
        log += ` [UA: ${userAgent}]`;
      }
      
      log += `: ${message}`;
      
      if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
      }
      
      return log;
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join('logs', 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
});

// Función para limpiar logs antiguos
export const cleanupOldLogs = async () => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const logsDir = path.join(process.cwd(), 'logs');
    
    const files = await fs.readdir(logsDir);
    const now = Date.now();
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 días
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        logger.info(`🗑️ Log antiguo eliminado: ${file}`);
      }
    }
  } catch (error) {
    logger.error('❌ Error limpiando logs antiguos:', error);
  }
};

// Función para obtener estadísticas de logs
export const getLogStats = async () => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const logsDir = path.join(process.cwd(), 'logs');
    
    const files = await fs.readdir(logsDir);
    const stats = {
      totalFiles: files.length,
      totalSize: 0,
      fileTypes: {} as Record<string, number>
    };
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const fileStats = await fs.stat(filePath);
      stats.totalSize += fileStats.size;
      
      const fileType = path.extname(file);
      stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1;
    }
    
    return stats;
  } catch (error) {
    logger.error('❌ Error obteniendo estadísticas de logs:', error);
    return null;
  }
};

export default logger;