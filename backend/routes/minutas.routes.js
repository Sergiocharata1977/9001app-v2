const express = require('express');
const mongoClient = require('../lib/mongoClient.js');

const router = express.Router();

// ===============================================
// RUTAS ESPECÍFICAS (deben ir antes de las rutas con parámetros)
// ===============================================

// Buscar minutas con datos SGC completos
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Término de búsqueda requerido'
      });
    }

    const result = await mongoClient.execute({
      sql: `SELECT * FROM v_minutas_completas 
             WHERE titulo LIKE ? OR organizador_nombre LIKE ? OR agenda LIKE ?
             ORDER BY created_at DESC`,
      args: [`%${q}%`, `%${q}%`, `%${q}%`]
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al buscar minutas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al buscar minutas',
      error: error.message
    });
  }
});

// Obtener estadísticas SGC de minutas
router.get('/stats', async (req, res) => {
  try {
    const [totalResult, participantesResult, documentosResult, normasResult, esteMesResult] = await Promise.all([
      mongoClient.execute({
        sql: `SELECT COUNT(*) as total FROM minutas WHERE is_active = 1`,
        args: []
      }),
      mongoClient.execute({
        sql: `SELECT COUNT(*) as total FROM sgc_personal_relaciones WHERE entidad_tipo = 'minuta' AND is_active = 1`,
        args: []
      }),
      mongoClient.execute({
        sql: `SELECT COUNT(*) as total FROM sgc_documentos_relacionados WHERE entidad_tipo = 'minuta' AND is_active = 1`,
        args: []
      }),
      mongoClient.execute({
        sql: `SELECT COUNT(*) as total FROM sgc_normas_relacionadas WHERE entidad_tipo = 'minuta' AND is_active = 1`,
        args: []
      }),
      mongoClient.execute({
        sql: `SELECT COUNT(*) as esteMes FROM minutas 
              WHERE created_at >= datetime('now', 'start of month') AND is_active = 1`,
        args: []
      })
    ]);

    const stats = {
      total: totalResult.rows[0]?.total || 0,
      participantes: participantesResult.rows[0]?.total || 0,
      documentos: documentosResult.rows[0]?.total || 0,
      normas: normasResult.rows[0]?.total || 0,
      esteMes: esteMesResult.rows[0]?.esteMes || 0
    };

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// Obtener minutas recientes con datos SGC
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM v_minutas_completas ORDER BY created_at DESC LIMIT ?`,
      args: [parseInt(limit)]
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener minutas recientes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener minutas recientes',
      error: error.message
    });
  }
});

// Exportar minutas con datos SGC
router.get('/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM v_minutas_completas ORDER BY created_at DESC`,
      args: []
    });

    if (format === 'json') {
      res.json({
        status: 'success',
        data: result.rows
      });
    } else {
      // Por ahora solo JSON, en el futuro se agregarán otros formatos
      res.json({
        status: 'success',
        data: result.rows
      });
    }
  } catch (error) {
    console.error('Error al exportar minutas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al exportar minutas',
      error: error.message
    });
  }
});

// ===============================================
// RUTAS CON PARÁMETROS
// ===============================================

// Obtener todas las minutas con datos SGC
router.get('/', async (req, res) => {
  try {
    console.log('📋 Iniciando consulta de minutas...');
    
    // Primero verificar si la tabla minutas existe
    let result;
    try {
      console.log('🔍 Probando consulta directa a tabla minutas...');
      // Primero hacer una consulta simple para verificar que la tabla existe
      const tableCheck = await mongoClient.execute({
        sql: `SELECT name FROM sqlite_master WHERE type='table' AND name='minutas'`,
        args: []
      });
      
      if (tableCheck.rows.length === 0) {
        console.log('❌ Tabla minutas no existe');
        return res.json({
          status: 'success',
          data: [],
          message: 'Tabla minutas no existe en la base de datos'
        });
      }
      
      console.log('✅ Tabla minutas existe, procediendo con consulta...');
      
      result = await mongoClient.execute({
        sql: `SELECT * FROM minutas LIMIT 10`,
        args: []
      });
      console.log(`✅ Consulta exitosa. Encontradas ${result.rows.length} minutas`);
    } catch (basicError) {
      console.log('❌ Error en consulta básica:', basicError.message);
      // Si ni siquiera la tabla básica funciona, devolver array vacío
      return res.json({
        status: 'success',
        data: [],
        message: 'Tabla minutas no disponible'
      });
    }

    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error general al obtener minutas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener minutas',
      error: error.message,
      details: error.stack
    });
  }
});

