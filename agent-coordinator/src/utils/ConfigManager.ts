import * as fs from 'fs';
import * as path from 'path';
import { UTILITY_CONSTANTS, ConfigType, ConfigFormat, DatabaseType, CacheType } from './constants';
import { Logger } from './Logger';

export interface ConfigOptions {
  type: ConfigType;
  format: ConfigFormat;
  path?: string;
  environment?: string;
  validate?: boolean;
  encrypt?: boolean;
  compress?: boolean;
}

export interface ConfigData {
  [key: string]: any;
}

export class ConfigManager {
  private logger: Logger;
  private configs: Map<string, ConfigData> = new Map();
  private configOptions: Map<string, ConfigOptions> = new Map();
  private defaultOptions: ConfigOptions;

  constructor() {
    this.logger = new Logger('ConfigManager');
    this.defaultOptions = {
      type: UTILITY_CONSTANTS.DEFAULT_CONFIG.CONFIG_TYPE as ConfigType,
      format: UTILITY_CONSTANTS.DEFAULT_CONFIG.CONFIG_FORMAT as ConfigFormat,
      validate: UTILITY_CONSTANTS.DEFAULT_CONFIG.VALIDATION_ENABLED,
      encrypt: UTILITY_CONSTANTS.DEFAULT_CONFIG.ENCRYPTION_ENABLED,
      compress: UTILITY_CONSTANTS.DEFAULT_CONFIG.COMPRESSION_ENABLED
    };
  }

  /**
   * Cargar configuración
   */
  async loadConfig(name: string, options?: Partial<ConfigOptions>): Promise<ConfigData> {
    try {
      const configOptions = { ...this.defaultOptions, ...options };
      const configPath = this.getConfigPath(name, configOptions);
      
      this.logger.info(`Loading configuration: ${name}`, { path: configPath, options: configOptions });
      
      if (!fs.existsSync(configPath)) {
        this.logger.warn(`Configuration file not found: ${configPath}`);
        return {};
      }

      const rawData = fs.readFileSync(configPath, 'utf8');
      let configData: ConfigData;

      // Descomprimir si es necesario
      if (configOptions.compress) {
        configData = this.decompressConfig(rawData);
      } else {
        configData = this.parseConfig(rawData, configOptions.format);
      }

      // Desencriptar si es necesario
      if (configOptions.encrypt) {
        configData = this.decryptConfig(configData);
      }

      // Validar si es necesario
      if (configOptions.validate) {
        this.validateConfig(configData, name);
      }

      // Aplicar variables de entorno
      configData = this.applyEnvironmentVariables(configData, configOptions.environment);

      this.configs.set(name, configData);
      this.configOptions.set(name, configOptions);

      this.logger.info(`Configuration loaded successfully: ${name}`, { 
        keys: Object.keys(configData),
        size: JSON.stringify(configData).length 
      });

      return configData;
    } catch (error) {
      this.logger.error(`Failed to load configuration: ${name}`, error);
      throw error;
    }
  }

  /**
   * Guardar configuración
   */
  async saveConfig(name: string, data: ConfigData, options?: Partial<ConfigOptions>): Promise<void> {
    try {
      const configOptions = { ...this.defaultOptions, ...options };
      const configPath = this.getConfigPath(name, configOptions);
      
      this.logger.info(`Saving configuration: ${name}`, { path: configPath, options: configOptions });
      
      let configData = { ...data };

      // Aplicar variables de entorno
      configData = this.applyEnvironmentVariables(configData, configOptions.environment);

      // Validar si es necesario
      if (configOptions.validate) {
        this.validateConfig(configData, name);
      }

      // Encriptar si es necesario
      if (configOptions.encrypt) {
        configData = this.encryptConfig(configData);
      }

      let rawData: string;

      // Comprimir si es necesario
      if (configOptions.compress) {
        rawData = this.compressConfig(configData);
      } else {
        rawData = this.stringifyConfig(configData, configOptions.format);
      }

      // Asegurar que existe el directorio
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(configPath, rawData);

      this.configs.set(name, configData);
      this.configOptions.set(name, configOptions);

      this.logger.info(`Configuration saved successfully: ${name}`, { 
        path: configPath,
        size: rawData.length 
      });
    } catch (error) {
      this.logger.error(`Failed to save configuration: ${name}`, error);
      throw error;
    }
  }

  /**
   * Obtener configuración
   */
  getConfig(name: string): ConfigData | undefined {
    return this.configs.get(name);
  }

  /**
   * Obtener valor de configuración
   */
  getValue(name: string, key: string, defaultValue?: any): any {
    const config = this.configs.get(name);
    if (!config) {
      this.logger.warn(`Configuration not found: ${name}`);
      return defaultValue;
    }

    const keys = key.split('.');
    let value = config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        this.logger.debug(`Configuration key not found: ${name}.${key}`);
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Establecer valor de configuración
   */
  setValue(name: string, key: string, value: any): void {
    const config = this.configs.get(name);
    if (!config) {
      this.logger.warn(`Configuration not found: ${name}`);
      return;
    }

    const keys = key.split('.');
    let current = config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    this.logger.debug(`Configuration value set: ${name}.${key}`, { value });
  }

  /**
   * Eliminar configuración
   */
  deleteConfig(name: string): boolean {
    const configOptions = this.configOptions.get(name);
    if (!configOptions) {
      return false;
    }

    try {
      const configPath = this.getConfigPath(name, configOptions);
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }

      this.configs.delete(name);
      this.configOptions.delete(name);

      this.logger.info(`Configuration deleted: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete configuration: ${name}`, error);
      return false;
    }
  }

