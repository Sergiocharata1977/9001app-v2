const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// ===============================================
// RUTAS ESPECÍFICAS (deben ir antes de las rutas con parámetros)
// ===============================================

// Buscar hallazgos con datos SGC completos
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Término de búsqueda requerido'
      });
    }

    // Parámetros de paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitValue = parseInt(limit);

    // Query optimizada con paginación
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          h.*,
          (resp.nombres || ' ' || resp.apellidos) as responsable_nombre,
          (aud.nombres || ' ' || aud.apellidos) as auditor_nombre
        FROM hallazgos h
        LEFT JOIN personal resp ON h.responsable_id = resp.id
        LEFT JOIN personal aud ON h.auditor_id = aud.id
        WHERE h.is_active = 1 AND (h.titulo LIKE ? OR h.descripcion LIKE ?)
        ORDER BY h.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [`%${q}%`, `%${q}%`, limitValue, offset]
    });

    // Query para obtener total de registros
    const countResult = await mongoClient.execute({
      sql: `
        SELECT COUNT(*) as total
        FROM hallazgos h
        WHERE h.is_active = 1 AND (h.titulo LIKE ? OR h.descripcion LIKE ?)
      `,
      args: [`%${q}%`, `%${q}%`]
    });

    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limitValue);

    res.json({
      status: 'success',
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: limitValue,
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error al buscar hallazgos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al buscar hallazgos',
      error: error.message
    });
  }
});

// Obtener estadísticas SGC de hallazgos
router.get('/stats', async (req, res) => {
  try {
    const result = await mongoClient.execute(`
      SELECT 
        COUNT(*) as total_hallazgos,
        COUNT(CASE WHEN estado = 'deteccion' THEN 1 END) as en_deteccion,
        COUNT(CASE WHEN estado IN ('planificacion_ai', 'ejecucion_ai') THEN 1 END) as en_tratamiento,
        COUNT(CASE WHEN estado = 'verificacion_cierre' THEN 1 END) as en_verificacion,
        COUNT(CASE WHEN estado LIKE '%finalizado%' OR estado LIKE '%cerrado%' THEN 1 END) as cerrados,
        
        -- Por prioridad
        COUNT(CASE WHEN prioridad = 'alta' THEN 1 END) as prioridad_alta,
        COUNT(CASE WHEN prioridad = 'media' THEN 1 END) as prioridad_media,
        COUNT(CASE WHEN prioridad = 'baja' THEN 1 END) as prioridad_baja,
        
        -- Por categoría
        COUNT(CASE WHEN categoria = 'no_conformidad' THEN 1 END) as no_conformidades,
        COUNT(CASE WHEN categoria = 'oportunidad_mejora' THEN 1 END) as oportunidades_mejora,
        COUNT(CASE WHEN categoria = 'observacion' THEN 1 END) as observaciones,
        
        -- Por origen
        COUNT(CASE WHEN origen = 'auditoria_interna' THEN 1 END) as auditoria_interna,
        COUNT(CASE WHEN origen = 'auditoria_externa' THEN 1 END) as auditoria_externa,
        COUNT(CASE WHEN origen = 'revision_direccion' THEN 1 END) as revision_direccion

      FROM hallazgos 
      WHERE is_active = 1
    `);

    res.json({
      status: 'success',
      data: result.rows[0] || {}
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de hallazgos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// Obtener hallazgos recientes con datos SGC
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await mongoClient.execute(`
      SELECT 
        h.*,
        COALESCE(participantes.total, 0) as total_participantes,
        COALESCE(participantes.responsables, 0) as total_responsables,
        COALESCE(documentos.total, 0) as total_documentos,
        COALESCE(normas.total, 0) as total_normas,
        (resp.nombres || ' ' || resp.apellidos) as responsable_nombre
      FROM hallazgos h
      LEFT JOIN (
        SELECT 
          entidad_id, 
          COUNT(*) as total,
          COUNT(CASE WHEN rol = 'responsable' THEN 1 END) as responsables
        FROM sgc_personal_relaciones 
        WHERE entidad_tipo = 'hallazgo' AND is_active = 1 
        GROUP BY entidad_id
      ) participantes ON h.id = participantes.entidad_id
      LEFT JOIN (
        SELECT entidad_id, COUNT(*) as total 
        FROM sgc_documentos_relacionados 
        WHERE entidad_tipo = 'hallazgo' AND is_active = 1 
        GROUP BY entidad_id
      ) documentos ON h.id = documentos.entidad_id
      LEFT JOIN (
        SELECT entidad_id, COUNT(*) as total 
        FROM sgc_normas_relacionadas 
        WHERE entidad_tipo = 'hallazgo' AND is_active = 1 
        GROUP BY entidad_id
      ) normas ON h.id = normas.entidad_id
      LEFT JOIN personal resp ON h.responsable_id = resp.id
      WHERE h.is_active = 1
      ORDER BY h.created_at DESC 
      LIMIT ${parseInt(limit)}
    `);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener hallazgos recientes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener hallazgos recientes',
      error: error.message
    });
  }
});