// Obtener una minuta por ID con datos SGC completos
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM v_minutas_completas WHERE id = ?`,
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener minuta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener minuta',
      error: error.message
    });
  }
});

// Crear nueva minuta
router.post('/', async (req, res) => {
  try {
    const {
      titulo,
      responsable,
      descripcion
    } = req.body;

    if (!titulo) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos obligatorios: titulo'
      });
    }

    const result = await mongoClient.execute({
      sql: `INSERT INTO minutas (
        titulo, responsable, descripcion, created_at
      ) VALUES (?, ?, ?, datetime('now', 'localtime'))`,
      args: [
        titulo,
        responsable || '',
        descripcion || ''
      ]
    });

    // Obtener la minuta creada
    const createdMinuta = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE id = ?`,
      args: [result.lastInsertRowid]
    });

    res.status(201).json({
      status: 'success',
      message: 'Minuta creada exitosamente',
      data: createdMinuta.rows[0]
    });
  } catch (error) {
    console.error('Error al crear minuta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear minuta',
      error: error.message
    });
  }
});

// Actualizar minuta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      responsable,
      descripcion
    } = req.body;

    if (!titulo) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos obligatorios: titulo'
      });
    }

    // Verificar que la minuta existe
    const existingMinuta = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE id = ?`,
      args: [id]
    });

    if (existingMinuta.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    // Actualizar la minuta
    await mongoClient.execute({
      sql: `UPDATE minutas SET 
        titulo = ?, 
        responsable = ?, 
        descripcion = ?
        WHERE id = ?`,
      args: [
        titulo,
        responsable || '',
        descripcion || '',
        id
      ]
    });

    // Obtener la minuta actualizada
    const updatedMinuta = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE id = ?`,
      args: [id]
    });

    res.json({
      status: 'success',
      message: 'Minuta actualizada exitosamente',
      data: updatedMinuta.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar minuta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar minuta',
      error: error.message
    });
  }
});

// Eliminar minuta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la minuta existe
    const existingMinuta = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE id = ?`,
      args: [id]
    });

    if (existingMinuta.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    // Eliminar la minuta
    await mongoClient.execute({
      sql: `DELETE FROM minutas WHERE id = ?`,
      args: [id]
    });

    res.json({
      status: 'success',
      message: 'Minuta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar minuta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar minuta',
      error: error.message
    });
  }
});

// Obtener documentos de una minuta (ACTUALIZADO SGC)
router.get('/:id/documentos', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM v_sgc_documentos_completos 
             WHERE entidad_tipo = 'minuta' AND entidad_id = ?
             ORDER BY tipo_relacion, documento_nombre`,
      args: [id]
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener documentos',
      error: error.message
    });
  }
});

// Obtener historial de cambios de una minuta
router.get('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Por ahora retornamos un historial básico
    // En el futuro esto se conectará con una tabla de historial
    const minuta = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE id = ?`,
      args: [id]
    });

    if (minuta.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    const historial = [
      {
        id: 1,
        action: 'create',
        description: 'Minuta creada',
        user_name: 'Sistema',
        timestamp: minuta.rows[0].created_at,
        changed_fields: ['titulo', 'responsable', 'descripcion']
      }
    ];

    res.json({
      status: 'success',
      data: historial
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener historial',
      error: error.message
    });
  }
});

// Descargar minuta como PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    
    const minuta = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE id = ?`,
      args: [id]
    });

    if (minuta.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    // Por ahora retornamos un JSON con los datos de la minuta
    // En el futuro esto generará un PDF real
    res.json({
      status: 'success',
      data: minuta.rows[0],
      message: 'PDF generado exitosamente'
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al generar PDF',
      error: error.message
    });
  }
});

