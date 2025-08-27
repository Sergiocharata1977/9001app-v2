const mongoClient = require('../lib/mongoClient.js');

// ===============================================
// CONTROLADOR EVALUACIONES SGC ESTANDARIZADO
// Utiliza las tablas genéricas SGC manteniendo compatibilidad con API existente
// ===============================================

// Obtener todas las evaluaciones individuales de la organización (usando tablas SGC)
const getEvaluaciones = async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    console.log(`🔎 [Evaluaciones SGC] Obteniendo evaluaciones para organización: ${organization_id}`);
    
    // Consulta usando las vistas de compatibilidad o directamente las tablas SGC
    const result = await mongoClient.execute({ 
      sql: `SELECT 
              sp_evaluado.entidad_id as id,
              sp_evaluado.organization_id,
              sp_evaluado.personal_id as empleado_id,
              sp_evaluador.personal_id as evaluador_id,
              JSON_EXTRACT(sp_evaluado.datos_adicionales, '$.fecha_evaluacion') as fecha_evaluacion,
              sp_evaluado.observaciones,
              JSON_EXTRACT(sp_evaluado.datos_adicionales, '$.estado') as estado,
              sp_evaluado.created_at,
              sp_evaluado.updated_at,
              p.nombres as empleado_nombre,
              p.apellidos as empleado_apellido,
              ev.nombres as evaluador_nombre,
              ev.apellidos as evaluador_apellido
            FROM sgc_personal_relaciones sp_evaluado
            LEFT JOIN sgc_personal_relaciones sp_evaluador ON (
              sp_evaluado.entidad_tipo = sp_evaluador.entidad_tipo 
              AND sp_evaluado.entidad_id = sp_evaluador.entidad_id
              AND sp_evaluador.rol = 'evaluador'
            )
            LEFT JOIN personal p ON sp_evaluado.personal_id = CAST(p.id as TEXT)
            LEFT JOIN personal ev ON sp_evaluador.personal_id = CAST(ev.id as TEXT)
            WHERE sp_evaluado.entidad_tipo = 'evaluacion' 
              AND sp_evaluado.rol = 'evaluado'
              AND sp_evaluado.organization_id = ?
            ORDER BY JSON_EXTRACT(sp_evaluado.datos_adicionales, '$.fecha_evaluacion') DESC`,
      args: [organization_id]
    });
    
    console.log(`✅ [Evaluaciones SGC] Encontradas ${result.rows.length} evaluaciones para organización ${organization_id}`);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ [Evaluaciones SGC] Error al obtener evaluaciones:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener evaluaciones', 
      details: error.message 
    });
  }
};

