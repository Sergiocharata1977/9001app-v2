const express = require('express');
const mongodbClient = require('../lib/mongodbClient.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// GET /relaciones - Obtener todas las relaciones
router.get('/', async (req, res) => {
  try {
    console.log('🔄 [RelacionesRoutes] Obteniendo todas las relaciones...');
    
    const result = await mongodbClient.execute({
      sql: `SELECT * FROM relaciones_sgc WHERE organization_id = ? ORDER BY fecha_creacion DESC`,
      args: [req.user.organization_id]
    });

    console.log(`✅ [RelacionesRoutes] Encontradas ${result.rows.length} relaciones`);
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al obtener relaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las relaciones',
      error: error.message
    });
  }
});

// GET /relaciones/origen/:tipo - Obtener relaciones por tipo de origen
router.get('/origen/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    console.log(`🔄 [RelacionesRoutes] Obteniendo relaciones de origen: ${tipo}`);
    
    const result = await mongodbClient.execute({
      sql: `SELECT * FROM relaciones_sgc 
            WHERE organization_id = ? AND origen_tipo = ? 
            ORDER BY fecha_creacion DESC`,
      args: [req.user.organization_id, tipo]
    });

    console.log(`✅ [RelacionesRoutes] Encontradas ${result.rows.length} relaciones para origen ${tipo}`);
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error(`❌ [RelacionesRoutes] Error al obtener relaciones de origen ${req.params.tipo}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las relaciones',
      error: error.message
    });
  }
});

// GET /relaciones/destino/:tipo - Obtener relaciones por tipo de destino
router.get('/destino/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    console.log(`🔄 [RelacionesRoutes] Obteniendo relaciones de destino: ${tipo}`);
    
    const result = await mongodbClient.execute({
      sql: `SELECT * FROM relaciones_sgc 
            WHERE organization_id = ? AND destino_tipo = ? 
            ORDER BY fecha_creacion DESC`,
      args: [req.user.organization_id, tipo]
    });

    console.log(`✅ [RelacionesRoutes] Encontradas ${result.rows.length} relaciones para destino ${tipo}`);
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error(`❌ [RelacionesRoutes] Error al obtener relaciones de destino ${req.params.tipo}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las relaciones',
      error: error.message
    });
  }
});

