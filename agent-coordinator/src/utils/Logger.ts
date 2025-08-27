import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { UTILITY_CONSTANTS, LogLevel, LogFormat, LogDestination } from './constants';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
  error?: Error;
  metadata?: Record<string, any>;
}

export class Logger {
  private context: string;
  private logLevel: LogLevel;
  private logFormat: LogFormat;
  private logDestinations: LogDestination[];
  private logFile: string;
  private maxLogSize: number;
  private maxLogFiles: number;
  private enableCompression: boolean;
  private enableEncryption: boolean;
  private enableValidation: boolean;

  constructor(
    context: string, 
    logLevel: LogLevel = UTILITY_CONSTANTS.DEFAULT_CONFIG.LOG_LEVEL as LogLevel,
    logFormat: LogFormat = UTILITY_CONSTANTS.DEFAULT_CONFIG.LOG_FORMAT as LogFormat,
    logDestinations: LogDestination[] = [UTILITY_CONSTANTS.DEFAULT_CONFIG.LOG_DESTINATION as LogDestination]
  ) {
    this.context = context;
    this.logLevel = logLevel;
    this.logFormat = logFormat;
    this.logDestinations = logDestinations;
    this.logFile = this.getLogFilePath();
    this.maxLogSize = UTILITY_CONSTANTS.SYSTEM_LIMITS.MAX_LOG_SIZE;
    this.maxLogFiles = UTILITY_CONSTANTS.SYSTEM_LIMITS.MAX_LOG_ROTATION;
    this.enableCompression = UTILITY_CONSTANTS.DEFAULT_CONFIG.COMPRESSION_ENABLED;
    this.enableEncryption = UTILITY_CONSTANTS.DEFAULT_CONFIG.ENCRYPTION_ENABLED;
    this.enableValidation = UTILITY_CONSTANTS.DEFAULT_CONFIG.VALIDATION_ENABLED;
    this.ensureLogDirectory();
  }

  /**
   * Log de debug
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  /**
   * Log de información
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Log de advertencia
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Log de error
   */
  error(message: string, error?: Error | any, metadata?: Record<string, any>): void {
    this.log('error', message, undefined, error, metadata);
  }

  /**
   * Log de fatal
   */
  fatal(message: string, error?: Error | any, metadata?: Record<string, any>): void {
    this.log('fatal', message, undefined, error, metadata);
  }

  /**
   * Método principal de logging
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
      error,
      metadata
    };

    // Validar entrada si está habilitado
    if (this.enableValidation && !this.validateLogEntry(entry)) {
      console.error('Invalid log entry:', entry);
      return;
    }

    // Log según destinos configurados
    this.logDestinations.forEach(destination => {
      switch (destination) {
        case 'console':
          this.logToConsole(entry);
          break;
        case 'file':
          this.logToFile(entry);
          break;
        case 'database':
          this.logToDatabase(entry);
          break;
        case 'remote':
          this.logToRemote(entry);
          break;
        case 'email':
          this.logToEmail(entry);
          break;
        case 'webhook':
          this.logToWebhook(entry);
          break;
      }
    });
  }

  /**
   * Verificar si debe hacer log según el nivel
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = UTILITY_CONSTANTS.LOG_LEVELS as LogLevel[];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Validar entrada de log
   */
  private validateLogEntry(entry: LogEntry): boolean {
    if (!entry.timestamp || !entry.level || !entry.context || !entry.message) {
      return false;
    }

    if (!UTILITY_CONSTANTS.LOG_LEVELS.includes(entry.level as any)) {
      return false;
    }

    if (entry.message.length > 10000) {
      return false;
    }

    return true;
  }

