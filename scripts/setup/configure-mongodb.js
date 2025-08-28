#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🍃 CONFIGURACIÓN MONGODB ATLAS - 9001app-v2');
console.log('═══════════════════════════════════════════\n');

// Configuración con la contraseña real
const MONGODB_PASSWORD = 'jFIIJY5D4PoWicU8';
const MONGODB_URI = `mongodb+srv://9001app-v2:${MONGODB_PASSWORD}@9001app-v2.xqydf2m.mongodb.net/?retryWrites=true&w=majority&appName=9001app-v2`;

// Configuración del backend
const backendEnvContent = `# MongoDB Atlas Configuration
MONGODB_URI=${MONGODB_URI}
MONGODB_DB_NAME=9001app-v2

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=9001app-v2-jwt-secret-key-2024
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# RAG Configuration
RAG_ENABLED=true
RAG_MODEL_PROVIDER=local
RAG_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2

# Default Organization
DEFAULT_ORG_ID=1
`;

// Configuración del agent-coordinator
const agentEnvContent = `# MongoDB Atlas Configuration
MONGODB_URI=${MONGODB_URI}
MONGODB_DB_NAME=9001app-v2

# Agent Coordinator Configuration
AGENT_COORDINATOR_PORT=3002
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
ENABLE_LOGGING=true

# Migration Configuration
MIGRATION_MODE=full
BACKUP_ENABLED=true
BACKUP_PATH=./backups/mongodb

# Agent Configuration
MAX_CONCURRENT_AGENTS=5
AGENT_TIMEOUT=60000
AGENT_RETRY_ATTEMPTS=3
`;

// Función para crear archivo .env
function createEnvFile(projectPath, envContent) {
  const envPath = path.join(projectPath, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log(`⚠️  El archivo .env ya existe en ${projectPath}`);
    const backupPath = path.join(projectPath, '.env.backup');
    fs.copyFileSync(envPath, backupPath);
    console.log(`📋 Backup creado en ${backupPath}`);
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Archivo .env creado en ${projectPath}`);
}

// Función para crear directorios
function createDirectories() {
  const dirs = [
    './backend/uploads',
    './backend/backups/mongodb',
    './agent-coordinator/backups/mongodb',
    './agent-coordinator/logs'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    }
  });
}

// Ejecutar configuración
async function configureMongoDB() {
  try {
    console.log('📋 Configurando MongoDB Atlas con contraseña real...\n');
    
    // 1. Configurar backend
    console.log('🔧 Configurando Backend...');
    createEnvFile('./backend', backendEnvContent);
    
    // 2. Configurar agent-coordinator
    console.log('🤖 Configurando Agent Coordinator...');
    createEnvFile('./agent-coordinator', agentEnvContent);
    
    // 3. Crear directorios necesarios
    console.log('\n📁 Creando directorios necesarios...');
    createDirectories();
    
    // 4. Instrucciones finales
    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📋 PRÓXIMOS PASOS EN MONGODB ATLAS:');
    console.log('1. Ve a MongoDB Atlas → Database Access');
    console.log('2. En el usuario 9001app-v2, ASIGNA UN ROL:');
    console.log('   - Selecciona "Built-in Role"');
    console.log('   - Elige "Atlas admin" o "Read and write to any database"');
    console.log('3. Ve a Network Access y agrega tu IP (0.0.0.0/0 para desarrollo)');
    console.log('4. Guarda los cambios');
    console.log('\n🔍 PRUEBAS DE CONEXIÓN:');
    console.log('Una vez configurado el rol, ejecuta:');
    console.log('   - Backend: cd backend && node scripts/test-mongodb-connection.js');
    console.log('   - Agent: cd agent-coordinator && node scripts/test-mongodb-connection.js');
    console.log('\n🚀 Una vez que funcione, puedes ejecutar:');
    console.log('   - Backend: cd backend && npm run dev');
    console.log('   - Agent: cd agent-coordinator && npm run mongodb');
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar configuración
configureMongoDB();
