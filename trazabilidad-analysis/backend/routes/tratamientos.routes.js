const { Router  } = require('express');
const mongoClient = require('../lib/mongoClient.js');
const crypto = require('crypto');

const router = Router();

// GET /api/tratamientos/hallazgo/:hallazgoId - Listar tratamientos por hallazgo
router.get('/hallazgo/:hallazgoId', async (req, res) => {
  const { hallazgoId } = req.params;
  try {
    const collection = mongoClient.collection('tratamientos');
    const result = await collection.find(
      { hallazgoId: hallazgoId },
      { sort: { fechaCompromisoImplementacion: 1 } }
    ).toArray();
    
    res.json(result);
  } catch (error) {
    console.error(`Error al obtener tratamientos para el hallazgo ${hallazgoId}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/tratamientos/:id - Obtener un tratamiento por su ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const collection = mongoClient.collection('tratamientos');
      const result = await collection.findOne({ id: id });
  
      if (!result) {
        return res.status(404).json({ error: 'Tratamiento no encontrado.' });
      }
      res.json(result);
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
    const hallazgosCollection = mongoClient.collection('hallazgos');
    const hallazgoExists = await hallazgosCollection.findOne({ id: hallazgoId });
    
    if (!hallazgoExists) {
        return res.status(404).json({ error: 'El hallazgo especificado no existe.' });
    }

    const id = crypto.randomUUID();
    const tratamientosCollection = mongoClient.collection('tratamientos');
    
    const nuevoTratamiento = {
      id,
      hallazgoId,
      analisisCausa,
      descripcionAnalisis,
      planAccion,
      responsableImplementacion,
      fechaCompromisoImplementacion: new Date(fechaCompromisoImplementacion),
      estadoPlan,
      created_at: new Date(),
      updated_at: new Date()
    };

    await tratamientosCollection.insertOne(nuevoTratamiento);

    res.status(201).json(nuevoTratamiento);
  } catch (error) {
    console.error('Error al crear el tratamiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/tratamientos/:id - Actualizar un tratamiento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { hallazgoId, ...fieldsToUpdate } = req.body;

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
  }
  
  // No permitir actualizar hallazgoId
  if (hallazgoId) {
    return res.status(400).json({ error: 'No se puede modificar el hallazgoId de un tratamiento.' });
  }

  try {
    const collection = mongoClient.collection('tratamientos');
    
    // Preparar datos para actualización
    const updateData = {
      ...fieldsToUpdate,
      updated_at: new Date()
    };

    // Convertir fechaCompromisoImplementacion a Date si existe
    if (updateData.fechaCompromisoImplementacion) {
      updateData.fechaCompromisoImplementacion = new Date(updateData.fechaCompromisoImplementacion);
    }

    const result = await collection.updateOne(
      { id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Tratamiento no encontrado.' });
    }

    // Obtener el tratamiento actualizado
    const updatedTratamientoResult = await collection.findOne({ id: id });
    res.json(updatedTratamientoResult);
  } catch (error) {
    console.error(`Error al actualizar el tratamiento ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/tratamientos/:id - Eliminar un tratamiento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const collection = mongoClient.collection('tratamientos');
    const result = await collection.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Tratamiento no encontrado.' });
    }

    res.json({ message: 'Tratamiento eliminado exitosamente.' });
  } catch (error) {
    console.error(`Error al eliminar el tratamiento ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