// Exportar hallazgos con datos SGC
router.get('/export', async (req, res) => {
  try {
    const result = await mongoClient.execute(`
      SELECT 
        h.numeroHallazgo,
        h.titulo,
        h.descripcion,
        h.estado,
        h.categoria,
        h.prioridad,
        h.origen,
        h.punto_norma_afectado,
        h.fecha_deteccion,
        (resp.nombres || ' ' || resp.apellidos) as responsable_nombre,
        participantes.total as total_participantes,
        documentos.total as total_documentos,
        normas.total as total_normas
      FROM v_hallazgos_sgc h
      LEFT JOIN personal resp ON h.responsable_id = resp.id
      WHERE h.is_active = 1
      ORDER BY h.fecha_deteccion DESC
    `);

    res.json({
      status: 'success',
      data: result.rows,
      filename: `hallazgos_export_${new Date().toISOString().split('T')[0]}.json`
    });
  } catch (error) {
    console.error('Error al exportar hallazgos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al exportar hallazgos',
      error: error.message
    });
  }
});

// ===============================================
// RUTAS CON PARÁMETROS
// ===============================================

// Obtener todos los hallazgos con datos SGC
router.get('/', async (req, res) => {
  try {
    const { organization_id, page = 1, limit = 20, estado, categoria } = req.query;
    
    // Parámetros de paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitValue = parseInt(limit);
    
    // Construir WHERE clause dinámico
    let whereConditions = ['h.is_active = 1'];
    let queryParams = [];
    
    if (organization_id) {
      whereConditions.push('h.organization_id = ?');
      queryParams.push(parseInt(organization_id));
    }
    
    if (estado) {
      whereConditions.push('h.estado = ?');
      queryParams.push(estado);
    }
    
    if (categoria) {
      whereConditions.push('h.categoria = ?');
      queryParams.push(categoria);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query optimizada con paginación
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          h.*,
          (resp.nombres || ' ' || resp.apellidos) as responsable_nombre,
          (aud.nombres || ' ' || aud.apellidos) as auditor_nombre
        FROM hallazgos h
        LEFT JOIN personal resp ON h.responsable_id = resp.id
        LEFT JOIN personal aud ON h.auditor_id = aud.id
        WHERE ${whereClause}
        ORDER BY h.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...queryParams, limitValue, offset]
    });

    // Query para obtener total de registros
    const countResult = await mongoClient.execute({
      sql: `
        SELECT COUNT(*) as total
        FROM hallazgos h
        WHERE ${whereClause}
      `,
      args: queryParams
    });

    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limitValue);

    console.log('📋 [HallazgosService] Obteniendo hallazgos con paginación');
    console.log('📋 [HallazgosService] Página:', page, 'Límite:', limit);
    console.log('📋 [HallazgosService] Cantidad de hallazgos:', result.rows.length);
    console.log('📋 [HallazgosService] Total de registros:', total);

    res.json({
      status: 'success',
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: limitValue,
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener hallazgos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener hallazgos',
      error: error.message
    });
  }
});

