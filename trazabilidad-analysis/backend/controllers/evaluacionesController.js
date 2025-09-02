const mongoClient = require('../lib/mongoClient.js');

// Obtener todas las evaluaciones individuales de la organización
const getEvaluaciones = async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    console.log(`🔎 [Evaluaciones] Obteniendo evaluaciones para organización: ${organization_id}`);
    
    const result = await mongoClient.execute({ 
      sql: `SELECT 
              e.*,
              p.nombres as empleado_nombre,
              p.apellidos as empleado_apellido,
              ev.nombres as evaluador_nombre,
              ev.apellidos as evaluador_apellido
            FROM evaluaciones_individuales e
            LEFT JOIN personal p ON e.empleado_id = p.id
            LEFT JOIN personal ev ON e.evaluador_id = ev.id
            WHERE e.organization_id = ? 
            ORDER BY e.fecha_evaluacion DESC`,
      args: [organization_id]
    });
    
    console.log(`✅ [Evaluaciones] Encontradas ${result.rows.length} evaluaciones para organización ${organization_id}`);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ [Evaluaciones] Error al obtener evaluaciones:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener evaluaciones', 
      details: error.message 
    });
  }
};

// Crear una nueva evaluación individual
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

    console.log(`🔄 [Evaluaciones] Creando evaluación para empleado ${empleado_id}`);

    // Iniciar transacción
    await mongoClient.execute('BEGIN TRANSACTION');

    try {
      // Crear la evaluación principal
      const evaluacionResult = await mongoClient.execute({
        sql: `INSERT INTO evaluaciones_individuales 
              (organization_id, empleado_id, evaluador_id, fecha_evaluacion, observaciones, estado, created_at) 
              VALUES (?, ?, ?, ?, ?, 'completada', datetime('now'))`,
        args: [organization_id, empleado_id, evaluador_id, fecha_evaluacion, observaciones || '']
      });

      const evaluacion_id = evaluacionResult.lastInsertRowid;

      // Insertar los puntajes de competencias
      for (const comp of competencias) {
        if (comp.competencia_id && comp.puntaje !== undefined) {
          await mongoClient.execute({
            sql: `INSERT INTO evaluaciones_competencias_detalle 
                  (organization_id, evaluacion_id, competencia_id, puntaje, created_at) 
                  VALUES (?, ?, ?, ?, datetime('now'))`,
            args: [organization_id, evaluacion_id, comp.competencia_id, comp.puntaje]
          });
        }
      }

      // Confirmar transacción
      await mongoClient.execute('COMMIT');

      console.log(`✅ [Evaluaciones] Evaluación creada exitosamente con ID: ${evaluacion_id}`);

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
    console.error('❌ [Evaluaciones] Error al crear evaluación:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear evaluación', 
      details: error.message 
    });
  }
};

// Obtener una evaluación específica con sus detalles
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

    // Obtener la evaluación principal
    const evaluacionResult = await mongoClient.execute({
      sql: `SELECT 
              e.*,
              p.nombre as empleado_nombre,
              p.apellido as empleado_apellido,
              ev.nombre as evaluador_nombre,
              ev.apellido as evaluador_apellido
            FROM evaluaciones_individuales e
            LEFT JOIN personal p ON e.empleado_id = p.id
            LEFT JOIN personal ev ON e.evaluador_id = ev.id
            WHERE e.id = ? AND e.organization_id = ?`,
      args: [id, organization_id]
    });

    if (evaluacionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }

    // Obtener los detalles de competencias
    const competenciasResult = await mongoClient.execute({
      sql: `SELECT 
              ecd.*,
              c.nombre as competencia_nombre,
              c.descripcion as competencia_descripcion
            FROM evaluaciones_competencias_detalle ecd
            LEFT JOIN competencias c ON ecd.competencia_id = c.id
            WHERE ecd.evaluacion_id = ? AND ecd.organization_id = ?`,
      args: [id, organization_id]
    });

    const evaluacion = evaluacionResult.rows[0];
    evaluacion.competencias = competenciasResult.rows;

    res.json({
      success: true,
      data: evaluacion
    });

  } catch (error) {
    console.error('❌ [Evaluaciones] Error al obtener evaluación:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener evaluación', 
      details: error.message 
    });
  }
};

// Obtener estadísticas de evaluaciones para dashboard
const getEstadisticasEvaluaciones = async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    // Total de evaluaciones
    const totalResult = await mongoClient.execute({
      sql: 'SELECT COUNT(*) as total FROM evaluaciones_individuales WHERE organization_id = ?',
      args: [organization_id]
    });

    // Evaluaciones por mes (últimos 6 meses)
    const porMesResult = await mongoClient.execute({
      sql: `SELECT 
              strftime('%Y-%m', fecha_evaluacion) as mes,
              COUNT(*) as cantidad
            FROM evaluaciones_individuales 
            WHERE organization_id = ? 
              AND fecha_evaluacion >= date('now', '-6 months')
            GROUP BY strftime('%Y-%m', fecha_evaluacion)
            ORDER BY mes DESC`,
      args: [organization_id]
    });

    // Promedio de puntajes por competencia
    const promediosResult = await mongoClient.execute({
      sql: `SELECT 
              c.nombre as competencia,
              AVG(ecd.puntaje) as promedio,
              COUNT(ecd.id) as evaluaciones
            FROM evaluaciones_competencias_detalle ecd
            LEFT JOIN competencias c ON ecd.competencia_id = c.id
            WHERE ecd.organization_id = ?
            GROUP BY ecd.competencia_id, c.nombre
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
    console.error('❌ [Evaluaciones] Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener estadísticas', 
      details: error.message 
    });
  }
};

export default {
  getEvaluaciones,
  createEvaluacion,
  getEvaluacionById,
  getEstadisticasEvaluaciones
};
