const mongoClient = require('../lib/mongoClient.js');
const { randomUUID  } = require('crypto');

// ===============================================
// CONTROLADOR DE AUDITORÍAS - SGC PRO
// ===============================================

// Obtener todas las auditorías con relaciones
const getAllAuditorias = async (req, res) => {
  try {
    console.log('🔍 Obteniendo auditorías con relaciones...');
    
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          a.*,
          p.nombres || ' ' || p.apellidos as responsable_nombre,
          COUNT(DISTINCT asp.id) as total_aspectos,
          COUNT(DISTINCT r.id) as total_relaciones
        FROM auditorias a
        LEFT JOIN personal p ON a.responsable_id = p.id
        LEFT JOIN auditoria_aspectos asp ON a.id = asp.auditoria_id
        LEFT JOIN relaciones_sgc r ON (r.origen_tipo = 'auditoria' AND r.origen_id = a.id)
        WHERE a.organization_id = ?
        GROUP BY a.id
        ORDER BY a.fecha_programada DESC
      `,
      args: [req.user?.organization_id || 2]
    });

    // Parsear las áreas como JSON para cada auditoría
    const auditoriasConAreas = result.rows.map(auditoria => {
      try {
        const areas = JSON.parse(auditoria.area || '[]');
        return {
          ...auditoria,
          areas: areas
        };
      } catch (error) {
        // Si no es JSON válido, tratar como string simple
        return {
          ...auditoria,
          areas: auditoria.area ? [auditoria.area] : []
        };
      }
    });

    console.log(`✅ ${auditoriasConAreas.length} auditorías encontradas con relaciones`);
    
    res.json({
      success: true,
      data: auditoriasConAreas,
      total: auditoriasConAreas.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo auditorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener auditorías',
      error: error.message
    });
  }
};

// Obtener auditoría por ID con relaciones completas
const getAuditoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Obteniendo auditoría ${id} con relaciones...`);
    
    // Obtener auditoría principal
    const auditoriaResult = await mongoClient.execute({
      sql: `
        SELECT 
          a.*,
          p.nombres || ' ' || p.apellidos as responsable_nombre
        FROM auditorias a
        LEFT JOIN personal p ON a.responsable_id = p.id
        WHERE a.id = ? AND a.organization_id = ?
      `,
      args: [id, req.user?.organization_id || 2]
    });

    if (auditoriaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auditoría no encontrada'
      });
    }

    const auditoria = auditoriaResult.rows[0];

    // Parsear las áreas como JSON
    let areas = [];
    try {
      areas = JSON.parse(auditoria.area || '[]');
    } catch (error) {
      // Si no es JSON válido, tratar como string simple
      areas = auditoria.area ? [auditoria.area] : [];
    }

    // Obtener aspectos de la auditoría
    const aspectosResult = await mongoClient.execute({
      sql: `
        SELECT 
          asp.*,
          p.nombre as proceso_nombre_completo
        FROM auditoria_aspectos asp
        LEFT JOIN procesos p ON asp.proceso_id = p.id
        WHERE asp.auditoria_id = ?
      `,
      args: [id]
    });

    // Obtener relaciones con otros registros
    const relacionesResult = await mongoClient.execute({
      sql: `
        SELECT 
          r.*,
          CASE 
            WHEN r.destino_tipo = 'proceso' THEN (SELECT nombre FROM procesos WHERE id = r.destino_id)
            WHEN r.destino_tipo = 'documento' THEN (SELECT titulo FROM documentos WHERE id = r.destino_id)
            WHEN r.destino_tipo = 'hallazgo' THEN (SELECT titulo FROM hallazgos WHERE id = r.destino_id)
            WHEN r.destino_tipo = 'accion' THEN (SELECT descripcion_accion FROM acciones WHERE id = r.destino_id)
            ELSE 'Registro no encontrado'
          END as destino_nombre
        FROM relaciones_sgc r
        WHERE r.origen_tipo = 'auditoria' AND r.origen_id = ? AND r.organization_id = ?
      `,
      args: [id, req.user?.organization_id || 2]
    });

    console.log(`✅ Auditoría ${id} encontrada con ${aspectosResult.rows.length} aspectos y ${relacionesResult.rows.length} relaciones`);
    
    res.json({
      success: true,
      data: {
        ...auditoria,
        areas: areas,
        aspectos: aspectosResult.rows,
        relaciones: relacionesResult.rows
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener auditoría',
      error: error.message
    });
  }
};