// Obtener un hallazgo por ID con datos SGC completos
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query simplificada para obtener datos básicos del hallazgo
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          h.*,
          (resp.nombres || ' ' || resp.apellidos) as responsable_nombre,
          (aud.nombres || ' ' || aud.apellidos) as auditor_nombre
        FROM hallazgos h
        LEFT JOIN personal resp ON h.responsable_id = resp.id
        LEFT JOIN personal aud ON h.auditor_id = aud.id
        WHERE h.is_active = 1 AND h.id = ?
      `,
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Hallazgo no encontrado'
      });
    }

    // Obtener datos SGC por separado para evitar consultas complejas
    const [participantesResult, documentosResult, normasResult] = await Promise.all([
      mongoClient.execute({
        sql: `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN rol = 'responsable' THEN 1 END) as responsables,
            COUNT(CASE WHEN rol = 'auditor' THEN 1 END) as auditores
          FROM sgc_personal_relaciones 
          WHERE entidad_tipo = 'hallazgo' AND entidad_id = ? AND is_active = 1
        `,
        args: [id]
      }),
      mongoClient.execute({
        sql: `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN tipo_relacion = 'evidencia' THEN 1 END) as evidencias
          FROM sgc_documentos_relacionados 
          WHERE entidad_tipo = 'hallazgo' AND entidad_id = ? AND is_active = 1
        `,
        args: [id]
      }),
      mongoClient.execute({
        sql: `
          SELECT COUNT(*) as total
          FROM sgc_normas_relacionadas 
          WHERE entidad_tipo = 'hallazgo' AND entidad_id = ? AND is_active = 1
        `,
        args: [id]
      })
    ]);

    const hallazgo = result.rows[0];
    const participantes = participantesResult.rows[0];
    const documentos = documentosResult.rows[0];
    const normas = normasResult.rows[0];

    // Combinar datos
    const hallazgoCompleto = {
      ...hallazgo,
      total_participantes: participantes?.total || 0,
      total_responsables: participantes?.responsables || 0,
      total_auditores: participantes?.auditores || 0,
      total_documentos: documentos?.total || 0,
      total_evidencias: documentos?.evidencias || 0,
      total_normas: normas?.total || 0
    };

    res.json({
      status: 'success',
      data: hallazgoCompleto
    });
  } catch (error) {
    console.error('Error al obtener hallazgo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener hallazgo',
      error: error.message
    });
  }
});

// Crear nuevo hallazgo
router.post('/', async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      origen,
      categoria,
      punto_norma_afectado,
      requisito_incumplido,
      prioridad = 'media',
      severidad = 'media',
      responsable_id,
      auditor_id,
      organization_id = 1
    } = req.body;

    // Validaciones básicas
    if (!titulo || !descripcion) {
      return res.status(400).json({
        status: 'error',
        message: 'Título y descripción son requeridos'
      });
    }

    // Generar ID único
    const hallazgoId = `HALL_${Date.now()}`;
    
    // Generar número de hallazgo automático
    const countResult = await mongoClient.execute(`
      SELECT COUNT(*) as count 
      FROM hallazgos 
      WHERE strftime('%Y', created_at) = strftime('%Y', 'now')
    `);
    
    const count = countResult.rows[0]?.count || 0;
    const numeroHallazgo = `HAL-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // Insertar hallazgo
    const result = await mongoClient.execute({
      sql: `
        INSERT INTO hallazgos (
          id, organization_id, numeroHallazgo, titulo, descripcion,
          origen, categoria, punto_norma_afectado, requisito_incumplido,
          prioridad, severidad, responsable_id, auditor_id,
          estado, fecha_deteccion, created_at, updated_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'deteccion', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
      `,
      args: [
        hallazgoId, organization_id, numeroHallazgo, titulo, descripcion,
        origen, categoria, punto_norma_afectado, requisito_incumplido,
        prioridad, severidad, responsable_id, auditor_id
      ]
    });

    // Crear participantes SGC si hay responsable
    if (responsable_id) {
      await mongoClient.execute({
        sql: `
          INSERT INTO sgc_personal_relaciones (
            id, organization_id, entidad_tipo, entidad_id, personal_id, rol,
            observaciones, created_at, updated_at, is_active
          ) VALUES (?, ?, 'hallazgo', ?, ?, 'responsable', 'Responsable principal del hallazgo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
        `,
        args: [`PART_HAL_${hallazgoId}_RESP`, organization_id, hallazgoId, responsable_id]
      });
    }

    // Crear auditor SGC si hay auditor
    if (auditor_id) {
      await mongoClient.execute({
        sql: `
          INSERT INTO sgc_personal_relaciones (
            id, organization_id, entidad_tipo, entidad_id, personal_id, rol,
            observaciones, created_at, updated_at, is_active
          ) VALUES (?, ?, 'hallazgo', ?, ?, 'auditor', 'Auditor que detectó el hallazgo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
        `,
        args: [`PART_HAL_${hallazgoId}_AUD`, organization_id, hallazgoId, auditor_id]
      });
    }

    // Crear norma SGC si hay punto de norma
    if (punto_norma_afectado) {
      const tipoRelacion = categoria === 'no_conformidad' ? 'no_conformidad' : 
                          categoria === 'oportunidad_mejora' ? 'oportunidad_mejora' : 'observacion';
                          
      await mongoClient.execute({
        sql: `
          INSERT INTO sgc_normas_relacionadas (
            id, organization_id, entidad_tipo, entidad_id, norma_id,
            punto_norma, clausula_descripcion, tipo_relacion, nivel_cumplimiento,
            observaciones, created_at, updated_at, is_active
          ) VALUES (?, ?, 'hallazgo', ?, 1, ?, ?, ?, 'no_cumple', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
        `,
        args: [
          `NOR_HAL_${hallazgoId}`, organization_id, hallazgoId, 
          punto_norma_afectado, requisito_incumplido, tipoRelacion, descripcion
        ]
      });
    }

    // Obtener el hallazgo creado con datos SGC
    const newHallazgo = await mongoClient.execute({
      sql: `
        SELECT h.*, (resp.nombres || ' ' || resp.apellidos) as responsable_nombre
        FROM hallazgos h
        LEFT JOIN personal resp ON h.responsable_id = resp.id
        WHERE h.id = ?
      `,
      args: [hallazgoId]
    });

    res.status(201).json({
      status: 'success',
      message: 'Hallazgo creado exitosamente',
      data: newHallazgo.rows[0]
    });
  } catch (error) {
    console.error('Error al crear hallazgo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al crear hallazgo',
      error: error.message
    });
  }
});

