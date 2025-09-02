const { Router  } = require('express');
const ActivityLogService = require('../services/activityLogService.js');

const router = Router();

// GET /api/actividad - Obtener historial de actividades
router.get('/', async (req, res, next) => {
  try {
    const { 
      tipo_entidad, 
      entidad_id, 
      usuario_id, 
      limite = 50, 
      offset = 0 
    } = req.query;

    // Obtener organization_id del usuario autenticado
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id es requerido' });
    }

    const filtros = {
      organization_id,
      tipo_entidad,
      entidad_id,
      usuario_id,
      limite: parseInt(limite),
      offset: parseInt(offset)
    };

    const actividades = await ActivityLogService.obtenerHistorial(filtros);
    
    res.json({
      actividades,
      filtros: {
        limite: parseInt(limite),
        offset: parseInt(offset),
        total: actividades.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/actividad/estadisticas - Obtener estadísticas de actividad
router.get('/estadisticas', async (req, res, next) => {
  try {
    const { periodo = 'semana' } = req.query;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id es requerido' });
    }

    const estadisticas = await ActivityLogService.obtenerEstadisticas(organization_id, periodo);
    
    res.json({
      estadisticas,
      periodo,
      organization_id
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/actividad/entidad/:tipo/:id - Obtener actividades de una entidad específica
router.get('/entidad/:tipo/:id', async (req, res, next) => {
  try {
    const { tipo, id } = req.params;
    const { limite = 20, offset = 0 } = req.query;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id es requerido' });
    }

    const filtros = {
      organization_id,
      tipo_entidad: tipo,
      entidad_id: id,
      limite: parseInt(limite),
      offset: parseInt(offset)
    };

    const actividades = await ActivityLogService.obtenerHistorial(filtros);
    
    res.json({
      actividades,
      entidad: { tipo, id },
      filtros: {
        limite: parseInt(limite),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/actividad/timeline - Obtener timeline completo de actividades
router.get('/timeline', async (req, res, next) => {
  try {
    const { limite = 100, offset = 0 } = req.query;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id es requerido' });
    }

    const actividades = await ActivityLogService.obtenerHistorial({
      organization_id,
      limite: parseInt(limite),
      offset: parseInt(offset)
    });

    // Agrupar por fecha para mostrar en timeline
    const timeline = actividades.reduce((acc, actividad) => {
      const fecha = actividad.created_at.split('T')[0]; // Solo la fecha
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(actividad);
      return acc;
    }, {});

    res.json({
      timeline,
      total_actividades: actividades.length,
      filtros: {
        limite: parseInt(limite),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router; 