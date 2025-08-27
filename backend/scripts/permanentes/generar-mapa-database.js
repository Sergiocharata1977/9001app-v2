const mongodbClient = require('../../lib/mongodbClient.js');

async function generarMapaDatabase() {
  console.log('🗄️ Generando mapa de base de datos...\n');
  
  try {
    // Obtener todas las tablas
    const tablasResult = await mongodbClient.execute(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    const mapa = {
      tablas: {},
      indices: {},
      estadisticas: {},
      timestamp: new Date().toISOString()
    };
    
    // Procesar cada tabla
    for (const tabla of tablasResult.rows) {
      const nombreTabla = tabla.name;
      console.log(`📋 Procesando tabla: ${nombreTabla}`);
      
      // Obtener estructura de la tabla
      const estructuraResult = await mongodbClient.execute(`PRAGMA table_info(${nombreTabla})`);
      
      // Obtener estadísticas básicas
      const countResult = await mongodbClient.execute(`SELECT COUNT(*) as total FROM ${nombreTabla}`);
      const totalRegistros = countResult.rows[0].total;
      
      // Obtener índices de la tabla
      const indicesResult = await mongodbClient.execute(`
        SELECT name, sql FROM sqlite_master 
        WHERE type='index' AND tbl_name = ?
        ORDER BY name
      `, [nombreTabla]);
      
      mapa.tablas[nombreTabla] = {
        estructura: estructuraResult.rows.map(col => ({
          nombre: col.name,
          tipo: col.type,
          notNull: col.notnull === 1,
          primaryKey: col.pk === 1,
          defaultValue: col.dflt_value
        })),
        totalRegistros,
        indices: indicesResult.rows.map(idx => ({
          nombre: idx.name,
          sql: idx.sql
        })),
        sql: tabla.sql
      };
    }
    
    // Obtener estadísticas generales
    mapa.estadisticas = {
      totalTablas: tablasResult.rows.length,
      totalIndices: await contarIndices(),
      tamañoAproximado: await calcularTamañoAproximado()
    };
    
    // Generar y guardar documento
    const contenido = generarMarkdown(mapa);
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../../../docs-esenciales/03-mapa-database-automatico.md');
    
    fs.writeFileSync(outputPath, contenido);
    console.log(`✅ Mapa de BD generado: ${outputPath}`);
    
    return mapa;
    
  } catch (error) {
    console.error('❌ Error generando mapa de BD:', error);
    throw error;
  }
}

async function contarIndices() {
  const result = await mongodbClient.execute(`
    SELECT COUNT(*) as total FROM sqlite_master 
    WHERE type='index' AND name NOT LIKE 'sqlite_%'
  `);
  return result.rows[0].total;
}

async function calcularTamañoAproximado() {
  const result = await mongodbClient.execute(`
    SELECT SUM(length(quote(name)) + length(quote(sql))) as tamaño
    FROM sqlite_master 
    WHERE type='table'
  `);
  return result.rows[0].tamaño || 0;
}

function generarMarkdown(mapa) {
  let contenido = `# 🗄️ MAPA DE BASE DE DATOS - SISTEMA SGC
**📅 Generado automáticamente: ${new Date().toLocaleString('es-ES')}**

## 📊 **ESTADÍSTICAS GENERALES**
- **Total Tablas:** ${mapa.estadisticas.totalTablas}
- **Total Índices:** ${mapa.estadisticas.totalIndices}
- **Tamaño Aproximado:** ${(mapa.estadisticas.tamañoAproximado / 1024).toFixed(2)} KB

## 📋 **TABLAS DEL SISTEMA**

`;

  // Agrupar tablas por módulo
  const modulos = {
    'Sistema': [],
    'Calidad': [],
    'RRHH': [],
    'Procesos': [],
    'CRM': [],
    'Otros': []
  };
  
  for (const [nombreTabla, info] of Object.entries(mapa.tablas)) {
    const modulo = determinarModulo(nombreTabla);
    modulos[modulo].push({ nombre: nombreTabla, info });
  }
  
  // Generar contenido por módulo
  for (const [modulo, tablas] of Object.entries(modulos)) {
    if (tablas.length > 0) {
      contenido += `### 🎯 **${modulo}** (${tablas.length} tablas)\n\n`;
      
      for (const { nombre, info } of tablas) {
        contenido += generarTablaMarkdown(nombre, info);
      }
      
      contenido += '\n';
    }
  }
  
  contenido += `## 🔍 **ÍNDICES CRÍTICOS**
${generarIndicesCriticos(mapa)}

## 📝 **NOTAS PARA IA**
- Base de datos: **Turso (SQLite)** en la nube
- Conexión: \`backend/lib/mongodbClient.js\`
- Patrón: Una tabla por entidad principal
- Índices optimizados para consultas frecuentes
- Sistema de coordinación: tabla \`coordinacion_tareas\`
`;

  return contenido;
}

function determinarModulo(nombreTabla) {
  const nombre = nombreTabla.toLowerCase();
  
  if (nombre.includes('usuario') || nombre.includes('auth') || nombre.includes('role')) return 'Sistema';
  if (nombre.includes('calidad') || nombre.includes('auditoria') || nombre.includes('hallazgo')) return 'Calidad';
  if (nombre.includes('personal') || nombre.includes('empleado') || nombre.includes('capacitacion')) return 'RRHH';
  if (nombre.includes('proceso') || nombre.includes('procedimiento')) return 'Procesos';
  if (nombre.includes('cliente') || nombre.includes('contacto') || nombre.includes('actividad')) return 'CRM';
  if (nombre.includes('coordinacion')) return 'Sistema';
  
  return 'Otros';
}

function generarTablaMarkdown(nombre, info) {
  let contenido = `#### 📋 **${nombre}** (${info.totalRegistros} registros)

**Estructura:**
\`\`\`sql
${info.sql}
\`\`\`

**Columnas principales:**
`;

  // Mostrar solo columnas importantes
  const columnasImportantes = info.estructura.filter(col => 
    col.primaryKey || col.notNull || ['name', 'title', 'description', 'email', 'status'].includes(col.nombre)
  );
  
  for (const col of columnasImportantes) {
    const flags = [];
    if (col.primaryKey) flags.push('PK');
    if (col.notNull) flags.push('NOT NULL');
    if (col.defaultValue) flags.push(`DEFAULT: ${col.defaultValue}`);
    
    contenido += `- **${col.nombre}** (\`${col.tipo}\`) ${flags.length > 0 ? `[${flags.join(', ')}]` : ''}\n`;
  }
  
  if (info.indices.length > 0) {
    contenido += `\n**Índices:** ${info.indices.map(idx => idx.nombre).join(', ')}\n`;
  }
  
  contenido += '\n';
  return contenido;
}

function generarIndicesCriticos(mapa) {
  const indicesCriticos = [];
  
  for (const [nombreTabla, info] of Object.entries(mapa.tablas)) {
    for (const indice of info.indices) {
      if (indice.nombre.includes('idx_') || indice.nombre.includes('unique_')) {
        indicesCriticos.push({
          tabla: nombreTabla,
          nombre: indice.nombre,
          sql: indice.sql
        });
      }
    }
  }
  
  let contenido = '';
  for (const indice of indicesCriticos.slice(0, 10)) { // Solo los primeros 10
    contenido += `- **${indice.nombre}** (${indice.tabla})\n`;
  }
  
  return contenido;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generarMapaDatabase();
}

module.exports = { generarMapaDatabase };
