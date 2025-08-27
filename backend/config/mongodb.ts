import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export interface MongoDBConfig {
  uri: string;
  dbName: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
}

export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  private config: MongoDBConfig = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || '9001app-v2',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  };

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async connect(): Promise<Db> {
    try {
      if (this.isConnected && this.db) {
        return this.db;
      }

      console.log('🔌 Conectando a MongoDB...');
      this.client = new MongoClient(this.config.uri, this.config.options);
      
      await this.client.connect();
      this.db = this.client.db(this.config.dbName);
      this.isConnected = true;
      
      console.log('✅ Conexión a MongoDB establecida');
      return this.db;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        this.db = null;
        console.log('🔌 Conexión a MongoDB cerrada');
      }
    } catch (error) {
      console.error('❌ Error cerrando conexión MongoDB:', error);
    }
  }

  public getDb(): Db | null {
    return this.db;
  }

  public isConnectedToDb(): boolean {
    return this.isConnected;
  }

  public getConfig(): MongoDBConfig {
    return this.config;
  }
}

// Exportar instancia singleton
export const mongoConnection = MongoDBConnection.getInstance();

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando conexión MongoDB...');
  await mongoConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Cerrando conexión MongoDB...');
  await mongoConnection.disconnect();
  process.exit(0);
});
