const mongoClient = require('../lib/mongoClient.js');

// Obtener todas las programaciones de evaluación de una organización
const getProgramaciones = async (req, res) => {
  const { organization_id } = req.user;

  try {
    console.log('🔄 [Backend] Obteniendo programaciones para organización:', organization_id);
    const result = await turso.execute({
      sql: 'SELECT * FROM evaluacion_programacion WHERE organization_id = ? ORDER BY fecha_creacion DESC',
      args: [organization_id],
    });
    
    // Mapear los datos para asegurar compatibilidad con frontend
    const programaciones = result.rows.map(row => ({
      ...row,
      titulo: row.titulo || row.nombre, // Asegurar que tenga titulo
      nombre: row.nombre || row.titulo  // Asegurar que tenga nombre
    }));
    
    console.log('✅ [Backend] Programaciones encontradas:', programaciones.length);
    console.log('📋 [Backend] Datos:', programaciones);
    
    res.json(programaciones);
  } catch (error) {
    console.error('❌ [Backend] Error al obtener programaciones:', error);
    res.status(500).json({ error: 'Error al obtener las programaciones de evaluación' });
  }
};

// Crear una nueva programación de evaluación
const createProgramacion = async (req, res) => {
  const { organization_id, id: user_id } = req.user;
  const { titulo, nombre, descripcion, fecha_inicio, fecha_fin, estado } = req.body;

  // Usar titulo si está disponible, sino usar nombre (compatibilidad)
  const nombreFinal = titulo || nombre;
  
  if (!nombreFinal) {
    return res.status(400).json({ error: 'El título/nombre es obligatorio.' });
  }

  try {
    const result = await turso.execute({
      sql: 'INSERT INTO evaluacion_programacion (organization_id, nombre, descripcion, fecha_inicio, fecha_fin, estado, usuario_creador) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [organization_id, nombreFinal, descripcion, fecha_inicio, fecha_fin, estado || 'borrador', String(user_id)],
    });

    const programacionId = result.lastInsertRowid;
    const newProgramacion = {
        id: programacionId,
        organization_id,
        nombre: nombreFinal,
        titulo: nombreFinal, // Agregar titulo para compatibilidad con frontend
        descripcion,
        fecha_inicio,
        fecha_fin,
        estado: estado || 'borrador',
        usuario_creador: String(user_id)
    }
    res.status(201).json(newProgramacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la programación de evaluación' });
  }
};

// Obtener una programación específica por ID
const getProgramacionById = async (req, res) => {
  const { organization_id } = req.user;
  const { id } = req.params;

  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM evaluacion_programacion WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Programación no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la programación' });
  }
};

// Actualizar una programación existente
const updateProgramacion = async (req, res) => {
  const { organization_id } = req.user;
  const { id } = req.params;
  const { titulo, nombre, descripcion, fecha_inicio, fecha_fin, estado } = req.body;
  
  // Usar titulo si está disponible, sino usar nombre (compatibilidad)
  const nombreFinal = titulo || nombre;

  try {
    // Verificar que la programación existe y pertenece a la organización
    const existingResult = await turso.execute({
      sql: 'SELECT * FROM evaluacion_programacion WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Programación no encontrada' });
    }

    // Actualizar la programación
    await turso.execute({
      sql: 'UPDATE evaluacion_programacion SET nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, estado = ? WHERE id = ? AND organization_id = ?',
      args: [nombreFinal, descripcion, fecha_inicio, fecha_fin, estado, id, organization_id],
    });

    // Obtener la programación actualizada
    const updatedResult = await turso.execute({
      sql: 'SELECT * FROM evaluacion_programacion WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    res.json(updatedResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la programación' });
  }
};

// Eliminar una programación
const deleteProgramacion = async (req, res) => {
  const { organization_id } = req.user;
  const { id } = req.params;

  try {
    // Verificar que la programación existe y pertenece a la organización
    const existingResult = await turso.execute({
      sql: 'SELECT * FROM evaluacion_programacion WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Programación no encontrada' });
    }

    // Eliminar la programación
    await turso.execute({
      sql: 'DELETE FROM evaluacion_programacion WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    res.json({ message: 'Programación eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la programación' });
  }
};