  /**
   * Listar configuraciones
   */
  listConfigs(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Validar configuración
   */
  validateConfig(data: ConfigData, name: string): boolean {
    // Implementación básica de validación
    // En producción, usar esquemas JSON o YAML
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid configuration data for: ${name}`);
    }

    return true;
  }

  /**
   * Obtener ruta de configuración
   */
  private getConfigPath(name: string, options: ConfigOptions): string {
    const configDir = path.join(process.cwd(), 'config');
    const environment = options.environment || process.env.NODE_ENV || 'development';
    const extension = this.getFileExtension(options.format);
    
    return path.join(configDir, environment, `${name}${extension}`);
  }

  /**
   * Obtener extensión de archivo
   */
  private getFileExtension(format: ConfigFormat): string {
    switch (format) {
      case 'json': return '.json';
      case 'yaml': return '.yml';
      case 'yml': return '.yaml';
      case 'toml': return '.toml';
      case 'ini': return '.ini';
      case 'env': return '.env';
      case 'xml': return '.xml';
      default: return '.json';
    }
  }

  /**
   * Parsear configuración
   */
  private parseConfig(data: string, format: ConfigFormat): ConfigData {
    switch (format) {
      case 'json':
        return JSON.parse(data);
      case 'yaml':
      case 'yml':
        // En producción, usar librería YAML
        return JSON.parse(data);
      case 'toml':
        // En producción, usar librería TOML
        return JSON.parse(data);
      case 'ini':
        // En producción, usar librería INI
        return JSON.parse(data);
      case 'env':
        return this.parseEnvConfig(data);
      case 'xml':
        // En producción, usar librería XML
        return JSON.parse(data);
      default:
        return JSON.parse(data);
    }
  }

  /**
   * Parsear configuración de entorno
   */
  private parseEnvConfig(data: string): ConfigData {
    const config: ConfigData = {};
    const lines = data.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    }

    return config;
  }

  /**
   * Convertir configuración a string
   */
  private stringifyConfig(data: ConfigData, format: ConfigFormat): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'yaml':
      case 'yml':
        // En producción, usar librería YAML
        return JSON.stringify(data, null, 2);
      case 'toml':
        // En producción, usar librería TOML
        return JSON.stringify(data, null, 2);
      case 'ini':
        // En producción, usar librería INI
        return JSON.stringify(data, null, 2);
      case 'env':
        return this.stringifyEnvConfig(data);
      case 'xml':
        // En producción, usar librería XML
        return JSON.stringify(data, null, 2);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convertir configuración de entorno a string
   */
  private stringifyEnvConfig(data: ConfigData): string {
    const lines: string[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      lines.push(`${key}=${value}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Aplicar variables de entorno
   */
  private applyEnvironmentVariables(data: ConfigData, environment?: string): ConfigData {
    const result = { ...data };
    
    // Aplicar variables de entorno específicas del entorno
    if (environment) {
      const envPrefix = `${environment.toUpperCase()}_`;
      for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith(envPrefix)) {
          const configKey = key.substring(envPrefix.length).toLowerCase();
          result[configKey] = value;
        }
      }
    }
    
    return result;
  }

  /**
   * Comprimir configuración
   */
  private compressConfig(data: ConfigData): string {
    // Implementación básica de compresión
    // En producción, usar librerías como zlib
    return JSON.stringify(data);
  }

  /**
   * Descomprimir configuración
   */
  private decompressConfig(data: string): ConfigData {
    // Implementación básica de descompresión
    // En producción, usar librerías como zlib
    return JSON.parse(data);
  }

  /**
   * Encriptar configuración
   */
  private encryptConfig(data: ConfigData): ConfigData {
    // Implementación básica de encriptación
    // En producción, usar librerías como crypto
    return data;
  }

  /**
   * Desencriptar configuración
   */
  private decryptConfig(data: ConfigData): ConfigData {
    // Implementación básica de desencriptación
    // En producción, usar librerías como crypto
    return data;
  }

  /**
   * Obtener configuración del sistema
   */
  getSystemConfig(): ConfigData {
    return {
      version: UTILITY_CONSTANTS.DEFAULT_CONFIG,
      limits: UTILITY_CONSTANTS.SYSTEM_LIMITS,
      timeouts: UTILITY_CONSTANTS.TIMEOUTS,
      intervals: UTILITY_CONSTANTS.INTERVALS
    };
  }

  /**
   * Obtener configuración de base de datos
   */
  getDatabaseConfig(type: DatabaseType): ConfigData {
    return {
      type,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '27017'),
      name: process.env.DB_NAME || 'agent_coordinator',
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    };
  }

  /**
   * Obtener configuración de caché
   */
  getCacheConfig(type: CacheType): ConfigData {
    return {
      type,
      host: process.env.CACHE_HOST || 'localhost',
      port: parseInt(process.env.CACHE_PORT || '6379'),
      password: process.env.CACHE_PASSWORD,
      db: parseInt(process.env.CACHE_DB || '0'),
      ttl: parseInt(process.env.CACHE_TTL || '3600')
    };
  }

  /**
   * Obtener estadísticas de configuración
   */
  getConfigStats(): {
    totalConfigs: number;
    totalSize: number;
    configs: Array<{ name: string; size: number; type: ConfigType; format: ConfigFormat }>;
  } {
    const configs = Array.from(this.configs.entries()).map(([name, data]) => ({
      name,
      size: JSON.stringify(data).length,
      type: this.configOptions.get(name)?.type || this.defaultOptions.type,
      format: this.configOptions.get(name)?.format || this.defaultOptions.format
    }));

    const totalSize = configs.reduce((sum, config) => sum + config.size, 0);

    return {
      totalConfigs: configs.length,
      totalSize,
      configs
    };
  }
}