// Crear una nueva evaluación individual usando tablas SGC
const createEvaluacion = async (req, res) => {
  try {
    const { 
      empleado_id, 
      fecha_evaluacion, 
      observaciones, 
      competencias // Array de { competencia_id, puntaje }
    } = req.body;
    
    const organization_id = req.user?.organization_id;
    const evaluador_id = req.user?.id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    if (!empleado_id || !fecha_evaluacion || !competencias || !Array.isArray(competencias)) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: empleado_id, fecha_evaluacion, competencias'
      });
    }

    console.log(`🔄 [Evaluaciones SGC] Creando evaluación para empleado ${empleado_id}`);

    // Generar ID único para la evaluación
    const evaluacion_id = `EVAL_${Date.now()}_${empleado_id}`;

    // Iniciar transacción
    await mongoClient.execute('BEGIN TRANSACTION');

    try {
      // 1. Insertar participante evaluado
      await mongoClient.execute({
        sql: `INSERT INTO sgc_personal_relaciones 
              (id, organization_id, entidad_tipo, entidad_id, personal_id, rol, asistio, observaciones, datos_adicionales, created_at, updated_at) 
              VALUES (?, ?, 'evaluacion', ?, ?, 'evaluado', 1, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          `PART_${evaluacion_id}_EVALUADO`,
          organization_id,
          evaluacion_id,
          empleado_id.toString(),
          observaciones || '',
          JSON.stringify({
            fecha_evaluacion,
            estado: 'completada',
            tipo_evaluacion: 'individual'
          })
        ]
      });

      // 2. Insertar participante evaluador
      await mongoClient.execute({
        sql: `INSERT INTO sgc_personal_relaciones 
              (id, organization_id, entidad_tipo, entidad_id, personal_id, rol, asistio, observaciones, datos_adicionales, created_at, updated_at) 
              VALUES (?, ?, 'evaluacion', ?, ?, 'evaluador', 1, 'Evaluador responsable', ?, datetime('now'), datetime('now'))`,
        args: [
          `PART_${evaluacion_id}_EVALUADOR`,
          organization_id,
          evaluacion_id,
          evaluador_id.toString(),
          JSON.stringify({
            fecha_evaluacion,
            estado: 'completada',
            tipo_evaluacion: 'individual'
          })
        ]
      });

      // 3. Insertar competencias evaluadas en sgc_normas_relacionadas
      for (const comp of competencias) {
        if (comp.competencia_id && comp.puntaje !== undefined) {
          const nivel_cumplimiento = comp.puntaje >= 80 ? 'cumple_completo' : 
                                    comp.puntaje >= 60 ? 'cumple_parcial' : 'no_cumple';
          
          await mongoClient.execute({
            sql: `INSERT INTO sgc_normas_relacionadas 
                  (id, organization_id, entidad_tipo, entidad_id, norma_id, punto_norma, tipo_relacion, nivel_cumplimiento, observaciones, datos_adicionales, created_at, updated_at) 
                  VALUES (?, ?, 'evaluacion', ?, ?, ?, 'competencia_evaluada', ?, ?, ?, datetime('now'), datetime('now'))`,
            args: [
              `NOR_${evaluacion_id}_COMP_${comp.competencia_id}`,
              organization_id,
              evaluacion_id,
              comp.competencia_id,
              `COMPETENCIA_${comp.competencia_id}`,
              nivel_cumplimiento,
              `Puntaje obtenido: ${comp.puntaje}`,
              JSON.stringify({
                puntaje: comp.puntaje,
                puntaje_maximo: 100,
                tipo_evaluacion: 'competencia_individual'
              })
            ]
          });
        }
      }

      // Confirmar transacción
      await mongoClient.execute('COMMIT');

      console.log(`✅ [Evaluaciones SGC] Evaluación creada exitosamente con ID: ${evaluacion_id}`);

      res.status(201).json({
        success: true,
        data: {
          id: evaluacion_id,
          empleado_id,
          evaluador_id,
          fecha_evaluacion,
          observaciones,
          estado: 'completada',
          competencias_evaluadas: competencias.length
        },
        message: 'Evaluación creada exitosamente'
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await mongoClient.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ [Evaluaciones SGC] Error al crear evaluación:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear evaluación', 
      details: error.message 
    });
  }
};

// Obtener una evaluación específica con sus detalles usando tablas SGC
const getEvaluacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    // Obtener la evaluación principal desde sgc_personal_relaciones
    const evaluacionResult = await mongoClient.execute({
      sql: `SELECT 
              sp_evaluado.entidad_id as id,
              sp_evaluado.organization_id,
              sp_evaluado.personal_id as empleado_id,
              sp_evaluador.personal_id as evaluador_id,
              JSON_EXTRACT(sp_evaluado.datos_adicionales, '$.fecha_evaluacion') as fecha_evaluacion,
              sp_evaluado.observaciones,
              JSON_EXTRACT(sp_evaluado.datos_adicionales, '$.estado') as estado,
              sp_evaluado.created_at,
              sp_evaluado.updated_at,
              p.nombres as empleado_nombre,
              p.apellidos as empleado_apellido,
              ev.nombres as evaluador_nombre,
              ev.apellidos as evaluador_apellido
            FROM sgc_personal_relaciones sp_evaluado
            LEFT JOIN sgc_personal_relaciones sp_evaluador ON (
              sp_evaluado.entidad_tipo = sp_evaluador.entidad_tipo 
              AND sp_evaluado.entidad_id = sp_evaluador.entidad_id
              AND sp_evaluador.rol = 'evaluador'
            )
            LEFT JOIN personal p ON sp_evaluado.personal_id = CAST(p.id as TEXT)
            LEFT JOIN personal ev ON sp_evaluador.personal_id = CAST(ev.id as TEXT)
            WHERE sp_evaluado.entidad_tipo = 'evaluacion' 
              AND sp_evaluado.rol = 'evaluado'
              AND sp_evaluado.entidad_id = ?
              AND sp_evaluado.organization_id = ?`,
      args: [id, organization_id]
    });

    if (evaluacionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }

    // Obtener los detalles de competencias desde sgc_normas_relacionadas
    const competenciasResult = await mongoClient.execute({
      sql: `SELECT 
              snr.norma_id as competencia_id,
              CAST(JSON_EXTRACT(snr.datos_adicionales, '$.puntaje') as INTEGER) as puntaje,
              snr.nivel_cumplimiento,
              snr.observaciones,
              c.nombre as competencia_nombre,
              c.descripcion as competencia_descripcion,
              snr.created_at,
              snr.updated_at
            FROM sgc_normas_relacionadas snr
            LEFT JOIN competencias c ON snr.norma_id = c.id
            WHERE snr.entidad_tipo = 'evaluacion' 
              AND snr.entidad_id = ? 
              AND snr.organization_id = ?
              AND snr.tipo_relacion = 'competencia_evaluada'`,
      args: [id, organization_id]
    });

    const evaluacion = evaluacionResult.rows[0];
    evaluacion.competencias = competenciasResult.rows;

    res.json({
      success: true,
      data: evaluacion
    });

  } catch (error) {
    console.error('❌ [Evaluaciones SGC] Error al obtener evaluación:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener evaluación', 
      details: error.message 
    });
  }
};

// Obtener estadísticas de evaluaciones para dashboard usando tablas SGC
const getEstadisticasEvaluaciones = async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    // Total de evaluaciones desde sgc_personal_relaciones
    const totalResult = await mongoClient.execute({
      sql: `SELECT COUNT(DISTINCT entidad_id) as total 
            FROM sgc_personal_relaciones 
            WHERE entidad_tipo = 'evaluacion' 
              AND rol = 'evaluado' 
              AND organization_id = ?`,
      args: [organization_id]
    });

    // Evaluaciones por mes (últimos 6 meses)
    const porMesResult = await mongoClient.execute({
      sql: `SELECT 
              strftime('%Y-%m', JSON_EXTRACT(datos_adicionales, '$.fecha_evaluacion')) as mes,
              COUNT(DISTINCT entidad_id) as cantidad
            FROM sgc_personal_relaciones 
            WHERE entidad_tipo = 'evaluacion' 
              AND rol = 'evaluado'
              AND organization_id = ? 
              AND JSON_EXTRACT(datos_adicionales, '$.fecha_evaluacion') >= date('now', '-6 months')
            GROUP BY strftime('%Y-%m', JSON_EXTRACT(datos_adicionales, '$.fecha_evaluacion'))
            ORDER BY mes DESC`,
      args: [organization_id]
    });

    // Promedio de puntajes por competencia desde sgc_normas_relacionadas
    const promediosResult = await mongoClient.execute({
      sql: `SELECT 
              c.nombre as competencia,
              AVG(CAST(JSON_EXTRACT(snr.datos_adicionales, '$.puntaje') as INTEGER)) as promedio,
              COUNT(snr.id) as evaluaciones
            FROM sgc_normas_relacionadas snr
            LEFT JOIN competencias c ON snr.norma_id = c.id
            WHERE snr.entidad_tipo = 'evaluacion'
              AND snr.tipo_relacion = 'competencia_evaluada'
              AND snr.organization_id = ?
            GROUP BY snr.norma_id, c.nombre
            ORDER BY promedio DESC`,
      args: [organization_id]
    });

    res.json({
      success: true,
      data: {
        total_evaluaciones: totalResult.rows[0]?.total || 0,
        evaluaciones_por_mes: porMesResult.rows,
        promedios_competencias: promediosResult.rows
      }
    });

  } catch (error) {
    console.error('❌ [Evaluaciones SGC] Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener estadísticas', 
      details: error.message 
    });
  }
};

// Obtener participantes de una evaluación (nuevo endpoint específico SGC)
const getParticipantesEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    const result = await mongoClient.execute({
      sql: `SELECT 
              sp.*,
              p.nombres,
              p.apellidos,
              p.cargo
            FROM sgc_personal_relaciones sp
            LEFT JOIN personal p ON sp.personal_id = CAST(p.id as TEXT)
            WHERE sp.entidad_tipo = 'evaluacion' 
              AND sp.entidad_id = ?
              AND sp.organization_id = ?
            ORDER BY sp.rol, p.nombres`,
      args: [id, organization_id]
    });

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ [Evaluaciones SGC] Error al obtener participantes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener participantes', 
      details: error.message 
    });
  }
};

// Obtener competencias evaluadas (nuevo endpoint específico SGC)
const getCompetenciasEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    const result = await mongoClient.execute({
      sql: `SELECT 
              snr.*,
              c.nombre as competencia_nombre,
              c.descripcion as competencia_descripcion,
              CAST(JSON_EXTRACT(snr.datos_adicionales, '$.puntaje') as INTEGER) as puntaje
            FROM sgc_normas_relacionadas snr
            LEFT JOIN competencias c ON snr.norma_id = c.id
            WHERE snr.entidad_tipo = 'evaluacion' 
              AND snr.entidad_id = ?
              AND snr.organization_id = ?
              AND snr.tipo_relacion = 'competencia_evaluada'
            ORDER BY c.nombre`,
      args: [id, organization_id]
    });

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ [Evaluaciones SGC] Error al obtener competencias:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener competencias', 
      details: error.message 
    });
  }
};

module.exports = {
  getEvaluaciones,
  createEvaluacion,
  getEvaluacionById,
  getEstadisticasEvaluaciones,
  getParticipantesEvaluacion,
  getCompetenciasEvaluacion
};
