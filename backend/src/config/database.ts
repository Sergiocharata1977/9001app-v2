import { MongoClient, Db } from 'mongodb';
import { createClient } from 'redis';
import { DatabaseConfig } from '../types';
import logger from '../utils/logger';

class DatabaseManager {
  private static instance: DatabaseManager;
  private mongoClient: MongoClient | null = null;
  private redisClient: any = null;
  private tenantConnections: Map<string, Db> = new Map();
  private config: DatabaseConfig;

  private constructor() {
    this.config = {
      mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        database: process.env.MONGODB_DATABASE || 'isoflow4',
        options: {
          maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
          serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000'),
          socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
        }
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        database: parseInt(process.env.REDIS_DATABASE || '0')
      }
    };
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    try {
      // Conectar a MongoDB
      this.mongoClient = new MongoClient(this.config.mongodb.uri, {
        ...this.config.mongodb.options,
        retryWrites: true,
        w: 'majority'
      });

      await this.mongoClient.connect();
      logger.info('✅ MongoDB Atlas conectado exitosamente');

      // Conectar a Redis
      this.redisClient = createClient({
        socket: {
          host: this.config.redis.host,
          port: this.config.redis.port
        },
        password: this.config.redis.password,
        database: this.config.redis.database
      });

      await this.redisClient.connect();
      logger.info('✅ Redis conectado exitosamente');

      // Crear índices necesarios
      await this.createIndexes();

    } catch (error) {
      logger.error('❌ Error conectando a las bases de datos:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.mongoClient) {
        await this.mongoClient.close();
        logger.info('🔌 MongoDB desconectado');
      }
      if (this.redisClient) {
        await this.redisClient.quit();
        logger.info('🔌 Redis desconectado');
      }
    } catch (error) {
      logger.error('❌ Error desconectando las bases de datos:', error);
    }
  }

  public getMongoClient(): MongoClient {
    if (!this.mongoClient) {
      throw new Error('MongoDB client no está conectado');
    }
    return this.mongoClient;
  }

  public getRedisClient(): any {
    if (!this.redisClient) {
      throw new Error('Redis client no está conectado');
    }
    return this.redisClient;
  }

  public getMainDatabase(): Db {
    if (!this.mongoClient) {
      throw new Error('MongoDB client no está conectado');
    }
    return this.mongoClient.db(this.config.mongodb.database);
  }

  public getTenantDatabase(organizationId: string): Db {
    // Para multi-tenancy, cada organización tiene su propia base de datos
    const tenantDbName = `${this.config.mongodb.database}_${organizationId}`;
    
    if (!this.tenantConnections.has(tenantDbName)) {
      if (!this.mongoClient) {
        throw new Error('MongoDB client no está conectado');
      }
      const tenantDb = this.mongoClient.db(tenantDbName);
      this.tenantConnections.set(tenantDbName, tenantDb);
    }

    return this.tenantConnections.get(tenantDbName)!;
  }

  private async createIndexes(): Promise<void> {
    try {
      const mainDb = this.getMainDatabase();

      // Índices para organizaciones
      await mainDb.collection('organizations').createIndexes([
        { key: { slug: 1 }, unique: true },
        { key: { status: 1 } },
        { key: { 'subscription.plan': 1 } },
        { key: { created_at: 1 } }
      ]);

      // Índices para usuarios
      await mainDb.collection('users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { organization_id: 1 } },
        { key: { role: 1 } },
        { key: { is_active: 1 } },
        { key: { last_login: 1 } }
      ]);

      // Índices para agentes de IA
      await mainDb.collection('ai_agents').createIndexes([
        { key: { organization_id: 1 } },
        { key: { type: 1 } },
        { key: { status: 1 } },
        { key: { capabilities: 1 } }
      ]);

      // Índices para documentos RAG
      await mainDb.collection('rag_documents').createIndexes([
        { key: { organization_id: 1 } },
        { key: { type: 1 } },
        { key: { status: 1 } },
        { key: { 'metadata.tags': 1 } },
        { key: { 'metadata.category': 1 } },
        { key: { created_at: 1 } }
      ]);

      // Índices para overrides de organización
      await mainDb.collection('org_overrides').createIndexes([
        { key: { organization_id: 1 } },
        { key: { process_type: 1 } },
        { key: { status: 1 } },
        { key: { version: 1 } }
      ]);

      // Índices para eventos de proceso
      await mainDb.collection('process_events').createIndexes([
        { key: { organization_id: 1 } },
        { key: { process_id: 1 } },
        { key: { event_type: 1 } },
        { key: { timestamp: 1 } },
        { key: { user_id: 1 } }
      ]);

      // Índices para alertas
      await mainDb.collection('alerts').createIndexes([
        { key: { organization_id: 1 } },
        { key: { type: 1 } },
        { key: { severity: 1 } },
        { key: { status: 1 } },
        { key: { created_at: 1 } }
      ]);

      logger.info('✅ Índices de MongoDB creados exitosamente');

    } catch (error) {
      logger.error('❌ Error creando índices:', error);
      throw error;
    }
  }

  public async createTenantIndexes(organizationId: string): Promise<void> {
    try {
      const tenantDb = this.getTenantDatabase(organizationId);

      // Índices para procesos
      await tenantDb.collection('processes').createIndexes([
        { key: { type: 1 } },
        { key: { is_active: 1 } },
        { key: { is_template: 1 } },
        { key: { version: 1 } },
        { key: { 'metadata.category': 1 } },
        { key: { 'metadata.tags': 1 } },
        { key: { created_at: 1 } }
      ]);

      // Índices para instancias de proceso
      await tenantDb.collection('process_instances').createIndexes([
        { key: { process_id: 1 } },
        { key: { current_state: 1 } },
        { key: { status: 1 } },
        { key: { assigned_to: 1 } },
        { key: { created_by: 1 } },
        { key: { created_at: 1 } },
        { key: { completed_at: 1 } },
        { key: { sla_status: 1 } },
        { key: { 'metadata.priority': 1 } },
        { key: { 'metadata.tags': 1 } }
      ]);

      // Índices para sugerencias de IA
      await tenantDb.collection('ai_suggestions').createIndexes([
        { key: { type: 1 } },
        { key: { applied: 1 } },
        { key: { created_at: 1 } },
        { key: { confidence: 1 } }
      ]);

      // Índices para consultas RAG
      await tenantDb.collection('rag_queries').createIndexes([
        { key: { user_id: 1 } },
        { key: { created_at: 1 } },
        { key: { 'metadata.confidence_score': 1 } }
      ]);

      logger.info(`✅ Índices de tenant ${organizationId} creados exitosamente`);

    } catch (error) {
      logger.error(`❌ Error creando índices para tenant ${organizationId}:`, error);
      throw error;
    }
  }

  public async healthCheck(): Promise<{
    mongodb: boolean;
    redis: boolean;
    tenants: number;
  }> {
    try {
      const mongodbHealthy = this.mongoClient ? true : false;
      const redisHealthy = this.redisClient?.isReady || false;
      const tenantsCount = this.tenantConnections.size;

      return {
        mongodb: mongodbHealthy,
        redis: redisHealthy,
        tenants: tenantsCount
      };
    } catch (error) {
      logger.error('❌ Error en health check:', error);
      return {
        mongodb: false,
        redis: false,
        tenants: 0
      };
    }
  }

  public async clearTenantCache(organizationId: string): Promise<void> {
    try {
      const tenantDbName = `${this.config.mongodb.database}_${organizationId}`;
      this.tenantConnections.delete(tenantDbName);
      logger.info(`🗑️ Cache de tenant ${organizationId} limpiado`);
    } catch (error) {
      logger.error(`❌ Error limpiando cache de tenant ${organizationId}:`, error);
    }
  }

  public getConfig(): DatabaseConfig {
    return this.config;
  }
}

export default DatabaseManager.getInstance();