  /**
   * Log a consola con colores
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = chalk.gray(entry.timestamp);
    const context = chalk.cyan(`[${entry.context}]`);
    const levelColor = this.getLevelColor(entry.level);
    const levelText = chalk[levelColor](entry.level.toUpperCase().padEnd(5));
    
    let output = `${timestamp} ${levelText} ${context} ${entry.message}`;
    
    if (entry.data) {
      output += ` ${chalk.gray(JSON.stringify(entry.data))}`;
    }
    
    if (entry.error) {
      output += `\n${chalk.red(entry.error.stack || entry.error.message)}`;
    }
    
    console.log(output);
  }

  /**
   * Log a archivo
   */
  private logToFile(entry: LogEntry): void {
    try {
      let logLine = this.formatLogLine(entry);
      
      // Comprimir si está habilitado
      if (this.enableCompression) {
        logLine = this.compressLogLine(logLine);
      }
      
      // Encriptar si está habilitado
      if (this.enableEncryption) {
        logLine = this.encryptLogLine(logLine);
      }
      
      fs.appendFileSync(this.logFile, logLine + '\n');
      
      // Rotar logs si es necesario
      this.rotateLogsIfNeeded();
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  /**
   * Formatear línea de log para archivo
   */
  private formatLogLine(entry: LogEntry): string {
    let line: string;

    switch (this.logFormat) {
      case 'json':
        line = JSON.stringify(entry);
        break;
      case 'structured':
        line = this.formatStructuredLog(entry);
        break;
      case 'compact':
        line = this.formatCompactLog(entry);
        break;
      case 'detailed':
        line = this.formatDetailedLog(entry);
        break;
      default:
        line = `${entry.timestamp} [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;
        
        if (entry.data) {
          line += ` | DATA: ${JSON.stringify(entry.data)}`;
        }
        
        if (entry.error) {
          line += ` | ERROR: ${entry.error.message}`;
          if (entry.error.stack) {
            line += ` | STACK: ${entry.error.stack.replace(/\n/g, ' | ')}`;
          }
        }
        
        if (entry.metadata) {
          line += ` | METADATA: ${JSON.stringify(entry.metadata)}`;
        }
    }
    
    return line;
  }

  /**
   * Formatear log estructurado
   */
  private formatStructuredLog(entry: LogEntry): string {
    const structured = {
      timestamp: entry.timestamp,
      level: entry.level.toUpperCase(),
      context: entry.context,
      message: entry.message,
      data: entry.data,
      error: entry.error ? {
        message: entry.error.message,
        stack: entry.error.stack
      } : undefined,
      metadata: entry.metadata
    };
    
    return JSON.stringify(structured);
  }

  /**
   * Formatear log compacto
   */
  private formatCompactLog(entry: LogEntry): string {
    return `${entry.timestamp} [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;
  }

  /**
   * Formatear log detallado
   */
  private formatDetailedLog(entry: LogEntry): string {
    let line = `${entry.timestamp} [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;
    
    if (entry.data) {
      line += `\nDATA: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.error) {
      line += `\nERROR: ${entry.error.message}`;
      if (entry.error.stack) {
        line += `\nSTACK: ${entry.error.stack}`;
      }
    }
    
    if (entry.metadata) {
      line += `\nMETADATA: ${JSON.stringify(entry.metadata, null, 2)}`;
    }
    
    return line;
  }

  /**
   * Obtener color para nivel de log
   */
  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case 'debug': return 'gray';
      case 'info': return 'blue';
      case 'warn': return 'yellow';
      case 'error': return 'red';
      case 'fatal': return 'red';
      default: return 'white';
    }
  }

  /**
   * Obtener ruta del archivo de log
   */
  private getLogFilePath(): string {
    const logDir = path.join(process.cwd(), 'logs');
    const date = new Date().toISOString().split('T')[0];
    return path.join(logDir, `agent-coordinator-${date}.log`);
  }

  /**
   * Asegurar que existe el directorio de logs
   */
  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Rotar logs si es necesario
   */
  private rotateLogsIfNeeded(): void {
    try {
      const stats = fs.statSync(this.logFile);
      
      if (stats.size > this.maxLogSize) {
        this.rotateLogFile();
      }
    } catch (error) {
      // Archivo no existe, no hay problema
    }
  }

  /**
   * Rotar archivo de log
   */
  private rotateLogFile(): void {
    const logDir = path.dirname(this.logFile);
    const baseName = path.basename(this.logFile, '.log');
    
    // Mover archivos existentes
    for (let i = this.maxLogFiles - 1; i >= 1; i--) {
      const oldFile = path.join(logDir, `${baseName}.${i}.log`);
      const newFile = path.join(logDir, `${baseName}.${i + 1}.log`);
      
      if (fs.existsSync(oldFile)) {
        if (i === this.maxLogFiles - 1) {
          fs.unlinkSync(oldFile);
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }
    
    // Renombrar archivo actual
    const backupFile = path.join(logDir, `${baseName}.1.log`);
    fs.renameSync(this.logFile, backupFile);
  }

  /**
   * Cambiar nivel de log
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Obtener estadísticas de logs
   */
  getLogStats(): { fileSize: number; lineCount: number } {
    try {
      const stats = fs.statSync(this.logFile);
      const content = fs.readFileSync(this.logFile, 'utf8');
      const lineCount = content.split('\n').length - 1;
      
      return {
        fileSize: stats.size,
        lineCount
      };
    } catch (error) {
      return {
        fileSize: 0,
        lineCount: 0
      };
    }
  }

  /**
   * Limpiar logs antiguos
   */
  cleanOldLogs(daysToKeep: number = 7): void {
    const logDir = path.dirname(this.logFile);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    try {
      const files = fs.readdirSync(logDir);
      
      files.forEach(file => {
        if (file.startsWith('agent-coordinator-') && file.endsWith('.log')) {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            this.info(`Log file deleted: ${file}`);
          }
        }
      });
    } catch (error) {
      this.error('Error cleaning old logs', error);
    }
  }

  /**
   * Comprimir línea de log
   */
  private compressLogLine(logLine: string): string {
    // Implementación básica de compresión
    // En producción, usar librerías como zlib
    return logLine;
  }

  /**
   * Encriptar línea de log
   */
  private encryptLogLine(logLine: string): string {
    // Implementación básica de encriptación
    // En producción, usar librerías como crypto
    return logLine;
  }

  /**
   * Log a base de datos
   */
  private logToDatabase(entry: LogEntry): void {
    // Implementación para logging a base de datos
    // En producción, usar ORM o driver de base de datos
  }

  /**
   * Log a sistema remoto
   */
  private logToRemote(entry: LogEntry): void {
    // Implementación para logging remoto
    // En producción, usar HTTP client o WebSocket
  }

  /**
   * Log por email
   */
  private logToEmail(entry: LogEntry): void {
    // Implementación para logging por email
    // En producción, usar librería de email
  }

  /**
   * Log por webhook
   */
  private logToWebhook(entry: LogEntry): void {
    // Implementación para logging por webhook
    // En producción, usar HTTP client
  }

  /**
   * Configurar nivel de log
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Configurar formato de log
   */
  setLogFormat(format: LogFormat): void {
    this.logFormat = format;
  }

  /**
   * Configurar destinos de log
   */
  setLogDestinations(destinations: LogDestination[]): void {
    this.logDestinations = destinations;
  }

  /**
   * Habilitar/deshabilitar compresión
   */
  setCompressionEnabled(enabled: boolean): void {
    this.enableCompression = enabled;
  }

  /**
   * Habilitar/deshabilitar encriptación
   */
  setEncryptionEnabled(enabled: boolean): void {
    this.enableEncryption = enabled;
  }

  /**
   * Habilitar/deshabilitar validación
   */
  setValidationEnabled(enabled: boolean): void {
    this.enableValidation = enabled;
  }

  /**
   * Obtener configuración actual
   */
  getConfiguration(): {
    context: string;
    logLevel: LogLevel;
    logFormat: LogFormat;
    logDestinations: LogDestination[];
    maxLogSize: number;
    maxLogFiles: number;
    enableCompression: boolean;
    enableEncryption: boolean;
    enableValidation: boolean;
  } {
    return {
      context: this.context,
      logLevel: this.logLevel,
      logFormat: this.logFormat,
      logDestinations: this.logDestinations,
      maxLogSize: this.maxLogSize,
      maxLogFiles: this.maxLogFiles,
      enableCompression: this.enableCompression,
      enableEncryption: this.enableEncryption,
      enableValidation: this.enableValidation
    };
  }
}
