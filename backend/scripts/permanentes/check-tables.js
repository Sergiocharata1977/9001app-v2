const mongoClient = require('../../lib/mongoClient.js');

async function checkTables() {
  try {
    console.log('📋 Verificando tablas existentes...\n');
    
    const result = await mongoClient.execute('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name');
    
    console.log(`Total de tablas: ${result.rows.length}\n`);
    result.rows.forEach(row => {
      console.log(`- ${row.name}`);
    });
    
    // Verificar específicamente las tablas RAG
    console.log('\n🔍 Verificando tablas RAG específicamente...');
    const ragTables = await mongoClient.execute('SELECT name FROM sqlite_master WHERE type="table" AND name LIKE "%rag%" ORDER BY name');
    
    console.log(`Tablas RAG encontradas: ${ragTables.rows.length}`);
    ragTables.rows.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();