// Actualizar hallazgo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que el hallazgo existe
    const existingHallazgo = await mongoClient.execute({
      sql: 'SELECT id FROM hallazgos WHERE id = ? AND is_active = 1',
      args: [id]
    });

    if (existingHallazgo.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Hallazgo no encontrado'
      });
    }

    // Construir query dinámico de actualización
    const allowedFields = [
      'titulo', 'descripcion', 'origen', 'categoria', 'punto_norma_afectado',
      'requisito_incumplido', 'estado', 'prioridad', 'severidad',
      'fecha_planificacion', 'fecha_ejecucion', 'fecha_verificacion', 'fecha_cierre',
      'accion_inmediata', 'causa_raiz', 'plan_accion', 'evidencia_cierre',
      'verificacion_eficacia', 'responsable_id', 'auditor_id'
    ];

    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No hay campos válidos para actualizar'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    // Actualizar hallazgo
    await mongoClient.execute({
      sql: `UPDATE hallazgos SET ${updateFields.join(', ')} WHERE id = ?`,
      args: updateValues
    });

    // Actualizar participantes SGC si cambió el responsable
    if (updateData.responsable_id !== undefined) {
      // Eliminar participante anterior
      await mongoClient.execute({
        sql: `
          UPDATE sgc_personal_relaciones 
          SET is_active = 0 
          WHERE entidad_tipo = 'hallazgo' AND entidad_id = ? AND rol = 'responsable'
        `,
        args: [id]
      });

      // Crear nuevo participante si hay responsable
      if (updateData.responsable_id) {
        await mongoClient.execute({
          sql: `
            INSERT OR REPLACE INTO sgc_personal_relaciones (
              id, organization_id, entidad_tipo, entidad_id, personal_id, rol,
              observaciones, created_at, updated_at, is_active
            ) VALUES (?, 1, 'hallazgo', ?, ?, 'responsable', 'Responsable principal del hallazgo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
          `,
          args: [`PART_HAL_${id}_RESP`, id, updateData.responsable_id]
        });
      }
    }

    // Obtener hallazgo actualizado
    const updatedHallazgo = await mongoClient.execute({
      sql: `
        SELECT h.*, (resp.nombres || ' ' || resp.apellidos) as responsable_nombre
        FROM hallazgos h
        LEFT JOIN personal resp ON h.responsable_id = resp.id
        WHERE h.id = ?
      `,
      args: [id]
    });

    res.json({
      status: 'success',
      message: 'Hallazgo actualizado exitosamente',
      data: updatedHallazgo.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar hallazgo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al actualizar hallazgo',
      error: error.message
    });
  }
});

// Actualizar estado de hallazgo
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;
    
    if (!estado) {
      return res.status(400).json({
        status: 'error',
        message: 'Estado es requerido'
      });
    }

    // Actualizar estado
    await mongoClient.execute({
      sql: `
        UPDATE hallazgos 
        SET estado = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND is_active = 1
      `,
      args: [estado, id]
    });

    // Actualizar nivel de cumplimiento en normas SGC
    const nivelCumplimiento = estado === 'verificacion_cierre' || estado.includes('finalizado') ? 'cumple' : 'en_proceso';
    
    await mongoClient.execute({
      sql: `
        UPDATE sgc_normas_relacionadas 
        SET nivel_cumplimiento = ?, updated_at = CURRENT_TIMESTAMP
        WHERE entidad_tipo = 'hallazgo' AND entidad_id = ? AND is_active = 1
      `,
      args: [nivelCumplimiento, id]
    });

    res.json({
      status: 'success',
      message: 'Estado del hallazgo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar estado del hallazgo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al actualizar estado',
      error: error.message
    });
  }
});