// Crear nueva auditoría con relaciones
const createAuditoria = async (req, res) => {
  try {
    console.log('🆕 Creando nueva auditoría con relaciones...');
    console.log('📋 Datos recibidos:', req.body);
    
    const {
      codigo,
      titulo,
      areas,
      responsable_id,
      fecha_programada,
      objetivos,
      alcance,
      criterios,
      estado = 'planificada',
      aspectos = [],
      relaciones = []
    } = req.body;

    // Validaciones básicas
    if (!titulo || !areas || areas.length === 0 || !fecha_programada || !objetivos) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: título, áreas, fecha programada, objetivos'
      });
    }

    // Convertir áreas a formato JSON para almacenar en la base de datos
    const areaJson = JSON.stringify(areas);

    const auditoriaId = randomUUID();
    const timestamp = new Date().toISOString();
    const organizationId = req.user?.organization_id || 2;

    // Crear auditoría principal
    await mongoClient.execute({
      sql: `
        INSERT INTO auditorias (
          id, codigo, titulo, area, responsable_id, fecha_programada,
          objetivos, alcance, criterios, estado, organization_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        auditoriaId,
        codigo || `AUD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        titulo,
        areaJson, // Ahora almacenamos el JSON de áreas
        responsable_id || null,
        fecha_programada,
        objetivos,
        alcance || null,
        criterios || null,
        estado,
        organizationId,
        timestamp,
        timestamp
      ]
    });

    // Crear aspectos si se proporcionan
    if (aspectos && aspectos.length > 0) {
      for (const aspecto of aspectos) {
        if (aspecto.proceso_nombre) {
          const aspectoId = randomUUID();
          await mongoClient.execute({
            sql: `
              INSERT INTO auditoria_aspectos (
                id, auditoria_id, proceso_id, proceso_nombre,
                documentacion_referenciada, auditor_nombre,
                observaciones, conformidad, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              aspectoId,
              auditoriaId,
              aspecto.proceso_id || null,
              aspecto.proceso_nombre,
              aspecto.documentacion_referenciada || null,
              aspecto.auditor_nombre || null,
              aspecto.observaciones || null,
              aspecto.conformidad || null,
              timestamp
            ]
          });
        }
      }
    }

    // Crear relaciones si se proporcionan
    if (relaciones && relaciones.length > 0) {
      for (const relacion of relaciones) {
        if (relacion.destino_tipo && relacion.destino_id) {
          const relacionId = randomUUID();
          await mongoClient.execute({
            sql: `
              INSERT INTO relaciones_sgc (
                id, organization_id, origen_tipo, origen_id,
                destino_tipo, destino_id, descripcion, fecha_creacion, usuario_creador
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              relacionId,
              organizationId,
              'auditoria',
              auditoriaId,
              relacion.destino_tipo,
              relacion.destino_id,
              relacion.descripcion || `Relación con ${relacion.destino_tipo}`,
              timestamp,
              req.user?.nombre || 'Sistema'
            ]
          });
        }
      }
    }

    console.log(`✅ Auditoría creada con ID: ${auditoriaId}`);
    
    res.status(201).json({
      success: true,
      data: {
        id: auditoriaId,
        codigo,
        titulo,
        areas,
        aspectos_creados: aspectos.length,
        relaciones_creadas: relaciones.length
      },
      message: 'Auditoría creada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error creando auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear auditoría',
      error: error.message
    });
  }
};

