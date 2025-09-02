const mongoClient = require('../lib/mongoClient.js');

// Obtener todos los detalles de una programación de evaluación
const getDetallesPorProgramacion = async (req, res) => {
  const { organization_id } = req.user;
  const { programacionId } = req.params;

  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM evaluaciones_detalle WHERE organization_id = ? AND programacion_id = ?',
      args: [organization_id, programacionId],
    });
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los detalles de la evaluación' });
  }
};

// Crear un nuevo detalle de evaluación (un puntaje para una competencia)
const createDetalle = async (req, res) => {
  const { organization_id, id: evaluador_id } = req.user;
  const { programacion_id, evaluado_id, competencia_id, puntaje, observaciones } = req.body;

  if (!programacion_id || !evaluado_id || !competencia_id || !puntaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
    const result = await turso.execute({
      sql: 'INSERT INTO evaluaciones_detalle (organization_id, programacion_id, evaluado_id, competencia_id, puntaje, observaciones, evaluador_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [organization_id, programacion_id, evaluado_id, competencia_id, puntaje, observaciones, evaluador_id],
    });

    const detalleId = result.lastInsertRowid;
    res.status(201).json({ id: detalleId, ...req.body, message: 'Detalle de evaluación creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el detalle de la evaluación' });
  }
};
