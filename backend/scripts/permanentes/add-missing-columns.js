const mongoClient = require('../../lib/mongoClient.js');

async function addMissingColumns() {
  try {
    console.log('🔄 Agregando columnas faltantes a la tabla de acciones...');
    
    // Lista de columnas que necesitamos agregar
    const columnsToAdd = [
      { name: 'prioridad', type: 'TEXT DEFAULT "media"' },
      { name: 'titulo', type: 'TEXT' },
      { name: 'evidencia_accion', type: 'TEXT' },
      { name: 'resultado_verificacion', type: 'TEXT' },
      { name: 'observaciones', type: 'TEXT' },
      { name: 'descripcion_verificacion', type: 'TEXT' },
      { name: 'responsable_verificacion', type: 'TEXT' },
      { name: 'fecha_plan_verificacion', type: 'TEXT' },
      { name: 'comentarios_verificacion', type: 'TEXT' },
      { name: 'fecha_verificacion_finalizada', type: 'TEXT' },
      { name: 'fecha_ejecucion', type: 'TEXT' }
    ];
    
    // Obtener las columnas existentes
    const tableInfo = await mongoClient.execute("PRAGMA table_info(acciones)");
    const existingColumns = tableInfo.rows.map(row => row.name);
    
    console.log('📊 Columnas existentes:', existingColumns);
    
    // Agregar columnas faltantes
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        try {
          await mongoClient.execute(`ALTER TABLE acciones ADD COLUMN ${column.name} ${column.type}`);
          console.log(`✅ Columna ${column.name} agregada correctamente`);
        } catch (error) {
          console.log(`⚠️ Error al agregar columna ${column.name}:`, error.message);
        }
      } else {
        console.log(`ℹ️ Columna ${column.name} ya existe`);
      }
    }
    
    // Verificar la estructura final
    console.log('🔍 Verificando estructura final de la tabla...');
    const finalTableInfo = await mongoClient.execute("PRAGMA table_info(acciones)");
    console.log('📊 Columnas finales en la tabla acciones:');
    finalTableInfo.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.type})`);
    });
    
    console.log('✅ Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addMissingColumns()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { addMissingColumns };