// Actualizar auditoría
const updateAuditoria = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Actualizando auditoría ${id}...`);
    
    const {
      titulo,
      area,
      responsable_id,
      fecha_programada,
      fecha_ejecucion,
      objetivos,
      alcance,
      criterios,
      resultados,
      observaciones,
      estado
    } = req.body;

    const timestamp = new Date().toISOString();

    const result = await mongoClient.execute({
      sql: `
        UPDATE auditorias SET
          titulo = COALESCE(?, titulo),
          area = COALESCE(?, area),
          responsable_id = ?,
          fecha_programada = COALESCE(?, fecha_programada),
          fecha_ejecucion = ?,
          objetivos = COALESCE(?, objetivos),
          alcance = ?,
          criterios = ?,
          resultados = ?,
          observaciones = ?,
          estado = COALESCE(?, estado),
          updated_at = ?
        WHERE id = ? AND organization_id = ?
      `,
      args: [
        titulo,
        area,
        responsable_id || null,
        fecha_programada,
        fecha_ejecucion || null,
        objetivos,
        alcance || null,
        criterios || null,
        resultados || null,
        observaciones || null,
        estado,
        timestamp,
        id,
        req.user.organization_id
      ]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auditoría no encontrada'
      });
    }

    console.log(`✅ Auditoría ${id} actualizada`);
    
    res.json({
      success: true,
      message: 'Auditoría actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error actualizando auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar auditoría',
      error: error.message
    });
  }
};

// Eliminar auditoría
const deleteAuditoria = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando auditoría ${id}...`);
    
    const result = await mongoClient.execute({
      sql: 'DELETE FROM auditorias WHERE id = ? AND organization_id = ?',
      args: [id, req.user.organization_id]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auditoría no encontrada'
      });
    }

    console.log(`✅ Auditoría ${id} eliminada`);
    
    res.json({
      success: true,
      message: 'Auditoría eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error eliminando auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar auditoría',
      error: error.message
    });
  }
};

// ===============================================
// GESTIÓN SGC - PARTICIPANTES, DOCUMENTOS Y NORMAS
// ===============================================

// Obtener participantes SGC de una auditoría
const getParticipantesSGC = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    console.log(`👥 Obteniendo participantes SGC de auditoría ${auditoriaId}...`);
    
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          sp.*,
          p.nombres || ' ' || p.apellidos as participante_nombre,
          p.email as participante_email,
          d.nombre as departamento_nombre
        FROM sgc_participantes sp
        INNER JOIN personal p ON sp.personal_id = p.id
        LEFT JOIN departamentos d ON p.departamento_id = d.id
        WHERE sp.entidad_tipo = 'auditoria' 
        AND sp.entidad_id = ? 
        AND sp.is_active = 1
        ORDER BY sp.rol, sp.created_at ASC
      `,
      args: [auditoriaId]
    });

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo participantes SGC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener participantes SGC',
      error: error.message
    });
  }
};

// Agregar participante SGC a auditoría
const addParticipanteSGC = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    const { personal_id, rol = 'participante', observaciones } = req.body;

    if (!personal_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del personal es obligatorio'
      });
    }

    const participanteId = randomUUID();
    const timestamp = new Date().toISOString();

    await mongoClient.execute({
      sql: `
        INSERT INTO sgc_participantes (
          id, organization_id, entidad_tipo, entidad_id,
          personal_id, rol, observaciones, created_at, updated_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        participanteId,
        req.user?.organization_id || 2,
        'auditoria',
        auditoriaId,
        personal_id,
        rol,
        observaciones || null,
        timestamp,
        timestamp,
        1
      ]
    });

    res.status(201).json({
      success: true,
      data: { id: participanteId, personal_id, rol },
      message: 'Participante SGC agregado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error agregando participante SGC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar participante SGC',
      error: error.message
    });
  }
};

// Obtener documentos SGC de una auditoría
const getDocumentosSGC = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          sdr.*,
          d.titulo as documento_titulo,
          d.tipo as documento_tipo
        FROM sgc_documentos_relacionados sdr
        INNER JOIN documentos d ON sdr.documento_id = d.id
        WHERE sdr.entidad_tipo = 'auditoria' 
        AND sdr.entidad_id = ? 
        AND sdr.is_active = 1
        ORDER BY sdr.tipo_relacion, sdr.created_at ASC
      `,
      args: [auditoriaId]
    });

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo documentos SGC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos SGC',
      error: error.message
    });
  }
};

// Agregar documento SGC a auditoría
const addDocumentoSGC = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    const { documento_id, tipo_relacion = 'adjunto', descripcion } = req.body;

    if (!documento_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del documento es obligatorio'
      });
    }

    const relacionId = randomUUID();
    const timestamp = new Date().toISOString();

    await mongoClient.execute({
      sql: `
        INSERT INTO sgc_documentos_relacionados (
          id, organization_id, entidad_tipo, entidad_id,
          documento_id, tipo_relacion, descripcion,
          created_at, updated_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        relacionId,
        req.user?.organization_id || 2,
        'auditoria',
        auditoriaId,
        documento_id,
        tipo_relacion,
        descripcion || null,
        timestamp,
        timestamp,
        1
      ]
    });

    res.status(201).json({
      success: true,
      data: { id: relacionId, documento_id, tipo_relacion },
      message: 'Documento SGC agregado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error agregando documento SGC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar documento SGC',
      error: error.message
    });
  }
};

