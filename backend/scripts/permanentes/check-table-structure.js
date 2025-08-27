const mongoClient = require('../../lib/mongoClient.js');

async function checkTableStructure() {
  console.log('🔍 Verificando estructura de tablas...\n');

  const tables = [
    'minutas',
    'personal', 
    'departamentos',
    'puestos',
    'documentos',
    'normas',
    'auditorias',
    'hallazgos',
    'acciones',
    'indicadores',
    'objetivos_calidad',
    'procesos',
    'capacitaciones'
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Tabla: ${table}`);
      const result = await mongoClient.execute(`PRAGMA table_info(${table})`);
      
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

checkTableStructure();