// GET /relaciones/relacion - Obtener relación específica
router.get('/relacion', async (req, res) => {
  try {
    const { origenTipo, origenId, destinoTipo, destinoId } = req.query;
    console.log(`🔄 [RelacionesRoutes] Obteniendo relación: ${origenTipo}:${origenId} -> ${destinoTipo}:${destinoId}`);
    
    const result = await mongodbClient.execute({
      sql: `SELECT * FROM relaciones_sgc 
            WHERE organization_id = ? 
            AND origen_tipo = ? AND origen_id = ? 
            AND destino_tipo = ? AND destino_id = ?`,
      args: [req.user.organization_id, origenTipo, origenId, destinoTipo, destinoId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    console.log('✅ [RelacionesRoutes] Relación encontrada');
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al obtener relación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la relación',
      error: error.message
    });
  }
});

// GET /relaciones/entidades-relacionadas - Obtener entidades relacionadas
router.get('/entidades-relacionadas', async (req, res) => {
  try {
    const { origenTipo, origenId, destinoTipo } = req.query;
    console.log(`🔄 [RelacionesRoutes] Obteniendo ${destinoTipo} relacionados con ${origenTipo}:${origenId}`);
    
    // Obtener IDs de entidades relacionadas
    const relacionesResult = await mongodbClient.execute({
      sql: `SELECT destino_id FROM relaciones_sgc 
            WHERE organization_id = ? 
            AND origen_tipo = ? AND origen_id = ? 
            AND destino_tipo = ?`,
      args: [req.user.organization_id, origenTipo, origenId, destinoTipo]
    });

    if (relacionesResult.rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }

    const destinoIds = relacionesResult.rows.map(row => row.destino_id);
    const placeholders = destinoIds.map(() => '?').join(',');
    
    // Obtener datos de las entidades relacionadas
    let entidadesResult;
    switch (destinoTipo) {
      case 'personal':
        entidadesResult = await mongodbClient.execute({
          sql: `SELECT * FROM personal WHERE id IN (${placeholders}) AND organization_id = ?`,
          args: [...destinoIds, req.user.organization_id]
        });
        break;
      case 'puesto':
      case 'puestos':
        entidadesResult = await mongodbClient.execute({
          sql: `SELECT 
                  id,
                  organization_id,
                  COALESCE(nombre, titulo_puesto) as nombre,
                  COALESCE(descripcion, descripcion_responsabilidades) as descripcion,
                  departamento_id,
                  COALESCE(requisitos_experiencia, experiencia_requerida) as requisitos_experiencia,
                  COALESCE(requisitos_formacion, formacion_requerida) as requisitos_formacion,
                  COALESCE(estado, estado_puesto) as estado,
                  codigo_puesto,
                  created_at,
                  updated_at
                FROM puestos WHERE id IN (${placeholders}) AND organization_id = ?`,
          args: [...destinoIds, req.user.organization_id]
        });
        break;
      case 'departamento':
      case 'departamentos':
        entidadesResult = await mongodbClient.execute({
          sql: `SELECT * FROM departamentos WHERE id IN (${placeholders}) AND organization_id = ?`,
          args: [...destinoIds, req.user.organization_id]
        });
        break;
      case 'competencias':
        entidadesResult = await mongodbClient.execute({
          sql: `SELECT * FROM competencias WHERE id IN (${placeholders}) AND organization_id = ?`,
          args: [...destinoIds, req.user.organization_id]
        });
        break;
      case 'evaluaciones':
        entidadesResult = await mongodbClient.execute({
          sql: `SELECT * FROM evaluaciones WHERE id IN (${placeholders}) AND organization_id = ?`,
          args: [...destinoIds, req.user.organization_id]
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Tipo de destino no soportado: ${destinoTipo}`
        });
    }

    console.log(`✅ [RelacionesRoutes] Encontradas ${entidadesResult.rows.length} entidades relacionadas`);
    res.json({
      success: true,
      data: entidadesResult.rows,
      total: entidadesResult.rows.length
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al obtener entidades relacionadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener entidades relacionadas',
      error: error.message
    });
  }
});

// POST /relaciones - Crear nueva relación
router.post('/', async (req, res) => {
  try {
    const {
      organization_id,
      origen_tipo,
      origen_id,
      destino_tipo,
      destino_id,
      descripcion,
      usuario_creador
    } = req.body;

    console.log('🔄 [RelacionesRoutes] Creando nueva relación:', {
      organization_id,
      origen_tipo,
      origen_id,
      destino_tipo,
      destino_id
    });

    // Validar campos obligatorios
    if (!organization_id || !origen_tipo || !origen_id || !destino_tipo || !destino_id) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: organization_id, origen_tipo, origen_id, destino_tipo, destino_id'
      });
    }

    // Verificar que no exista la relación
    const existingResult = await mongodbClient.execute({
      sql: `SELECT id FROM relaciones_sgc 
            WHERE organization_id = ? 
            AND origen_tipo = ? AND origen_id = ? 
            AND destino_tipo = ? AND destino_id = ?`,
      args: [organization_id, origen_tipo, origen_id, destino_tipo, destino_id]
    });

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'La relación ya existe'
      });
    }

    // Crear la relación
    const result = await mongodbClient.execute({
      sql: `INSERT INTO relaciones_sgc 
            (organization_id, origen_tipo, origen_id, destino_tipo, destino_id, descripcion, usuario_creador, fecha_creacion) 
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [organization_id, origen_tipo, origen_id, destino_tipo, destino_id, descripcion, usuario_creador]
    });

    console.log('✅ [RelacionesRoutes] Relación creada exitosamente');
    res.status(201).json({
      success: true,
      message: 'Relación creada exitosamente',
      data: {
        id: result.lastInsertRowid,
        organization_id,
        origen_tipo,
        origen_id,
        destino_tipo,
        destino_id,
        descripcion,
        usuario_creador
      }
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al crear relación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la relación',
      error: error.message
    });
  }
});

// PUT /relaciones/:id - Actualizar relación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, usuario_creador } = req.body;

    console.log(`🔄 [RelacionesRoutes] Actualizando relación ${id}`);

    const result = await mongodbClient.execute({
      sql: `UPDATE relaciones_sgc 
            SET descripcion = ?, usuario_creador = ? 
            WHERE id = ? AND organization_id = ?`,
      args: [descripcion, usuario_creador, id, req.user.organization_id]
    });

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    console.log('✅ [RelacionesRoutes] Relación actualizada exitosamente');
    res.json({
      success: true,
      message: 'Relación actualizada exitosamente'
    });
  } catch (error) {
    console.error(`❌ [RelacionesRoutes] Error al actualizar relación ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la relación',
      error: error.message
    });
  }
});

// DELETE /relaciones/:id - Eliminar relación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 [RelacionesRoutes] Eliminando relación ${id}`);

    const result = await mongodbClient.execute({
      sql: `DELETE FROM relaciones_sgc WHERE id = ? AND organization_id = ?`,
      args: [id, req.user.organization_id]
    });

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    console.log('✅ [RelacionesRoutes] Relación eliminada exitosamente');
    res.json({
      success: true,
      message: 'Relación eliminada exitosamente'
    });
  } catch (error) {
    console.error(`❌ [RelacionesRoutes] Error al eliminar relación ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la relación',
      error: error.message
    });
  }
});

module.exports = router; 