// Obtener normas SGC de una auditoría
const getNormasSGC = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          snr.*,
          n.nombre as norma_nombre
        FROM sgc_normas_relacionadas snr
        INNER JOIN normas n ON snr.norma_id = n.id
        WHERE snr.entidad_tipo = 'auditoria' 
        AND snr.entidad_id = ? 
        AND snr.is_active = 1
        ORDER BY snr.punto_norma ASC
      `,
      args: [auditoriaId]
    });

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo normas SGC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener normas SGC',
      error: error.message
    });
  }
};

// Agregar norma SGC a auditoría
const addNormaSGC = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    const { 
      norma_id = 1, 
      punto_norma, 
      nivel_cumplimiento = 'pendiente', 
      observaciones 
    } = req.body;

    if (!punto_norma) {
      return res.status(400).json({
        success: false,
        message: 'El punto de la norma es obligatorio'
      });
    }

    const normaRelacionId = randomUUID();
    const timestamp = new Date().toISOString();

    await mongoClient.execute({
      sql: `
        INSERT INTO sgc_normas_relacionadas (
          id, organization_id, entidad_tipo, entidad_id,
          norma_id, punto_norma, nivel_cumplimiento, observaciones,
          created_at, updated_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        normaRelacionId,
        req.user?.organization_id || 2,
        'auditoria',
        auditoriaId,
        norma_id,
        punto_norma,
        nivel_cumplimiento,
        observaciones || null,
        timestamp,
        timestamp,
        1
      ]
    });

    res.status(201).json({
      success: true,
      data: { id: normaRelacionId, punto_norma, nivel_cumplimiento },
      message: 'Norma SGC agregada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error agregando norma SGC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar norma SGC',
      error: error.message
    });
  }
};

// ===============================================
// GESTIÓN DE ASPECTOS (LEGACY - MANTENER COMPATIBILIDAD)
// ===============================================

// Obtener aspectos de una auditoría
const getAspectos = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    console.log(`🔍 Obteniendo aspectos de auditoría ${auditoriaId}...`);
    
    const result = await mongoClient.execute({
      sql: `
        SELECT aa.*, p.nombre as proceso_original
        FROM auditoria_aspectos aa
        LEFT JOIN procesos p ON aa.proceso_id = p.id
        WHERE aa.auditoria_id = ?
        ORDER BY aa.created_at ASC
      `,
      args: [auditoriaId]
    });

    console.log(`✅ ${result.rows.length} aspectos encontrados`);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo aspectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener aspectos',
      error: error.message
    });
  }
};