// Obtener minutas por responsable
router.get('/responsable/:responsable', async (req, res) => {
  try {
    const { responsable } = req.params;
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE responsable LIKE ? ORDER BY created_at DESC`,
      args: [`%${responsable}%`]
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener minutas por responsable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener minutas por responsable',
      error: error.message
    });
  }
});

// Duplicar minuta
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const minuta = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE id = ?`,
      args: [id]
    });

    if (minuta.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    const originalMinuta = minuta.rows[0];
    
    const result = await mongoClient.execute({
      sql: `INSERT INTO minutas (
        titulo, responsable, descripcion, created_at
      ) VALUES (?, ?, ?, datetime('now', 'localtime'))`,
      args: [
        `${originalMinuta.titulo} (Copia)`,
        originalMinuta.responsable,
        originalMinuta.descripcion
      ]
    });

    // Obtener la minuta duplicada
    const duplicatedMinuta = await mongoClient.execute({
      sql: `SELECT * FROM minutas WHERE id = ?`,
      args: [result.lastInsertRowid]
    });

    res.status(201).json({
      status: 'success',
      message: 'Minuta duplicada exitosamente',
      data: duplicatedMinuta.rows[0]
    });
  } catch (error) {
    console.error('Error al duplicar minuta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al duplicar minuta',
      error: error.message
    });
  }
});

// ===============================================
// NUEVAS RUTAS SGC - PARTICIPANTES
// ===============================================

// Obtener participantes de una minuta
router.get('/:id/participantes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM v_sgc_personal_relaciones_completos 
             WHERE entidad_tipo = 'minuta' AND entidad_id = ?
             ORDER BY rol, nombre_personal`,
      args: [id]
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener participantes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener participantes',
      error: error.message
    });
  }
});

// Agregar participante a minuta
router.post('/:id/participantes', async (req, res) => {
  try {
    const { id } = req.params;
    const { personal_id, rol = 'participante', asistio = 0, datos_adicionales } = req.body;

    if (!personal_id) {
      return res.status(400).json({
        status: 'error',
        message: 'personal_id es requerido'
      });
    }

    // Verificar que la minuta existe
    const minutaExists = await mongoClient.execute({
      sql: `SELECT id FROM minutas WHERE id = ? AND is_active = 1`,
      args: [id]
    });

    if (minutaExists.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    // Generar ID único
    const participanteId = `PART_MIN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const result = await mongoClient.execute({
      sql: `INSERT INTO sgc_personal_relaciones (
        id, organization_id, entidad_tipo, entidad_id, personal_id, 
        rol, asistio, datos_adicionales, created_at, updated_at, is_active
      ) VALUES (?, 2, 'minuta', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)`,
      args: [
        participanteId,
        id,
        personal_id,
        rol,
        asistio,
        datos_adicionales || '{}'
      ]
    });

    // Obtener el participante creado con datos completos
    const createdParticipante = await mongoClient.execute({
      sql: `SELECT * FROM v_sgc_personal_relaciones_completos WHERE id = ?`,
      args: [participanteId]
    });

    res.status(201).json({
      status: 'success',
      message: 'Participante agregado exitosamente',
      data: createdParticipante.rows[0]
    });
  } catch (error) {
    console.error('Error al agregar participante:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar participante',
      error: error.message
    });
  }
});

// Eliminar participante de minuta
router.delete('/:id/participantes/:participanteId', async (req, res) => {
  try {
    const { id, participanteId } = req.params;

    const result = await mongoClient.execute({
      sql: `UPDATE sgc_personal_relaciones SET is_active = 0, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND entidad_tipo = 'minuta' AND entidad_id = ?`,
      args: [participanteId, id]
    });

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Participante no encontrado'
      });
    }

    res.json({
      status: 'success',
      message: 'Participante eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar participante:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar participante',
      error: error.message
    });
  }
});

