const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// ===============================================
// RUTAS PROCESOS SGC - SISTEMA ESTANDARIZADO
// Integrado con tablas: sgc_personal_relaciones, sgc_documentos_relacionados, sgc_normas_relacionadas
// ===============================================

// GET /api/procesos - Obtener todos los procesos con información SGC
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orgId = req.user?.organization_id || 2;
    console.log('📋 Obteniendo todos los procesos SGC para organización:', orgId);
    
    const result = await mongoClient.execute({
      sql: `SELECT 
        p.id, p.codigo, p.nombre, p.descripcion, p.objetivo, p.alcance, p.version,
        p.tipo, p.categoria, p.nivel_critico, p.estado, p.responsable_id,
        p.departamento_id, p.supervisor_id, p.entradas, p.salidas, p.proveedores, p.clientes,
        p.recursos_requeridos, p.competencias_requeridas, p.indicadores,
        p.metodos_seguimiento, p.criterios_control, p.procedimientos_documentados,
        p.registros_requeridos, p.riesgos_identificados, p.oportunidades_mejora,
        p.fecha_vigencia, p.fecha_revision, p.organization_id, p.created_at, p.updated_at, p.is_active,
        -- Contadores SGC
        COUNT(DISTINCT sp.id) as total_participantes,
        COUNT(DISTINCT sd.id) as total_documentos,
        COUNT(DISTINCT sn.id) as total_normas
      FROM procesos p
      LEFT JOIN sgc_personal_relaciones sp ON p.id = sp.entidad_id AND sp.entidad_tipo = 'proceso' AND sp.is_active = 1
      LEFT JOIN sgc_documentos_relacionados sd ON p.id = sd.entidad_id AND sd.entidad_tipo = 'proceso' AND sd.is_active = 1
      LEFT JOIN sgc_normas_relacionadas sn ON p.id = sn.entidad_id AND sn.entidad_tipo = 'proceso' AND sn.is_active = 1
      WHERE p.organization_id = ? AND p.is_active = 1
      GROUP BY p.id
      ORDER BY p.codigo, p.nombre`,
      args: [orgId]
    });
    
    console.log(`✅ Encontrados ${result.rows.length} procesos SGC`);
    res.json({ 
      success: true, 
      data: result.rows, 
      total: result.rows.length,
      message: 'Procesos SGC obtenidos exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener procesos SGC:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al obtener procesos SGC',
      error: error.message 
    });
  }
});

// GET /api/procesos/:id - Obtener proceso por ID con información SGC completa
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization_id || 2;
    console.log(`🔍 Buscando proceso SGC con ID: ${id}`);
    
    // Obtener proceso principal
    const procesoResult = await mongoClient.execute({
      sql: 'SELECT * FROM procesos WHERE id = ? AND organization_id = ? AND is_active = 1',
      args: [id, orgId]
    });

    if (procesoResult.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Proceso no encontrado' 
      });
    }

    const proceso = procesoResult.rows[0];
    
    // Obtener participantes SGC
    const participantesResult = await mongoClient.execute({
      sql: `SELECT sp.*, p.nombre_completo, p.puesto 
            FROM sgc_personal_relaciones sp
            LEFT JOIN personal p ON sp.personal_id = p.id
            WHERE sp.entidad_tipo = 'proceso' AND sp.entidad_id = ? AND sp.is_active = 1
            ORDER BY sp.rol`,
      args: [id]
    });
    
    // Obtener documentos SGC
    const documentosResult = await mongoClient.execute({
      sql: `SELECT sd.*, d.nombre as documento_nombre, d.tipo as documento_tipo
            FROM sgc_documentos_relacionados sd
            LEFT JOIN documentos d ON sd.documento_id = d.id
            WHERE sd.entidad_tipo = 'proceso' AND sd.entidad_id = ? AND sd.is_active = 1
            ORDER BY sd.tipo_relacion`,
      args: [id]
    });
    
    // Obtener normas SGC
    const normasResult = await mongoClient.execute({
      sql: `SELECT sn.*, n.nombre as norma_nombre
            FROM sgc_normas_relacionadas sn
            LEFT JOIN normas n ON sn.norma_id = n.id
            WHERE sn.entidad_tipo = 'proceso' AND sn.entidad_id = ? AND sn.is_active = 1
            ORDER BY sn.punto_norma`,
      args: [id]
    });

    // Combinar toda la información SGC
    const procesoCompleto = {
      ...proceso,
      participantes: participantesResult.rows,
      documentos: documentosResult.rows,
      normas: normasResult.rows,
      estadisticas_sgc: {
        total_participantes: participantesResult.rows.length,
        total_documentos: documentosResult.rows.length,
        total_normas: normasResult.rows.length
      }
    };

    console.log(`✅ Proceso SGC completo encontrado: ${proceso.nombre}`);
    res.json({
      status: 'success',
      data: procesoCompleto,
      message: 'Proceso SGC obtenido exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener proceso SGC:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al obtener proceso SGC',
      error: error.message 
    });
  }
});