// Agregar aspecto a auditoría
const addAspecto = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    console.log(`➕ Agregando aspecto a auditoría ${auditoriaId}...`);
    
    const {
      proceso_id,
      proceso_nombre,
      documentacion_referenciada,
      auditor_nombre,
      observaciones,
      conformidad
    } = req.body;

    if (!proceso_nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del proceso es obligatorio'
      });
    }

    const aspectoId = randomUUID();
    const timestamp = new Date().toISOString();

    const result = await mongoClient.execute({
      sql: `
        INSERT INTO auditoria_aspectos (
          id, auditoria_id, proceso_id, proceso_nombre,
          documentacion_referenciada, auditor_nombre,
          observaciones, conformidad, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        aspectoId,
        auditoriaId,
        proceso_id || null,
        proceso_nombre,
        documentacion_referenciada || null,
        auditor_nombre || null,
        observaciones || null,
        conformidad || null,
        timestamp
      ]
    });

    console.log(`✅ Aspecto agregado con ID: ${aspectoId}`);
    
    res.status(201).json({
      success: true,
      data: {
        id: aspectoId,
        proceso_nombre
      },
      message: 'Aspecto agregado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error agregando aspecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar aspecto',
      error: error.message
    });
  }
};

// Actualizar aspecto
const updateAspecto = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Actualizando aspecto ${id}...`);
    
    const {
      proceso_id,
      proceso_nombre,
      documentacion_referenciada,
      auditor_nombre,
      observaciones,
      conformidad
    } = req.body;

    const result = await mongoClient.execute({
      sql: `
        UPDATE auditoria_aspectos SET
          proceso_id = ?,
          proceso_nombre = COALESCE(?, proceso_nombre),
          documentacion_referenciada = ?,
          auditor_nombre = ?,
          observaciones = ?,
          conformidad = ?
        WHERE id = ?
      `,
      args: [
        proceso_id || null,
        proceso_nombre,
        documentacion_referenciada || null,
        auditor_nombre || null,
        observaciones || null,
        conformidad || null,
        id
      ]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aspecto no encontrado'
      });
    }

    console.log(`✅ Aspecto ${id} actualizado`);
    
    res.json({
      success: true,
      message: 'Aspecto actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error actualizando aspecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar aspecto',
      error: error.message
    });
  }
};

// Eliminar aspecto
const deleteAspecto = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando aspecto ${id}...`);
    
    const result = await mongoClient.execute({
      sql: 'DELETE FROM auditoria_aspectos WHERE id = ?',
      args: [id]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aspecto no encontrado'
      });
    }

    console.log(`✅ Aspecto ${id} eliminado`);
    
    res.json({
      success: true,
      message: 'Aspecto eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error eliminando aspecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar aspecto',
      error: error.message
    });
  }
};

// Agregar relación a auditoría
const addRelacion = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    console.log(`🔗 Agregando relación a auditoría ${auditoriaId}...`);
    
    const {
      destino_tipo,
      destino_id,
      descripcion
    } = req.body;

    if (!destino_tipo || !destino_id) {
      return res.status(400).json({
        success: false,
        message: 'Los campos destino_tipo y destino_id son obligatorios'
      });
    }

    // Verificar que la auditoría existe
    const auditoriaExists = await mongoClient.execute({
      sql: 'SELECT id FROM auditorias WHERE id = ? AND organization_id = ?',
      args: [auditoriaId, req.user?.organization_id || 2]
    });

    if (auditoriaExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auditoría no encontrada'
      });
    }

    // Verificar que no existe ya la relación
    const relacionExists = await mongoClient.execute({
      sql: `
        SELECT id FROM relaciones_sgc 
        WHERE origen_tipo = 'auditoria' AND origen_id = ? 
        AND destino_tipo = ? AND destino_id = ? 
        AND organization_id = ?
      `,
      args: [auditoriaId, destino_tipo, destino_id, req.user?.organization_id || 2]
    });

    if (relacionExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Esta relación ya existe'
      });
    }

    const relacionId = randomUUID();
    const timestamp = new Date().toISOString();

    await mongoClient.execute({
      sql: `
        INSERT INTO relaciones_sgc (
          id, organization_id, origen_tipo, origen_id,
          destino_tipo, destino_id, descripcion, fecha_creacion, usuario_creador
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        relacionId,
        req.user?.organization_id || 2,
        'auditoria',
        auditoriaId,
        destino_tipo,
        destino_id,
        descripcion || `Relación con ${destino_tipo}`,
        timestamp,
        req.user?.nombre || 'Sistema'
      ]
    });

    console.log(`✅ Relación agregada con ID: ${relacionId}`);
    
    res.status(201).json({
      success: true,
      data: {
        id: relacionId,
        origen_tipo: 'auditoria',
        origen_id: auditoriaId,
        destino_tipo,
        destino_id,
        descripcion
      },
      message: 'Relación agregada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error agregando relación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar relación',
      error: error.message
    });
  }
};

