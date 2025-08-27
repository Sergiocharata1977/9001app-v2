const { Router } = require('express');
const mongoClient = require('../lib/mongoClient.js');
const crypto = require('crypto');

const router = Router();

// GET /api/verificaciones/hallazgo/:hallazgoId - Listar verificaciones por hallazgo
router.get('/hallazgo/:hallazgoId', async (req, res) => {
  const { hallazgoId } = req.params;
  try {
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM verificaciones WHERE hallazgoId = ? ORDER BY fechaVerificacion ASC',
      args: [hallazgoId],
    });
    res.json(result.rows);
  } catch (error) {
    console.error(`Error al obtener verificaciones para el hallazgo ${hallazgoId}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/verificaciones/:id - Obtener una verificacion por su ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await mongoClient.execute({
        sql: 'SELECT * FROM verificaciones WHERE id = ?',
        args: [id],
      });
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Verificación no encontrada.' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`Error al obtener la verificación ${id}:`, error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /api/verificaciones - Crear una nueva verificacion
router.post('/', async (req, res) => {
  const {
    hallazgoId,
    responsableVerificacion,
    fechaVerificacion,
    resultadoVerificacion,
    comentarios,
    estadoHallazgo
  } = req.body;

  if (!hallazgoId || !fechaVerificacion || !estadoHallazgo) {
    return res.status(400).json({ error: 'Los campos hallazgoId, fechaVerificacion y estadoHallazgo son obligatorios.' });
  }

  // Verificar que el hallazgo exista
  try {
    const hallazgoExists = await mongoClient.execute({
        sql: 'SELECT id FROM hallazgos WHERE id = ?',
        args: [hallazgoId]
    });
    if (hallazgoExists.rows.length === 0) {
        return res.status(404).json({ error: 'El hallazgo especificado no existe.' });
    }

    const id = crypto.randomUUID();
    
    await mongoClient.execute({
      sql: `INSERT INTO verificaciones (
              id, hallazgoId, responsableVerificacion, fechaVerificacion,
              resultadoVerificacion, comentarios, estadoHallazgo
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
      args: [
        id, hallazgoId, responsableVerificacion, fechaVerificacion,
        resultadoVerificacion, comentarios, estadoHallazgo
      ],
    });

    const newVerificacionResult = await mongoClient.execute({
        sql: 'SELECT * FROM verificaciones WHERE id = ?',
        args: [id]
    });

    res.status(201).json(newVerificacionResult.rows[0]);
  } catch (error) {
    console.error('Error al crear la verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/verificaciones/:id - Actualizar una verificacion
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ...fieldsToUpdate } = req.body;

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
  }
  
  // No permitir actualizar hallazgoId
  if (fieldsToUpdate.hallazgoId) {
      delete fieldsToUpdate.hallazgoId;
  }

  const allowedFields = [
    'responsableVerificacion', 'fechaVerificacion', 'resultadoVerificacion',
    'comentarios', 'estadoHallazgo'
  ];

  const fields = Object.keys(fieldsToUpdate)
    .filter(key => allowedFields.includes(key));
    
  if (fields.length === 0) {
    return res.status(400).json({ error: 'Ninguno de los campos proporcionados es actualizable.' });
  }

  const sqlSetParts = fields.map(key => `${key} = ?`);
  const sqlArgs = fields.map(key => fieldsToUpdate[key]);
  sqlArgs.push(id);

  try {
    const result = await mongoClient.execute({
      sql: `UPDATE verificaciones SET ${sqlSetParts.join(', ')} WHERE id = ?`,
      args: sqlArgs,
    });

    if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'Verificación no encontrada.' });
    }

    const updatedVerificacionResult = await mongoClient.execute({
        sql: 'SELECT * FROM verificaciones WHERE id = ?',
        args: [id]
    });

    res.json(updatedVerificacionResult.rows[0]);
  } catch (error) {
    console.error(`Error al actualizar la verificación ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/verificaciones/:id - Eliminar una verificacion
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await mongoClient.execute({
      sql: 'DELETE FROM verificaciones WHERE id = ?',
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Verificación no encontrada.' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error al eliminar la verificación ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