// POST /api/procesos - Crear nuevo proceso con estructura SGC
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      nombre, codigo, descripcion, objetivo, alcance, version = '1.0',
      tipo = 'operativo', categoria = 'proceso', nivel_critico = 'medio',
      responsable_id, departamento_id, supervisor_id,
      entradas, salidas, proveedores, clientes,
      recursos_requeridos, competencias_requeridas, indicadores,
      metodos_seguimiento, criterios_control, procedimientos_documentados,
      registros_requeridos, riesgos_identificados, oportunidades_mejora,
      fecha_vigencia, fecha_revision, motivo_cambio
    } = req.body;
    
    const orgId = req.user?.organization_id || 2;
    const userId = req.user?.id;
    
    console.log('➕ Creando nuevo proceso SGC:', { nombre, codigo, tipo, categoria });

    // Validación básica
    if (!nombre) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El nombre es obligatorio' 
      });
    }

    // Generar ID y código únicos
    const id = `proc-${Date.now()}`;
    const codigoFinal = codigo || `PROC-${String(Date.now()).slice(-6)}`;

    const result = await mongoClient.execute({
      sql: `INSERT INTO procesos (
        id, organization_id, codigo, nombre, descripcion, objetivo, alcance, version,
        tipo, categoria, nivel_critico, responsable_id, departamento_id, supervisor_id,
        entradas, salidas, proveedores, clientes, recursos_requeridos, competencias_requeridas,
        indicadores, metodos_seguimiento, criterios_control, procedimientos_documentados,
        registros_requeridos, riesgos_identificados, oportunidades_mejora,
        fecha_vigencia, fecha_revision, estado, motivo_cambio,
        created_at, updated_at, created_by, updated_by, is_active
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', ?, 
        datetime('now'), datetime('now'), ?, ?, 1
      ) RETURNING *`,
      args: [
        id, orgId, codigoFinal, nombre, descripcion || '', objetivo || '', alcance || '', version,
        tipo, categoria, nivel_critico, responsable_id, departamento_id, supervisor_id,
        entradas || '', salidas || '', proveedores || '', clientes || '', recursos_requeridos || '', competencias_requeridas || '',
        indicadores || '', metodos_seguimiento || '', criterios_control || '', procedimientos_documentados || '',
        registros_requeridos || '', riesgos_identificados || '', oportunidades_mejora || '',
        fecha_vigencia, fecha_revision, motivo_cambio || '',
        userId, userId
      ]
    });

    console.log(`✅ Proceso SGC creado con ID: ${result.rows[0].id}`);
    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'Proceso SGC creado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al crear proceso SGC:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al crear proceso SGC',
      error: error.message 
    });
  }
});

