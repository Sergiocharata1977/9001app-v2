const mongoClient = require('../../lib/mongoClient.js');
const fs = require('fs');
const path = require('path');

// Función para leer y parsear la documentación de coordinación
async function parseCoordinacionDocs() {
  try {
    const docsPath = path.join(__dirname, '../../../docs-esenciales/04-sistema-coordinacion-agentes-19-08-2025.md');
    const content = fs.readFileSync(docsPath, 'utf8');
    
    const tareas = [];
    const tareaRegex = /### 📝 Tarea #(\d+)\s*\n- 📅 Fecha: (\d{2}-\d{2}-\d{4})\s*\n- ⏰ Hora inicio: (\d{2}:\d{2})\s*\n- 🖊️ Descripción: ([^\n]+)\s*\n- 🎯 Objetivos:\s*\n([\s\S]*?)- 🔄 Estado: ([^\n]+)\s*\n- 📦 Entregable: ([^\n]+)\s*\n- 📁 Archivos trabajados: ([^\n]+)\s*\n- 📄 Archivos creados: ([^\n]+)\s*\n- 🗑️ Archivos eliminados: ([^\n]+)\s*\n- 📑 Informe:\s*\n([\s\S]*?)(?=### 📝 Tarea #|\n---)/g;
    
    let match;
    while ((match = tareaRegex.exec(content)) !== null) {
      const [
        fullMatch,
        tareaNumero,
        fecha,
        horaInicio,
        descripcion,
        objetivos,
        estado,
        entregable,
        archivosTrabajados,
        archivosCreados,
        archivosEliminados,
        informe
      ] = match;
      
      // Determinar módulo basado en descripción
      const modulo = determinarModulo(descripcion);
      
      // Determinar prioridad basado en descripción
      const prioridad = determinarPrioridad(descripcion);
      
      // Extraer problema y solución del informe
      const { problema, solucion, resultado } = extraerProblemaSolucion(informe);
      
      const tareaNumeroInt = parseInt(tareaNumero);
      if (!isNaN(tareaNumeroInt)) {
        tareas.push({
          tarea_numero: tareaNumeroInt,
          fecha: convertirFecha(fecha),
          hora_inicio: horaInicio,
          descripcion: descripcion.trim(),
          estado: estado.includes('Terminado') ? 'terminado' : 
                  estado.includes('En proceso') ? 'en_proceso' : 'pausado',
          prioridad,
          modulo,
          archivos_trabajados: archivosTrabajados.trim(),
          archivos_creados: archivosCreados.trim(),
          problema,
          solucion,
          resultado,
          tiempo_estimado: 120, // 2 horas por defecto
          tiempo_real: 120
        });
      }
    }
    
    return tareas;
  } catch (error) {
    console.error('Error parseando documentación:', error);
    return [];
  }
}

// Función para determinar módulo
function determinarModulo(descripcion) {
  const desc = descripcion.toLowerCase();
  if (desc.includes('crm') || desc.includes('clientes')) return 'crm';
  if (desc.includes('personal') || desc.includes('rrhh')) return 'rrhh';
  if (desc.includes('procesos')) return 'procesos';
  if (desc.includes('calidad') || desc.includes('iso')) return 'calidad';
  if (desc.includes('menú') || desc.includes('navegación')) return 'sistema';
  if (desc.includes('rag') || desc.includes('base de datos')) return 'sistema';
  return 'sistema';
}

// Función para determinar prioridad
function determinarPrioridad(descripcion) {
  const desc = descripcion.toLowerCase();
  if (desc.includes('crítico') || desc.includes('error') || desc.includes('urgente')) return 'critica';
  if (desc.includes('importante') || desc.includes('corrección')) return 'alta';
  return 'normal';
}

// Función para extraer problema, solución y resultado
function extraerProblemaSolucion(informe) {
  const info = informe.toLowerCase();
  
  let problema = '';
  let solucion = '';
  let resultado = '';
  
  // Buscar patrones comunes
  if (info.includes('problema:')) {
    const match = informe.match(/problema[:\s]+([^.\n]+)/i);
    problema = match ? match[1].trim() : '';
  }
  
  if (info.includes('solución:')) {
    const match = informe.match(/solución[:\s]+([^.\n]+)/i);
    solucion = match ? match[1].trim() : '';
  }
  
  if (info.includes('resultado:')) {
    const match = informe.match(/resultado[:\s]+([^.\n]+)/i);
    resultado = match ? match[1].trim() : '';
  }
  
  return { problema, solucion, resultado };
}

