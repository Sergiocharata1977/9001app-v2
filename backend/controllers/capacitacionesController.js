const mongoClient = require('../lib/mongoClient.js');
const { randomUUID } = require('crypto');

// GET /api/capacitaciones - Obtener todas las capacitaciones
const getAllCapacitaciones = async (req, res) => {
  try {
    console.log('📋 Obteniendo todas las capacitaciones...');
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM capacitaciones WHERE organization_id = ? ORDER BY created_at DESC',
      args: [req.user?.organization_id || 1]
    });
    
    console.log(`✅ Encontradas ${result.rows.length} capacitaciones`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener capacitaciones:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al obtener capacitaciones',
      error: error.message 
    });
  }
};

// GET /api/capacitaciones/:id - Obtener capacitación por ID
const getCapacitacionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando capacitación con ID: ${id}`);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM capacitaciones WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id || 1]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Capacitación no encontrada' 
      });
    }

    console.log(`✅ Capacitación encontrada: ${result.rows[0].nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener capacitación:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al obtener capacitación',
      error: error.message 
    });
  }
};

// POST /api/capacitaciones - Crear nueva capacitación
const createCapacitacion = async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      instructor,
      fecha_inicio,
      fecha_fin,
      duracion_horas,
      modalidad,
      estado = 'Programada',
      ubicacion,
      costo,
      cupo_maximo,
      requisitos,
      objetivos,
      contenido,
      metodologia,
      evaluacion,
      certificacion = false
    } = req.body;
    
    console.log('➕ Creando nueva capacitación:', { nombre, fecha_inicio, estado });

    // Validación básica
    if (!nombre || !fecha_inicio) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Nombre y fecha de inicio son obligatorios' 
      });
    }

    const result = await mongoClient.execute({
      sql: `INSERT INTO capacitaciones (
        nombre, descripcion, instructor, fecha_inicio, fecha_fin, 
        duracion_horas, modalidad, estado, ubicacion, costo, 
        cupo_maximo, requisitos, objetivos, contenido, metodologia, 
        evaluacion, certificacion, organization_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"), datetime("now", "localtime")) RETURNING *`,
      args: [
        nombre, descripcion, instructor, fecha_inicio, fecha_fin,
        duracion_horas, modalidad, estado, ubicacion, costo,
        cupo_maximo, requisitos, objetivos, contenido, metodologia,
        evaluacion, certificacion, req.user?.organization_id || 1
      ]
    });

    console.log(`✅ Capacitación creada con ID: ${result.rows[0].id}`);
    res.status(201).json({
      status: 'success',
      message: 'Capacitación creada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al crear capacitación:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al crear capacitación',
      error: error.message 
    });
  }
};

// PUT /api/capacitaciones/:id - Actualizar capacitación
const updateCapacitacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      descripcion, 
      instructor,
      fecha_inicio,
      fecha_fin,
      duracion_horas,
      modalidad,
      estado,
      ubicacion,
      costo,
      cupo_maximo,
      requisitos,
      objetivos,
      contenido,
      metodologia,
      evaluacion,
      certificacion
    } = req.body;
    
    console.log(`🔄 Actualizando capacitación con ID: ${id}`);

    // Verificar que la capacitación existe
    const existingResult = await mongoClient.execute({
      sql: 'SELECT id FROM capacitaciones WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id || 1]
    });

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Capacitación no encontrada' 
      });
    }

    const result = await mongoClient.execute({
      sql: `UPDATE capacitaciones SET 
        nombre = ?, descripcion = ?, instructor = ?, fecha_inicio = ?, fecha_fin = ?,
        duracion_horas = ?, modalidad = ?, estado = ?, ubicacion = ?, costo = ?,
        cupo_maximo = ?, requisitos = ?, objetivos = ?, contenido = ?, metodologia = ?,
        evaluacion = ?, certificacion = ?, updated_at = datetime("now", "localtime")
        WHERE id = ? AND organization_id = ? RETURNING *`,
      args: [
        nombre, descripcion, instructor, fecha_inicio, fecha_fin,
        duracion_horas, modalidad, estado, ubicacion, costo,
        cupo_maximo, requisitos, objetivos, contenido, metodologia,
        evaluacion, certificacion, id, req.user?.organization_id || 1
      ]
    });

    console.log(`✅ Capacitación actualizada: ${result.rows[0].nombre}`);
    res.json({
      status: 'success',
      message: 'Capacitación actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar capacitación:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al actualizar capacitación',
      error: error.message 
    });
  }
};

