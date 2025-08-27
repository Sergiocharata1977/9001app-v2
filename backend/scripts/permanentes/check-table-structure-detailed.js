const mongodbClient = require('../../lib/mongodbClient.js');

/**
 * Script para verificar la estructura detallada de las tablas
 * y corregir las consultas SQL del sistema RAG
 */

async function checkTableStructure() {
  console.log('🔍 Verificando estructura detallada de tablas...\n');

  const tables = [
    'puestos',
    'objetivos_calidad', 
    'personal',
    'departamentos',
    'indicadores',
    'minutas',
    'mediciones'
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Tabla: ${table}`);
      const result = await mongodbClient.execute(`PRAGMA table_info(${table})`);
      
      if (result.rows.length > 0) {
        console.log('   Columnas:');
        result.rows.forEach(col => {
          console.log(`     - ${col.name} (${col.type})`);
        });
      } else {
        console.log('   ❌ Tabla no encontrada');
      }
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log('');
    }
  }
}

// Ejecutar verificación
checkTableStructure();
