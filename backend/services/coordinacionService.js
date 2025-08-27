const mongodbClient = require('../lib/mongodbClient.js');

class CoordinacionService {
  
  // Obtener todas las tareas
  async obtenerTareas(organizationId = 2, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM coordinacion_tareas 
        WHERE organization_id = ? 
        ORDER BY fecha DESC, hora_inicio DESC 
        LIMIT ? OFFSET ?
      `;
      
      const result = await mongodbClient.execute(query, [organizationId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo tareas:', error);
      throw error;
    }
  }
  
  // Obtener tarea por número
  async obtenerTareaPorNumero(organizationId, tareaNumero) {
    try {
      const query = `
        SELECT * FROM coordinacion_tareas 
        WHERE organization_id = ? AND tarea_numero = ?
      `;
      
      const result = await mongodbClient.execute(query, [organizationId, tareaNumero]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo tarea:', error);
      throw error;
    }
  }
  
  // Obtener estadísticas
  async obtenerEstadisticas(organizationId = 2) {
    try {
      // Total tareas
      const totalQuery = await mongodbClient.execute(
        'SELECT COUNT(*) as total FROM coordinacion_tareas WHERE organization_id = ?',
        [organizationId]
      );
      
      // Por estado
      const estadoQuery = await mongodbClient.execute(`
        SELECT estado, COUNT(*) as count 
        FROM coordinacion_tareas 
        WHERE organization_id = ? 
        GROUP BY estado
      `, [organizationId]);
      
      // Por módulo
      const moduloQuery = await mongodbClient.execute(`
        SELECT modulo, COUNT(*) as count 
        FROM coordinacion_tareas 
        WHERE organization_id = ? 
        GROUP BY modulo
      `, [organizationId]);
      
      // Por prioridad
      const prioridadQuery = await mongodbClient.execute(`
        SELECT prioridad, COUNT(*) as count 
        FROM coordinacion_tareas 
        WHERE organization_id = ? 
        GROUP BY prioridad
      `, [organizationId]);
      
      // Tiempo total
      const tiempoQuery = await mongodbClient.execute(`
        SELECT 
          SUM(tiempo_real) as tiempo_total,
          AVG(tiempo_real) as tiempo_promedio,
          COUNT(*) as tareas_con_tiempo
        FROM coordinacion_tareas 
        WHERE organization_id = ? AND tiempo_real IS NOT NULL
      `, [organizationId]);
      
      const total = totalQuery.rows[0].total;
      const estados = {};
      const modulos = {};
      const prioridades = {};
      
      estadoQuery.rows.forEach(row => {
        estados[row.estado] = row.count;
      });
      
      moduloQuery.rows.forEach(row => {
        modulos[row.modulo] = row.count;
      });
      
      prioridadQuery.rows.forEach(row => {
        prioridades[row.prioridad] = row.count;
      });
      
      const tiempo = tiempoQuery.rows[0];
      
      return {
        total,
        estados,
        modulos,
        prioridades,
        tiempo: {
          total: tiempo.tiempo_total || 0,
          promedio: tiempo.tiempo_promedio || 0,
          tareas_con_tiempo: tiempo.tareas_con_tiempo || 0
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
  
  // Buscar tareas por texto
  async buscarTareas(organizationId, texto, limit = 20) {
    try {
      const query = `
        SELECT * FROM coordinacion_tareas 
        WHERE organization_id = ? 
        AND (
          descripcion LIKE ? OR 
          problema LIKE ? OR 
          solucion LIKE ? OR 
          resultado LIKE ?
        )
        ORDER BY fecha DESC 
        LIMIT ?
      `;
      
      const searchTerm = `%${texto}%`;
      const result = await mongodbClient.execute(query, [
        organizationId, 
        searchTerm, 
        searchTerm, 
        searchTerm, 
        searchTerm, 
        limit
      ]);
      
      return result.rows;
    } catch (error) {
      console.error('Error buscando tareas:', error);
      throw error;
    }
  }
  
  // Obtener tareas por módulo
  async obtenerTareasPorModulo(organizationId, modulo, limit = 20) {
    try {
      const query = `
        SELECT * FROM coordinacion_tareas 
        WHERE organization_id = ? AND modulo = ?
        ORDER BY fecha DESC 
        LIMIT ?
      `;
      
      const result = await mongodbClient.execute(query, [organizationId, modulo, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo tareas por módulo:', error);
      throw error;
    }
  }
  
  // Obtener tareas por estado
  async obtenerTareasPorEstado(organizationId, estado, limit = 20) {
    try {
      const query = `
        SELECT * FROM coordinacion_tareas 
        WHERE organization_id = ? AND estado = ?
        ORDER BY fecha DESC 
        LIMIT ?
      `;
      
      const result = await mongodbClient.execute(query, [organizationId, estado, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo tareas por estado:', error);
      throw error;
    }
  }
  
  // Crear nueva tarea
  async crearTarea(tareaData) {
    try {
      const query = `
        INSERT INTO coordinacion_tareas (
          organization_id, tarea_numero, fecha, hora_inicio, descripcion,
          estado, prioridad, modulo, archivos_trabajados, archivos_creados,
          problema, solucion, resultado, tiempo_estimado, tiempo_real
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        tareaData.organization_id || 2,
        tareaData.tarea_numero,
        tareaData.fecha,
        tareaData.hora_inicio,
        tareaData.descripcion,
        tareaData.estado || 'en_proceso',
        tareaData.prioridad || 'normal',
        tareaData.modulo || 'sistema',
        tareaData.archivos_trabajados || '',
        tareaData.archivos_creados || '',
        tareaData.problema || '',
        tareaData.solucion || '',
        tareaData.resultado || '',
        tareaData.tiempo_estimado || 120,
        tareaData.tiempo_real || 120
      ];
      
      const result = await mongodbClient.execute(query, params);
      return result.lastInsertRowid;
    } catch (error) {
      console.error('Error creando tarea:', error);
      throw error;
    }
  }
  
  // Actualizar tarea
  async actualizarTarea(organizationId, tareaNumero, tareaData) {
    try {
      const query = `
        UPDATE coordinacion_tareas 
        SET 
          fecha = ?, hora_inicio = ?, descripcion = ?, estado = ?,
          prioridad = ?, modulo = ?, archivos_trabajados = ?, archivos_creados = ?,
          problema = ?, solucion = ?, resultado = ?, tiempo_estimado = ?,
          tiempo_real = ?, updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = ? AND tarea_numero = ?
      `;
      
      const params = [
        tareaData.fecha,
        tareaData.hora_inicio,
        tareaData.descripcion,
        tareaData.estado,
        tareaData.prioridad,
        tareaData.modulo,
        tareaData.archivos_trabajados,
        tareaData.archivos_creados,
        tareaData.problema,
        tareaData.solucion,
        tareaData.resultado,
        tareaData.tiempo_estimado,
        tareaData.tiempo_real,
        organizationId,
        tareaNumero
      ];
      
      const result = await mongodbClient.execute(query, params);
      return result.changes > 0;
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      throw error;
    }
  }
  
  // Eliminar tarea
  async eliminarTarea(organizationId, tareaNumero) {
    try {
      const query = `
        DELETE FROM coordinacion_tareas 
        WHERE organization_id = ? AND tarea_numero = ?
      `;
      
      const result = await mongodbClient.execute(query, [organizationId, tareaNumero]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      throw error;
    }
  }
  
  // Obtener siguiente número de tarea
  async obtenerSiguienteNumeroTarea(organizationId) {
    try {
      const query = `
        SELECT MAX(tarea_numero) as max_numero 
        FROM coordinacion_tareas 
        WHERE organization_id = ?
      `;
      
      const result = await mongodbClient.execute(query, [organizationId]);
      const maxNumero = result.rows[0].max_numero || 0;
      return maxNumero + 1;
    } catch (error) {
      console.error('Error obteniendo siguiente número:', error);
      throw error;
    }
  }
}

module.exports = new CoordinacionService();