// PUT /api/procesos/:id - Actualizar proceso con estructura SGC
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, codigo, descripcion, objetivo, alcance, version,
      tipo, categoria, nivel_critico, responsable_id, departamento_id, supervisor_id,
      entradas, salidas, proveedores, clientes, recursos_requeridos, competencias_requeridas,
      indicadores, metodos_seguimiento, criterios_control, procedimientos_documentados,
      registros_requeridos, riesgos_identificados, oportunidades_mejora,
      fecha_vigencia, fecha_revision, estado, motivo_cambio
    } = req.body;
    
    const orgId = req.user?.organization_id || 2;
    const userId = req.user?.id;
    
    console.log(`✏️ Actualizando proceso SGC ID: ${id}`, { nombre, codigo, tipo });

    // Validación básica
    if (!nombre) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El nombre es obligatorio' 
      });
    }

    const result = await mongoClient.execute({
      sql: `UPDATE procesos SET 
        codigo = COALESCE(?, codigo),
        nombre = ?, descripcion = COALESCE(?, descripcion), 
        objetivo = COALESCE(?, objetivo), alcance = COALESCE(?, alcance), version = COALESCE(?, version),
        tipo = COALESCE(?, tipo), categoria = COALESCE(?, categoria), nivel_critico = COALESCE(?, nivel_critico),
        responsable_id = COALESCE(?, responsable_id), departamento_id = COALESCE(?, departamento_id), supervisor_id = COALESCE(?, supervisor_id),
        entradas = COALESCE(?, entradas), salidas = COALESCE(?, salidas), proveedores = COALESCE(?, proveedores), clientes = COALESCE(?, clientes),
        recursos_requeridos = COALESCE(?, recursos_requeridos), competencias_requeridas = COALESCE(?, competencias_requeridas),
        indicadores = COALESCE(?, indicadores), metodos_seguimiento = COALESCE(?, metodos_seguimiento), criterios_control = COALESCE(?, criterios_control),
        procedimientos_documentados = COALESCE(?, procedimientos_documentados), registros_requeridos = COALESCE(?, registros_requeridos),
        riesgos_identificados = COALESCE(?, riesgos_identificados), oportunidades_mejora = COALESCE(?, oportunidades_mejora),
        fecha_vigencia = COALESCE(?, fecha_vigencia), fecha_revision = COALESCE(?, fecha_revision), 
        estado = COALESCE(?, estado), motivo_cambio = COALESCE(?, motivo_cambio),
        updated_at = datetime('now'), updated_by = ?
      WHERE id = ? AND organization_id = ? AND is_active = 1
      RETURNING *`,
      args: [
        codigo, nombre, descripcion, objetivo, alcance, version,
        tipo, categoria, nivel_critico, responsable_id, departamento_id, supervisor_id,
        entradas, salidas, proveedores, clientes, recursos_requeridos, competencias_requeridas,
        indicadores, metodos_seguimiento, criterios_control, procedimientos_documentados, registros_requeridos,
        riesgos_identificados, oportunidades_mejora, fecha_vigencia, fecha_revision, estado, motivo_cambio,
        userId, id, orgId
      ]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Proceso no encontrado' 
      });
    }

    console.log(`✅ Proceso SGC actualizado: ${result.rows[0].nombre}`);
    res.json({
      status: 'success',
      data: result.rows[0],
      message: 'Proceso SGC actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al actualizar proceso SGC:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al actualizar proceso SGC',
      error: error.message 
    });
  }
});

// DELETE /api/procesos/:id - Eliminar proceso (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization_id || 2;
    const userId = req.user?.id;
    
    console.log(`🗑️ Eliminando proceso SGC ID: ${id}`);

    // Soft delete - marcar como inactivo en lugar de eliminar
    const result = await mongoClient.execute({
      sql: `UPDATE procesos SET 
        is_active = 0, estado = 'obsoleto', 
        updated_at = datetime('now'), updated_by = ?,
        motivo_cambio = 'Proceso eliminado por usuario'
      WHERE id = ? AND organization_id = ? AND is_active = 1
      RETURNING id, nombre`,
      args: [userId, id, orgId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Proceso no encontrado' 
      });
    }

    // También desactivar datos SGC relacionados
    await Promise.all([
      mongoClient.execute({
        sql: 'UPDATE sgc_personal_relaciones SET is_active = 0 WHERE entidad_tipo = "proceso" AND entidad_id = ?',
        args: [id]
      }),
      mongoClient.execute({
        sql: 'UPDATE sgc_documentos_relacionados SET is_active = 0 WHERE entidad_tipo = "proceso" AND entidad_id = ?',
        args: [id]
      }),
      mongoClient.execute({
        sql: 'UPDATE sgc_normas_relacionadas SET is_active = 0 WHERE entidad_tipo = "proceso" AND entidad_id = ?',
        args: [id]
      })
    ]);

    console.log(`✅ Proceso SGC eliminado exitosamente: ${result.rows[0].nombre}`);
    res.json({
      status: 'success',
      message: 'Proceso SGC eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al eliminar proceso SGC:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al eliminar proceso SGC',
      error: error.message 
    });
  }
});

// ===============================================
// ENDPOINTS SGC PARA PROCESOS
// ===============================================

