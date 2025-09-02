const { Router } = require('express');
const mongoClient = require('../lib/mongoClient.js');
const crypto = require('crypto');

const router = Router();

// GET /api/verificaciones/hallazgo/:hallazgoId - Listar verificaciones por hallazgo
router.get('/hallazgo/:hallazgoId', async (req, res) => {
  const { hallazgoId } = req.params;
  try {
    const collection = mongoClient.collection('verificaciones');
    const result = await collection.find(
      { hallazgoId: hallazgoId },
      { sort: { fechaVerificacion: 1 } }
    ).toArray();
    
    res.json(result);
  } catch (error) {
    console.error(`Error al obtener verificaciones para el hallazgo ${hallazgoId}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/verificaciones/:id - Obtener una verificacion por su ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const collection = mongoClient.collection('verificaciones');
      const result = await collection.findOne({ id: id });
  
      if (!result) {
        return res.status(404).json({ error: 'Verificación no encontrada.' });
      }
      res.json(result);
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
    const hallazgosCollection = mongoClient.collection('hallazgos');
    const hallazgoExists = await hallazgosCollection.findOne({ id: hallazgoId });
    
    if (!hallazgoExists) {
        return res.status(404).json({ error: 'El hallazgo especificado no existe.' });
    }

    const id = crypto.randomUUID();
    const verificacionesCollection = mongoClient.collection('verificaciones');
    
    const nuevaVerificacion = {
      id,
      hallazgoId,
      responsableVerificacion,
      fechaVerificacion: new Date(fechaVerificacion),
      resultadoVerificacion,
      comentarios,
      estadoHallazgo,
      created_at: new Date(),
      updated_at: new Date()
    };

    await verificacionesCollection.insertOne(nuevaVerificacion);

    res.status(201).json(nuevaVerificacion);
  } catch (error) {
    console.error('Error al crear la verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/verificaciones/:id - Actualizar una verificacion
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { hallazgoId, ...fieldsToUpdate } = req.body;

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
  }
  
  // No permitir actualizar hallazgoId
  if (hallazgoId) {
    return res.status(400).json({ error: 'No se puede modificar el hallazgoId de una verificación.' });
  }

  try {
    const collection = mongoClient.collection('verificaciones');
    
    // Preparar datos para actualización
    const updateData = {
      ...fieldsToUpdate,
      updated_at: new Date()
    };

    // Convertir fechaVerificacion a Date si existe
    if (updateData.fechaVerificacion) {
      updateData.fechaVerificacion = new Date(updateData.fechaVerificacion);
    }

    const result = await collection.updateOne(
      { id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Verificación no encontrada.' });
    }

    // Obtener la verificación actualizada
    const updatedVerificacionResult = await collection.findOne({ id: id });
    res.json(updatedVerificacionResult);
  } catch (error) {
    console.error(`Error al actualizar la verificación ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/verificaciones/:id - Eliminar una verificacion
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const collection = mongoClient.collection('verificaciones');
    const result = await collection.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Verificación no encontrada.' });
    }

    res.json({ message: 'Verificación eliminada exitosamente.' });
  } catch (error) {
    console.error(`Error al eliminar la verificación ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
