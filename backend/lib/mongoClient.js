const { MongoClient } = require('mongodb');
require('dotenv').config();

class MongoClientWrapper {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.connectionString = process.env.MONGODB_URI || 'mongodb+srv://9001app-v2:jFIIJY5D4PoWicU8@9001app-v2.xqydf2m.mongodb.net/?retryWrites=true&w=majority&appName=9001app-v2';
    this.dbName = process.env.MONGODB_DB_NAME || '9001app-v2';
  }

  async connect() {
    try {
      if (this.isConnected) {
        return this.db;
      }

      console.log('🔌 Conectando a MongoDB...');
      this.client = new MongoClient(this.connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000
      });

      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      
      console.log('✅ Conexión a MongoDB establecida');
      return this.db;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        console.log('🔌 Conexión a MongoDB cerrada');
      }
    } catch (error) {
      console.error('❌ Error cerrando conexión MongoDB:', error);
    }
  }

  async execute(query) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // Si es una consulta SQL (para compatibilidad con Turso)
      if (typeof query === 'string') {
        return await this.executeSQL(query);
      }

      // Si es un objeto con sql y args (formato Turso)
      if (query.sql && query.args) {
        return await this.executeSQLWithArgs(query.sql, query.args);
      }

      // Si es una operación MongoDB directa
      if (query.collection && query.operation) {
        return await this.executeMongoOperation(query);
      }

      throw new Error('Formato de consulta no soportado');
    } catch (error) {
      console.error('❌ Error ejecutando consulta:', error);
      throw error;
    }
  }

  async executeSQL(sql, args = []) {
    // Mapeo de SQL a operaciones MongoDB
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.startsWith('select')) {
      return await this.handleSelect(sql, args);
    } else if (sqlLower.startsWith('insert')) {
      return await this.handleInsert(sql, args);
    } else if (sqlLower.startsWith('update')) {
      return await this.handleUpdate(sql, args);
    } else if (sqlLower.startsWith('delete')) {
      return await this.handleDelete(sql, args);
    } else if (sqlLower.startsWith('create table')) {
      return await this.handleCreateTable(sql);
    } else if (sqlLower.startsWith('drop table')) {
      return await this.handleDropTable(sql);
    } else if (sqlLower.startsWith('alter table')) {
      return await this.handleAlterTable(sql);
    } else {
      throw new Error(`Operación SQL no soportada: ${sql}`);
    }
  }

  async executeSQLWithArgs(sql, args) {
    return await this.executeSQL(sql, args);
  }

  async executeMongoOperation(query) {
    const { collection, operation, ...params } = query;
    const coll = this.db.collection(collection);

    switch (operation) {
      case 'find':
        return await coll.find(params.filter || {}).toArray();
      case 'findOne':
        return await coll.findOne(params.filter || {});
      case 'insertOne':
        return await coll.insertOne(params.document);
      case 'insertMany':
        return await coll.insertMany(params.documents);
      case 'updateOne':
        return await coll.updateOne(params.filter, params.update, params.options);
      case 'updateMany':
        return await coll.updateMany(params.filter, params.update, params.options);
      case 'deleteOne':
        return await coll.deleteOne(params.filter);
      case 'deleteMany':
        return await coll.deleteMany(params.filter);
      case 'countDocuments':
        return await coll.countDocuments(params.filter || {});
      case 'aggregate':
        return await coll.aggregate(params.pipeline).toArray();
      default:
        throw new Error(`Operación MongoDB no soportada: ${operation}`);
    }
  }

  async handleSelect(sql, args) {
    // Parsear SELECT básico
    const match = sql.match(/select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(.+?))?(?:\s+limit\s+(\d+))?/i);
    
    if (!match) {
      throw new Error(`SELECT no soportado: ${sql}`);
    }

    const [, fields, table, whereClause, orderBy, limit] = match;
    const collection = this.db.collection(table);
    
    // Construir filtro
    let filter = {};
    if (whereClause) {
      filter = this.parseWhereClause(whereClause, args);
    }

    // Construir proyección
    let projection = {};
    if (fields !== '*') {
      const fieldList = fields.split(',').map(f => f.trim());
      fieldList.forEach(field => {
        projection[field] = 1;
      });
    }

    // Ejecutar consulta
    let query = collection.find(filter);
    
    if (Object.keys(projection).length > 0) {
      query = query.project(projection);
    }

    if (orderBy) {
      const sort = this.parseOrderBy(orderBy);
      query = query.sort(sort);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const results = await query.toArray();
    return { rows: results };
  }

  async handleInsert(sql, args) {
    const match = sql.match(/insert\s+into\s+(\w+)\s*\(([^)]+)\)\s+values\s*\(([^)]+)\)/i);
    
    if (!match) {
      throw new Error(`INSERT no soportado: ${sql}`);
    }

    const [, table, columns, values] = match;
    const columnList = columns.split(',').map(c => c.trim());
    const valueList = values.split(',').map(v => v.trim());
    
    // Crear documento
    const document = {};
    columnList.forEach((column, index) => {
      let value = valueList[index];
      
      // Remover comillas
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      // Usar args si están disponibles
      if (args && args[index] !== undefined) {
        value = args[index];
      }

      document[column] = value;
    });

    const collection = this.db.collection(table);
    const result = await collection.insertOne(document);
    
    return { 
      lastInsertRowid: result.insertedId,
      changes: 1 
    };
  }

  async handleUpdate(sql, args) {
    const match = sql.match(/update\s+(\w+)\s+set\s+(.+?)(?:\s+where\s+(.+?))?/i);
    
    if (!match) {
      throw new Error(`UPDATE no soportado: ${sql}`);
    }

    const [, table, setClause, whereClause] = match;
    
    // Parsear SET
    const updates = {};
    const setPairs = setClause.split(',').map(pair => pair.trim());
    setPairs.forEach(pair => {
      const [column, value] = pair.split('=').map(p => p.trim());
      let cleanValue = value;
      
      if (cleanValue.startsWith("'") && cleanValue.endsWith("'")) {
        cleanValue = cleanValue.slice(1, -1);
      } else if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
        cleanValue = cleanValue.slice(1, -1);
      }
      
      updates[column] = cleanValue;
    });

    // Parsear WHERE
    let filter = {};
    if (whereClause) {
      filter = this.parseWhereClause(whereClause, args);
    }

    const collection = this.db.collection(table);
    const result = await collection.updateMany(filter, { $set: updates });
    
    return { 
      changes: result.modifiedCount 
    };
  }

  async handleDelete(sql, args) {
    const match = sql.match(/delete\s+from\s+(\w+)(?:\s+where\s+(.+?))?/i);
    
    if (!match) {
      throw new Error(`DELETE no soportado: ${sql}`);
    }

    const [, table, whereClause] = match;
    
    let filter = {};
    if (whereClause) {
      filter = this.parseWhereClause(whereClause, args);
    }

    const collection = this.db.collection(table);
    const result = await collection.deleteMany(filter);
    
    return { 
      changes: result.deletedCount 
    };
  }

  async handleCreateTable(sql) {
    const match = sql.match(/create\s+table\s+(\w+)\s*\(([^)]+)\)/i);
    
    if (!match) {
      throw new Error(`CREATE TABLE no soportado: ${sql}`);
    }

    const [, tableName, columns] = match;
    
    // En MongoDB, las colecciones se crean automáticamente
    // Solo necesitamos crear un índice si es necesario
    const collection = this.db.collection(tableName);
    
    // Crear índice en _id si no existe
    try {
      await collection.createIndex({ _id: 1 });
    } catch (error) {
      // El índice ya existe
    }
    
    return { success: true };
  }

  async handleDropTable(sql) {
    const match = sql.match(/drop\s+table\s+(\w+)/i);
    
    if (!match) {
      throw new Error(`DROP TABLE no soportado: ${sql}`);
    }

    const [, tableName] = match;
    await this.db.collection(tableName).drop();
    
    return { success: true };
  }

  async handleAlterTable(sql) {
    // MongoDB no soporta ALTER TABLE directamente
    // Esta operación se maneja a nivel de aplicación
    console.warn('⚠️ ALTER TABLE no soportado en MongoDB:', sql);
    return { success: true };
  }

  parseWhereClause(whereClause, args) {
    // Parseo básico de WHERE
    const conditions = whereClause.split(/\s+and\s+|\s+or\s+/i);
    const filter = {};
    
    conditions.forEach(condition => {
      const match = condition.match(/(\w+)\s*([=<>!]+)\s*(.+)/);
      if (match) {
        const [, field, operator, value] = match;
        let cleanValue = value.trim();
        
        // Remover comillas
        if (cleanValue.startsWith("'") && cleanValue.endsWith("'")) {
          cleanValue = cleanValue.slice(1, -1);
        } else if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
          cleanValue = cleanValue.slice(1, -1);
        }
        
        // Mapear operadores SQL a MongoDB
        switch (operator) {
          case '=':
            filter[field] = cleanValue;
            break;
          case '!=':
          case '<>':
            filter[field] = { $ne: cleanValue };
            break;
          case '>':
            filter[field] = { $gt: parseFloat(cleanValue) };
            break;
          case '>=':
            filter[field] = { $gte: parseFloat(cleanValue) };
            break;
          case '<':
            filter[field] = { $lt: parseFloat(cleanValue) };
            break;
          case '<=':
            filter[field] = { $lte: parseFloat(cleanValue) };
            break;
          case 'LIKE':
            filter[field] = { $regex: cleanValue.replace(/%/g, '.*'), $options: 'i' };
            break;
          default:
            filter[field] = cleanValue;
        }
      }
    });
    
    return filter;
  }

  parseOrderBy(orderBy) {
    const sort = {};
    const clauses = orderBy.split(',').map(clause => clause.trim());
    
    clauses.forEach(clause => {
      const match = clause.match(/(\w+)\s+(asc|desc)?/i);
      if (match) {
        const [, field, direction] = match;
        sort[field] = direction && direction.toLowerCase() === 'desc' ? -1 : 1;
      }
    });
    
    return sort;
  }

  // Métodos de utilidad para MongoDB
  async getCollection(collectionName) {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.db.collection(collectionName);
  }

  async listCollections() {
    if (!this.isConnected) {
      await this.connect();
    }
    return await this.db.listCollections().toArray();
  }

  async createIndex(collectionName, indexSpec, options = {}) {
    const collection = await this.getCollection(collectionName);
    return await collection.createIndex(indexSpec, options);
  }

  async dropIndex(collectionName, indexName) {
    const collection = await this.getCollection(collectionName);
    return await collection.dropIndex(indexName);
  }

  async getIndexes(collectionName) {
    const collection = await this.getCollection(collectionName);
    return await collection.indexes();
  }
}

// Instancia singleton
const mongoClient = new MongoClientWrapper();

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando conexión MongoDB...');
  await mongoClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Cerrando conexión MongoDB...');
  await mongoClient.disconnect();
  process.exit(0);
});

module.exports = mongoClient;