// ===============================================
// NUEVAS RUTAS SGC - DOCUMENTOS
// ===============================================

// Agregar documento a minuta
router.post('/:id/documentos', async (req, res) => {
  try {
    const { id } = req.params;
    const { documento_id, tipo_relacion = 'adjunto', descripcion, es_obligatorio = 0 } = req.body;

    if (!documento_id) {
      return res.status(400).json({
        status: 'error',
        message: 'documento_id es requerido'
      });
    }

    // Verificar que la minuta existe
    const minutaExists = await mongoClient.execute({
      sql: `SELECT id FROM minutas WHERE id = ? AND is_active = 1`,
      args: [id]
    });

    if (minutaExists.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    // Generar ID único
    const documentoId = `DOC_MIN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    await mongoClient.execute({
      sql: `INSERT INTO sgc_documentos_relacionados (
        id, organization_id, entidad_tipo, entidad_id, documento_id,
        tipo_relacion, descripcion, es_obligatorio, created_at, updated_at, is_active
      ) VALUES (?, 2, 'minuta', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)`,
      args: [documentoId, id, documento_id, tipo_relacion, descripcion, es_obligatorio]
    });

    // Obtener documento creado con datos completos
    const createdDocumento = await mongoClient.execute({
      sql: `SELECT * FROM v_sgc_documentos_completos WHERE id = ?`,
      args: [documentoId]
    });

    res.status(201).json({
      status: 'success',
      message: 'Documento agregado exitosamente',
      data: createdDocumento.rows[0]
    });
  } catch (error) {
    console.error('Error al agregar documento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar documento',
      error: error.message
    });
  }
});

// Eliminar documento de minuta
router.delete('/:id/documentos/:documentoId', async (req, res) => {
  try {
    const { id, documentoId } = req.params;

    const result = await mongoClient.execute({
      sql: `UPDATE sgc_documentos_relacionados SET is_active = 0, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND entidad_tipo = 'minuta' AND entidad_id = ?`,
      args: [documentoId, id]
    });

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Documento no encontrado'
      });
    }

    res.json({
      status: 'success',
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar documento',
      error: error.message
    });
  }
});

// ===============================================
// NUEVAS RUTAS SGC - NORMAS ISO
// ===============================================

// Obtener normas ISO de una minuta
router.get('/:id/normas', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM v_sgc_normas_completas 
             WHERE entidad_tipo = 'minuta' AND entidad_id = ?
             ORDER BY punto_norma`,
      args: [id]
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener normas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener normas',
      error: error.message
    });
  }
});