// Obtener relaciones de una auditoría
const getRelaciones = async (req, res) => {
  try {
    const { auditoriaId } = req.params;
    console.log(`🔗 Obteniendo relaciones de auditoría ${auditoriaId}...`);
    
    const result = await mongoClient.execute({
      sql: `
        SELECT 
          r.*,
          CASE 
            WHEN r.destino_tipo = 'proceso' THEN (SELECT nombre FROM procesos WHERE id = r.destino_id)
            WHEN r.destino_tipo = 'documento' THEN (SELECT titulo FROM documentos WHERE id = r.destino_id)
            WHEN r.destino_tipo = 'hallazgo' THEN (SELECT titulo FROM hallazgos WHERE id = r.destino_id)
            WHEN r.destino_tipo = 'accion' THEN (SELECT descripcion_accion FROM acciones WHERE id = r.destino_id)
            WHEN r.destino_tipo = 'personal' THEN (SELECT nombres || ' ' || apellidos FROM personal WHERE id = r.destino_id)
            WHEN r.destino_tipo = 'departamento' THEN (SELECT nombre FROM departamentos WHERE id = r.destino_id)
            ELSE 'Registro no encontrado'
          END as destino_nombre
        FROM relaciones_sgc r
        WHERE r.origen_tipo = 'auditoria' 
        AND r.origen_id = ? 
        AND r.organization_id = ?
        ORDER BY r.fecha_creacion DESC
      `,
      args: [auditoriaId, req.user?.organization_id || 2]
    });

    console.log(`✅ ${result.rows.length} relaciones encontradas`);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo relaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener relaciones',
      error: error.message
    });
  }
};

// Eliminar relación de auditoría
const deleteRelacion = async (req, res) => {
  try {
    const { relacionId } = req.params;
    console.log(`🗑️ Eliminando relación ${relacionId}...`);
    
    const result = await mongoClient.execute({
      sql: `
        DELETE FROM relaciones_sgc 
        WHERE id = ? AND organization_id = ? AND origen_tipo = 'auditoria'
      `,
      args: [relacionId, req.user?.organization_id || 2]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    console.log(`✅ Relación ${relacionId} eliminada`);
    
    res.json({
      success: true,
      message: 'Relación eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error eliminando relación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar relación',
      error: error.message
    });
  }
};

// Obtener registros relacionables disponibles para auditoría
const getRegistrosRelacionables = async (req, res) => {
  try {
    const { tipo } = req.query;
    console.log(`🔍 Obteniendo registros relacionables de tipo: ${tipo}`);
    
    let sql = '';
    let args = [req.user?.organization_id || 2];
    
    switch (tipo) {
      case 'procesos':
        sql = 'SELECT id, nombre as titulo FROM procesos WHERE organization_id = ? ORDER BY nombre';
        break;
      case 'documentos':
        sql = 'SELECT id, titulo FROM documentos WHERE organization_id = ? ORDER BY titulo';
        break;
      case 'hallazgos':
        sql = 'SELECT id, titulo FROM hallazgos WHERE organization_id = ? ORDER BY titulo';
        break;
      case 'acciones':
        sql = 'SELECT id, descripcion_accion as titulo FROM acciones WHERE organization_id = ? ORDER BY descripcion_accion';
        break;
      case 'personal':
        sql = 'SELECT id, nombres || " " || apellidos as titulo FROM personal WHERE organization_id = ? ORDER BY nombres';
        break;
      case 'departamentos':
        sql = 'SELECT id, nombre as titulo FROM departamentos WHERE organization_id = ? ORDER BY nombre';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de registro no válido'
        });
    }

    const result = await mongoClient.execute({ sql, args });

    console.log(`✅ ${result.rows.length} registros de tipo ${tipo} encontrados`);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo registros relacionables:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros relacionables',
      error: error.message
    });
  }
};

// ===============================================
// EXPORTACIÓN DE FUNCIONES - SGC PRO
// ===============================================

module.exports = {
  // Funciones principales de auditorías
  getAllAuditorias,
  getAuditoriaById,
  createAuditoria,
  updateAuditoria,
  deleteAuditoria,
  
  // Funciones SGC - Participantes
  getParticipantesSGC,
  addParticipanteSGC,
  
  // Funciones SGC - Documentos
  getDocumentosSGC,
  addDocumentoSGC,
  
  // Funciones SGC - Normas
  getNormasSGC,
  addNormaSGC,
  
  // Funciones legacy (mantener compatibilidad)
  getAspectos,
  addAspecto,
  updateAspecto,
  deleteAspecto,
  addRelacion,
  getRelaciones,
  deleteRelacion,
  getRegistrosRelacionables
};
