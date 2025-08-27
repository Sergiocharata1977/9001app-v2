const mongodbClient = require('../../lib/mongodbClient.js');
const fs = require('fs');
const path = require('path');

async function updateAccionesTable() {
  try {
    console.log('🔄 Iniciando actualización de la tabla de acciones...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../../database/migrations/20241222_update_acciones_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);
    
    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      try {
        await mongodbClient.execute(command);
        console.log(`✅ Comando ${i + 1}/${commands.length} ejecutado correctamente`);
      } catch (error) {
        console.log(`⚠️ Comando ${i + 1}/${commands.length} falló (puede ser normal si la columna ya existe):`, error.message);
      }
    }
    
    // Verificar la estructura de la tabla
    console.log('🔍 Verificando estructura de la tabla...');
    const tableInfo = await mongodbClient.execute("PRAGMA table_info(acciones)");
    console.log('📊 Columnas en la tabla acciones:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.type})`);
    });
    
    // Verificar datos existentes
    const countResult = await mongodbClient.execute("SELECT COUNT(*) as count FROM acciones");
    console.log(`📈 Total de acciones en la base de datos: ${countResult.rows[0].count}`);
    
    console.log('✅ Actualización de la tabla de acciones completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateAccionesTable()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { updateAccionesTable };