// Eliminar hallazgo (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el hallazgo existe
    const existingHallazgo = await mongoClient.execute({
      sql: 'SELECT id FROM hallazgos WHERE id = ? AND is_active = 1',
      args: [id]
    });

    if (existingHallazgo.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Hallazgo no encontrado'
      });
    }

    // Soft delete del hallazgo
    await mongoClient.execute({
      sql: `
        UPDATE hallazgos 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
      args: [id]
    });

    // Soft delete de datos SGC relacionados
    await mongoClient.execute({
      sql: `
        UPDATE sgc_personal_relaciones 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE entidad_tipo = 'hallazgo' AND entidad_id = ?
      `,
      args: [id]
    });

    await mongoClient.execute({
      sql: `
        UPDATE sgc_documentos_relacionados 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE entidad_tipo = 'hallazgo' AND entidad_id = ?
      `,
      args: [id]
    });

    await mongoClient.execute({
      sql: `
        UPDATE sgc_normas_relacionadas 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE entidad_tipo = 'hallazgo' AND entidad_id = ?
      `,
      args: [id]
    });

    res.json({
      status: 'success',
      message: 'Hallazgo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar hallazgo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al eliminar hallazgo',
      error: error.message
    });
  }
});

// ===============================================
// RUTAS SGC ESPECÍFICAS
// ===============================================

// Obtener participantes de un hallazgo
router.get('/:id/participantes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          p.*,
          (per.nombres || ' ' || per.apellidos),
          per.email,
          per.telefono,
          per.departamento_id
        FROM sgc_personal_relaciones p
        LEFT JOIN personal per ON p.personal_id = per.id
        WHERE p.entidad_tipo = 'hallazgo' AND p.entidad_id = ? AND p.is_active = 1
        ORDER BY p.rol, (per.nombres || ' ' || per.apellidos)
      `,
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

// Obtener documentos de un hallazgo
router.get('/:id/documentos', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          d.*,
          doc.nombre,
          doc.archivo,
          doc.tipo,
          doc.tamano
        FROM sgc_documentos_relacionados d
        LEFT JOIN documentos doc ON d.documento_id = doc.id
        WHERE d.entidad_tipo = 'hallazgo' AND d.entidad_id = ? AND d.is_active = 1
        ORDER BY d.tipo_relacion, doc.nombre
      `,
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

// Obtener normas de un hallazgo
router.get('/:id/normas', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          n.*,
          nor.nombre as norma_nombre,
          nor.version
        FROM sgc_normas_relacionadas n
        LEFT JOIN normas nor ON n.norma_id = nor.id
        WHERE n.entidad_tipo = 'hallazgo' AND n.entidad_id = ? AND n.is_active = 1
        ORDER BY n.punto_norma
      `,
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

// Agregar participante a un hallazgo
router.post('/:id/participantes', async (req, res) => {
  try {
    const { id } = req.params;
    const { personal_id, rol, observaciones } = req.body;

    if (!personal_id || !rol) {
      return res.status(400).json({
        status: 'error',
        message: 'personal_id y rol son requeridos'
      });
    }

    const participanteId = `PART_HAL_${id}_${rol.toUpperCase()}_${Date.now()}`;

    await mongoClient.execute({
      sql: `
        INSERT INTO sgc_personal_relaciones (
          id, organization_id, entidad_tipo, entidad_id, personal_id, rol,
          observaciones, created_at, updated_at, is_active
        ) VALUES (?, 1, 'hallazgo', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
      `,
      args: [participanteId, id, personal_id, rol, observaciones]
    });

    res.status(201).json({
      status: 'success',
      message: 'Participante agregado exitosamente'
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

// Health check
router.get('/health', async (req, res) => {
  try {
    const result = await mongoClient.execute('SELECT COUNT(*) as count FROM hallazgos WHERE is_active = 1');
    
    res.json({ 
      status: 'OK', 
      message: 'Hallazgos service running with SGC integration',
      timestamp: new Date().toISOString(),
      count: result.rows[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

module.exports = router;