// GET /api/procesos/:id/participantes - Obtener participantes SGC del proceso
router.get('/:id/participantes', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization_id || 2;
    
    const result = await mongoClient.execute({
      sql: `SELECT 
        sp.id, sp.personal_id, sp.rol, sp.asistio, sp.justificacion_ausencia,
        sp.observaciones, sp.datos_adicionales, sp.created_at, sp.updated_at,
        p.nombre_completo, p.puesto, p.departamento, p.email
      FROM sgc_personal_relaciones sp
      LEFT JOIN personal p ON sp.personal_id = p.id
      WHERE sp.entidad_tipo = 'proceso' AND sp.entidad_id = ? 
        AND sp.organization_id = ? AND sp.is_active = 1
      ORDER BY sp.rol, p.nombre_completo`,
      args: [id, orgId]
    });
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rows.length,
      message: 'Participantes SGC obtenidos exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener participantes SGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener participantes SGC',
      error: error.message
    });
  }
});

// POST /api/procesos/:id/participantes - Agregar participante SGC al proceso
router.post('/:id/participantes', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { personal_id, rol = 'participante', observaciones } = req.body;
    const orgId = req.user?.organization_id || 2;
    const userId = req.user?.id;
    
    if (!personal_id) {
      return res.status(400).json({
        status: 'error',
        message: 'personal_id es obligatorio'
      });
    }
    
    const participanteId = `PART_PROC_${id}_${personal_id}`;
    
    const result = await mongoClient.execute({
      sql: `INSERT INTO sgc_personal_relaciones (
        id, organization_id, entidad_tipo, entidad_id, personal_id, rol,
        observaciones, created_at, updated_at, created_by, is_active
      ) VALUES (?, ?, 'proceso', ?, ?, ?, ?, datetime('now'), datetime('now'), ?, 1)
      RETURNING *`,
      args: [participanteId, orgId, id, personal_id, rol, observaciones || '', userId]
    });
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'Participante SGC agregado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al agregar participante SGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar participante SGC',
      error: error.message
    });
  }
});

// GET /api/procesos/:id/documentos - Obtener documentos SGC del proceso
router.get('/:id/documentos', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization_id || 2;
    
    const result = await mongoClient.execute({
      sql: `SELECT 
        sd.id, sd.documento_id, sd.tipo_relacion, sd.descripcion, sd.es_obligatorio,
        sd.datos_adicionales, sd.created_at, sd.updated_at,
        d.nombre as documento_nombre, d.tipo as documento_tipo, d.ruta_archivo
      FROM sgc_documentos_relacionados sd
      LEFT JOIN documentos d ON sd.documento_id = d.id
      WHERE sd.entidad_tipo = 'proceso' AND sd.entidad_id = ? 
        AND sd.organization_id = ? AND sd.is_active = 1
      ORDER BY sd.tipo_relacion, d.nombre`,
      args: [id, orgId]
    });
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rows.length,
      message: 'Documentos SGC obtenidos exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener documentos SGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener documentos SGC',
      error: error.message
    });
  }
});

// POST /api/procesos/:id/documentos - Agregar documento SGC al proceso
router.post('/:id/documentos', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { documento_id, tipo_relacion = 'adjunto', descripcion, es_obligatorio = 0 } = req.body;
    const orgId = req.user?.organization_id || 2;
    const userId = req.user?.id;
    
    if (!documento_id) {
      return res.status(400).json({
        status: 'error',
        message: 'documento_id es obligatorio'
      });
    }
    
    const documentoId = `DOC_PROC_${id}_${documento_id}`;
    
    const result = await mongoClient.execute({
      sql: `INSERT INTO sgc_documentos_relacionados (
        id, organization_id, entidad_tipo, entidad_id, documento_id, tipo_relacion,
        descripcion, es_obligatorio, created_at, updated_at, created_by, is_active
      ) VALUES (?, ?, 'proceso', ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, 1)
      RETURNING *`,
      args: [documentoId, orgId, id, documento_id, tipo_relacion, descripcion || '', es_obligatorio, userId]
    });
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'Documento SGC agregado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al agregar documento SGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar documento SGC',
      error: error.message
    });
  }
});