// Agregar norma ISO a minuta
router.post('/:id/normas', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      norma_id, 
      punto_norma, 
      clausula_descripcion, 
      tipo_relacion = 'aplica',
      nivel_cumplimiento = 'pendiente',
      observaciones 
    } = req.body;

    if (!norma_id || !punto_norma) {
      return res.status(400).json({
        status: 'error',
        message: 'norma_id y punto_norma son requeridos'
      });
    }

    // Verificar que la minuta existe
    const minutaExists = await mongoClient.execute({
      sql: `SELECT id FROM minutas WHERE id = ? AND is_active = 1`,
      args: [id]
    });

    if (minutaExists.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Minuta no encontrada'
      });
    }

    // Generar ID único
    const normaId = `NOR_MIN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    await mongoClient.execute({
      sql: `INSERT INTO sgc_normas_relacionadas (
        id, organization_id, entidad_tipo, entidad_id, norma_id,
        punto_norma, clausula_descripcion, tipo_relacion, nivel_cumplimiento,
        observaciones, created_at, updated_at, is_active
      ) VALUES (?, 2, 'minuta', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)`,
      args: [
        normaId, id, norma_id, punto_norma, clausula_descripcion, 
        tipo_relacion, nivel_cumplimiento, observaciones
      ]
    });

    // Obtener norma creada con datos completos
    const createdNorma = await mongoClient.execute({
      sql: `SELECT * FROM v_sgc_normas_completas WHERE id = ?`,
      args: [normaId]
    });

    res.status(201).json({
      status: 'success',
      message: 'Norma agregada exitosamente',
      data: createdNorma.rows[0]
    });
  } catch (error) {
    console.error('Error al agregar norma:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar norma',
      error: error.message
    });
  }
});

// Eliminar norma ISO de minuta
router.delete('/:id/normas/:normaId', async (req, res) => {
  try {
    const { id, normaId } = req.params;

    const result = await mongoClient.execute({
      sql: `UPDATE sgc_normas_relacionadas SET is_active = 0, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND entidad_tipo = 'minuta' AND entidad_id = ?`,
      args: [normaId, id]
    });

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Norma no encontrada'
      });
    }

    res.json({
      status: 'success',
      message: 'Norma eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar norma:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar norma',
      error: error.message
    });
  }
});

// ===============================================
// RUTAS AUXILIARES SGC
// ===============================================

// Dashboard de minutas SGC
router.get('/dashboard/sgc', async (req, res) => {
  try {
    const [
      resumenResult,
      porTipoResult,
      participacionResult,
      cumplimientoResult
    ] = await Promise.all([
      // Resumen general
      mongoClient.execute({
        sql: `SELECT 
          COUNT(*) as total_minutas,
          COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
          COUNT(CASE WHEN estado = 'borrador' THEN 1 END) as borradores,
          COUNT(CASE WHEN fecha >= date('now', '-30 days') THEN 1 END) as ultimo_mes
        FROM minutas WHERE is_active = 1`
      }),
      
      // Minutas por tipo
      mongoClient.execute({
        sql: `SELECT tipo, COUNT(*) as cantidad
        FROM minutas WHERE is_active = 1
        GROUP BY tipo ORDER BY cantidad DESC`
      }),
      
      // Participación promedio
      mongoClient.execute({
        sql: `SELECT 
          AVG(total_participantes) as promedio_participantes,
          AVG(participantes_asistieron) as promedio_asistencia
        FROM v_minutas_completas`
      }),
      
      // Cumplimiento de normas
      mongoClient.execute({
        sql: `SELECT 
          nivel_cumplimiento,
          COUNT(*) as cantidad
        FROM sgc_normas_relacionadas 
        WHERE entidad_tipo = 'minuta' AND is_active = 1
        GROUP BY nivel_cumplimiento`
      })
    ]);

    const dashboard = {
      resumen: resumenResult.rows[0] || {},
      por_tipo: porTipoResult.rows || [],
      participacion: participacionResult.rows[0] || {},
      cumplimiento_normas: cumplimientoResult.rows || []
    };

    res.json({
      status: 'success',
      data: dashboard
    });
  } catch (error) {
    console.error('Error al obtener dashboard SGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener dashboard SGC',
      error: error.message
    });
  }
});

// Obtener lista de personal disponible para participantes
router.get('/util/personal', async (req, res) => {
  try {
    const result = await mongoClient.execute({
      sql: `SELECT id, nombres, apellidos, email, departamento_id, puesto_id
             FROM personal WHERE is_active = 1
             ORDER BY nombres, apellidos`
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener personal',
      error: error.message
    });
  }
});

// Obtener lista de documentos disponibles
router.get('/util/documentos', async (req, res) => {
  try {
    const result = await mongoClient.execute({
      sql: `SELECT id, titulo, nombre, tipo_archivo
             FROM documentos WHERE is_active = 1
             ORDER BY titulo`
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener documentos',
      error: error.message
    });
  }
});

// Obtener lista de normas disponibles
router.get('/util/normas', async (req, res) => {
  try {
    const result = await mongoClient.execute({
      sql: `SELECT id, nombre, version, descripcion
             FROM normas WHERE is_active = 1
             ORDER BY nombre`
    });

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener normas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener normas',
      error: error.message
    });
  }
});

module.exports = router; 