// DELETE /api/capacitaciones/:id - Eliminar capacitación
const deleteCapacitacion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando capacitación con ID: ${id}`);

    // Verificar que la capacitación existe
    const existingResult = await mongoClient.execute({
      sql: 'SELECT id, nombre FROM capacitaciones WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id || 1]
    });

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Capacitación no encontrada' 
      });
    }

    // Eliminar capacitación
    await mongoClient.execute({
      sql: 'DELETE FROM capacitaciones WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id || 1]
    });

    console.log(`✅ Capacitación eliminada: ${existingResult.rows[0].nombre}`);
    res.json({
      status: 'success',
      message: 'Capacitación eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al eliminar capacitación:', error);
    res.status(500).json({ 
      status: 'error', 
      statusCode: 500,
      message: 'Error al eliminar capacitación',
      error: error.message 
    });
  }
};

// GET /api/capacitaciones/:id/temas - Obtener temas de una capacitación
const getTemasByCapacitacion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📚 Obteniendo temas de capacitación ID: ${id}`);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM temas_capacitacion WHERE capacitacion_id = ? ORDER BY orden ASC',
      args: [id]
    });

    console.log(`✅ Encontrados ${result.rows.length} temas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener temas:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener temas',
      error: error.message 
    });
  }
};

// POST /api/capacitaciones/:id/temas - Crear tema para capacitación
const createTema = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, orden = 0 } = req.body;
    
    console.log(`➕ Creando tema para capacitación ID: ${id}`);

    if (!titulo) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Título del tema es obligatorio' 
      });
    }

    const result = await mongoClient.execute({
      sql: `INSERT INTO temas_capacitacion (capacitacion_id, titulo, descripcion, orden, created_at) 
            VALUES (?, ?, ?, ?, datetime("now", "localtime")) RETURNING *`,
      args: [id, titulo, descripcion, orden]
    });

    console.log(`✅ Tema creado: ${result.rows[0].titulo}`);
    res.status(201).json({
      status: 'success',
      message: 'Tema creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al crear tema:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al crear tema',
      error: error.message 
    });
  }
};

// GET /api/capacitaciones/:id/asistentes - Obtener asistentes de una capacitación
const getAsistentesByCapacitacion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👥 Obteniendo asistentes de capacitación ID: ${id}`);
    
    const result = await mongoClient.execute({
      sql: `SELECT ca.*, e.nombre as empleado_nombre, e.apellido as empleado_apellido 
            FROM capacitacion_asistentes ca 
            JOIN empleados e ON ca.empleado_id = e.id 
            WHERE ca.capacitacion_id = ?`,
      args: [id]
    });

    console.log(`✅ Encontrados ${result.rows.length} asistentes`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener asistentes:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener asistentes',
      error: error.message 
    });
  }
};

// POST /api/capacitaciones/:id/asistentes - Agregar asistente a capacitación
const addAsistente = async (req, res) => {
  try {
    const { id } = req.params;
    const { empleado_id } = req.body;
    
    console.log(`➕ Agregando asistente ${empleado_id} a capacitación ID: ${id}`);

    if (!empleado_id) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'ID del empleado es obligatorio' 
      });
    }

    // Verificar que el empleado no esté ya inscrito
    const existingResult = await mongoClient.execute({
      sql: 'SELECT id FROM capacitacion_asistentes WHERE capacitacion_id = ? AND empleado_id = ?',
      args: [id, empleado_id]
    });

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El empleado ya está inscrito en esta capacitación' 
      });
    }

    const result = await mongoClient.execute({
      sql: `INSERT INTO capacitacion_asistentes (capacitacion_id, empleado_id, estado, fecha_inscripcion) 
            VALUES (?, ?, 'inscrito', datetime("now", "localtime")) RETURNING *`,
      args: [id, empleado_id]
    });

    console.log(`✅ Asistente agregado exitosamente`);
    res.status(201).json({
      status: 'success',
      message: 'Asistente agregado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al agregar asistente:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al agregar asistente',
      error: error.message 
    });
  }
};

module.exports = {
  getAllCapacitaciones,
  getCapacitacionById,
  createCapacitacion,
  updateCapacitacion,
  deleteCapacitacion,
  getTemasByCapacitacion,
  createTema,
  getAsistentesByCapacitacion,
  addAsistente
};
