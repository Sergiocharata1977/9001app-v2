const { Router  } = require('express');
const mongodbClient = require('../lib/mongodbClient.js');
const crypto = require('crypto');

const router = Router();

// GET /api/tratamientos/hallazgo/:hallazgoId - Listar tratamientos por hallazgo
router.get('/hallazgo/:hallazgoId', async (req, res) => {
  const { hallazgoId } = req.params;
  try {
    const result = await mongodbClient.execute({
      sql: 'SELECT * FROM tratamientos WHERE hallazgoId = ? ORDER BY fechaCompromisoImplementacion ASC',
      args: [hallazgoId],
    });
    res.json(result.rows);
  } catch (error) {
    console.error(`Error al obtener tratamientos para el hallazgo ${hallazgoId}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/tratamientos/:id - Obtener un tratamiento por su ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await mongodbClient.execute({
        sql: 'SELECT * FROM tratamientos WHERE id = ?',
        args: [id],
      });
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tratamiento no encontrado.' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`Error al obtener el tratamiento ${id}:`, error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// POST /api/tratamientos - Crear un nuevo tratamiento
router.post('/', async (req, res) => {
  const {
    hallazgoId,
    analisisCausa,
    descripcionAnalisis,
    planAccion,
    responsableImplementacion,
    fechaCompromisoImplementacion,
    estadoPlan
  } = req.body;

  if (!hallazgoId || !analisisCausa) {
    return res.status(400).json({ error: 'El ID del hallazgo (hallazgoId) y el tipo de análisis de causa son obligatorios.' });
  }

  // Verificar que el hallazgo exista
  try {
    const hallazgoExists = await mongodbClient.execute({
        sql: 'SELECT id FROM hallazgos WHERE id = ?',
        args: [hallazgoId]
    });
    if (hallazgoExists.rows.length === 0) {
        return res.status(404).json({ error: 'El hallazgo especificado no existe.' });
    }

    const id = crypto.randomUUID();
    
    await mongodbClient.execute({
      sql: `INSERT INTO tratamientos (
              id, hallazgoId, analisisCausa, descripcionAnalisis, planAccion,
              responsableImplementacion, fechaCompromisoImplementacion, estadoPlan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      args: [
        id, hallazgoId, analisisCausa, descripcionAnalisis, planAccion,
        responsableImplementacion, fechaCompromisoImplementacion, estadoPlan
      ],
    });

    const newTratamientoResult = await mongodbClient.execute({
        sql: 'SELECT * FROM tratamientos WHERE id = ?',
        args: [id]
    });

    res.status(201).json(newTratamientoResult.rows[0]);
  } catch (error) {
    console.error('Error al crear el tratamiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/tratamientos/:id - Actualizar un tratamiento
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
    'analisisCausa', 'descripcionAnalisis', 'planAccion',
    'responsableImplementacion', 'fechaCompromisoImplementacion', 'estadoPlan'
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
    const result = await mongodbClient.execute({
      sql: `UPDATE tratamientos SET ${sqlSetParts.join(', ')} WHERE id = ?`,
      args: sqlArgs,
    });

    if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'Tratamiento no encontrado.' });
    }

    const updatedTratamientoResult = await mongodbClient.execute({
        sql: 'SELECT * FROM tratamientos WHERE id = ?',
        args: [id]
    });

    res.json(updatedTratamientoResult.rows[0]);
  } catch (error) {
    console.error(`Error al actualizar el tratamiento ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/tratamientos/:id - Eliminar un tratamiento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await mongodbClient.execute({
      sql: 'DELETE FROM tratamientos WHERE id = ?',
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Tratamiento no encontrado.' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error al eliminar el tratamiento ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