// GET /api/procesos/:id/normas - Obtener normas SGC del proceso
router.get('/:id/normas', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization_id || 2;
    
    const result = await mongoClient.execute({
      sql: `SELECT 
        sn.id, sn.norma_id, sn.punto_norma, sn.clausula_descripcion, sn.tipo_relacion,
        sn.nivel_cumplimiento, sn.observaciones, sn.evidencias, sn.acciones_requeridas,
        sn.datos_adicionales, sn.created_at, sn.updated_at,
        n.nombre as norma_nombre, n.descripcion as norma_descripcion
      FROM sgc_normas_relacionadas sn
      LEFT JOIN normas n ON sn.norma_id = n.id
      WHERE sn.entidad_tipo = 'proceso' AND sn.entidad_id = ? 
        AND sn.organization_id = ? AND sn.is_active = 1
      ORDER BY sn.punto_norma, sn.tipo_relacion`,
      args: [id, orgId]
    });
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rows.length,
      message: 'Normas SGC obtenidas exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener normas SGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener normas SGC',
      error: error.message
    });
  }
});

// POST /api/procesos/:id/normas - Agregar norma SGC al proceso
router.post('/:id/normas', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      norma_id, punto_norma, clausula_descripcion, tipo_relacion = 'aplica',
      nivel_cumplimiento = 'pendiente', observaciones, evidencias, acciones_requeridas 
    } = req.body;
    const orgId = req.user?.organization_id || 2;
    const userId = req.user?.id;
    
    if (!norma_id || !punto_norma) {
      return res.status(400).json({
        status: 'error',
        message: 'norma_id y punto_norma son obligatorios'
      });
    }
    
    const normaId = `NOR_PROC_${id}_${norma_id}_${punto_norma.replace(/\./g, '_')}`;
    
    const result = await mongoClient.execute({
      sql: `INSERT INTO sgc_normas_relacionadas (
        id, organization_id, entidad_tipo, entidad_id, norma_id, punto_norma,
        clausula_descripcion, tipo_relacion, nivel_cumplimiento, observaciones,
        evidencias, acciones_requeridas, created_at, updated_at, created_by, is_active
      ) VALUES (?, ?, 'proceso', ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, 1)
      RETURNING *`,
      args: [
        normaId, orgId, id, norma_id, punto_norma, clausula_descripcion || '',
        tipo_relacion, nivel_cumplimiento, observaciones || '', evidencias || '',
        acciones_requeridas || '', userId
      ]
    });
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'Norma SGC agregada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al agregar norma SGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar norma SGC',
      error: error.message
    });
  }
});

// GET /api/procesos/dashboard/sgc - Dashboard estadísticas SGC de procesos
router.get('/dashboard/sgc', authMiddleware, async (req, res) => {
  try {
    const orgId = req.user?.organization_id || 2;
    
    const [resumenResult, tiposResult, cumplimientoResult] = await Promise.all([
      // Resumen general
      mongoClient.execute({
        sql: `SELECT 
          COUNT(*) as total_procesos,
          COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
          COUNT(CASE WHEN tipo = 'estrategico' THEN 1 END) as estrategicos,
          COUNT(CASE WHEN tipo = 'operativo' THEN 1 END) as operativos,
          COUNT(CASE WHEN tipo = 'apoyo' THEN 1 END) as apoyo
        FROM procesos WHERE organization_id = ? AND is_active = 1`,
        args: [orgId]
      }),
      
      // Distribución por tipos
      mongoClient.execute({
        sql: `SELECT tipo, categoria, COUNT(*) as cantidad
        FROM procesos WHERE organization_id = ? AND is_active = 1
        GROUP BY tipo, categoria ORDER BY cantidad DESC`,
        args: [orgId]
      }),
      
      // Cumplimiento de normas
      mongoClient.execute({
        sql: `SELECT 
          nivel_cumplimiento,
          COUNT(*) as cantidad
        FROM sgc_normas_relacionadas 
        WHERE entidad_tipo = 'proceso' AND organization_id = ? AND is_active = 1
        GROUP BY nivel_cumplimiento`,
        args: [orgId]
      })
    ]);
    
    const dashboard = {
      resumen: resumenResult.rows[0] || {},
      distribucion_tipos: tiposResult.rows || [],
      cumplimiento_normas: cumplimientoResult.rows || []
    };
    
    res.json({
      status: 'success',
      data: dashboard,
      message: 'Dashboard SGC procesos obtenido exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener dashboard SGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener dashboard SGC',
      error: error.message
    });
  }
});

module.exports = router;