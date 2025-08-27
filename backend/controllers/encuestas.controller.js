const mongoClient = require('../lib/mongoClient.js');

// GET /api/encuestas - Listar todas las encuestas
const getEncuestas = async (req, res) => {
  try {
    const result = await mongoClient.execute(`
      SELECT * FROM encuestas
      ORDER BY fecha_creacion DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener encuestas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/encuestas - Crear una nueva encuesta
const createEncuesta = async (req, res) => {
  const { titulo, descripcion, preguntas, estado, creador } = req.body;

  if (!titulo) {
    return res.status(400).json({ message: 'El campo "titulo" es obligatorio.' });
  }

  try {
    const result = await mongoClient.execute({
      sql: `INSERT INTO encuestas (titulo, descripcion, preguntas, estado, creador) 
            VALUES (?, ?, ?, ?, ?)`, 
      args: [
        titulo,
        descripcion || null,
        preguntas ? JSON.stringify(preguntas) : '[]',
        estado || 'Borrador',
        creador || 'Anónimo',
      ],
    });

    const newId = result.lastInsertRowid;
    if (newId) {
      const newEncuestaResult = await mongoClient.execute({
        sql: 'SELECT * FROM encuestas WHERE id = ?',
        args: [newId],
      });
      res.status(201).json(newEncuestaResult.rows[0]);
    } else {
      res.status(500).json({ message: 'No se pudo obtener el ID de la nueva encuesta.' });
    }
  } catch (error) {
    console.error('Error al crear la encuesta:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// GET /api/encuestas/:id - Obtener una encuesta por ID
const getEncuesta = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM encuestas WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Encuesta no encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error al obtener la encuesta ${id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/encuestas/:id - Actualizar una encuesta
const updateEncuesta = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, preguntas, estado } = req.body;

  if (!titulo) {
    return res.status(400).json({ message: 'El campo "titulo" es obligatorio.' });
  }

  try {
    const result = await mongoClient.execute({
      sql: `UPDATE encuestas SET 
              titulo = ?, descripcion = ?, preguntas = ?, estado = ?
            WHERE id = ?`,
      args: [
        titulo,
        descripcion || null,
        preguntas ? JSON.stringify(preguntas) : '[]',
        estado || 'Borrador',
        id,
      ],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Encuesta no encontrada.' });
    }

    const updatedEncuestaResult = await mongoClient.execute({
      sql: 'SELECT * FROM encuestas WHERE id = ?',
      args: [id],
    });

    res.json(updatedEncuestaResult.rows[0]);
  } catch (error) {
    console.error(`Error al actualizar la encuesta ${id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// DELETE /api/encuestas/:id - Eliminar una encuesta
const deleteEncuesta = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await mongoClient.execute({
      sql: 'DELETE FROM encuestas WHERE id = ?',
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Encuesta no encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(`Error al eliminar la encuesta ${id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/encuestas/:id/respuestas - Añadir respuestas a una encuesta
const addRespuesta = async (req, res) => {
  const { id } = req.params;
  const { respuestas, respondente_id } = req.body;

  if (!respuestas) {
    return res.status(400).json({ message: 'El objeto de respuestas es obligatorio.' });
  }

  try {
    const encuestaResult = await mongoClient.execute({
      sql: 'SELECT id, estado FROM encuestas WHERE id = ?',
      args: [id],
    });

    if (encuestaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Encuesta no encontrada.' });
    }

    if (encuestaResult.rows[0].estado !== 'Activa') {
      return res.status(400).json({ message: 'La encuesta no está activa para recibir respuestas.' });
    }

    const result = await mongoClient.execute({
      sql: `INSERT INTO encuestas_respuestas (encuesta_id, respuestas, respondente_id) 
            VALUES (?, ?, ?)`,
      args: [
        id,
        JSON.stringify(respuestas),
        respondente_id || null,
      ],
    });

    res.status(201).json({
      id: result.lastInsertRowid,
      mensaje: 'Respuestas registradas correctamente',
    });
  } catch (error) {
    console.error(`Error al registrar respuestas para la encuesta ${id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
