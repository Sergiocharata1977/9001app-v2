const mongoClient = require('../lib/mongoClient.js');
const crypto = require('crypto');

/**
 * Servicio para registrar actividades del sistema en la bitácora unificada
 */
class ActivityLogService {
  
  /**
   * Registra una actividad en la bitácora del sistema
   * @param {Object} activityData - Datos de la actividad
   * @param {string} activityData.tipo_entidad - Tipo de entidad (departamento, puesto, proceso, etc.)
   * @param {string} activityData.entidad_id - ID de la entidad
   * @param {string} activityData.accion - Acción realizada (crear, actualizar, eliminar)
   * @param {string} activityData.descripcion - Descripción legible de la actividad
   * @param {string} activityData.usuario_id - ID del usuario que realizó la acción
   * @param {string} activityData.usuario_nombre - Nombre del usuario
   * @param {number} activityData.organization_id - ID de la organización
   * @param {Object} activityData.datos_anteriores - Datos antes del cambio (opcional)
   * @param {Object} activityData.datos_nuevos - Datos después del cambio (opcional)
   * @param {string} activityData.ip_address - Dirección IP (opcional)
   * @param {string} activityData.user_agent - User Agent (opcional)
   */
  static async registrarActividad(activityData) {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const sql = `
        INSERT INTO actividad_sistema (
          id, tipo_entidad, entidad_id, accion, descripcion,
          usuario_id, usuario_nombre, organization_id,
          datos_anteriores, datos_nuevos, created_at,
          ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const args = [
        id,
        activityData.tipo_entidad,
        activityData.entidad_id,
        activityData.accion,
        activityData.descripcion,
        activityData.usuario_id || null,
        activityData.usuario_nombre || 'Sistema',
        activityData.organization_id,
        activityData.datos_anteriores ? JSON.stringify(activityData.datos_anteriores) : null,
        activityData.datos_nuevos ? JSON.stringify(activityData.datos_nuevos) : null,
        now,
        activityData.ip_address || null,
        activityData.user_agent || null
      ];

      await mongoClient.execute({ sql, args });

      return { id, created_at: now };

    } catch (error) {
      console.error('Error registrando actividad:', error);
      // No lanzar error para evitar que falle la operación principal
      return null;
    }
  }

  /**
   * Obtiene el historial de actividades filtrado
   * @param {Object} filtros - Filtros para la consulta
   * @param {number} filtros.organization_id - ID de la organización
   * @param {string} filtros.tipo_entidad - Tipo de entidad (opcional)
   * @param {string} filtros.entidad_id - ID de entidad específica (opcional)
   * @param {string} filtros.usuario_id - ID de usuario (opcional)
   * @param {number} filtros.limite - Límite de resultados (default: 50)
   * @param {number} filtros.offset - Offset para paginación (default: 0)
   */
  static async obtenerHistorial(filtros = {}) {
    try {
      const {
        organization_id,
        tipo_entidad,
        entidad_id,
        usuario_id,
        limite = 50,
        offset = 0
      } = filtros;

      let whereClause = 'WHERE organization_id = ?';
      const args = [organization_id];

      if (tipo_entidad) {
        whereClause += ' AND tipo_entidad = ?';
        args.push(tipo_entidad);
      }

      if (entidad_id) {
        whereClause += ' AND entidad_id = ?';
        args.push(entidad_id);
      }

      if (usuario_id) {
        whereClause += ' AND usuario_id = ?';
        args.push(usuario_id);
      }

      const sql = `
        SELECT * FROM actividad_sistema
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      args.push(limite, offset);

      const result = await mongoClient.execute({ sql, args });

      // Parsear JSON de datos anteriores y nuevos
      const actividades = result.rows.map(row => ({
        ...row,
        datos_anteriores: row.datos_anteriores ? JSON.parse(row.datos_anteriores) : null,
        datos_nuevos: row.datos_nuevos ? JSON.parse(row.datos_nuevos) : null
      }));

      return actividades;

    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de actividad
   * @param {number} organization_id - ID de la organización
   * @param {string} periodo - Período: 'dia', 'semana', 'mes' (default: 'semana')
   */
  static async obtenerEstadisticas(organization_id, periodo = 'semana') {
    try {
      let dateFilter;
      switch (periodo) {
        case 'dia':
          dateFilter = "datetime('now', '-1 day')";
          break;
        case 'mes':
          dateFilter = "datetime('now', '-1 month')";
          break;
        default:
          dateFilter = "datetime('now', '-7 days')";
      }

      const sql = `
        SELECT 
          tipo_entidad,
          accion,
          COUNT(*) as total
        FROM actividad_sistema
        WHERE organization_id = ? 
          AND created_at >= ${dateFilter}
        GROUP BY tipo_entidad, accion
        ORDER BY total DESC
      `;

      const result = await mongoClient.execute({
        sql,
        args: [organization_id]
      });

      return result.rows;

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Métodos de conveniencia para registrar actividades específicas
   */
  static async registrarCreacion(tipo_entidad, entidad_id, datos_nuevos, usuario, organization_id) {
    return this.registrarActividad({
      tipo_entidad,
      entidad_id,
      accion: 'crear',
      descripcion: `Se creó ${tipo_entidad}: ${datos_nuevos.nombre || entidad_id}`,
      usuario_id: usuario?.id,
      usuario_nombre: usuario?.nombre || 'Sistema',
      organization_id,
      datos_nuevos
    });
  }

  static async registrarActualizacion(tipo_entidad, entidad_id, datos_anteriores, datos_nuevos, usuario, organization_id) {
    return this.registrarActividad({
      tipo_entidad,
      entidad_id,
      accion: 'actualizar',
      descripcion: `Se actualizó ${tipo_entidad}: ${datos_nuevos.nombre || entidad_id}`,
      usuario_id: usuario?.id,
      usuario_nombre: usuario?.nombre || 'Sistema',
      organization_id,
      datos_anteriores,
      datos_nuevos
    });
  }

  static async registrarEliminacion(tipo_entidad, entidad_id, datos_anteriores, usuario, organization_id) {
    return this.registrarActividad({
      tipo_entidad,
      entidad_id,
      accion: 'eliminar',
      descripcion: `Se eliminó ${tipo_entidad}: ${datos_anteriores.nombre || entidad_id}`,
      usuario_id: usuario?.id,
      usuario_nombre: usuario?.nombre || 'Sistema',
      organization_id,
      datos_anteriores
    });
  }
}

module.exports = ActivityLogService; 