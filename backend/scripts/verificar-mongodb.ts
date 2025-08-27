#!/usr/bin/env ts-node

/**
 * Script de verificación de conexión a MongoDB Atlas
 * Sistema de Gestión de Calidad ISO 9001
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Configurar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sergiojdf:<password>@9001app-v2.xqydf2m.mongodb.net/9001app-v2';

class MongoDBVerifier {
  private logger: Console;

  constructor() {
    this.logger = console;
  }

  async verificarConexion(): Promise<void> {
    try {
      this.logger.log('🔍 Verificando conexión a MongoDB Atlas...');
      this.logger.log(`📡 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
      
      // Conectar a MongoDB
      await mongoose.connect(MONGODB_URI);
      this.logger.log('✅ Conexión exitosa a MongoDB Atlas');
      
      // Verificar información de la base de datos
      const db = mongoose.connection.db;
      if (db) {
        const adminDb = db.admin();
        const serverInfo = await adminDb.serverInfo();
        this.logger.log(`📊 Versión de MongoDB: ${serverInfo.version}`);
        this.logger.log(`🏢 Base de datos: ${db.databaseName}`);
        
        // Listar colecciones
        const collections = await db.listCollections().toArray();
        this.logger.log(`📁 Colecciones encontradas: ${collections.length}`);
        
        if (collections.length > 0) {
          this.logger.log('📋 Lista de colecciones:');
          collections.forEach(collection => {
            this.logger.log(`  - ${collection.name}`);
          });
        }
      }
      
      // Verificar estado de la conexión
      this.logger.log(`🔗 Estado de conexión: ${mongoose.connection.readyState}`);
      this.logger.log(`🌐 Host: ${mongoose.connection.host}`);
      this.logger.log(`🔌 Puerto: ${mongoose.connection.port}`);
      this.logger.log(`📚 Base de datos: ${mongoose.connection.name}`);
      
    } catch (error) {
      this.logger.error('❌ Error verificando conexión:', error);
      throw error;
    } finally {
      await mongoose.disconnect();
      this.logger.log('🔌 Conexión cerrada');
    }
  }

  async ejecutar(): Promise<void> {
    try {
      this.logger.log('🚀 Iniciando verificación de MongoDB Atlas...');
      this.logger.log('📊 Base de datos: MongoDB Atlas');
      this.logger.log('🔧 Lenguaje: TypeScript');
      this.logger.log('❌ Turso: ELIMINADO COMPLETAMENTE');
      
      await this.verificarConexion();
      
      this.logger.log('\n✅ Verificación completada exitosamente');
      this.logger.log('🎯 MongoDB Atlas configurado correctamente');
      this.logger.log('🔧 TypeScript funcionando correctamente');
      
    } catch (error) {
      this.logger.error('❌ Error durante la verificación:', error);
      throw error;
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  const verifier = new MongoDBVerifier();
  verifier.ejecutar()
    .then(() => {
      console.log('🎉 Verificación completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la verificación:', error);
      process.exit(1);
    });
}

export default MongoDBVerifier;