// Función para convertir fecha
function convertirFecha(fecha) {
  const [dia, mes, año] = fecha.split('-');
  return `${año}-${mes}-${dia}`;
}

// Función para guardar tareas en la base de datos
async function guardarTareasEnBD(tareas) {
  console.log(`🔄 Guardando ${tareas.length} tareas en la base de datos...`);
  
  for (const tarea of tareas) {
    try {
      const query = `
        INSERT OR REPLACE INTO coordinacion_tareas (
          organization_id, tarea_numero, fecha, hora_inicio, descripcion,
          estado, prioridad, modulo, archivos_trabajados, archivos_creados,
          problema, solucion, resultado, tiempo_estimado, tiempo_real
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        2, // organization_id
        tarea.tarea_numero,
        tarea.fecha,
        tarea.hora_inicio,
        tarea.descripcion,
        tarea.estado,
        tarea.prioridad,
        tarea.modulo,
        tarea.archivos_trabajados,
        tarea.archivos_creados,
        tarea.problema,
        tarea.solucion,
        tarea.resultado,
        tarea.tiempo_estimado,
        tarea.tiempo_real
      ];
      
      await mongoClient.execute(query, params);
      console.log(`✅ Tarea #${tarea.tarea_numero} guardada`);
      
    } catch (error) {
      console.error(`❌ Error guardando tarea #${tarea.tarea_numero}:`, error.message);
    }
  }
}

// Función principal
async function sincronizarCoordinacion() {
  console.log('🚀 Iniciando sincronización de coordinación...\n');
  
  try {
    // Parsear documentación
    const tareas = await parseCoordinacionDocs();
    console.log(`📋 Encontradas ${tareas.length} tareas en la documentación\n`);
    
    if (tareas.length === 0) {
      console.log('❌ No se encontraron tareas para sincronizar');
      return;
    }
    
    // Guardar en base de datos
    await guardarTareasEnBD(tareas);
    
    console.log('\n✅ Sincronización completada exitosamente');
    
    // Mostrar estadísticas
    const stats = await obtenerEstadisticas();
    console.log('\n📊 Estadísticas:');
    console.log(`- Total tareas: ${stats.total}`);
    console.log(`- Terminadas: ${stats.terminadas}`);
    console.log(`- En proceso: ${stats.enProceso}`);
    console.log(`- Por módulo:`, stats.porModulo);
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  }
}

// Función para obtener estadísticas
async function obtenerEstadisticas() {
  try {
    const totalQuery = await mongoClient.execute(
      'SELECT COUNT(*) as total FROM coordinacion_tareas WHERE organization_id = 2'
    );
    
    const estadoQuery = await mongoClient.execute(`
      SELECT estado, COUNT(*) as count 
      FROM coordinacion_tareas 
      WHERE organization_id = 2 
      GROUP BY estado
    `);
    
    const moduloQuery = await mongoClient.execute(`
      SELECT modulo, COUNT(*) as count 
      FROM coordinacion_tareas 
      WHERE organization_id = 2 
      GROUP BY modulo
    `);
    
    const total = totalQuery.rows[0].total;
    const terminadas = estadoQuery.rows.find(r => r.estado === 'terminado')?.count || 0;
    const enProceso = estadoQuery.rows.find(r => r.estado === 'en_proceso')?.count || 0;
    
    const porModulo = {};
    moduloQuery.rows.forEach(row => {
      porModulo[row.modulo] = row.count;
    });
    
    return { total, terminadas, enProceso, porModulo };
    
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { total: 0, terminadas: 0, enProceso: 0, porModulo: {} };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  sincronizarCoordinacion();
}

module.exports = {
  sincronizarCoordinacion,
  parseCoordinacionDocs,
  obtenerEstadisticas
};
