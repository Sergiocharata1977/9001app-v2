const { MongoClient } = require('mongodb');

class MongoDBClient {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/9001app-v2';
      const dbName = process.env.MONGODB_DB_NAME || '9001app-v2';
      
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;
      
      console.log('✅ MongoDB conectado exitosamente');
      return this.db;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 MongoDB desconectado');
    }
  }

  async execute(query) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Simular la interfaz de mongodbClient.execute para compatibilidad
      if (query.sql) {
        return await this.executeSQL(query.sql, query.args || []);
      } else if (typeof query === 'string') {
        return await this.executeSQL(query, []);
      }
      
      throw new Error('Formato de query no soportado');
    } catch (error) {
      console.error('❌ Error ejecutando query MongoDB:', error);
      throw error;
    }
  }

  async executeSQL(sql, args = []) {
    // Convertir SQL básico a operaciones MongoDB
    const sqlLower = sql.toLowerCase();
    
    if (sqlLower.includes('select')) {
      return await this.handleSelect(sql, args);
    } else if (sqlLower.includes('insert')) {
      return await this.handleInsert(sql, args);
    } else if (sqlLower.includes('update')) {
      return await this.handleUpdate(sql, args);
    } else if (sqlLower.includes('delete')) {
      return await this.handleDelete(sql, args);
    }
    
    throw new Error(`Operación SQL no soportada: ${sql}`);
  }

  async handleSelect(sql, args) {
    // Extraer tabla y condiciones básicas
    const tableMatch = sql.match(/from\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('No se pudo extraer tabla de SELECT');
    }
    
    const tableName = tableMatch[1];
    const collection = this.db.collection(tableName);
    
    // Construir filtro básico
    let filter = {};
    if (args.length > 0) {
      // Asumir que el primer argumento es el ID o condición principal
      filter = { _id: args[0] };
    }
    
    const documents = await collection.find(filter).toArray();
    
    // Convertir a formato compatible con tursoClient
    return {
      rows: documents.map(doc => {
        // Convertir _id de MongoDB a id para compatibilidad
        const { _id, ...rest } = doc;
        return { id: _id, ...rest };
      })
    };
  }

  async handleInsert(sql, args) {
    const tableMatch = sql.match(/into\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('No se pudo extraer tabla de INSERT');
    }
    
    const tableName = tableMatch[1];
    const collection = this.db.collection(tableName);
    
    // Crear documento a insertar
    const document = {};
    if (args.length > 0) {
      // Asumir que args contiene los valores en orden
      const columnsMatch = sql.match(/\(([^)]+)\)/);
      if (columnsMatch) {
        const columns = columnsMatch[1].split(',').map(col => col.trim());
        columns.forEach((col, index) => {
          document[col] = args[index];
        });
      }
    }
    
    const result = await collection.insertOne(document);
    
    return {
      rows: [{ id: result.insertedId }]
    };
  }

  async handleUpdate(sql, args) {
    const tableMatch = sql.match(/update\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('No se pudo extraer tabla de UPDATE');
    }
    
    const tableName = tableMatch[1];
    const collection = this.db.collection(tableName);
    
    // Construir filtro y actualización básicos
    const filter = { _id: args[0] };
    const update = { $set: {} };
    
    // Extraer campos a actualizar
    const setMatch = sql.match(/set\s+(.+?)\s+where/i);
    if (setMatch) {
      const setClause = setMatch[1];
      const updates = setClause.split(',').map(update => update.trim());
      updates.forEach((updateStr, index) => {
        const [field] = updateStr.split('=');
        if (args[index + 1] !== undefined) {
          update.$set[field.trim()] = args[index + 1];
        }
      });
    }
    
    const result = await collection.updateOne(filter, update);
    
    return {
      rows: [{ modifiedCount: result.modifiedCount }]
    };
  }

  async handleDelete(sql, args) {
    const tableMatch = sql.match(/from\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('No se pudo extraer tabla de DELETE');
    }
    
    const tableName = tableMatch[1];
    const collection = this.db.collection(tableName);
    
    const filter = { _id: args[0] };
    const result = await collection.deleteOne(filter);
    
    return {
      rows: [{ deletedCount: result.deletedCount }]
    };
  }

  // Métodos específicos para MongoDB
  async findOne(collectionName, filter) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const collection = this.db.collection(collectionName);
    return await collection.findOne(filter);
  }

  async find(collectionName, filter = {}) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const collection = this.db.collection(collectionName);
    return await collection.find(filter).toArray();
  }

  async insertOne(collectionName, document) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const collection = this.db.collection(collectionName);
    return await collection.insertOne(document);
  }

  async updateOne(collectionName, filter, update) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const collection = this.db.collection(collectionName);
    return await collection.updateOne(filter, update);
  }

  async deleteOne(collectionName, filter) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const collection = this.db.collection(collectionName);
    return await collection.deleteOne(filter);
  }
}

// Crear instancia singleton
const mongodbClient = new MongoDBClient();

module.exports = mongodbClient;