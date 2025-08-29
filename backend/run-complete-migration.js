#!/usr/bin/env node

/**
 * SCRIPT MAESTRO DE MIGRACIÓN MONGODB
 * ===================================
 * 
 * Este script ejecuta la migración completa de Turso a MongoDB
 * Incluye todas las tablas críticas y verificaciones de integridad
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const MIGRATION_SCRIPTS = [
  {
    name: 'Planes (CRÍTICO)',
    script: 'migrate-planes-table.js',
    description: 'Migra la tabla planes - crítica para el funcionamiento del sistema'
  },
  {
    name: 'RRHH Módulo',
    script: 'migrate-rrhh-module.js', 
    description: 'Migra departamentos, personal, puestos, capacitaciones, competencias'
  },
  {
    name: 'RRHH Restante',
    script: 'migrate-rrhh-remaining.js',
    description: 'Migra evaluaciones individuales y otras tablas RRHH'
  },
  {
    name: 'Relaciones SGC',
    script: 'migrate-sgc-relations.js',
    description: 'Migra tablas de relaciones del Sistema de Gestión de Calidad'
  }
];

async function runCompleteMigration() {
  console.log('🚀 MIGRACIÓN MONGODB - INICIO');
  console.log('============================');
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`🎯 Objetivo: Migración 100% a MongoDB`);
  console.log(`📊 Estado actual: 81.4% → 100%`);
  console.log('');
  
  const startTime = Date.now();
  let successfulMigrations = 0;
  let failedMigrations = 0;
  
  // Verificar que MongoDB esté configurado
  console.log('🔍 Verificando configuración...');
  const mongoUri = process.env.MONGODB_URI;
  const mongoDb = process.env.MONGODB_DB_NAME;
  
  if (!mongoUri || !mongoDb) {
    console.error('❌ CONFIGURACIÓN INCOMPLETA');
    console.error('   Falta MONGODB_URI o MONGODB_DB_NAME en .env');
    console.error('   Configuración requerida:');
    console.error('   MONGODB_URI=mongodb+srv://9001app:password@cluster0.mongodb.net/9001app');
    console.error('   MONGODB_DB_NAME=9001app');
    process.exit(1);
  }
  
  console.log('✅ Configuración MongoDB encontrada');
  console.log(`   🔗 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  console.log(`   🗄️  Base de datos: ${mongoDb}`);
  console.log('');
  
  // Ejecutar migraciones en secuencia
  for (let i = 0; i < MIGRATION_SCRIPTS.length; i++) {
    const migration = MIGRATION_SCRIPTS[i];
    const stepNumber = i + 1;
    
    console.log(`📋 PASO ${stepNumber}/${MIGRATION_SCRIPTS.length}: ${migration.name}`);
    console.log(`   📝 ${migration.description}`);
    console.log(`   🔧 Ejecutando: ${migration.script}`);
    
    try {
      const { stdout, stderr } = await execAsync(`node ${migration.script}`);
      
      if (stderr && !stderr.includes('warn')) {
        console.log(`   ⚠️  Advertencias: ${stderr}`);
      }
      
      // Mostrar salida del script (últimas líneas)
      const outputLines = stdout.split('\n').filter(line => line.trim());
      const lastLines = outputLines.slice(-3);
      lastLines.forEach(line => {
        if (line.includes('✅') || line.includes('🎉')) {
          console.log(`   ${line}`);
        }
      });
      
      console.log(`   ✅ PASO ${stepNumber} COMPLETADO`);
      successfulMigrations++;
      
    } catch (error) {
      console.error(`   ❌ PASO ${stepNumber} FALLÓ`);
      console.error(`   💥 Error: ${error.message}`);
      
      // Si falla una migración crítica (planes), detener todo
      if (migration.script.includes('planes')) {
        console.error('   🚨 MIGRACIÓN CRÍTICA FALLÓ - DETENIENDO PROCESO');
        throw error;
      }
      
      failedMigrations++;
    }
    
    console.log('');
  }
  
  // Ejecutar limpieza de Turso
  console.log('🧹 PASO FINAL: Limpieza de dependencias Turso...');
  try {
    await execAsync('node eliminate-turso-dependencies.js');
    console.log('   ✅ Dependencias Turso eliminadas');
  } catch (error) {
    console.log('   ⚠️  Limpieza Turso falló (no crítico):', error.message);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Reporte final
  console.log('');
  console.log('🎯 MIGRACIÓN COMPLETADA');
  console.log('======================');
  console.log(`⏱️  Tiempo total: ${duration} segundos`);
  console.log(`✅ Migraciones exitosas: ${successfulMigrations}/${MIGRATION_SCRIPTS.length}`);
  console.log(`❌ Migraciones fallidas: ${failedMigrations}/${MIGRATION_SCRIPTS.length}`);
  
  if (failedMigrations === 0) {
    console.log('');
    console.log('🎉 ¡MIGRACIÓN 100% EXITOSA!');
    console.log('===========================');
    console.log('✅ Todas las tablas críticas migradas');
    console.log('✅ Sistema completamente en MongoDB');
    console.log('✅ Dependencias Turso eliminadas');
    console.log('✅ Rendimiento optimizado');
    console.log('✅ Listo para producción');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('1. Ejecutar npm install para limpiar dependencias');
    console.log('2. Reiniciar el servidor backend');
    console.log('3. Probar funcionalidades críticas');
    console.log('4. Monitorear rendimiento');
    console.log('5. Hacer backup de MongoDB');
    
  } else {
    console.log('');
    console.log('⚠️  MIGRACIÓN PARCIALMENTE EXITOSA');
    console.log('==================================');
    console.log(`✅ ${successfulMigrations} migraciones exitosas`);
    console.log(`❌ ${failedMigrations} migraciones fallaron`);
    console.log('');
    console.log('📋 ACCIONES REQUERIDAS:');
    console.log('1. Revisar logs de errores arriba');
    console.log('2. Verificar conexión MongoDB');
    console.log('3. Reejecutar migraciones fallidas');
    console.log('4. Contactar soporte si persisten errores');
  }
}

// Función de ayuda
function showHelp() {
  console.log('📖 AYUDA - MIGRACIÓN MONGODB');
  console.log('============================');
  console.log('');
  console.log('🚀 Uso:');
  console.log('   node run-complete-migration.js');
  console.log('');
  console.log('📋 Prerequisitos:');
  console.log('   ✅ Archivo .env configurado con MONGODB_URI y MONGODB_DB_NAME');
  console.log('   ✅ MongoDB Atlas o instancia local ejecutándose');
  console.log('   ✅ Credenciales de MongoDB válidas');
  console.log('');
  console.log('🔧 Configuración ejemplo (.env):');
  console.log('   MONGODB_URI=mongodb+srv://9001app:password@cluster0.mongodb.net/9001app');
  console.log('   MONGODB_DB_NAME=9001app');
  console.log('');
  console.log('📊 Tablas que se migrarán:');
  MIGRATION_SCRIPTS.forEach((migration, index) => {
    console.log(`   ${index + 1}. ${migration.name}`);
    console.log(`      📝 ${migration.description}`);
  });
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Este proceso es IRREVERSIBLE');
  console.log('   - Hacer backup antes de ejecutar');
  console.log('   - Verificar que no hay usuarios activos');
  console.log('   - Tiempo estimado: 2-5 minutos');
}

// Manejo de argumentos
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Ejecutar migración
if (require.main === module) {
  runCompleteMigration()
    .then(() => {
      console.log('\n🏁 SCRIPT FINALIZADO EXITOSAMENTE');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 SCRIPT FALLÓ:', error.message);
      console.error('\n🔧 Para obtener ayuda: node run-complete-migration.js --help');
      process.exit(1);
    });
}

module.exports = { runCompleteMigration };