#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🍃 CONFIGURACIÓN MONGODB ATLAS - 9001app-v2');
console.log('═══════════════════════════════════════════\n');

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

// Función para instalar dependencias
function installDependencies(projectPath) {
  console.log(`📦 Instalando dependencias en ${projectPath}...`);
  try {
    execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
    console.log(`✅ Dependencias instaladas en ${projectPath}`);
  } catch (error) {
    console.error(`❌ Error instalando dependencias en ${projectPath}:`, error.message);
  }
}

// Función para probar conexión
function testConnection(projectPath) {
  console.log(`🔍 Probando conexión desde ${projectPath}...`);
  try {
    const testScript = path.join(projectPath, 'scripts', 'test-mongodb-connection.js');
    if (fs.existsSync(testScript)) {
      execSync('node scripts/test-mongodb-connection.js', { cwd: projectPath, stdio: 'inherit' });
    } else {
      console.log(`⚠️  Script de prueba no encontrado en ${testScript}`);
    }
  } catch (error) {
    console.error(`❌ Error probando conexión desde ${projectPath}:`, error.message);
  }
}

// Configuración del backend
const backendEnvContent = `# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://sergiojdf:<db_password>@9001app-v2.xqydf2m.mongodb.net/?retryWrites=true&w=majority&appName=9001app-v2
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
MONGODB_URI=mongodb+srv://sergiojdf:<db_password>@9001app-v2.xqydf2m.mongodb.net/?retryWrites=true&w=majority&appName=9001app-v2
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

// Ejecutar configuración
async function setupMongoDB() {
  try {
    console.log('📋 Configurando MongoDB Atlas para 9001app-v2...\n');
    
    // 1. Configurar backend
    console.log('🔧 Configurando Backend...');
    createEnvFile('./backend', backendEnvContent);
    installDependencies('./backend');
    
    // 2. Configurar agent-coordinator
    console.log('\n🤖 Configurando Agent Coordinator...');
    createEnvFile('./agent-coordinator', agentEnvContent);
    installDependencies('./agent-coordinator');
    
    // 3. Crear directorios necesarios
    console.log('\n📁 Creando directorios necesarios...');
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
    
    // 4. Instrucciones finales
    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Ve a MongoDB Atlas → Database Access');
    console.log('2. Crea o resetea la contraseña del usuario sergiojdf');
    console.log('3. Ve a Network Access y agrega tu IP (0.0.0.0/0 para desarrollo)');
    console.log('4. Reemplaza <db_password> en los archivos .env con tu contraseña real');
    console.log('5. Ejecuta las pruebas de conexión:');
    console.log('   - Backend: cd backend && node scripts/test-mongodb-connection.js');
    console.log('   - Agent: cd agent-coordinator && node scripts/test-mongodb-connection.js');
    console.log('\n🚀 Una vez configurado, puedes ejecutar:');
    console.log('   - Backend: cd backend && npm run dev');
    console.log('   - Agent: cd agent-coordinator && npm run mongodb');
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar configuración
setupMongoDB();
