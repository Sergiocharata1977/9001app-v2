const coordinacionService = require('../services/coordinacionService.js');
const fs = require('fs').promises;
const path = require('path');
const mongoClient = require('../lib/mongoClient.js');

class CoordinacionController {
  
  // Leer el archivo de log de tareas
  async leerLogTareas(req, res) {
    try {
      const logPath = path.join(__dirname, '../../docs-esenciales/01-log-tareas-agentes.md');
      
      const content = await fs.readFile(logPath, 'utf8');
      const stats = await fs.stat(logPath);
      
      res.json({
        success: true,
        data: {
          content,
          lastModified: stats.mtime,
          size: stats.size
        }
      });
    } catch (error) {
      console.error('Error leyendo log de tareas:', error);
      res.status(500).json({
        success: false,
        message: 'Error leyendo archivo de log de tareas',
        error: error.message
      });
    }
  }
  
  // Obtener todas las tareas
  async obtenerTareas(req, res) {
    try {
      const { organizationId } = req.user;
      const { limit = 50, offset = 0 } = req.query;
      
      const tareas = await coordinacionService.obtenerTareas(
        organizationId, 
        parseInt(limit), 
        parseInt(offset)
      );
      
      res.json({
        success: true,
        data: tareas,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: tareas.length
        }
      });
    } catch (error) {
      console.error('Error en obtenerTareas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo tareas',
        error: error.message
      });
    }
  }
  
  // Obtener tarea por número
  async obtenerTareaPorNumero(req, res) {
    try {
      const { organizationId } = req.user;
      const { tareaNumero } = req.params;
      
      const tarea = await coordinacionService.obtenerTareaPorNumero(
        organizationId, 
        parseInt(tareaNumero)
      );
      
      if (!tarea) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: tarea
      });
    } catch (error) {
      console.error('Error en obtenerTareaPorNumero:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo tarea',
        error: error.message
      });
    }
  }
  
  // Obtener estadísticas
  async obtenerEstadisticas(req, res) {
    try {
      const { organizationId } = req.user;
      
      const estadisticas = await coordinacionService.obtenerEstadisticas(organizationId);
      
      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }
  
  // Buscar tareas
  async buscarTareas(req, res) {
    try {
      const { organizationId } = req.user;
      const { q: texto, limit = 20 } = req.query;
      
      if (!texto) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro de búsqueda requerido'
        });
      }
      
      const tareas = await coordinacionService.buscarTareas(
        organizationId, 
        texto, 
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: tareas,
        search: {
          query: texto,
          results: tareas.length
        }
      });
    } catch (error) {
      console.error('Error en buscarTareas:', error);
      res.status(500).json({
        success: false,
        message: 'Error buscando tareas',
        error: error.message
      });
    }
  }
  
  // Obtener tareas por módulo
  async obtenerTareasPorModulo(req, res) {
    try {
      const { organizationId } = req.user;
      const { modulo } = req.params;
      const { limit = 20 } = req.query;
      
      const tareas = await coordinacionService.obtenerTareasPorModulo(
        organizationId, 
        modulo, 
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: tareas,
        filter: {
          modulo,
          results: tareas.length
        }
      });
    } catch (error) {
      console.error('Error en obtenerTareasPorModulo:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo tareas por módulo',
        error: error.message
      });
    }
  }
  
  // Obtener tareas por estado
  async obtenerTareasPorEstado(req, res) {
    try {
      const { organizationId } = req.user;
      const { estado } = req.params;
      const { limit = 20 } = req.query;
      
      const tareas = await coordinacionService.obtenerTareasPorEstado(
        organizationId, 
        estado, 
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: tareas,
        filter: {
          estado,
          results: tareas.length
        }
      });
    } catch (error) {
      console.error('Error en obtenerTareasPorEstado:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo tareas por estado',
        error: error.message
      });
    }
  }
  
  // Crear nueva tarea
  async crearTarea(req, res) {
    try {
      const { organizationId } = req.user;
      const tareaData = {
        ...req.body,
        organization_id: organizationId
      };
      
      // Obtener siguiente número de tarea
      const siguienteNumero = await coordinacionService.obtenerSiguienteNumeroTarea(organizationId);
      tareaData.tarea_numero = siguienteNumero;
      
      const tareaId = await coordinacionService.crearTarea(tareaData);
      
      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente',
        data: {
          id: tareaId,
          tarea_numero: siguienteNumero
        }
      });
    } catch (error) {
      console.error('Error en crearTarea:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando tarea',
        error: error.message
      });
    }
  }
  
  // Actualizar tarea
  async actualizarTarea(req, res) {
    try {
      const { organizationId } = req.user;
      const { tareaNumero } = req.params;
      const tareaData = req.body;
      
      const actualizado = await coordinacionService.actualizarTarea(
        organizationId, 
        parseInt(tareaNumero), 
        tareaData
      );
      
      if (!actualizado) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error en actualizarTarea:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando tarea',
        error: error.message
      });
    }
  }
  
  // Eliminar tarea
  async eliminarTarea(req, res) {
    try {
      const { organizationId } = req.user;
      const { tareaNumero } = req.params;
      
      const eliminado = await coordinacionService.eliminarTarea(
        organizationId, 
        parseInt(tareaNumero)
      );
      
      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Tarea eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en eliminarTarea:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando tarea',
        error: error.message
      });
    }
  }
  
  // Sincronizar desde documentación
  async sincronizarDesdeDocumentacion(req, res) {
    try {
      const { sincronizarCoordinacion } = require('../scripts/permanentes/coordinacion-auto-save.js');
      
      await sincronizarCoordinacion();
      
      res.json({
        success: true,
        message: 'Sincronización completada exitosamente'
      });
    } catch (error) {
      console.error('Error en sincronizarDesdeDocumentacion:', error);
      res.status(500).json({
        success: false,
        message: 'Error en sincronización',
        error: error.message
      });
    }
  }
}

module.exports = new CoordinacionController();
